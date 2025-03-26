from app import create_app
from together import Together
from flask import request, jsonify
from flask_cors import CORS, cross_origin
import logging
import chromadb
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

TOGETHER_API_KEY = "e4496792b64a18f405d6f2ff88543aaa95b6e348d688c01e9ec8133a77b68476"
client = Together(api_key=TOGETHER_API_KEY)

# Define the model to use
MODEL = "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free"

chroma_client = chromadb.PersistentClient(path="vectordb")
collection = chroma_client.get_collection("pdf_embeddings")
results = collection.get()

# Store chat histories for different sessions
chat_sessions = {}

def retrive_embedding(query):
    return collection.query(
        query_texts=[query],
        n_results=1
    )

# System prompt template for educational context
def get_system_prompt(course_name=None):
    return f"""
    You are an educational AI assistant for IIT Madras' Degree in Data Science and Applications program.

    **Guidelines for Responses:**
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



@app.route('/v1/chat', methods=['POST'])
def chat():
    logger.info("Chatbot API endpoint called")
    data = request.json
    user_message = data.get('message', '')
    session_id = data.get('session_id', 'default')
    path_param = data.get('path_param', 'default').lower()
    
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

    embedding_context = retrive_embedding(user_message)
    embedding_context_text = embedding_context['documents'][0][0] if embedding_context.get('documents') else ""

    user_query_to_be_fed_to_llm = f"Original question: {user_message}\n\nRelevant context: {embedding_context_text}"
    
    # Add user message to session history
    chat_sessions[session_id].append({"role": "user", "content": user_query_to_be_fed_to_llm})
    logger.debug(f"Current history length for session {session_id}: {len(chat_sessions[session_id])}")
    
    try:
        # Log before API call
        logger.info(f"Sending request to Together API - model: {MODEL}")
        
        # Send the request to the LLM
        response = client.chat.completions.create(
            model=MODEL,
            messages=chat_sessions[session_id],
            max_tokens=1024,
            temperature=0.7
        )
        
        # Get the model's response
        assistant_response = response.choices[0].message.content
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
        "active_sessions": len(chat_sessions)
    })


if __name__ == '__main__':
    logger.info("Starting chatbot API server")
    app.run(debug=True, port=5000)