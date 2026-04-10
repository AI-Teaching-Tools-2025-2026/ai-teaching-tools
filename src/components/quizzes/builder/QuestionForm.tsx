"use client";

import React, { useState } from "react";
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

interface QuestionFormProps {
  onSave: (question: BuilderQuestion) => void;
  onCancel: () => void;
}

export function QuestionForm({ onSave, onCancel }: QuestionFormProps) {
  const [authorship, setAuthorship] = useState("manual");
  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState("multiple-choice");
  const [points, setPoints] = useState(5);

  // State for answers
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [incorrectAnswers, setIncorrectAnswers] = useState(["", "", ""]);

  const handleSave = () => {
    // Construct the BuilderQuestion object
    const newQuestion: BuilderQuestion = {
      id: crypto.randomUUID(),
      text: questionText,
      type: questionType as "multiple-choice" | "true-false",
      points: Number(points),
      options: [correctAnswer, ...incorrectAnswers],
      correctAnswer: correctAnswer,
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
        <Select value={questionType} onValueChange={setQuestionType}>
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

              <Select
                value={correctAnswer}
                onValueChange={setCorrectAnswer}
              >
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

              {/* Possible Answers */}
              {incorrectAnswers.map((ans, idx) => (
                <div key={idx} className="grid gap-2">
                  <Label className="text-muted-foreground font-medium">
                    Possible Answer
                  </Label>

                  <Input
                    value={ans}
                    onChange={(e) => {
                      const newArr = [...incorrectAnswers];
                      newArr[idx] = e.target.value;
                      setIncorrectAnswers(newArr);
                    }}
                    className="bg-muted/30"
                  />
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save changes</Button>
      </div>
    </div>
  );
}
