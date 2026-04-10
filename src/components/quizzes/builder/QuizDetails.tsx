"use client";

import React, { useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { mockSections } from "../mockData";
import { QuizData } from "@/types/quiz";

function toDateInputValue(stored: string | undefined): string {
  if (!stored?.trim()) return "";
  const isoDay = stored.match(/^(\d{4}-\d{2}-\d{2})/);
  if (isoDay) return isoDay[1];
  const d = new Date(stored);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

interface QuizDetailsProps {
  quizData: Partial<QuizData>;
  // accept the state setter dispatch so callers can pass the useState setter
  // and this component can use the functional updater form to avoid races.
  setQuizData: React.Dispatch<React.SetStateAction<Partial<QuizData>>>;
  selectedSection: string;
  setSelectedSection: (section: string) => void;
}

export function QuizDetails({
  quizData,
  setQuizData,
  selectedSection,
  setSelectedSection,
}: QuizDetailsProps) {
  // set a sensible default (today) for the due date when creating a new quiz
  useEffect(() => {
    if (!quizData.dueDate || !quizData.dueDate.trim()) {
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, "0");
      const d = String(now.getDate()).padStart(2, "0");
      const today = `${y}-${m}-${d}`;
      setQuizData((prev) => ({ ...prev, dueDate: today }));
    }
    // run only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="w-full max-w-3xl mx-auto bg-card border border-border rounded-lg p-8 shadow-sm flex flex-col gap-6">
      {/* Title Input */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-foreground">
          Quiz Title
        </label>
        <Input
          type="text"
          placeholder="Enter quiz title"
          value={quizData.quizTitle ?? ""}
          onChange={(e) =>
            setQuizData((prev) => ({
              ...prev,
              quizTitle: e.target.value,
            }))
          }
        />
      </div>

      {/* Description Textarea */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-foreground">
          Description
        </label>
        <Textarea
          placeholder="Enter quiz description"
          className="min-h-[120px] resize-y"
          value={quizData.description ?? ""}
          onChange={(e) =>
            setQuizData((prev) => ({
              ...prev,
              description: e.target.value,
            }))
          }
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Section Select */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">Section</label>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer">
                {selectedSection}
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[200px]">
              {mockSections.map((section) => (
                <DropdownMenuItem
                  key={section}
                  onClick={() => setSelectedSection(section)}
                  className="cursor-pointer"
                >
                  {section}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Points Input */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">Points</label>
          <Input
            type="number"
            value={quizData.totalPoints ?? 0}
            onChange={(e) =>
              setQuizData((prev) => ({
                ...prev,
                totalPoints: Number(e.target.value),
              }))
            }
          />
        </div>

        {/* Due date */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="quiz-due-date"
            className="text-sm font-medium text-foreground"
          >
            Due Date
          </label>
          <Input
            id="quiz-due-date"
            type="date"
            className="bg-background"
            value={toDateInputValue(quizData.dueDate)}
            onChange={(e) => {
              const v = e.target.value;
              // store as a date-only string (YYYY-MM-DD) to match MongoDB format
              // expected by the backend.
              setQuizData((prev) => ({
                ...prev,
                dueDate: v || "",
              }));
            }}
          />
        </div>
      </div>
    </div>
  );
}
