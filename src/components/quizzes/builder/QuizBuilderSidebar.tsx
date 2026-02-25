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
    <div className="lg:col-span-3 flex flex-col gap-6 h-fit sticky top-24">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg">Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button
            variant="secondary"
            className="w-full gap-2 justify-start h-auto py-3 px-4 cursor-pointer whitespace-normal text-left"
          >
            <GraduationCap className="h-4 w-4 shrink-0" />
            Student View
          </Button>
          <Button 
            className="w-full gap-2 justify-start h-auto py-3 px-4 bg-blue-800 hover:bg-blue-900 text-white whitespace-normal text-left"
            onClick={onPublish}
          >
            <Eye className="h-4 w-4 shrink-0" />
            Publish Quiz
          </Button>
          <Button
            className="w-full gap-2 justify-start h-auto py-3 px-4 cursor-pointer bg-[#9E4042] hover:bg-[#9E4042]/90 text-white whitespace-normal text-left"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4 shrink-0" />
            Delete Quiz
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}