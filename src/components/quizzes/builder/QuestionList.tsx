"use client";

import React from "react";
import { Plus } from "lucide-react";
import { BuilderQuestion } from "@/types/quiz";
import { QuestionItem } from "./QuestionItem";

interface QuestionListProps {
  questions: BuilderQuestion[];
  setQuestions: React.Dispatch<React.SetStateAction<BuilderQuestion[]>>;
}

export function QuestionList({ questions }: QuestionListProps) {
  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto">
      {questions.map((q, index) => (
        <QuestionItem key={q.id} question={q} index={index} />
      ))}

      {/* Add Question Button */}
      <button className="w-full border border-dashed border-primary/50 rounded-lg p-8 flex flex-col items-center justify-center gap-3 hover:bg-primary/5 transition-colors group bg-card cursor-pointer">
        <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-lg group-hover:scale-110 transition-transform">
          <Plus className="h-5 w-5" />
        </div>
        <span className="text-sm font-medium text-foreground">
          Add New Question
        </span>
      </button>
    </div>
  );
}
