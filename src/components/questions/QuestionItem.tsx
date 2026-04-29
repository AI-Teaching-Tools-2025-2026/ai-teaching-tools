"use client";

import React, { useState } from "react";
import { Trash2, Pencil, ChevronDown, ChevronUp, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BuilderQuestion } from "@/types/quiz";
import { QuestionForm } from "./QuestionForm";
import SubmissionModal from "@/components/modal/submissionModal";

interface QuestionItemProps {
  question: BuilderQuestion;
  index: number;
  onDelete: (id: string) => void;
  onUpdate: (updatedQuestion: BuilderQuestion) => void;
  hideAuthorship?: boolean;
}

export function QuestionItem({
  question: q,
  index,
  onDelete,
  onUpdate,
  hideAuthorship,
}: QuestionItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const displayType =
    q.type === "multiple-choice" ? "Multiple Choice" : "True/False";

  const handleEditSave = (updatedQuestions: BuilderQuestion[]) => {
    onUpdate(updatedQuestions[0]);
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
  };

  const confirmDelete = async () => {
    onDelete(q.id);
  };

  if (isEditing) {
    return (
      <div className="w-full bg-card border border-border rounded-lg p-6 animate-in fade-in">
        <h3 className="text-lg font-medium mb-4">Edit Question {index + 1}</h3>
        <QuestionForm
          initialQuestion={q}
          onSave={handleEditSave}
          onCancel={handleEditCancel}
          hideAuthorship={true}
        />
      </div>
    );
  }

  return (
    <>
      <div className="w-full bg-card border border-border rounded-lg group hover:border-ring transition-colors overflow-hidden">
        {/* Header - Clickable for accordion */}
        <div
          className="p-6 cursor-pointer relative"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {/* Action Buttons */}
          <div
            className="absolute right-4 top-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-primary hover:bg-muted cursor-pointer"
              aria-label="Edit question"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="bg-[#9E4042] hover:bg-[#9E4042]/90 text-muted-foreground hover:text-primary cursor-pointer"
              aria-label="Delete question"
              onClick={() => setIsDeleteModalOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="pr-20">
            <div className="flex items-center gap-2 mb-2">
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Question {index + 1} | {displayType}
              </span>
            </div>

            <p className="text-lg font-medium text-foreground leading-relaxed">
              {q.text}
            </p>
          </div>
        </div>

        {/* Collapsible Answers Area */}
        {isExpanded && (
          <div className="px-6 pb-6 pt-2 border-t border-border bg-muted/10 animate-in slide-in-from-top-2">
            <div className="flex flex-col gap-3 pl-2 mt-2">
              {q.type === "multiple-choice" &&
                q.options?.map((opt, i) => {
                  const isCorrect = opt === q.correctAnswer;
                  return (
                    <div
                      key={i}
                      className={cn(
                        "flex items-center gap-3",
                        isCorrect ? "bg-green-600/20 rounded-md p-1 -m-1" : "",
                      )}
                    >
                      <div
                        className={cn(
                          "h-4 w-4 rounded-full border flex items-center justify-center shrink-0",
                          isCorrect
                            ? "border-green-600 bg-green-600/20"
                            : "border-border",
                        )}
                      >
                        {isCorrect && (
                          <div className="h-2 w-2 rounded-full bg-green-600" />
                        )}
                      </div>
                      <span
                        className={cn(
                          "text-sm font-medium",
                          isCorrect ? "text-white" : "text-muted-foreground",
                        )}
                      >
                        {opt}
                      </span>
                      {isCorrect && (
                        <Check className="h-4 w-4 text-green-500 ml-auto mr-2" />
                      )}
                    </div>
                  );
                })}

              {q.type === "true-false" && (
                <div className="flex flex-col gap-3">
                  {["True", "False"].map((opt) => {
                    const isCorrect = opt === q.correctAnswer;
                    return (
                      <div
                        key={opt}
                        className={cn(
                          "flex items-center gap-3",
                          isCorrect
                            ? "bg-green-600/20 rounded-md p-1 -m-1"
                            : "",
                        )}
                      >
                        <div
                          className={cn(
                            "h-4 w-4 rounded-full border flex items-center justify-center shrink-0",
                            isCorrect
                              ? "border-green-600 bg-green-600/20"
                              : "border-border",
                          )}
                        >
                          {isCorrect && (
                            <div className="h-2 w-2 rounded-full bg-green-600" />
                          )}
                        </div>
                        <span
                          className={cn(
                            "text-sm font-medium",
                            isCorrect ? "text-white" : "text-muted-foreground",
                          )}
                        >
                          {opt}
                        </span>
                        {isCorrect && (
                          <Check className="h-4 w-4 text-green-500 ml-auto mr-2" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <SubmissionModal
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        body="Are you sure you want to delete this question? This action cannot be undone."
        onSubmit={confirmDelete}
      />
    </>
  );
}
