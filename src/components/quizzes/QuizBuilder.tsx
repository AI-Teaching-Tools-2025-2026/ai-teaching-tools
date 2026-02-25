"use client";

import React, { useState } from "react";
import { ChevronLeft, GraduationCap, Trash2, Eye, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { mockQuizTypes, mockSections } from "./mockData";
import { QuizDetails } from "./builder/QuizDetails";
import { QuestionList } from "./builder/QuestionList";
import { BuilderQuestion, QuizTypeOption } from "@/types/quiz";
import { QuizBuilderSidebar } from "./builder/QuizBuilderSidebar";

type Tab = "details" | "questions";

export default function QuizBuilder() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("details");
  const [questions, setQuestions] = useState<BuilderQuestion[]>([]);
  const [selectedQuizType, setSelectedQuizType] = useState<QuizTypeOption>(
    mockQuizTypes[0],
  );
  const [selectedSection, setSelectedSection] = useState(mockSections[0]);

  const handleAddQuestion = (type: BuilderQuestion["type"]) => {
    const newQ: BuilderQuestion = {
      id: crypto.randomUUID(),
      text: "",
      type: type,
      options: ["", "", "", ""],
      correctAnswer: "",
    };
    setQuestions([...questions, newQ]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full max-w-[1600px]">
      {/* Main Content Form */}
      <div className="lg:col-span-9 flex flex-col gap-6">
        <Card className="border-border bg-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Quiz Configuration</CardTitle>
              {/* Internal Tabs for switching views within the form context */}
              <div className="bg-muted p-1 rounded-lg inline-flex border border-border">
                <button
                  onClick={() => setActiveTab("details")}
                  className={cn(
                    "px-4 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer",
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
                    "px-4 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer",
                    activeTab === "questions"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  Questions
                  <span className="ml-2 bg-primary/10 text-primary text-xs px-1.5 py-0.5 rounded-full">
                    {questions.length}
                  </span>
                </button>
              </div>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
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
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <QuizBuilderSidebar
        activeTab={activeTab}
        onAddQuestion={handleAddQuestion}
        onDelete={() => router.back()} // Gonna have to change later lol
        onPublish={() => console.log("Publishing...")} // Placeholder
      />
    </div>
  );
}
