// Formatted to MongoDB Schema

export interface Answer {
  text: string;
  isCorrect: boolean;
}

export interface Question {
  questionId: number;
  questionPoints: number; 
  question: string;
  answers: Answer[];
}

export interface QuizData {
  _id: string;
  quizTitle: string;        
  quizStatus: "Published" | "Draft"; 
  section: string;
  courseId: string;
  createdAt: string;      
  dueDate: string;
  totalPoints: number;      
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