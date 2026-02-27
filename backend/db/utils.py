from configs.settings import settings
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi import Request, Depends

def get_mongodb() -> AsyncIOMotorClient:
    """Get MongoDB client instance"""
    client = AsyncIOMotorClient(settings.MONGO_DB_URL)
    return client[settings.MONGO_DB_DB]

class Database:
    def __init__(self):

        # MongoDB Clusters
        self.instructor_client = AsyncIOMotorClient(
            settings.INSTRUCTOR_MONGODB_URL
        )

        self.student_client = AsyncIOMotorClient(
            settings.STUDENT_MONGODB_URL
        )

    # Databases
    def instructor_main(self):
        return self.instructor_client[
            settings.INSTRUCTOR_MAIN_DB
        ]

    def student(self):
        return self.student_client[
            settings.STUDENT_DB
        ]

    # Cleanup
    def close(self):
        self.instructor_client.close()
        self.student_client.close()


def get_database(request: Request) -> Database:
    return request.app.db


def get_instructor_db(db: Database = Depends(get_database)):
    return db.instructor_main()


def get_student_db(db: Database = Depends(get_database)):
    return db.student()