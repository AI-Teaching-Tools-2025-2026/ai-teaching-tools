"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import QuestionBankBuilder from "@/components/questionbank/QuestionBankBuilder";
import { questionBankService } from "@/services/questionBankService";
import { QuestionBank } from "@/types/questionBank";

export default function EditQuestionBankPage() {
  const router = useRouter();
  const params = useParams();
  const questionBankId = params.questionBankId as string;
  const [questionBank, setQuestionBank] = useState<QuestionBank | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadQuestionBank() {
      try {
        setLoading(true);
        const data =
          await questionBankService.getQuestionBankById(questionBankId);
        setQuestionBank(data);
      } catch (err) {
        console.error("Failed to load question bank", err);
        setError("Failed to load question bank");
      } finally {
        setLoading(false);
      }
    }

    if (questionBankId) {
      loadQuestionBank();
    }
  }, [questionBankId]);

  if (loading) {
    return (
      <div className="p-8 flex justify-center mt-20 text-muted-foreground w-full">
        Loading question bank data...
      </div>
    );
  }

  if (error || !questionBank) {
    return (
      <div className="p-8 flex justify-center mt-20 text-red-500 w-full">
        {error || "Question bank not found"}
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
          Edit Question Bank
        </h1>
      </div>

      <div className="flex flex-col items-center justify-center">
        <QuestionBankBuilder initialQuestionBank={questionBank} />
      </div>
    </div>
  );
}
