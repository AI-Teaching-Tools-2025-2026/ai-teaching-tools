"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useRouter, useParams } from "next/navigation";
import { mockSections } from "./mockData";
import { QuizDetails } from "./builder/QuizDetails";
import { QuestionList } from "./builder/QuestionList";
import {
  QuizData,
  BuilderQuestion,
  transformBuilderQuestions,
} from "@/types/quiz";
import { QuizBuilderSidebar } from "./builder/QuizBuilderSidebar";
import { quizService } from "@/services/quizService";
import QuizPreview from "./QuizPreview";

type Tab = "details" | "questions";

export default function QuizBuilder() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const [activeTab, setActiveTab] = useState<Tab>("details");
  const [quizData, setQuizData] = useState<Partial<QuizData>>({
    quizTitle: "",
    quizStatus: "Draft",
    section: "",
    courseId,
    createdAt: "",
    description: "",
    dueDate: "",
    totalPoints: 0,
    questions: [],
  });
  const [questions, setQuestions] = useState<BuilderQuestion[]>([]);
  const [selectedSection, setSelectedSection] = useState(mockSections[0]);
  const [previewOpen, setPreviewOpen] = useState(false);

  const previewQuiz = useMemo((): QuizData => {
    const transformed = transformBuilderQuestions(questions);
    const pointsFromQuestions = questions.reduce((sum, q) => sum + q.points, 0);
    return {
      _id: "",
      quizTitle: quizData.quizTitle?.trim() || "Untitled quiz",
      quizStatus: quizData.quizStatus ?? "Draft",
      section: (quizData.section || selectedSection) ?? "",
      courseId,
      createdAt: quizData.createdAt || new Date().toISOString(),
      description: quizData.description ?? "",
      dueDate: quizData.dueDate ?? "",
      totalPoints:
        pointsFromQuestions > 0
          ? pointsFromQuestions
          : (quizData.totalPoints ?? 0),
      questions: transformed,
    };
  }, [quizData, questions, selectedSection, courseId]);

  const handlePreview = () => {
    setPreviewOpen(true);
  };

  const handleCreateQuiz = async () => {
    const transformedQuestions = transformBuilderQuestions(questions);

    const quiz: QuizData = {
      _id: "",
      quizTitle: quizData.quizTitle ?? "",
      quizStatus: "Draft",
      section: quizData.section ?? "",
      courseId,
      createdAt: new Date().toISOString(),
      description: quizData.description ?? "",
      dueDate: quizData.dueDate ?? "",
      totalPoints: quizData.totalPoints ?? 0,
      questions: transformedQuestions,
    };

    try {
      const createdQuiz = await quizService.createQuiz(quiz);
      console.log("Created quiz:", createdQuiz);
      router.push(`/courses/${courseId}/quizzes`); //should navigate to editor mode in the future
    } catch (error) {
      console.error("Failed to create quiz:", error);
    }
  };

  return (
    <>
      <Sheet open={previewOpen} onOpenChange={setPreviewOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl overflow-y-auto"
        >
          <SheetHeader className="space-y-1 border-b border-border pb-4 pr-8">
            <SheetTitle>Quiz preview</SheetTitle>
            <p className="text-sm text-muted-foreground font-normal">
              How the quiz looks with correct answers marked (draft view).
            </p>
          </SheetHeader>
          <div className="mt-4 pb-8">
            <QuizPreview quiz={previewQuiz} />
          </div>
        </SheetContent>
      </Sheet>

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
                  quizData={quizData}
                  setQuizData={setQuizData}
                  selectedSection={selectedSection}
                  setSelectedSection={setSelectedSection}
                />
              )}

              {activeTab === "questions" && (
                <QuestionList
                  questions={questions}
                  setQuestions={setQuestions}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <QuizBuilderSidebar
          onPreview={handlePreview}
          onCreateQuiz={handleCreateQuiz}
          onUpdateQuiz={() => console.log("Updating...")}
          onDelete={() => console.log("Deleting...")}
          onPublish={() => console.log("Publishing...")}
        />
      </div>
    </>
  );
}
