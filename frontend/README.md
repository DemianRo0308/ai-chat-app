# AI Chat App

A full-stack AI chat application built with React and FastAPI, powered by the OpenAI API. Inspired by ChatGPT, this project features real-time conversation, persistent chat history, and a clean modern UI.

## Features

- Multi-turn conversations with context retention
- Chat history saved to a local database — persists after page refresh
- Multiple chat sessions with the ability to delete them
- Responsive, dark-mode UI built from scratch
- RESTful backend with auto-generated API documentation

## Tech Stack

**Frontend**
- React
- Axios

**Backend**
- Python, FastAPI
- SQLAlchemy, SQLite
- OpenAI API

**Deployment**
- Frontend: Vercel
- Backend: Railway

## Getting Started

### Prerequisites
- Python 3.9+
- Node.js 16+
- OpenAI API key

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory:

APP_NAME=AI Chat App
DEBUG=True
OPENAI_API_KEY=your_openai_api_key_here

Start the server:

```bash
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Health check |
| GET | /sessions | Get all chat sessions |
| POST | /sessions | Create a new session |
| DELETE | /sessions/{id} | Delete a session |
| GET | /sessions/{id}/messages | Get messages for a session |
| POST | /chat | Send a message and get AI response |

## Project Structure

ai-chat-app/
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   └── requirements.txt
└── frontend/
└── src/
├── App.js
├── App.css
└── index.css

## License

MIT