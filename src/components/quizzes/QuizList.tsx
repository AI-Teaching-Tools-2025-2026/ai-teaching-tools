"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, MoreHorizontal, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { quizService } from "@/services/quizService";
import { QuizData } from "./mockData";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function QuizList() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<QuizData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuizzes, setSelectedQuizzes] = useState<string[]>([]);

  console.log("Quizzes data:", quizzes);

  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        const data = await quizService.getAllQuizzes();
        setQuizzes(data);
      } catch (error) {
        console.error("Failed to load quizzes:", error);
      } finally {
        setLoading(false);
      }
    };
    loadQuizzes();
  }, []);

  const allSelected =
    selectedQuizzes.length === quizzes.length && quizzes.length > 0;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedQuizzes([]);
    } else {
      setSelectedQuizzes(quizzes.map((q) => q.quizId));
    }
  };

  const toggleSelectQuiz = (id: string) => {
    if (selectedQuizzes.includes(id)) {
      setSelectedQuizzes(selectedQuizzes.filter((qId) => qId !== id));
    } else {
      setSelectedQuizzes([...selectedQuizzes, id]);
    }
  };

  return (
    <div className="rounded-lg border border-[#404040] overflow-hidden">
      {/* Table Header Filter Bar - mimicking the visual from Figma */}
      <div className="p-4 bg-[#171717] border-b border-[#404040] flex justify-between items-center">
        <h3 className="text-base font-medium text-white">All Quizzes</h3>
        <Button
          variant="outline"
          className="gap-2 bg-[#262626] border-none text-[#f5f5f5] hover:bg-[#333] hover:text-white h-8 text-xs"
        >
          Filter <ChevronDown className="h-3 w-3" />
        </Button>
      </div>

      <div className="bg-[#171717]">
        <Table>
          <TableHeader>
            <TableRow className="border-[#404040] hover:bg-transparent">
              <TableHead className="w-[50px] pl-6 h-10">
                <div
                  className={cn(
                    "h-4 w-4 rounded border border-[#525252] flex items-center justify-center cursor-pointer transition-colors",
                    allSelected
                      ? "bg-white border-white"
                      : "bg-transparent hover:border-neutral-400",
                  )}
                  onClick={toggleSelectAll}
                >
                  {allSelected && (
                    <div className="h-2 w-2 bg-black rounded-sm" />
                  )}
                </div>
              </TableHead>
              <TableHead className="text-sm font-medium text-[#a3a3a3] h-10 w-[300px]">
                Title
              </TableHead>
              <TableHead className="text-sm font-medium text-[#a3a3a3] h-10 w-[150px]">
                Section
              </TableHead>
              <TableHead className="text-sm font-medium text-[#a3a3a3] h-10 w-[150px]">
                Due Date
              </TableHead>
              <TableHead className="text-sm font-medium text-[#a3a3a3] h-10 w-[100px]">
                Points
              </TableHead>
              <TableHead className="text-sm font-medium text-[#a3a3a3] h-10 w-[100px]">
                Questions
              </TableHead>
              <TableHead className="text-sm font-medium text-[#a3a3a3] h-10 w-[120px]">
                Published
              </TableHead>
              <TableHead className="w-[50px] h-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-[#a3a3a3] text-sm"
                >
                  Loading quizzes...
                </TableCell>
              </TableRow>
            ) : quizzes.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-[#a3a3a3] text-sm"
                >
                  No quizzes found.
                </TableCell>
              </TableRow>
            ) : (
              quizzes.map((quiz) => {
                const isSelected = selectedQuizzes.includes(quiz.quizId);
                return (
                  <TableRow
                    key={quiz.quizId}
                    className={cn(
                      "border-[#404040] group transition-colors data-[state=selected]:bg-[#262626]",
                      isSelected ? "bg-[#262626]" : "hover:bg-[#262626]/50",
                    )}
                  >
                    <TableCell className="pl-6 py-3">
                      <div
                        className={cn(
                          "h-4 w-4 rounded border border-[#525252] flex items-center justify-center cursor-pointer transition-colors",
                          isSelected
                            ? "bg-white border-white"
                            : "bg-transparent group-hover:border-neutral-400",
                        )}
                        onClick={() => toggleSelectQuiz(quiz.quizId)}
                      >
                        {isSelected && (
                          <div className="h-2 w-2 bg-black rounded-sm" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-sm text-[#fafafa] py-3">
                      {quiz.title}
                    </TableCell>
                    <TableCell className="text-sm text-[#fafafa] py-3">
                      {quiz.section}
                    </TableCell>
                    <TableCell className="text-sm text-[#fafafa] py-3">
                      {quiz.dueDate}
                    </TableCell>
                    <TableCell className="text-sm text-[#fafafa] py-3">
                      {quiz.points}
                    </TableCell>
                    <TableCell className="text-sm text-[#fafafa] py-3">
                      {quiz.questions.length}
                    </TableCell>
                    <TableCell className="text-sm text-[#fafafa] py-3">
                      <div
                        className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                          quiz.status === "Published"
                            ? "bg-green-500/10 text-green-500"
                            : "bg-neutral-500/10 text-neutral-400",
                        )}
                      >
                        {quiz.status === "Published" ? "Yes" : "No"}
                      </div>
                    </TableCell>
                    <TableCell className="pr-6 py-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-[#a3a3a3] hover:text-white hover:bg-white/10"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
