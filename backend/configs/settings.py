from pydantic_settings import BaseSettings
from pathlib import Path

# This points to backend/configs
CURRENT_FILE_DIR = Path(__file__).resolve().parent
# This points to the root of the project (two levels up from configs -> backend -> root)
ROOT_DIR = CURRENT_FILE_DIR.parent.parent

class AppSettings(BaseSettings):
    class Config:
        # Point to the .env file in the root directory
        env_file = str(ROOT_DIR / ".env")
        env_file_encoding = "utf-8"

    # MongoDB Clusters
    INSTRUCTOR_MONGODB_URL: str
    STUDENT_MONGODB_URL: str

    # Databases
    INSTRUCTOR_MAIN_DB: str 
    STUDENT_DB: str

    # JWT
    JWT_SECRET_KEY: str
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: float = 60

settings = AppSettings()  