from flask import Flask, request, jsonify
from flask_cors import CORS
from langchain_ollama import OllamaLLM
from langchain.prompts import ChatPromptTemplate
from collections import defaultdict
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.vectorstores import FAISS
from langchain.embeddings import HuggingFaceEmbeddings
from pypdf import PdfReader

app = Flask(__name__)
CORS(app)

reader = PdfReader("test.pdf")
transcript = ""
for page in reader.pages:
    transcript += page.extract_text() + "\n"

# Initialize text splitter
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50,
    separators=["\n\n", "\n", ".", "!", "?", ",", " ", ""]
)
chunks = text_splitter.split_text(transcript)

embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

vector_store = FAISS.from_texts(chunks, embeddings)

template = """
Answer the question below based on the provided context.

Context from transcript: {context}
Conversation history: {chat_history}

Question: {question}

Answer the question based on the context provided. If the answer is not in the context, say "I don't have enough information to answer that question."

Answer:
"""

model = OllamaLLM(model="llama3.2")
prompt = ChatPromptTemplate.from_template(template)
chain = prompt | model
conversation_contexts = defaultdict(str)

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_input = data.get('message')
        session_id = data.get('session_id', 'default')
        chat_history = conversation_contexts[session_id]
        docs = vector_store.similarity_search(user_input, k=3)
        relevant_context = "\n\n".join([doc.page_content for doc in docs])
        result = chain.invoke({
            "context": relevant_context,
            "chat_history": chat_history,
            "question": user_input
        })
        conversation_contexts[session_id] += f"User: {user_input}\nAssistant: {result}\n"
        
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
    app.run(debug=True, port=5000)
