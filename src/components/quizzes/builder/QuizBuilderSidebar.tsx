import React from "react";
import { GraduationCap, Eye, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BuilderQuestion } from "@/types/quiz";

interface QuizBuilderSidebarProps {
  activeTab: "details" | "questions";
  onAddQuestion: (type: BuilderQuestion["type"]) => void;
  onDelete: () => void;
  onPublish: () => void;
}

export function QuizBuilderSidebar({
  activeTab,
  onAddQuestion,
  onDelete,
  onPublish,
}: QuizBuilderSidebarProps) {
  return (
    <div className="lg:col-span-3 flex flex-col gap-6 ">
      <Card className="border-border bg-card sticky top-6">
        <CardHeader>
          <CardTitle className="text-lg">Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button
            variant="secondary"
            className="w-full gap-2 justify-start h-auto py-3 px-4 cursor-pointer"
          >
            <GraduationCap className="h-4 w-4" />
            Student View
          </Button>
          <Button 
            className="w-full gap-2 justify-start h-auto py-3 px-4 bg-blue-800 hover:bg-blue-900 text-white"
            onClick={onPublish}
          >
            <Eye className="h-4 w-4" />
            Publish Quiz
          </Button>
          <Button
            className="w-full gap-2 justify-start h-auto py-3 px-4 cursor-pointer bg-[#9E4042] hover:bg-[#9E4042]/90 text-white"
            onClick={onDelete}
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
            <Button
              variant="outline"
              className="justify-start gap-2"
              onClick={() => onAddQuestion("multiple-choice")}
            >
              <Plus className="h-4 w-4" /> Multiple Choice
            </Button>
            <Button 
              variant="outline" 
              className="justify-start gap-2"
              onClick={() => onAddQuestion("true-false")}
            >
              <Plus className="h-4 w-4" /> True / False
            </Button>
            <Button 
              variant="outline" 
              className="justify-start gap-2"
              onClick={() => onAddQuestion("short-answer")}
            >
              <Plus className="h-4 w-4" /> Short Answer
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}