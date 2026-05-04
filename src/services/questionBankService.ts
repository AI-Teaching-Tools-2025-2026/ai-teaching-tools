import { QuestionBank } from "@/types/questionBank";
import axios from "axios";

export const questionBankService = {
  getAllQuestionBanks: async (courseId: string): Promise<QuestionBank[]> => {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/question_bank/fetch_question_banks`,
      {
        params: { courseId },
        withCredentials: true,
      },
    );

    return response.data;
  },

  getQuestionBankById: async (
    questionBankId: string,
  ): Promise<QuestionBank> => {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/question_bank/${questionBankId}`,
      { withCredentials: true },
    );
    return response.data;
  },

  createQuestionBank: async (
    questionBank: QuestionBank,
  ): Promise<QuestionBank> => {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/question_bank`,
      questionBank,
      { withCredentials: true },
    );
    return response.data;
  },

  updateQuestionBank: async (
    questionBankId: string,
    questionBank: QuestionBank,
  ): Promise<QuestionBank> => {
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/question_bank/${questionBankId}`,
      questionBank,
      { withCredentials: true },
    );

    return response.data;
  },

  deleteQuestionBankById: async (questionBankId: string): Promise<void> => {
    await axios.delete(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/question_bank/${questionBankId}`,
      { withCredentials: true },
    );
  },

  duplicateQuestionBankById: async (
    questionBankId: string,
  ): Promise<QuestionBank> => {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/question_bank/${questionBankId}/duplicate`,
      {},
      { withCredentials: true },
    );

    return response.data;
  },

  generateQuestionBanks: async (
    courseId: string,
    file: File,
  ): Promise<{ message: string; jobId: string }> => {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/question_bank/generate_question_banks`,
      file,
      {
        params: { courseId },
        headers: {
          "Content-Type": "application/octet-stream",
          filename: file.name,
        },
        withCredentials: true,
      },
    );

    return response.data;
  },

  checkJobStatus: async (
    jobId: string,
  ): Promise<{ jobId: string; status: string }> => {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/question_bank/jobs/${jobId}`,
      { withCredentials: true },
    );
    return response.data;
  },
};
