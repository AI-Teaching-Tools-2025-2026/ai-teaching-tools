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
  description: string;
  dueDate: string;
  totalPoints: number;
  questions: Question[];
}

// Builder specific types
export interface BuilderQuestion {
  id: string; // For frontend local state
  text: string;
  type: "multiple-choice" | "true-false";
  points: number;
  options?: string[];
  correctAnswer?: string;
}

// Convert BuilderQuestion into Question
export const transformBuilderQuestions = (
  builderQuestions: BuilderQuestion[]
): Question[] => {
  return builderQuestions.map((q, index) => {
    let answers: Answer[] = [];

    // Multiple choice
    if (q.type === "multiple-choice") {
      answers = (q.options || []).map((opt) => ({
        text: opt,
        isCorrect: opt === q.correctAnswer,
      }));
    }

    // True / False
    if (q.type === "true-false") {
      answers = ["True", "False"].map((opt) => ({
        text: opt,
        isCorrect: opt === q.correctAnswer,
      }));
    }

    return {
      questionId: index + 1,
      questionPoints: q.points,
      question: q.text,
      answers,
    };
  });
};

export interface QuizTypeOption {
  id: string;
  name: string;
}
