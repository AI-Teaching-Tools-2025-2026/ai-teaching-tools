from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

# This points to backend/configs
CURRENT_FILE_DIR = Path(__file__).resolve().parent
# This points to the root of the project (two levels up from configs -> backend -> root)
ROOT_DIR = CURRENT_FILE_DIR.parent.parent

class AppSettings(BaseSettings):

    model_config = SettingsConfigDict(
        env_file=str(ROOT_DIR / ".env"),
        env_file_encoding="utf-8",
        extra='ignore'  
    )

    # MongoDB Clusters
    INSTRUCTOR_MONGODB_URL: str
    STUDENT_MONGODB_URL: str

    # Databases
    INSTRUCTOR_MAIN_DB: str 
    STUDENT_DB: str

    # JWT
    JWT_SECRET_KEY: str
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: float = 60

    # OpenAI
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"

settings = AppSettings()  