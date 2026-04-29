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
import { QuestionList } from "../questions/QuestionList";
import {
  QuizData,
  BuilderQuestion,
  transformBuilderQuestions,
  transformQuestionsToBuilder,
} from "@/types/quiz";
import { ActionSidebar, SidebarAction } from "@/components/shared/ActionSidebar";
import { quizService } from "@/services/quizService";
import QuizPreview from "./QuizPreview";
import { toast } from "sonner";
import { Eye, GraduationCap, RefreshCcw, SquarePen, Trash2 } from "lucide-react";

type Tab = "details" | "questions";

interface QuizBuilderProps {
  initialQuiz?: QuizData;
}

export default function QuizBuilder({ initialQuiz }: QuizBuilderProps = {}) {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const [activeTab, setActiveTab] = useState<Tab>("details");
  const [quizData, setQuizData] = useState<Partial<QuizData>>(
    initialQuiz || {
      quizTitle: "",
      quizStatus: "Draft",
      section: "",
      courseId,
      createdAt: "",
      description: "",
      dueDate: "",
      totalPoints: 0,
      questions: [],
    },
  );
  const [questions, setQuestions] = useState<BuilderQuestion[]>(
    initialQuiz ? transformQuestionsToBuilder(initialQuiz.questions) : [],
  );
  const [selectedSection, setSelectedSection] = useState(
    mockSections.find((s) => s === initialQuiz?.section) || mockSections[0],
  );
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

  const handleSaveQuiz = async () => {
    const transformedQuestions = transformBuilderQuestions(questions);

    const quiz: QuizData = {
      _id: initialQuiz?._id || "",
      quizTitle: quizData.quizTitle ?? "",
      quizStatus: "Draft",
      section: selectedSection ?? "",
      courseId,
      createdAt: initialQuiz?.createdAt || new Date().toISOString(),
      description: quizData.description ?? "",
      dueDate: quizData.dueDate ?? "",
      totalPoints: quizData.totalPoints ?? 0,
      questions: transformedQuestions,
    };

    try {
      if (initialQuiz?._id) {
        await quizService.updateQuiz(initialQuiz._id, quiz);
        toast.success("Quiz updated successfully");
        // router.push(`/courses/${courseId}/quizzes`);
      } else {
        const createdQuiz = await quizService.createQuiz(quiz);
        toast.success("Quiz created successfully");
        router.push(`/courses/${courseId}/quizzes/${createdQuiz._id}/edit`);
      }
    } catch (error) {
      toast.error("Failed to save quiz. Please try again.");
      console.error("Failed to save quiz:", error);
    }
  };

  const handleDeleteQuiz = async () => {
    if (!initialQuiz?._id) return;
    try {
      await quizService.deleteQuizById(initialQuiz._id);
      toast.success("Quiz deleted successfully");
      router.push(`/courses/${courseId}/quizzes`);
    } catch (error) {
      toast.error("Failed to delete quiz. Please try again.");
      console.error("Failed to delete quiz:", error);
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
                  courseId={courseId}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <ActionSidebar
          actions={[
            {
              label: "Preview",
              icon: <Eye className="h-4 w-4 shrink-0" />,
              onClick: handlePreview,
              variant: "secondary",
            },
            {
              label: initialQuiz ? "Update Quiz" : "Create Quiz",
              icon: initialQuiz ? (
                <RefreshCcw className="h-4 w-4 shrink-0" />
              ) : (
                <SquarePen className="h-4 w-4 shrink-0" />
              ),
              onClick: handleSaveQuiz,
            },
            {
              label: "Publish Quiz",
              icon: <GraduationCap className="h-4 w-4 shrink-0" />,
              onClick: () => console.log("Publishing..."),
              disabled: true,
              className: "bg-blue-800 hover:bg-blue-900 text-white",
            },
            ...(initialQuiz
              ? [
                  {
                    label: "Delete Quiz",
                    icon: <Trash2 className="h-4 w-4 shrink-0" />,
                    onClick: handleDeleteQuiz,
                    className: "bg-[#9E4042] hover:bg-[#9E4042]/90 text-white",
                  },
                ]
              : []),
          ]}
        />
      </div>
    </>
  );
}
