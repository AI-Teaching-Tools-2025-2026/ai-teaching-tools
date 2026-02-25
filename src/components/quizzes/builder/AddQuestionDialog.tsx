"use client";

import React, { useState } from "react";
import { Plus, Type, ListChecks, CheckSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BuilderQuestion } from "@/types/quiz";

interface AddQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddQuestion: (question: BuilderQuestion) => void;
}

export function AddQuestionDialog({
  open,
  onOpenChange,
  onAddQuestion,
}: AddQuestionDialogProps) {
  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState<BuilderQuestion["type"]>("multiple-choice");

  const handleSubmit = () => {
    if (!questionText) return;

    const newQuestion: BuilderQuestion = {
      id: crypto.randomUUID(),
      text: questionText,
      type: questionType,
      options: questionType !== "short-answer" ? ["", "", "", ""] : [],
      correctAnswer: "",
    };

    onAddQuestion(newQuestion);
    setQuestionText("");
    setQuestionType("multiple-choice");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Question</DialogTitle>
          <DialogDescription>
            Choose the question type and enter the main question text.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="q-type">Question Type</Label>
            <Select
              value={questionType}
              onValueChange={(val: BuilderQuestion["type"]) => setQuestionType(val)}
            >
              <SelectTrigger id="q-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="multiple-choice">
                  <div className="flex items-center gap-2">
                    <ListChecks className="h-4 w-4" />
                    <span>Multiple Choice</span>
                  </div>
                </SelectItem>
                <SelectItem value="true-false">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4" />
                    <span>True / False</span>
                  </div>
                </SelectItem>
                <SelectItem value="short-answer">
                  <div className="flex items-center gap-2">
                    <Type className="h-4 w-4" />
                    <span>Short Answer</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="q-text">Question Text</Label>
            <Textarea
              id="q-text"
              placeholder="e.g., What is the capital of France?"
              className="min-h-[100px]"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!questionText}>
            <Plus className="mr-2 h-4 w-4" />
            Add Question
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}