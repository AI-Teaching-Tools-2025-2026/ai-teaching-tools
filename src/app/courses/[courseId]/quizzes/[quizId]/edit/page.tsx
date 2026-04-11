"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import QuizBuilder from "@/components/quizzes/QuizBuilder";
import { quizService } from "@/services/quizService";
import { QuizData } from "@/types/quiz";

export default function EditQuizPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.quizId as string;
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadQuiz() {
      try {
        setLoading(true);
        const data = await quizService.getQuizById(quizId);
        setQuiz(data);
      } catch (err) {
        console.error("Failed to load quiz", err);
        setError("Failed to load quiz");
      } finally {
        setLoading(false);
      }
    }

    if (quizId) {
      loadQuiz();
    }
  }, [quizId]);

  if (loading) {
    return (
      <div className="p-8 flex justify-center mt-20 text-muted-foreground w-full">
        Loading quiz data...
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="p-8 flex justify-center mt-20 text-red-500 w-full">
        {error || "Quiz not found"}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-8 gap-8 max-w-[1600px] mx-auto w-full">
      <div className="flex items-center gap-4 py-6 px-8 border-b border-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Edit Quiz
        </h1>
      </div>

      <div className="flex flex-col items-center justify-center">
        <QuizBuilder initialQuiz={quiz} />
      </div>
    </div>
  );
}
