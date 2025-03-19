from app import create_app
from together import Together
from flask import request, jsonify
# from flask_cors import CORS

app = create_app()

# CORS(app)

TOGETHER_API_KEY = "e4496792b64a18f405d6f2ff88543aaa95b6e348d688c01e9ec8133a77b68476"
client = Together(api_key=TOGETHER_API_KEY)

# Define the model to use
MODEL = "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free"

# Store chat histories for different sessions
chat_sessions = {}

# System prompt template for educational context
def get_system_prompt(course_name=None):
    return f"""
    You are an educational AI assistant for IIT Madras' Degree in Data Science and Applications program.

    **Guidelines for Responses:**
    - Only assist with questions related to Data Science and its applications.
    - Do not provide direct answers to questions; instead, guide students towards the solution by offering hints and encouraging critical thinking.
    - Provide simple, one-line responses to help students think towards the solution.
    - Engage in discussions to help students reach the correct answer on their own.

    **Course Context:** {course_name if course_name else "General Data Science Topics"}

    Your role is to facilitate learning and discussion in Data Science, helping students develop their problem-solving skills without giving away answers.
    """


@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message', '')
    session_id = data.get('session_id', 'default')
    path_param = data.get('path_param', 'default').lower()
    
    # Use path parameter as course context if available
    course_context = path_param.replace('-', ' ').title() if path_param != 'default' else None
    system_prompt = get_system_prompt(course_context)
    
    # Initialize session if it doesn't exist
    if session_id not in chat_sessions:
        chat_sessions[session_id] = [
            {"role": "system", "content": system_prompt}
        ]
    
    # Add user message to session history
    chat_sessions[session_id].append({"role": "user", "content": user_message})
    
    try:
        # Send the request to the LLM
        response = client.chat.completions.create(
            model=MODEL,
            messages=chat_sessions[session_id],
            max_tokens=1024,
            temperature=0.7
        )
        
        # Get the model's response
        assistant_response = response.choices[0].message.content
        
        # Add the assistant's response to the session history
        chat_sessions[session_id].append({"role": "assistant", "content": assistant_response})
        
        # Return the response
        return jsonify({
            "success": True,  # Changed to match frontend expectation
            "response": assistant_response,
            "history": chat_sessions[session_id]
        })
        
    except Exception as e:
        return jsonify({
            "success": False,  # Changed to match frontend expectation
            "message": str(e)
        })

if __name__ == '__main__':
    app.run(debug=True, port=5000)