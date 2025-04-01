# soft-engg-project-jan-2025-se-Jan-6
Software Engineering Project [Jan 2025 Term - Team 6] - AI Agent for Academic Guidance 

This is a React-based frontend integrated with a Flask backend. This project is designed as an AI-powered academic guidance assistant, helping students with various course-related activities. The AI chatbot serves as a virtual assistant, answering queries, providing resources, and assisting with academic queries.


## Features
- Dynamic navigation with routes
- Responsive and stylish UI
- Profile page with a professional design
- Desing Based on the submitted wireframe
- AI Chatbot Assistant – Provides academic guidance based on user query
- Course Management – Allows students to select, drop, or change courses
- Lecture & Notes Access – View and download lecture materials and notes
- Chatroom – Enables discussions and collaboration among students, professors and TAs
- Past Year Questions (PYQs) – Access and review previous exam questions
- Assignments – View and submit assignments

## Installation



### Clone the Repository
```sh
git clone git@github.com:ShreyaShambhavi/soft-engg-project-jan-2025-se-Jan-6.git
cd soft-engg-project-jan-2025-se-Jan-6
```

## Backend:

### Create a virtual environment:
```
python -m venv .venv
```

### Activate the venv:
```
.\venv\Scripts\activate
```

### cd into the backend directory
```
cd backend
```
### Install the required libraries from the requirements.txt
```
pip install -r requirements.txt
```

### Run the backend file:
```
python run.py
```
The backend should now be active at `http://localhost:5000/`


## Frontend:

### Prerequisites
Ensure you have the following installed:
- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/) 

### cd into the frontend directory

### Install Dependencies
```sh
npm install

```

## Usage

### Start the Development Server
```sh
npm run dev

```

The application should now be running at `http://localhost:5173/`.

### Build for Production
```sh
npm run build

```

### Running the Production Build
```sh
npm run preview
```

## Project Structure
```
Project Folder/
├──backend/
| ├── app/
| │   ├── api/
| │   │   ├── __init__.py
| │   │   └── auth.py
| │   ├── __init__.py
| │   ├── models.py
| ├── tests/
| │   ├── test_api.py
| │   └── test_chatbot.py
| ├── transcripts/
| ├── config.py
| ├── requirements.txt
| ├── pdf_embeddings.py
| └── run.py
|
├──frontend/
| │── src/
| │   ├── components/    # Reusable React components/Pages
| │   ├── App.jsx        # Main application component
| │   ├── main.jsx       # React entry point
| │
| ├── public/            # Static assets
| ├── package.json       # Project dependencies and scripts
| ├── README.md          # Project documentation
```

## Environment Variables
You are advised to use the Virtual Env especially for the backend as mentioned above.

## Contributing
This is an Academic Project, and only assigned students can contribute.

## License
This project is for Academic Purposes only (as of now).

## Contact
For any inquiries from IITM BS Degree, reach out via official student email ids.
Everyone else please refrain from making any contacts as this is an Acadmic Project only.


