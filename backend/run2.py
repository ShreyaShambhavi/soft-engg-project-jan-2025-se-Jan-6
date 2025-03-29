import os
from PyPDF2 import PdfReader
import chromadb
import uuid
from app import create_app
from together import Together
from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import logging
from pprint import pprint
from langchain_ollama import OllamaLLM
from langchain.prompts import ChatPromptTemplate
from collections import defaultdict


# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('chatbot-api')

app = create_app()

# Add CORS configuration for the chat endpoint
CORS(app, resources={
    r"/v1/chat": {"origins": ["http://localhost:5173", "http://localhost:5000", "http://localhost", "https://editor.swagger.io"], "supports_credentials": True}
})


# Set up ChromaDB client
PERSIST_DIRECTORY = os.path.join(os.path.dirname(__file__), "vectordb")
chroma_client = chromadb.PersistentClient(path=PERSIST_DIRECTORY)
collection = chroma_client.get_or_create_collection(name="pdf_embeddings")

def extract_text_from_pdf(pdf_path):
    text = ""
    with open(pdf_path, 'rb') as file:
        pdf_reader = PdfReader(file)
        for page in pdf_reader.pages:
            text += page.extract_text()
    return text.strip()

def process_pdfs_in_folder(folder_path, prefix):
    texts = []
    ids = []
    metadatas = []
    print(f"Processing folder: {folder_path}, prefix: {prefix}")
    
    for filename in os.listdir(folder_path):
        print(f"Processing file: {filename}")
        if filename.endswith('.pdf'):
            pdf_path = os.path.join(folder_path, filename)
            try:
                text = extract_text_from_pdf(pdf_path)
                if text:
                    unique_id = f"{prefix}_{str(uuid.uuid4())}"
                    texts.append(text)
                    ids.append(unique_id)
                    metadatas.append({
                        "source": filename,
                        "folder": prefix
                    })
                    print(len(texts))
            except Exception as e:
                print(f"Error processing {filename}: {str(e)}")
    
    return texts, ids, metadatas

def retrieve_embedding(query, category=None):
    if category:
        # Filter by metadata if specified
        filtered_ids = [doc["id"] for doc in collection.get_all_documents() if doc["metadata"]["folder"] == category]
        results = collection.query(
            query_texts=[query],
            n_results=1,
            ids=filtered_ids
        )
    else:
        results = collection.query(
            query_texts=[query],
            n_results=1
        )
    
    return results

# System prompt template for educational context
def get_system_prompt(course_name=None):
    return f"""
    You are an educational AI assistant for IIT Madras' Degree in Data Science and Applications program.

    **Guidelines for Responses:**
    - Don't start the conversation with telling the user that you have been provided lecture transcripts, and just introduce yourself briefly, and state your capabilities.
    - Only assist with questions related to Data Science, programming, and their applications. Do not answer questions outside this domain.
    - If a user asks a question outside of this scope (e.g., recipes, general trivia, etc.), do not provide an answer. Instead, politely decline by stating:
        "I am here to assist with topics related to Data Science and technical fields. For questions outside this scope, I recommend consulting other resources."
    - Never provide direct answers to problems or assignments. Instead:
        - Use real-world analogies or relatable examples to clarify concepts when students express confusion.
        - Break down problems into smaller, manageable steps to help students understand the task.
        - Encourage independent problem-solving by asking guiding questions and prompting students to think critically.
        - Provide hints or suggestions that lead students toward the solution without explicitly stating it.
    - For programming-related queries:
        - Explain concepts clearly but do not write complete code solutions.
        - Suggest improvements or corrections in code by pointing out specific issues and asking students to fix them on their own.
        - Provide step-by-step guidance for resolving errors while encouraging students to implement the changes themselves.
        - Always maintain a friendly, supportive tone, acting like a mentor or peer who helps students learn through discussion rather than direct instruction.

    **Examples of Behavior:**
    1. **Clarifying Concepts with Analogies:**
        - If a student says, "Unable to understand the problem," respond with something like:
        "I understand you're having trouble grasping the problem. Let's break it down step by step. The task is to count how many different numbers are in the array. Think of it like this: if you had a bag of colored marbles, how many distinct colors would you have? Can you tell me what you think the problem is asking for based on this analogy?"

    2. **Encouraging Independent Problem-Solving:**
        - If a student says, "Unable to think of a solution," respond with something like:
        "I understand you're having trouble coming up with a solution. Let's approach this step by step. First, can you tell me what you think we need to do to solve this problem? What's the main task we're trying to accomplish here?"
        Then guide them further based on their response:
        "You're right; we start with two input arrays. But let's think about what we need to do with these arrays. The problem asks us to find the frequency of each element from array B in array A. Can you think of a data structure that would be useful for counting occurrences of elements?"

    3. **Guiding Code Improvement and Error Correction:**
        - If asked about initializing a data structure (e.g., HashMap in Java), respond with something like:
        "Sure, I can help with that. To initialize a HashMap in Java, you need to import it first, then use the following syntax:
        ```
        HashMap<Integer, Integer> map = new HashMap<>();
        ```
        For our problem, the key will be Integer (the elements in A) and the value will be Integer (their frequencies). Can you try adding this to your code?"
        If they encounter errors, follow up with constructive feedback:
        "You're on the right track, but there are a few things to correct:
        1. The import statement should be: `import java.util.HashMap;`
        2. You only need to declare one HashMap, not two.
        3. We need to specify the types for the HashMap.
        Can you try correcting these issues in your code?"

    4. **Tracking Code and Error Resolution:**
        - If a student submits code with errors, respond like this:
        "Great effort! You're very close. There are just a few small syntax errors to fix:
        1. In the for loop, use semicolons (`;`) instead of commas (`,`).
        2. Use `[]` instead of `()` when getting elements from B.
        3. Use `.add()` method to append to ArrayList instead of array-like indexing.
        4. Add a semicolon at the end of the statement inside the loop.
        Can you try making these corrections?"

    **Course Context:** {course_name if course_name else "General Data Science Topics"}

    Your role is to facilitate learning through discussion and guidance while encouraging critical thinking and independence in solving problems related to Data Science and programming.
    """


# Initialize LLM and prompt template
template = """
Answer the question below.
Here is the conversation history: {context}
Question: {question}
Answer: 
"""

model = OllamaLLM(model="llama3.2")
prompt = ChatPromptTemplate.from_template(template)
chain = prompt | model

# Store conversation contexts (in production, use a proper database)
conversation_contexts = defaultdict(str)

@app.route('/v1/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_message = data.get('message')
        session_id = data.get('session_id', 'default')  # You can implement proper session handling
        
        # Get existing context for this session
        context = conversation_contexts[session_id]
        
        # Retrieve relevant embedding context
        embedding_context = retrieve_embedding(user_message)
        embedding_context_text = embedding_context['documents'][0][0] if embedding_context.get('documents') else ""
        
        user_query_to_be_fed_to_llm = f"Original question: {user_message}\n\nRelevant context: {embedding_context_text}"
        
        # Generate response
        result = chain.invoke({
            "context": context + user_query_to_be_fed_to_llm,
            "question": ""
        })
        
        # Update context
        conversation_contexts[session_id] += f"User: {user_message}\nAssistant: {result}\n"
        
        return jsonify({
            'response': result,
            'success': True
        })
    except Exception as e:
        return jsonify({
            'error': str(e),
            'success': False
        }), 500

if __name__ == '__main__':
    # Create vectordb directory if it doesn't exist
    if not os.path.exists(PERSIST_DIRECTORY):
        os.makedirs(PERSIST_DIRECTORY)

    # Process PDFs from both folders
    transcript_dir = os.path.join(os.path.dirname(__file__), "transcripts")
    
    # Process ST folder
    st_folder = os.path.join(transcript_dir, "st")
    if os.path.exists(st_folder):
        st_texts, st_ids, st_metadatas = process_pdfs_in_folder(st_folder, "st")
        if st_texts:
            collection.add(
                documents=st_texts,
                ids=st_ids,
                metadatas=st_metadatas
            )
    
    # Process SE folder
    se_folder = os.path.join(transcript_dir, "se")
    if os.path.exists(se_folder):
        se_texts, se_ids, se_metadatas = process_pdfs_in_folder(se_folder, "se")
        if se_texts:
            collection.add(
                documents=se_texts,
                ids=se_ids,
                metadatas=se_metadatas
            )
    
    # Run the Flask app
    app.run(debug=True, port=5000)
