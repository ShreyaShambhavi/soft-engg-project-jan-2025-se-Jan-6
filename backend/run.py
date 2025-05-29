import os
from dotenv import load_dotenv
from PyPDF2 import PdfReader
import chromadb
import uuid
from app import create_app
from google.generativeai import GenerativeModel
import google.generativeai as genai
from flask import request, jsonify
from flask_cors import CORS, cross_origin
import logging
from pprint import pprint


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

load_dotenv()


# The API key will be provided by the user
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
api_key = os.getenv('GEMINI_API_KEY')
genai.configure(api_key=api_key)

# Define the model to use
MODEL = "gemini-2.0-flash"

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

# Initialize the Gemini API client
def initialize_gemini_client(api_key):
    genai.configure(api_key=api_key)
    return True

@app.route('/v1/chat', methods=['POST'])
def chat():
    global GEMINI_API_KEY
    
    logger.info("Chatbot API endpoint called")
    data = request.json
    user_message = data.get('message', '')
    session_id = data.get('session_id', 'default')
    path_param = data.get('path_param', 'default').lower()
    
    # Check if API key is set, or use the one provided in the request
    if not GEMINI_API_KEY:
        GEMINI_API_KEY = data.get('api_key', '')
        if not GEMINI_API_KEY:
            return jsonify({
                "success": False,
                "message": "Gemini API key not provided"
            })
        # Initialize the API with the provided key
        initialize_gemini_client(GEMINI_API_KEY)
    
    logger.debug(f"Request params - session_id: {session_id}, path_param: {path_param}")
    logger.debug(f"User message: '{user_message}'")
    
    # Use path parameter as course context if available
    course_context = path_param.replace('-', ' ').title() if path_param != 'default' else None
    system_prompt = get_system_prompt(course_context)
    
    # Initialize session if it doesn't exist
    if session_id not in chat_sessions:
        logger.debug(f"Initializing new chat session: {session_id}")
        chat_sessions[session_id] = [
            {"role": "system", "content": system_prompt}
        ]

    # Retrieve relevant embedding context
    embedding_context = retrieve_embedding(user_message)
    embedding_context_text = embedding_context['documents'][0][0] if embedding_context.get('documents') else ""

    user_query_to_be_fed_to_llm = f"Original question: {user_message}\n\nRelevant context: {embedding_context_text}"
    
    # Add user message to session history
    chat_sessions[session_id].append({"role": "user", "content": user_query_to_be_fed_to_llm})
    
    # Dynamically manage chat history to prevent exceeding token limit
    def manage_chat_history(chat_sessions, session_id, max_messages=10):
        if len(chat_sessions[session_id]) > max_messages:
            # Keep only the system message and the last (max_messages-1) messages
            system_message = chat_sessions[session_id][0]
            recent_messages = chat_sessions[session_id][-(max_messages-1):]
            chat_sessions[session_id] = [system_message] + recent_messages
    
    manage_chat_history(chat_sessions, session_id)
    
    logger.debug(f"Current history length for session {session_id}: {len(chat_sessions[session_id])}")
    
    try:
        # Log before API call
        logger.info(f"Sending request to Gemini API - model: {MODEL}")
        
        # Convert chat history to Gemini format
        gemini_messages = []
        for msg in chat_sessions[session_id]:
            if msg["role"] == "system":
                # Add system prompt as a user message at the beginning
                gemini_messages.append({"role": "user", "parts": [msg["content"]]})
                gemini_messages.append({"role": "model", "parts": ["I understand my role as an educational AI assistant for IIT Madras' Degree in Data Science and Applications program. I'll follow the guidelines provided."]})
            elif msg["role"] == "user":
                gemini_messages.append({"role": "user", "parts": [msg["content"]]})
            elif msg["role"] == "assistant":
                gemini_messages.append({"role": "model", "parts": [msg["content"]]})
        
        # Create a Gemini model instance
        model = GenerativeModel(MODEL)
        
        # Send the request to Gemini
        chat = model.start_chat(history=gemini_messages[:-1])
        response = chat.send_message(gemini_messages[-1]["parts"][0])
        
        # Get the model's response
        assistant_response = response.text
        logger.debug(f"Received response from API: '{assistant_response[:50]}...'")
        
        # Add the assistant's response to the session history
        chat_sessions[session_id].append({"role": "assistant", "content": assistant_response})
        
        # Return the response
        logger.info("Successfully processed chatbot request")
        return jsonify({
            "success": True,
            "response": assistant_response,
            "history": chat_sessions[session_id]
        })
        
    except Exception as e:
        logger.error(f"Error processing chatbot request: {str(e)}", exc_info=True)
        return jsonify({
            "success": False,
            "message": str(e)
        })


# Add a route to check if the API is working
@app.route('/v1/chatbot-status', methods=['GET'])
def chatbot_status():
    logger.info("Chatbot status endpoint called")
    return jsonify({
        "status": "operational",
        "model": MODEL,
        "api_key_set": bool(GEMINI_API_KEY),
        "active_sessions": len(chat_sessions)
    })


# Add a route to set the API key
@app.route('/v1/set-api-key', methods=['POST'])
def set_api_key():
    global GEMINI_API_KEY
    
    data = request.json
    api_key = data.get('api_key', '')
    
    if not api_key:
        return jsonify({
            "success": False,
            "message": "API key not provided"
        })
    
    try:
        # Update the API key
        GEMINI_API_KEY = api_key
        # Initialize the Gemini client with the new API key
        success = initialize_gemini_client(GEMINI_API_KEY)
        
        return jsonify({
            "success": success,
            "message": "API key set successfully"
        })
    except Exception as e:
        logger.error(f"Error setting API key: {str(e)}", exc_info=True)
        return jsonify({
            "success": False,
            "message": str(e)
        })


def main():
    global chat_sessions
    chat_sessions = {}
    
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


if __name__ == "__main__":
    main()
