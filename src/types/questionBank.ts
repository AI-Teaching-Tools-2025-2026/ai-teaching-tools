// Question Bank Types (MongoDB formatted)

export interface Answer {
  text: string;
  isCorrect: boolean;
}

export interface Question {
  questionId: string;
  questionType: "multiple-choice" | "true-false";
  questionText: string;
  questionPoints: number;
  answers: Answer[];
}

export interface QuestionBank {
  _id: string;
  title: string;
  chapter: string;
  courseID: string;
  sourceFile: string;
  createdAt: string;
  lastModified: string;
  questionCount: number;
  questions: Question[]; 
}