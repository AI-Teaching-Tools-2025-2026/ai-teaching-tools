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
        env_prefix = "app_"

    # MongoDB
    MONGO_DB_URL: str
    MONGO_DB_DB: str

    # JWT
    JWT_SECRET_KEY: str
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: float = 60

settings = AppSettings()  