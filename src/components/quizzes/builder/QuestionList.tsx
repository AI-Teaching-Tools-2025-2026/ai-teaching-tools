"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { BuilderQuestion } from "@/types/quiz";
import { QuestionItem } from "./QuestionItem";
import { QuestionForm } from "./QuestionForm";

interface QuestionListProps {
  questions: BuilderQuestion[];
  setQuestions: React.Dispatch<React.SetStateAction<BuilderQuestion[]>>;
}

export function QuestionList({ questions, setQuestions }: QuestionListProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleCreateQuestion = (newQuestion: BuilderQuestion) => {
    setQuestions([...questions, newQuestion]);
    setIsFormOpen(false);
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto">
      {questions.map((q, index) => (
        <QuestionItem
          key={q.id}
          question={q}
          index={index}
          onDelete={handleDeleteQuestion}
          onUpdate={(updatedQ) => {
            setQuestions((prev) =>
              prev.map((item) => (item.id === updatedQ.id ? updatedQ : item))
            );
          }}
        />
      ))}

      {/* Inline Form or Add Button */}
      {isFormOpen ? (
        <div className="border rounded-lg p-6 bg-card animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="text-lg font-medium mb-4">Create Question</h3>
          <QuestionForm
            onSave={handleCreateQuestion}
            onCancel={() => setIsFormOpen(false)}
          />
        </div>
      ) : (
        <button
          onClick={() => setIsFormOpen(true)}
          className="w-full border border-dashed border-primary/50 rounded-lg p-8 flex flex-col items-center justify-center gap-3 hover:bg-primary/5 transition-colors group bg-card cursor-pointer"
        >
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-lg group-hover:scale-110 transition-transform">
            <Plus className="h-5 w-5" />
          </div>
          <span className="text-sm font-medium text-foreground">
            Add New Question
          </span>
        </button>
      )}
    </div>
  );
}
