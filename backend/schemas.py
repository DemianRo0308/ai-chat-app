from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class MessageBase(BaseModel):
    role: str
    content: str

class MessageResponse(BaseModel):
    id: int
    session_id: int
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True

class SessionCreate(BaseModel):
    title: Optional[str] = "New Chat"

class SessionResponse(BaseModel):
    id: int
    title: str
    created_at: datetime

    class Config:
        from_attributes = True

class ChatRequest(BaseModel):
    session_id: int
    messages: List[MessageBase]

class ChatResponse(BaseModel):
    reply: str