"use client";

import React, { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { mockQuizTypes, mockSections } from "./mockData";
import { QuizDetails } from "./builder/QuizDetails";
import { QuestionList } from "./builder/QuestionList";
import { BuilderQuestion, QuizTypeOption } from "@/types/quiz";

type Tab = "details" | "questions";

export default function QuizBuilder() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("details");
  const [questions, setQuestions] = useState<BuilderQuestion[]>([]);
  const [selectedQuizType, setSelectedQuizType] = useState<QuizTypeOption>(
    mockQuizTypes[0],
  );
  const [selectedSection, setSelectedSection] = useState(mockSections[0]);

  return (
    <div className="flex flex-col w-full text-foreground items-center justify-center">

      <div className="flex flex-col max-w-5xl mx-auto w-full p-8 gap-8">
        {/* Tabs */}
        <div className="bg-muted/50 p-1 rounded-xl inline-flex self-start border border-border">
          <button
            onClick={() => setActiveTab("details")}
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === "details"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab("questions")}
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === "questions"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Questions
          </button>
        </div>

        {activeTab === "details" && (
          <QuizDetails
            selectedQuizType={selectedQuizType}
            setSelectedQuizType={setSelectedQuizType}
            selectedSection={selectedSection}
            setSelectedSection={setSelectedSection}
          />
        )}

        {activeTab === "questions" && (
          <QuestionList questions={questions} setQuestions={setQuestions} />
        )}
      </div>
    </div>
  );
}
