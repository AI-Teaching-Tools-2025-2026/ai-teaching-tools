export interface Answer {
  text: string;
  isCorrect: boolean;
}

export interface Question {
  questionId: number; // For DB/API question
  question: string;
  answers: Answer[];
}

export interface QuizData {
  _id: string;
  title: string;
  status: "Published" | "Draft";
  section: string;
  courseId: string;
  timestamp: { $date: string };
  dueDate: string; // ISO Date string
  points: number;
  questions: Question[];
}

// Builder specific types
export interface BuilderQuestion {
  id: string; // For frontend local state
  text: string;
  type: "multiple-choice" | "true-false" | "short-answer";
  options?: string[];
  correctAnswer?: string;
}

export interface QuizTypeOption {
  id: string;
  name: string;
}
