"use client";

import React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BuilderQuestion } from "@/types/quiz";

interface QuestionItemProps {
  question: BuilderQuestion;
  index: number;
  onDelete: (id: string) => void;
}

export function QuestionItem({ question: q, index, onDelete }: QuestionItemProps) {
  return (
    <div className="w-full bg-card border border-border rounded-lg p-6 flex flex-col gap-4 group hover:border-ring transition-colors relative">
      <div className="absolute right-4 top-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive hover:bg-muted"
          aria-label="Delete question"
          onClick={() => onDelete(q.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Question {index + 1}
        </label>
        <input
          type="text"
          defaultValue={q.text}
          className="bg-transparent border-none text-lg font-medium text-foreground focus:ring-0 px-0 w-full outline-none placeholder:text-muted-foreground"
          placeholder="Enter the question text..."
        />
      </div>

      <div className="flex flex-col gap-2 pl-4 border-l-2 border-border">
        {q.type === "multiple-choice" &&
          q.options?.map((opt, i) => {
            const isCorrect = opt === q.correctAnswer;
            return (
              <div key={i} className="flex items-center gap-3">
                <div
                  className={cn(
                    "h-4 w-4 rounded-full border flex items-center justify-center shrink-0",
                    isCorrect
                      ? "border-green-500 bg-green-500/20"
                      : "border-border",
                  )}
                >
                  {isCorrect && (
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-sm",
                    isCorrect ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {opt}
                </span>
              </div>
            );
          })}
        {q.type === "true-false" && (
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "h-4 w-4 rounded-full border flex items-center justify-center shrink-0",
                  q.correctAnswer === "True"
                    ? "border-green-500 bg-green-500/20"
                    : "border-border",
                )}
              >
                {q.correctAnswer === "True" && (
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                )}
              </div>
              <span
                className={cn(
                  "text-sm",
                  q.correctAnswer === "True"
                    ? "text-foreground"
                    : "text-muted-foreground",
                )}
              >
                True
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "h-4 w-4 rounded-full border flex items-center justify-center shrink-0",
                  q.correctAnswer === "False"
                    ? "border-green-500 bg-green-500/20"
                    : "border-border",
                )}
              >
                {q.correctAnswer === "False" && (
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                )}
              </div>
              <span
                className={cn(
                  "text-sm",
                  q.correctAnswer === "False"
                    ? "text-foreground"
                    : "text-muted-foreground",
                )}
              >
                False
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
