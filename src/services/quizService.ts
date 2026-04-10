import { QuizData, Question, Answer } from "@/types/quiz";
import axios from "axios";

export const quizService = {
  getAllQuizzes: async (courseId: string): Promise<QuizData[]> => {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/quiz/fetch_quizzes`,
      {
        params: { courseId },
        withCredentials: true,
      },
    );

    return response.data;
  },

  getQuizById: async (quizId: string): Promise<QuizData> => {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/quiz/${quizId}`,
      { withCredentials: true },
    );
    return response.data;
  },

  createQuiz: async (quiz: QuizData): Promise<QuizData> => {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/quiz`,
      quiz,
      { withCredentials: true },
    );
    return response.data;
  },

  updateQuiz: async (quizId: string, quiz: QuizData): Promise<QuizData> => {
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/quiz/${quizId}`,
      quiz,
      { withCredentials: true },
    );

    return response.data;
  },

  deleteQuizById: async (quizId: string): Promise<void> => {
    await axios.delete(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/quiz/${quizId}`,
      { withCredentials: true },
    );
  },

  duplicateQuizById: async (quizId: string): Promise<QuizData> => {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/quiz/${quizId}/duplicate`,
      {},
      { withCredentials: true },
    );

    return response.data;
  },
};
