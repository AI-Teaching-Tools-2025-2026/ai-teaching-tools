"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import QuestionBankPreview from "@/components/questionbank/QuestionBankPreview";
import { questionBankService } from "@/services/questionBankService";
import { QuestionBank } from "@/types/questionBank";

export default function CourseQuestionBankPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const questionBankId = params.questionBankId as string;
  const [questionBank, setQuestionBank] = useState<QuestionBank | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!questionBankId) return;
      try {
        const data =
          await questionBankService.getQuestionBankById(questionBankId);
        setQuestionBank(data);
      } catch {
        setError("Failed to load question bank.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [questionBankId]);

  const handleBack = () => {
    router.push(`/courses/${courseId}/question-banks`);
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
          <p className="text-muted-foreground">Loading question bank...</p>
        </div>
      </div>
    );
  }

  if (error || !questionBank) {
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
          <p className="text-destructive">
            {error ?? "Question bank not found."}
          </p>
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
          Question Bank Preview
        </h1>
      </div>

      <div className="flex-1 overflow-auto pb-8">
        <QuestionBankPreview questionBank={questionBank} />
      </div>
    </div>
  );
}
