from pydantic import BaseModel
from typing import List



class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    courseId: str
    messages: List[ChatMessage]

class ChatResponse(BaseModel):
    reply: str

class ChatbotConfigRequest(BaseModel):
    courseId: str
    botName: str = "AI Tutor"
    persona: str = "Socratic Tutor"
    systemPrompt: str = ""
    topics: str = ""
    restrictions: str = ""
    welcomeMessage: str = "Hi! I'm your AI tutor. How can I help?"
    temperature: float = 0.7
    status: str = "draft"  # "draft" or "active"
