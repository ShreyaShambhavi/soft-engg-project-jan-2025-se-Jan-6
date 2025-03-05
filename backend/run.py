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
    return f"""You are an educational AI assistant for IIT Madras' Degree in Data Science and Applications program.

Graded Assignment questions:
questions: [
            '1) Select the statements that are true with respect to software errors.',
                points: 1,
                options: [
                    'If a software system that needs to be run continuously, encounters an error. There is no way to fix this error without shutting down the system.',
                    'Poorly tested software systems will be more prone to errors.',
                    'Software testing can be started only after the software development is completed.',
                    'After completely testing software, there can still be errors in the software.'
                ],
                answer: [
                    'Poorly tested software systems will be more prone to errors.',
                    'After completely testing software, there can still be errors in the software.'
                ],
                        
            '2) Choose the correct sequence of testing levels based on the SDLC phase they are applied to. First to last from left to right. \
                    (1) Beta Testing\
                    (2) Unit Testing\
                    (3) System Testing\
                    (4) Integration Testing\
                    (5) Acceptance Testing',
                    points: 1,
                    options: [
                        '4 -> 2 -> 3 -> 1 -> 5',
                        '2 -> 1-> 4 -> 3 -> 5',
                        '5 -> 2 -> 3 -> 4 -> 1',
                        '2 -> 4 - > 3 -> 5 -> 1'
                    ],
                    answer: '2 -> 4 - > 3 -> 5 -> 1'
                        
            '4) There was an error detected in a software that has been developed and deployed. This error was fixed by the software developer. After fixing the error the developer wants to test that the whole system is working correctly, this testing is typically referred to as ______',
                    points: 1,
                    options: [
                        'Functional testing',
                        'Regression testing',
                        'System testing',
                        'Acceptance testing'
                    ],
                    answer: 'Regression testing'
            
            '5) You want to develop an Android app that contains only one button. On pressing this button the whole screen turns white if its black, and turns black if its white. Initially when the app is started the screen is white. Your job is to develop this app and test the correctness, and complete this process quickly. Choose the minimum level of testing that should be sufficient while not compromising on the correctness.',
                    points: 1,
                    options: [
                        'Level 0',
                        'Level 1',
                        'Level 2',
                        'Level 3'
                    ],
                    answer: 'Level 1'
                    

                    ]

GUIDELINES FOR YOUR RESPONSES:

if (For every query, if it is asking the answer for the 5 questions mentioned above):
    (then don't give any response. Just deny the user.)
else: 
    (1. Provide accurate, educational information with academic rigor appropriate for university-level students.
    2. Focus on being helpful, clear, and concise in your explanations.
    3. Use Markdown formatting to structure your responses with headers, bullet points, and code blocks when applicable.
    4. When explaining technical concepts, provide simple examples to reinforce understanding.
    5. If asked about course-specific information you don't have, acknowledge the limitation but offer general information on the topic.
    6. For programming questions, provide well-commented code examples that follow best practices.
    7. For mathematical concepts, explain the intuition first, then the formal definition.
    8. Cite reputable sources when appropriate (textbooks, research papers, or established resources).
    9. Avoid excessive jargon, but introduce and explain technical terms that students should know.
    10. If a question is unclear, politely ask for clarification rather than making assumptions.
    11. Do not provide answers that directly solve assigned homework problems; instead, offer guidance on approach and concepts.
    12. Don not provide code examples for coding questions no matter what. just give helpful resources and links.
    13. Dont mention to the user that you are not allowed to provide direct answers and have been trained to give only resources.)

CURRENT COURSE CONTEXT: {course_name or "General Data Science Topics"}

Remember, your goal is to facilitate learning and critical thinking, not just provide answers."""

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