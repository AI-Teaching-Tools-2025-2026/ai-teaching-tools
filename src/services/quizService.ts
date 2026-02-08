import { mockQuizzes, QuizData } from "@/components/quizzes/mockData";

// Simulate database delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const quizService = {
  getAllQuizzes: async (): Promise<QuizData[]> => {
    // Simulate API call
    console.log("Fetching quizzes via service...");
    await delay(500); 
    // In the future, this will be:
    // const response = await axios.get('/api/quizzes');
    // return response.data;
    return mockQuizzes;
  },

  getQuizById: async (id: string): Promise<QuizData | undefined> => {
    await delay(300);
    return mockQuizzes.find((q) => q.quizId === id);
  }
};
