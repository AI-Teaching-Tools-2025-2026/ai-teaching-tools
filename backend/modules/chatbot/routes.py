from fastapi import APIRouter, HTTPException, Request, Depends
from .models import ChatRequest, ChatResponse, ChatbotConfigRequest
from configs.settings import settings
from db.utils import get_instructor_db
from modules.auth.jwt_service import verify_access_token
from datetime import datetime, timezone
from pathlib import Path
import httpx
import re

chatbot_router = APIRouter(prefix="/chatbot", tags=["Chatbot"])

OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"

# same textbook files the quiz pipeline uses
TEXTBOOK_DIR = Path(__file__).resolve().parent.parent.parent / "AI_core" / "quiz_pipeline" / "textbook_chapters"

DEFAULT_SYSTEM_PROMPT = """You are an AI teaching assistant for a university course. Your role is to:
1. Help students understand course material by explaining concepts clearly
2. Answer questions about course content
3. Generate practice questions and quizzes when asked
4. Provide study tips and learning strategies

Be encouraging, clear, and pedagogically sound. Keep responses concise but thorough."""


# TODO: this is copy-pasted from auth routes, should probably be shared middleware
def get_current_user(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    user_id = verify_access_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return user_id


def get_available_chapters() -> dict[int, Path]:
    chapters = {}
    if not TEXTBOOK_DIR.exists():
        return chapters

    for f in TEXTBOOK_DIR.glob("*.txt"):
        match = re.search(r"chapter_(\d+)", f.name)
        if match:
            chapters[int(match.group(1))] = f

    return dict(sorted(chapters.items()))


def load_chapter_text(chapter_path: Path, max_chars: int = 30000) -> str:
    text = chapter_path.read_text(encoding="utf-8", errors="replace")
    if len(text) > max_chars:
        text = text[:max_chars] + "\n\n[... chapter truncated for length ...]"
    return text


def pick_relevant_chapters(user_message, available_chapters, config_topics=""):
    """Figures out which chapters to inject based on user msg + instructor config."""
    selected = []

    # user says "chapter 5" -> load chapter 5
    chapter_refs = re.findall(r"chapter\s*(\d+)", user_message.lower())
    for ref in chapter_refs:
        num = int(ref)
        if num in available_chapters:
            selected.append(num)

    if selected:
        return selected

    # fall back to whatever the instructor configured
    if config_topics:
        topic_refs = re.findall(r"chapter\s*(\d+)", config_topics.lower())
        for ref in topic_refs:
            num = int(ref)
            if num in available_chapters:
                selected.append(num)

    # handle ranges like "1-3"
    if config_topics:
        range_refs = re.findall(r"(\d+)\s*[-–]\s*(\d+)", config_topics)
        for start, end in range_refs:
            for num in range(int(start), int(end) + 1):
                if num in available_chapters and num not in selected:
                    selected.append(num)

    return selected


# config endpoints 

@chatbot_router.get("/config/{course_id}")
async def get_config(
    course_id: str,
    request: Request,
    db=Depends(get_instructor_db),
):
    get_current_user(request)
    config = await db["chatbot_configs"].find_one({"courseId": course_id})
    if not config:
        raise HTTPException(status_code=404, detail="No chatbot config found")
    config["_id"] = str(config["_id"])
    return config


@chatbot_router.post("/config")
async def save_config(
    config_data: ChatbotConfigRequest,
    request: Request,
    db=Depends(get_instructor_db),
):
    get_current_user(request)
    now = datetime.now(timezone.utc).isoformat()
    doc = config_data.model_dump()
    doc["updatedAt"] = now

    existing = await db["chatbot_configs"].find_one(
        {"courseId": config_data.courseId}
    )
    if existing:
        await db["chatbot_configs"].update_one(
            {"courseId": config_data.courseId}, {"$set": doc}
        )
        return {"message": "Config updated", "status": config_data.status}
    else:
        doc["createdAt"] = now
        await db["chatbot_configs"].insert_one(doc)
        return {"message": "Config created", "status": config_data.status}


@chatbot_router.get("/chapters")
async def list_chapters(request: Request):
    """List available textbook chapters (for the config UI)."""
    get_current_user(request)
    chapters = get_available_chapters()
    return {
        "chapters": [
            {"number": num, "filename": path.name}
            for num, path in chapters.items()
        ]
    }


# chat 

def build_system_prompt(config, course, chapter_texts):
    # combines instructor config + course info + textbook content into one prompt

    if config and config.get("systemPrompt"):
        prompt = config["systemPrompt"]
    else:
        prompt = DEFAULT_SYSTEM_PROMPT

    if course:
        title = course.get("courseTitle", "Unknown")
        desc = course.get("courseDescription", "")
        prompt += f"\n\nYou are assisting with the course: {title}."
        if desc:
            prompt += f" Course description: {desc}"

    if config and config.get("topics"):
        prompt += f"\n\nFocus on these topics: {config['topics']}"

    if config and config.get("restrictions"):
        prompt += f"\n\nIMPORTANT RULES:\n{config['restrictions']}"

    # stuff textbook chapters into context
    if chapter_texts:
        prompt += "\n\n" + "=" * 40
        prompt += "\nTEXTBOOK REFERENCE MATERIAL"
        prompt += "\n" + "=" * 40
        prompt += "\nUse the following textbook content to answer the student's questions accurately. "
        prompt += "Quote or reference specific passages when relevant. "
        prompt += "If the answer is not in the provided material, say so and offer what you can.\n"

        for chapter_num in sorted(chapter_texts.keys()):
            prompt += f"\n--- CHAPTER {chapter_num} ---\n"
            prompt += chapter_texts[chapter_num]
            prompt += "\n"

    return prompt


@chatbot_router.post("/chat", response_model=ChatResponse)
async def chat(
    chat_request: ChatRequest,
    request: Request,
    db=Depends(get_instructor_db),
):
    user_id = get_current_user(request)

    # Load config and course
    config = await db["chatbot_configs"].find_one(
        {"courseId": chat_request.courseId}
    )
    course = await db["courses"].find_one({"_id": chat_request.courseId})

    # Figure out which chapters to load
    available = get_available_chapters()
    last_user_msg = ""
    if chat_request.messages:
        last_user_msg = chat_request.messages[-1].content

    chapter_nums = pick_relevant_chapters(
        last_user_msg,
        available,
        config.get("topics", "") if config else "",
    )

    # Load chapter texts (limit to 3 chapters max to stay within context)
    chapter_texts = {}
    for num in chapter_nums[:3]:
        if num in available:
            chapter_texts[num] = load_chapter_text(available[num])

    # Build system prompt with textbook content
    system_prompt = build_system_prompt(config, course, chapter_texts)

    # Temperature from config
    temperature = 0.7
    if config and "temperature" in config:
        temperature = config["temperature"]

    # Build OpenAI messages
    openai_messages = [{"role": "system", "content": system_prompt}]
    for msg in chat_request.messages:
        openai_messages.append({"role": msg.role, "content": msg.content})

    # Call OpenAI
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
                error_detail = (
                    response.json()
                    .get("error", {})
                    .get("message", "OpenAI API error")
                )
                raise HTTPException(status_code=502, detail=error_detail)

            data = response.json()
            reply = data["choices"][0]["message"]["content"]
            return ChatResponse(reply=reply)

    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504, detail="AI response timed out. Try again."
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to get AI response: {str(e)}"
        )
