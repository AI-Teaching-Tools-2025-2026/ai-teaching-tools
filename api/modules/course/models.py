from pydantic import BaseModel

class CourseCreate(BaseModel):
    # textbookID: str | None = None
    courseTitle: str
    courseTerm: str
    courseDescription: str
    imageSrc: str | None = ""
    cardColor: str | None = "#2563eb"


class CourseUpdate(BaseModel):
    # textbookID: str | None = None
    courseTitle: str | None = None
    courseTerm: str | None = None
    courseDescription: str | None = None
    imageSrc: str | None = None
    cardColor: str | None = None