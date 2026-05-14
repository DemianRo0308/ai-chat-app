from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from openai import OpenAI
from typing import List
import os

from database import engine, get_db, Base
from models import Session as SessionModel, Message as MessageModel
from schemas import (
    ChatRequest, ChatResponse,
    SessionCreate, SessionResponse,
    MessageResponse
)

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(title=os.getenv("APP_NAME", "AI Chat App"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@app.get("/")
def read_root():
    return {"message": "AI Chat App API is running"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/sessions", response_model=SessionResponse)
def create_session(data: SessionCreate, db: Session = Depends(get_db)):
    session = SessionModel(title=data.title)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

@app.get("/sessions", response_model=List[SessionResponse])
def get_sessions(db: Session = Depends(get_db)):
    return db.query(SessionModel).order_by(SessionModel.created_at.desc()).all()

@app.delete("/sessions/{session_id}")
def delete_session(session_id: int, db: Session = Depends(get_db)):
    db.query(MessageModel).filter(MessageModel.session_id == session_id).delete()
    db.query(SessionModel).filter(SessionModel.id == session_id).delete()
    db.commit()
    return {"message": "Session deleted"}

@app.get("/sessions/{session_id}/messages", response_model=List[MessageResponse])
def get_messages(session_id: int, db: Session = Depends(get_db)):
    return db.query(MessageModel).filter(
        MessageModel.session_id == session_id
    ).order_by(MessageModel.created_at).all()

@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest, db: Session = Depends(get_db)):
    try:
        messages = [{"role": "system", "content": "You are a helpful assistant."}]
        for msg in request.messages:
            messages.append({"role": msg.role, "content": msg.content})

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages
        )
        reply = response.choices[0].message.content

        user_msg = request.messages[-1]
        db.add(MessageModel(
            session_id=request.session_id,
            role=user_msg.role,
            content=user_msg.content
        ))
        db.add(MessageModel(
            session_id=request.session_id,
            role="assistant",
            content=reply
        ))

        if len(request.messages) == 1:
            db.query(SessionModel).filter(
                SessionModel.id == request.session_id
            ).update({"title": user_msg.content[:40]})

        db.commit()
        return ChatResponse(reply=reply)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))