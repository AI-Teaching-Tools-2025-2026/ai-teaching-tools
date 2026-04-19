"use client";

import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BuilderQuestion } from "@/types/quiz";

/** Wrong options always include at least this many rows; with correct answer → minimum 2 options total. */
const MIN_INCORRECT_ANSWERS = 1;

interface QuestionFormProps {
  initialQuestion?: BuilderQuestion;
  onSave: (question: BuilderQuestion) => void;
  onCancel: () => void;
}

export function QuestionForm({ initialQuestion, onSave, onCancel }: QuestionFormProps) {
  const [authorship, setAuthorship] = useState("manual");
  const [questionText, setQuestionText] = useState(initialQuestion?.text || "");
  const [questionType, setQuestionType] = useState(initialQuestion?.type || "multiple-choice");
  const [points, setPoints] = useState(initialQuestion?.points || 5);

  // State for answers
  const [correctAnswer, setCorrectAnswer] = useState(initialQuestion?.correctAnswer || "");
  const [incorrectAnswers, setIncorrectAnswers] = useState<string[]>(() => {
    if (initialQuestion?.type === "multiple-choice" && initialQuestion.options) {
      const incorrects = initialQuestion.options.filter(
        (opt) => opt !== initialQuestion.correctAnswer
      );
      if (incorrects.length >= MIN_INCORRECT_ANSWERS) return incorrects;
      return [
        ...incorrects,
        ...Array(MIN_INCORRECT_ANSWERS - incorrects.length).fill(""),
      ];
    }
    return Array(MIN_INCORRECT_ANSWERS).fill("");
  });

  const handleQuestionTypeChange = (value: string) => {
    setQuestionType(value);
    if (value === "multiple-choice") {
      setIncorrectAnswers(Array(MIN_INCORRECT_ANSWERS).fill(""));
      setCorrectAnswer("");
    } else if (value === "true-false") {
      setCorrectAnswer("");
    }
  };

  const addIncorrectAnswer = () => {
    setIncorrectAnswers((prev) => [...prev, ""]);
  };

  const removeIncorrectAnswer = (index: number) => {
    if (index < MIN_INCORRECT_ANSWERS) return;
    setIncorrectAnswers((prev) =>
      prev.length > MIN_INCORRECT_ANSWERS
        ? prev.filter((_, i) => i !== index)
        : prev,
    );
  };

  const updateIncorrectAnswer = (index: number, value: string) => {
    setIncorrectAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const multipleChoiceIsValid = () => {
    const trimmedCorrect = correctAnswer.trim();
    if (!trimmedCorrect) return false;
    const nonEmptyOptions = [
      trimmedCorrect,
      ...incorrectAnswers.map((a) => a.trim()).filter(Boolean),
    ];
    const uniqueTexts = new Set(nonEmptyOptions);
    return uniqueTexts.size >= 2;
  };

  const trueFalseIsValid = () =>
    correctAnswer === "True" || correctAnswer === "False";

  const canSave =
    questionText.trim().length > 0 &&
    (questionType === "multiple-choice"
      ? multipleChoiceIsValid()
      : trueFalseIsValid());

  const handleSave = () => {
    if (!canSave) return;
    const newQuestion: BuilderQuestion = {
      id: initialQuestion?.id || crypto.randomUUID(),
      text: questionText.trim(),
      type: questionType as "multiple-choice" | "true-false",
      points: Number(points),
      options:
        questionType === "multiple-choice"
          ? [
              correctAnswer.trim(),
              ...incorrectAnswers.map((a) => a.trim()).filter(Boolean),
            ]
          : undefined,
      correctAnswer:
        questionType === "multiple-choice"
          ? correctAnswer.trim()
          : correctAnswer,
    };
    onSave(newQuestion);
  };

  return (
    <div className="grid gap-6 py-4">
      {/* Question Authorship */}
      <div className="grid gap-3">
        <Label className="text-[15px] font-medium leading-none">
          Question Authorship
        </Label>
        <RadioGroup
          defaultValue="manual"
          value={authorship}
          onValueChange={setAuthorship}
          className="flex flex-col gap-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="manual" id="manual" />
            <Label
              htmlFor="manual"
              className="font-normal text-muted-foreground"
            >
              Manual
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="bank" id="bank" />
            <Label htmlFor="bank" className="font-normal text-muted-foreground">
              Question Bank
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="h-px bg-border w-full" />

      {/* Question Name */}
      <div className="grid gap-2">
        <Label htmlFor="name" className="text-[15px] font-medium">
          Question Name
        </Label>
        <Input
          id="name"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          className="bg-card/50"
        />
      </div>

      {/* Question Type */}
      <div className="grid gap-2">
        <Label className="text-[15px] font-medium">Question Type</Label>
        <Select value={questionType} onValueChange={handleQuestionTypeChange}>
          <SelectTrigger className="bg-card/50">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
            <SelectItem value="true-false">True / False</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Number of Points */}
      <div className="grid gap-2">
        <Label htmlFor="points" className="text-[15px] font-medium">
          Number of Points
        </Label>
        <Input
          id="points"
          type="number"
          className="w-[200px] bg-card/50"
          value={points}
          onChange={(e) => setPoints(Number(e.target.value))}
        />
      </div>

      {/* Answers Section */}
      <div className="grid gap-4 pt-2">
        <Label className="text-lg font-medium">Answers</Label>

        <div className="rounded-lg border bg-card/30 p-4 grid gap-6">
          {/* TRUE / FALSE MODE */}
          {questionType === "true-false" && (
            <div className="grid gap-3">
              <Label className="text-muted-foreground font-medium">
                Correct Answer
              </Label>

              <Select value={correctAnswer} onValueChange={setCorrectAnswer}>
                <SelectTrigger className="bg-card">
                  <SelectValue placeholder="Select True or False" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="True">True</SelectItem>
                  <SelectItem value="False">False</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* MULTIPLE CHOICE MODE */}
          {questionType === "multiple-choice" && (
            <>
              {/* Correct Answer */}
              <div className="grid gap-2">
                <Label className="text-blue-500 font-medium">
                  Correct Answer
                </Label>

                <Input
                  value={correctAnswer}
                  onChange={(e) => setCorrectAnswer(e.target.value)}
                  className="border-blue-500/50 focus-visible:ring-blue-500/50"
                />
              </div>

              {/* Incorrect options: minimum one (two choices total with correct); extras can be removed */}
              {incorrectAnswers.map((ans, idx) => (
                <div key={idx} className="grid gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label className="text-muted-foreground font-medium">
                      Incorrect option {idx + 1}
                    </Label>
                    {idx >= MIN_INCORRECT_ANSWERS &&
                      incorrectAnswers.length > MIN_INCORRECT_ANSWERS && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={() => removeIncorrectAnswer(idx)}
                          aria-label={`Remove option ${idx + 1}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                  </div>

                  <Input
                    value={ans}
                    onChange={(e) => updateIncorrectAnswer(idx, e.target.value)}
                    className="bg-muted/30"
                  />
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit gap-1.5"
                onClick={addIncorrectAnswer}
              >
                <Plus className="h-4 w-4" />
                Add answer
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!canSave}>
          Save changes
        </Button>
      </div>
    </div>
  );
}
