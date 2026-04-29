// Question Bank Types (MongoDB formatted)
import { BuilderQuestion } from "@/types/quiz";

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

// Convert BuilderQuestion into Question Bank Question
export const transformBuilderToQBQuestions = (
  builderQuestions: BuilderQuestion[],
): Question[] => {
  return builderQuestions.map((q) => {
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
      questionId: q.id,
      questionPoints: q.points,
      questionText: q.text,
      questionType: q.type,
      answers,
    };
  });
};

// Convert Question Bank Question back to BuilderQuestion
export const transformQBQuestionsToBuilder = (
  questions: Question[],
): BuilderQuestion[] => {
  return questions.map((q) => {
    const correctAnswer = q.answers.find((a) => a.isCorrect)?.text;
    const options =
      q.questionType === "multiple-choice"
        ? q.answers.map((a) => a.text)
        : undefined;

    return {
      id: q.questionId,
      text: q.questionText,
      type: q.questionType,
      points: q.questionPoints,
      options,
      correctAnswer,
    };
  });
};
