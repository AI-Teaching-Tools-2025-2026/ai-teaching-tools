"use client";

import React, { useState } from "react";
import { ChevronDown, MoreHorizontal, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { mockQuizzes } from "./mockData";
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
  const [selectedQuizzes, setSelectedQuizzes] = useState<string[]>([]);
  const allSelected = selectedQuizzes.length === mockQuizzes.length && mockQuizzes.length > 0;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedQuizzes([]);
    } else {
      setSelectedQuizzes(mockQuizzes.map((q) => q.quizId));
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
    <div className="flex flex-col gap-4 w-full max-w-5xl">
       {/* Header Actions */}
      <div className="flex items-center justify-between w-full">
        <h2 className="text-xl font-medium text-neutral-900">Quizzes</h2>
        <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
                Filter <ChevronDown className="h-4 w-4" />
            </Button>
            <Button onClick={() => router.push("/dashboard/quizzes/builder")}>
                <Plus className="h-4 w-4 mr-2" />
                Create Quiz
            </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-white overflow-hidden">
        <Table>
          <TableHeader className="bg-neutral-50">
            <TableRow>
              <TableHead className="w-12 text-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead className="font-medium text-neutral-500">Quiz Title</TableHead>
              <TableHead className="w-48 font-medium text-neutral-500">Course & Topic</TableHead>
              <TableHead className="w-32 font-medium text-neutral-500">List of Questions</TableHead>
              <TableHead className="w-32 font-medium text-neutral-500">Status</TableHead>
              <TableHead className="w-32 font-medium text-neutral-500">Created At</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockQuizzes.map((quiz) => (
              <TableRow 
                key={quiz.quizId} 
                data-state={selectedQuizzes.includes(quiz.quizId) && "selected"}
                className={selectedQuizzes.includes(quiz.quizId) ? "bg-neutral-50" : ""}
              >
                <TableCell className="text-center">
                   <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                    checked={selectedQuizzes.includes(quiz.quizId)}
                    onChange={() => toggleSelectQuiz(quiz.quizId)}
                    aria-label={`Select ${quiz.title}`}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  <span className="text-neutral-900 font-medium">{quiz.title}</span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                     <span className="font-medium text-neutral-900">{quiz.courseId}</span>
                     <span className="text-xs text-neutral-500">{quiz.section}</span>
                  </div>
                </TableCell>
                <TableCell className="text-neutral-600">
                  {quiz.questions.length} Questions
                </TableCell>
                <TableCell>
                   <span
                      className={cn(
                        "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                        quiz.status === "Published"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      )}
                    >
                      {quiz.status}
                    </span>
                </TableCell>
                <TableCell className="text-neutral-600">
                  {new Date(quiz.timestamp.$date).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
