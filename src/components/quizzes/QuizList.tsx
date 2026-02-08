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

  const allSelected = selectedQuizzes.length === quizzes.length && quizzes.length > 0;

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
    <div className="flex flex-col gap-8 w-full max-w-[1200px] mx-auto p-6 bg-[#0a0a0a] min-h-screen">
      {/* Header Actions */}
      <div className="flex items-center justify-between w-full">
        <h2 className="text-5xl font-semibold text-white tracking-tight">Quizzes</h2>
        <Button 
          onClick={() => router.push("/dashboard/quizzes/builder")}
          className="bg-white text-black hover:bg-neutral-200 font-medium rounded-lg px-6 h-10"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Quiz
        </Button>
      </div>

      <div className="rounded-lg border border-[#404040] overflow-hidden">
        {/* Table Header Filter Bar - mimicking the visual from Figma */}
        <div className="p-4 bg-[#171717] border-b border-[#404040] flex justify-between items-center">
            <h3 className="text-xl font-medium text-white">All Quizzes</h3>
             <Button variant="outline" className="gap-2 bg-[#262626] border-none text-[#f5f5f5] hover:bg-[#333] hover:text-white">
                Filter <ChevronDown className="h-4 w-4" />
            </Button>
        </div>

        <div className="bg-[#171717]">
          <Table>
            <TableHeader>
              <TableRow className="border-[#404040] hover:bg-transparent">
                <TableHead className="w-[50px] pl-6 py-4">
                  <div 
                    className={cn(
                      "h-5 w-5 rounded border border-[#525252] flex items-center justify-center cursor-pointer transition-colors",
                      allSelected ? "bg-white border-white" : "bg-transparent hover:border-neutral-400"
                    )}
                    onClick={toggleSelectAll}
                  >
                    {allSelected && <div className="h-2.5 w-2.5 bg-black rounded-sm" />}
                  </div>
                </TableHead>
                <TableHead className="text-lg font-medium text-[#a3a3a3] h-14">Title</TableHead>
                <TableHead className="text-lg font-medium text-[#a3a3a3] h-14">Section</TableHead>
                <TableHead className="text-lg font-medium text-[#a3a3a3] h-14">Course</TableHead>
                <TableHead className="text-lg font-medium text-[#a3a3a3] h-14">Questions</TableHead>
                <TableHead className="text-lg font-medium text-[#a3a3a3] h-14">Date</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quizzes.map((quiz) => {
                const isSelected = selectedQuizzes.includes(quiz.quizId);
                return (
                  <TableRow 
                    key={quiz.quizId} 
                    className={cn(
                        "border-[#404040] group transition-colors data-[state=selected]:bg-[#262626]",
                        isSelected ? "bg-[#262626]" : "hover:bg-[#262626]/50"
                    )}
                  >
                    <TableCell className="pl-6 py-4">
                      <div 
                        className={cn(
                          "h-5 w-5 rounded border border-[#525252] flex items-center justify-center cursor-pointer transition-colors",
                          isSelected ? "bg-white border-white" : "bg-transparent group-hover:border-neutral-400"
                        )}
                        onClick={() => toggleSelectQuiz(quiz.quizId)}
                      >
                         {isSelected && <div className="h-2.5 w-2.5 bg-black rounded-sm" />}
                      </div>
                    </TableCell>
                    <TableCell className="font-normal text-lg text-[#fafafa] py-4">{quiz.title}</TableCell>
                    <TableCell className="font-normal text-lg text-[#fafafa] py-4">{quiz.courseId}</TableCell>
                    <TableCell className="font-normal text-lg text-[#fafafa] py-4">{quiz.questions.length}</TableCell>
                    <TableCell className="font-normal text-lg text-[#fafafa] py-4">
                      {new Date(quiz.timestamp.$date).toLocaleDateString()}
                    </TableCell>
                     <TableCell className="pr-6">
                        <Button variant="ghost" size="icon" className="text-[#a3a3a3] hover:text-white hover:bg-white/10">
                            <MoreHorizontal className="h-5 w-5" />
                        </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
