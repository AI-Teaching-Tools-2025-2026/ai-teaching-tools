"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { RefreshCcw, Trash2, SquarePen } from "lucide-react";

import { QuestionBankDetails } from "./builder/QuestionBankDetails";
import { QuestionList } from "../questions/QuestionList";
import { ActionSidebar } from "../shared/ActionSidebar";
import { questionBankService } from "@/services/questionBankService";
import {
  QuestionBank,
  transformQBQuestionsToBuilder,
  transformBuilderToQBQuestions,
} from "@/types/questionBank";
import { BuilderQuestion } from "@/types/quiz";

type Tab = "details" | "questions";

interface QuestionBankBuilderProps {
  initialQuestionBank?: QuestionBank;
}

export default function QuestionBankBuilder({
  initialQuestionBank,
}: QuestionBankBuilderProps = {}) {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;

  const [activeTab, setActiveTab] = useState<Tab>("details");

  const [questionBankData, setQuestionBankData] = useState<
    Partial<QuestionBank>
  >(
    initialQuestionBank || {
      title: "",
      chapter: "",
      courseID: courseId,
      sourceFile: "",
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      questionCount: 0,
      questions: [],
    },
  );

  const [questions, setQuestions] = useState<BuilderQuestion[]>(
    initialQuestionBank
      ? transformQBQuestionsToBuilder(initialQuestionBank.questions || [])
      : [],
  );

  const handleSaveQuestionBank = async () => {
    const transformedQuestions = transformBuilderToQBQuestions(questions);

    const questionBank: QuestionBank = {
      _id: initialQuestionBank?._id || "",
      title: questionBankData.title ?? "",
      chapter: questionBankData.chapter ?? "",
      courseID: courseId,
      sourceFile: questionBankData.sourceFile ?? "",
      createdAt: initialQuestionBank?.createdAt || new Date().toISOString(),
      lastModified: new Date().toISOString(),
      questionCount: transformedQuestions.length,
      questions: transformedQuestions,
    };

    try {
      if (initialQuestionBank?._id) {
        await questionBankService.updateQuestionBank(
          initialQuestionBank._id,
          questionBank,
        );
        toast.success("Question Bank updated successfully");
      } else {
        const createdQB =
          await questionBankService.createQuestionBank(questionBank);
        toast.success("Question Bank created successfully");
        router.push(
          `/courses/${courseId}/question-banks/${createdQB._id}/edit`,
        );
      }
    } catch (error) {
      toast.error("Failed to save question bank. Please try again.");
      console.error("Failed to save question bank:", error);
    }
  };

  const handleDeleteQuestionBank = async () => {
    if (!initialQuestionBank?._id) return;
    try {
      await questionBankService.deleteQuestionBankById(initialQuestionBank._id);
      toast.success("Question Bank deleted successfully");
      router.push(`/courses/${courseId}/question-banks`);
    } catch (error) {
      toast.error("Failed to delete question bank. Please try again.");
      console.error("Failed to delete question bank:", error);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full max-w-[1600px]">
      {/* Main Content Form */}
      <div className="lg:col-span-9 flex flex-col gap-6">
        <Card className="border-border bg-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Question Bank Configuration</CardTitle>
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
              <QuestionBankDetails
                questionBankData={questionBankData}
                setQuestionBankData={setQuestionBankData}
              />
            )}

            {activeTab === "questions" && (
              <QuestionList
                questions={questions}
                setQuestions={setQuestions}
                hideAuthorship={true}
                hidePoints={true}
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
            label: initialQuestionBank
              ? "Update Question Bank"
              : "Create Question Bank",
            icon: initialQuestionBank ? (
              <RefreshCcw className="h-4 w-4 shrink-0" />
            ) : (
              <SquarePen className="h-4 w-4 shrink-0" />
            ),
            onClick: handleSaveQuestionBank,
            disabled: !questionBankData.title || questionBankData.title.trim() === "",
          },
          ...(initialQuestionBank
            ? [
                {
                  label: "Delete Question Bank",
                  icon: <Trash2 className="h-4 w-4 shrink-0" />,
                  onClick: handleDeleteQuestionBank,
                  className: "bg-[#9E4042] hover:bg-[#9E4042]/90 text-white",
                },
              ]
            : []),
        ]}
      />
    </div>
  );
}
