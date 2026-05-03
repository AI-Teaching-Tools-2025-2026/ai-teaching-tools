"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronLeft, SquarePen } from "lucide-react";
import { Button } from "@/components/ui/button";
import QuizPreview from "@/components/quizzes/QuizPreview";
import { quizService } from "@/services/quizService";
import { QuizData } from "@/types/quiz";
import { ActionSidebar } from "@/components/shared/ActionSidebar";

export default function CourseQuizPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const quizId = params.quizId as string;
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!quizId) return;
      try {
        const data = await quizService.getQuizById(quizId);
        setQuiz(data);
      } catch {
        setError("Failed to load quiz.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [quizId]);

  const handleBack = () => {
    router.push(`/courses/${courseId}/quizzes`);
  };

  if (loading) {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] p-8 gap-8 max-w-[1600px] mx-auto w-full">
        <div className="flex items-center gap-4 py-6 px-8 border-b border-border">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <p className="text-muted-foreground">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] p-8 gap-8 max-w-[1600px] mx-auto w-full">
        <div className="flex items-center gap-4 py-6 px-8 border-b border-border">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <p className="text-destructive">{error ?? "Quiz not found."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-8 gap-8 max-w-[1600px] mx-auto w-full">
      <div className="flex items-center gap-4 py-6 px-8 border-b border-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Quiz Preview
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full max-w-[1600px]">
        <div className="lg:col-span-9 overflow-auto pb-8">
          <QuizPreview quiz={quiz} />
        </div>

        {/* Sidebar */}
        <ActionSidebar
          actions={[
            {
              label: "Edit",
              icon: <SquarePen className="h-4 w-4 shrink-0" />,
              onClick: () => router.push(`/courses/${courseId}/quizzes/${quizId}/edit`),
              variant: "secondary",
            }
          ]}
        />
      </div>
    </div>
  );
}
