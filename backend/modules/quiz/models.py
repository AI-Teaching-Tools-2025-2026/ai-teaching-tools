from pydantic import BaseModel
from typing import List

class Answer(BaseModel):
    text: str
    isCorrect: bool


class Question(BaseModel):
    questionId: int
    questionPoints: int
    question: str
    answers: List[Answer]


class QuizCreate(BaseModel):
    quizTitle: str
    quizStatus: str = "Draft"
    section: str
    courseId: str
    createdAt: str
    description: str
    dueDate: str
    totalPoints: int
    questions: List[Question]