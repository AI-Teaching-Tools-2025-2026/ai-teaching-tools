"use client";

import React, { useState } from "react";
import { ChevronLeft, GraduationCap, Trash2, Eye, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full max-w-[1600px]">
      {/* Main Content Form - Spans 8 columns on large screens */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <Card className="border-border bg-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Quiz Configuration</CardTitle>
              {/* Internal Tabs for switching views within the form context */}
              <div className="bg-muted p-1 rounded-lg inline-flex border border-border">
                <button
                  onClick={() => setActiveTab("details")}
                  className={cn(
                    "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
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
                    "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
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

      {/* Sidebar Actions - Spans 4 columns on large screens */}
      <div className="lg:col-span-4 flex flex-col gap-6 ">
        <Card className="border-border bg-card sticky top-6">
          <CardHeader>
            <CardTitle className="text-lg">Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button variant="secondary" className="w-full gap-2 justify-start h-auto py-3 px-4  cursor-pointer">
              <Eye className="h-4 w-4" />
              Student View
            </Button>
            <Button className="w-full gap-2 justify-start h-auto py-3 px-4 bg-primary hover:bg-primary/90">
              <GraduationCap className="h-4 w-4" />
              Publish Quiz
            </Button>
            <Button
              variant="destructive"
              className="w-full gap-2 justify-start h-auto py-3 px-4 cursor-pointer"
              onClick={() => router.back()}
            >
              <Trash2 className="h-4 w-4" />
              Delete Quiz
            </Button>
          </CardContent>
        </Card>

        {activeTab === "questions" && (
           <Card className="border-border bg-card sticky top-[280px]">
            <CardHeader>
             <CardTitle className="text-lg">Quick Add</CardTitle>
            </CardHeader>
             <CardContent className="flex flex-col gap-3">
               <Button variant="outline" className="justify-start gap-2" onClick={() => {
                   /* Logic to add specific type */
                   const newQ: BuilderQuestion = {
                       id: crypto.randomUUID(),
                       text: "",
                       type: "multiple-choice",
                       options: ["", "", "", ""],
                       correctAnswer: ""
                   };
                   setQuestions([...questions, newQ]);
               }}>
                 <Plus className="h-4 w-4"/> Multiple Choice
               </Button>
               <Button variant="outline" className="justify-start gap-2">
                 <Plus className="h-4 w-4"/> True / False
               </Button>
               <Button variant="outline" className="justify-start gap-2">
                 <Plus className="h-4 w-4"/> Short Answer
               </Button>
             </CardContent>
           </Card>
        )}
      </div>
    </div>
  );
}
