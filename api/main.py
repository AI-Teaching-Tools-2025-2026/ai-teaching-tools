import sys
import os

# This tells Vercel to treat the 'api' folder as the root for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from db.utils import Database
from modules.auth.routes import auth_router
from modules.course.routes import courses_router
from modules.quiz.routes import quiz_router
from modules.chatbot.routes import chatbot_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.db = Database()
    yield
    app.db.close()

app = FastAPI(lifespan=lifespan, root_path="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(courses_router)
app.include_router(quiz_router)
app.include_router(chatbot_router)


@app.get("/")
async def read_root() -> dict[str, str]:
    return {"Hello": "World"}