"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { QuestionBank } from "@/types/questionBank";

interface QuestionBankDetailsProps {
  questionBankData: Partial<QuestionBank>;
  setQuestionBankData: React.Dispatch<
    React.SetStateAction<Partial<QuestionBank>>
  >;
}

export function QuestionBankDetails({
  questionBankData,
  setQuestionBankData,
}: QuestionBankDetailsProps) {
  return (
    <div className="w-full max-w-3xl mx-auto bg-card border border-border rounded-lg p-8 shadow-sm flex flex-col gap-6">
      {/* Title Input */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-foreground">
          Question Bank Title
        </label>
        <Input
          type="text"
          placeholder="Enter question bank title"
          value={questionBankData.title ?? ""}
          onChange={(e) =>
            setQuestionBankData((prev) => ({
              ...prev,
              title: e.target.value,
            }))
          }
        />
      </div>

      {/* Chapter Input */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-foreground">Chapter</label>
        <Input
          type="text"
          placeholder="Enter chapter name or number"
          value={questionBankData.chapter ?? ""}
          onChange={(e) =>
            setQuestionBankData((prev) => ({
              ...prev,
              chapter: e.target.value,
            }))
          }
        />
      </div>
    </div>
  );
}
