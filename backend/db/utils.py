from configs.settings import settings
from motor.motor_asyncio import AsyncIOMotorClient

def get_mongodb() -> AsyncIOMotorClient:
    """Get MongoDB client instance"""
    client = AsyncIOMotorClient(settings.MONGO_DB_URL)
    return client[settings.MONGO_DB_DB]