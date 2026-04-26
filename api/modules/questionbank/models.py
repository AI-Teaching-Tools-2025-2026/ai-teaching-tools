from pydantic import BaseModel
from typing import List, Literal

class Answer(BaseModel):
    text: str
    isCorrect: bool

class Question(BaseModel):
    questionId: str
    questionType: Literal["multiple-choice", "true-false"]
    questionText: str
    questionPoints: int
    answers: List[Answer]

class QuestionBankCreate(BaseModel):
    title: str
    chapter: str
    courseID: str
    sourceFile: str
    createdAt: str
    lastModified: str
    questionCount: int
    questions: List[Question]