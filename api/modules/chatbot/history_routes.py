from datetime import datetime, timezone
from typing import List, Optional
import httpx
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel

from configs.settings import settings
from db.utils import get_instructor_db
from modules.auth.jwt_service import verify_access_token
from modules.chatbot.models import ChatRequest
from modules.chatbot.textbook_index import (
    format_chunks_for_prompt,
    get_or_build_index,
    get_pdf_path_for_course,
    retrieve_relevant_chunks,
)

enhanced_chatbot_router = APIRouter(prefix="/chatbot", tags=["Chatbot Enhanced"])

OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"
MAX_HISTORY_MESSAGES = 100
RAG_TOP_K = 5

DEFAULT_SYSTEM_PROMPT = """You are an AI teaching assistant for a university course. Your role is to:
1. Help students understand course material by explaining concepts clearly
2. Answer questions about course content
3. Generate practice questions and quizzes when asked
4. Provide study tips and learning strategies

Be encouraging, clear, and pedagogically sound. Keep responses concise but thorough."""


class HistoryMessage(BaseModel):
    role: str
    content: str
    timestamp: str


class ChatHistoryResponse(BaseModel):
    messages: List[HistoryMessage]


class AskResponse(BaseModel):
    reply: str
    sources: Optional[List[dict]] = None


def _get_current_user(request: Request) -> str:
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    user_id = verify_access_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return user_id


@enhanced_chatbot_router.post("/index/{course_id}")
async def build_index_for_course(course_id: str, request: Request, db=Depends(get_instructor_db)):
    _get_current_user(request)

    pdf_path = await get_pdf_path_for_course(course_id, db)
    if not pdf_path:
        raise HTTPException(status_code=404, detail="No textbook PDF found for this course. Generate a question bank first.")

    try:
        index = await get_or_build_index(pdf_path)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"PDF not found at {pdf_path}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to build index: {str(e)}")

    return {
        "message": "Index ready",
        "textbookName": index.get("textbookName"),
        "chunkCount": len(index.get("chunks", [])),
    }


@enhanced_chatbot_router.get("/history/{course_id}", response_model=ChatHistoryResponse)
async def get_history(course_id: str, request: Request, db=Depends(get_instructor_db)):
    user_id = _get_current_user(request)
    session = await db["chat_sessions"].find_one({"userId": user_id, "courseId": course_id})
    if not session:
        return ChatHistoryResponse(messages=[])
    return ChatHistoryResponse(messages=session.get("messages", []))


@enhanced_chatbot_router.delete("/history/{course_id}")
async def clear_history(course_id: str, request: Request, db=Depends(get_instructor_db)):
    user_id = _get_current_user(request)
    await db["chat_sessions"].delete_one({"userId": user_id, "courseId": course_id})
    return {"message": "History cleared"}


def _build_system_prompt(config, course, retrieved_passages_text: str) -> str:
    if config and config.get("systemPrompt"):
        prompt = config["systemPrompt"]
    else:
        prompt = DEFAULT_SYSTEM_PROMPT

    if course:
        prompt += f"\n\nYou are assisting with the course: {course.get('courseTitle', 'Unknown')}."
        if course.get("courseDescription"):
            prompt += f" Course description: {course['courseDescription']}"

    if config and config.get("topics"):
        prompt += f"\n\nFocus on these topics: {config['topics']}"

    if config and config.get("restrictions"):
        prompt += f"\n\nIMPORTANT RULES:\n{config['restrictions']}"

    if retrieved_passages_text:
        prompt += "\n\n" + ("=" * 40) + "\n" + retrieved_passages_text

    return prompt


async def _persist_turn(db, user_id: str, course_id: str, user_msg: str, assistant_msg: str) -> None:
    now = datetime.now(timezone.utc).isoformat()
    new_messages = [
        {"role": "user", "content": user_msg, "timestamp": now},
        {"role": "assistant", "content": assistant_msg, "timestamp": now},
    ]
    await db["chat_sessions"].update_one(
        {"userId": user_id, "courseId": course_id},
        {
            "$push": {"messages": {"$each": new_messages, "$slice": -MAX_HISTORY_MESSAGES}},
            "$set": {"updatedAt": now},
            "$setOnInsert": {"createdAt": now},
        },
        upsert=True,
    )


@enhanced_chatbot_router.post("/ask", response_model=AskResponse)
async def ask(chat_request: ChatRequest, request: Request, db=Depends(get_instructor_db)):
    user_id = _get_current_user(request)

    config = await db["chatbot_configs"].find_one({"courseId": chat_request.courseId})
    course = await db["courses"].find_one({"_id": chat_request.courseId})

    last_user_msg = chat_request.messages[-1].content if chat_request.messages else ""

    # 1. RAG: retrieve relevant textbook passages
    retrieved_chunks: list[dict] = []
    pdf_path = await get_pdf_path_for_course(chat_request.courseId, db)
    if pdf_path and last_user_msg:
        try:
            index = await get_or_build_index(pdf_path)
            retrieved_chunks = await retrieve_relevant_chunks(index, last_user_msg, k=RAG_TOP_K)
        except Exception as e:
            print(f"[chatbot/ask] RAG failed, continuing without context: {e}")

    passages_text = format_chunks_for_prompt(retrieved_chunks)

    # 2. Build prompt and call OpenAI
    system_prompt = _build_system_prompt(config, course, passages_text)
    temperature = config.get("temperature", 0.7) if config else 0.7

    openai_messages = [{"role": "system", "content": system_prompt}]
    for msg in chat_request.messages:
        openai_messages.append({"role": msg.role, "content": msg.content})

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                OPENAI_API_URL,
                headers={
                    "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": settings.OPENAI_MODEL,
                    "messages": openai_messages,
                    "max_tokens": 1024,
                    "temperature": temperature,
                },
            )

            if response.status_code != 200:
                error_detail = response.json().get("error", {}).get("message", "OpenAI API error")
                raise HTTPException(status_code=502, detail=error_detail)

            reply = response.json()["choices"][0]["message"]["content"]

    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="AI response timed out. Try again.")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get AI response: {str(e)}")

    # 3. Save the turn so chat history survives a refresh
    try:
        await _persist_turn(db, user_id, chat_request.courseId, last_user_msg, reply)
    except Exception as e:
        print(f"[chatbot/ask] failed to persist chat turn: {e}")

    sources = [
        {"chapterNum": c["chapterNum"], "chapterTitle": c["chapterTitle"], "score": c["score"]}
        for c in retrieved_chunks
    ]
    return AskResponse(reply=reply, sources=sources)