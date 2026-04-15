from pydantic import BaseModel

class CourseCreate(BaseModel):
    textbookID: str
    courseTitle: str
    courseTerm: str
    courseDescription: str
    imageSrc: str | None = ""