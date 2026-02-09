from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from modules.auth.service import router as api_router
from db.utils import get_mongodb

@asynccontextmanager
async def lifespan(app: FastAPI):
    # set up MongoDB
    mongodb = get_mongodb()
    app.mongodb = mongodb
    yield
    # close MongoDB connection
    mongodb.client.close()

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.get("/")
async def read_root() -> dict[str, str]:
    return {"Hello": "World"}