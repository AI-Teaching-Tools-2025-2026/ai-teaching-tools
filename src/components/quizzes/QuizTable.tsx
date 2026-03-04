"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { MoreHorizontal, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function QuizTable() {
  const [quizzes, setQuizzes] = useState<QuizData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuizzes, setSelectedQuizzes] = useState<string[]>([]);
  const params = useParams();
  const courseId = params.courseId as string;

  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        const data = await quizService.getAllQuizzes(courseId as string);
        setQuizzes(data);
      } catch (error) {
        console.error("Failed to load quizzes:", error);
      } finally {
        setLoading(false);
      }
    };
    if (courseId) loadQuizzes();
  }, []);

  console.log("Quizzes data:", quizzes);

  const allSelected =
    selectedQuizzes.length === quizzes.length && quizzes.length > 0;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedQuizzes([]);
    } else {
      setSelectedQuizzes(quizzes.map((q) => q._id));
    }
  };

  const toggleSelectQuiz = (id: string) => {
    if (selectedQuizzes.includes(id)) {
      setSelectedQuizzes(selectedQuizzes.filter((qId) => qId !== id));
    } else {
      setSelectedQuizzes([...selectedQuizzes, id]);
    }
  };

  const handleDelete = async (quizId: string) => {
    try {
      await quizService.deleteQuizById(quizId);

      setQuizzes((prev) => prev.filter((q) => q._id !== quizId));
    } catch (error) {
      console.error("Failed to delete quiz", error);
    }
  };

  const handleDuplicate = async (quizId: string) => {
    try {
      const newQuiz = await quizService.duplicateQuizById(quizId);

      setQuizzes((prev) => [...prev, newQuiz]);
    } catch (error) {
      console.error("Failed to duplicate quiz", error);
    }
};

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-2">
            <Filter className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Filter
            </span>
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[50px] pl-4">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead className="w-[300px]">Title</TableHead>
              <TableHead className="w-[150px]">Section</TableHead>
              <TableHead className="w-[150px]">Due Date</TableHead>
              <TableHead className="w-[100px]">Points</TableHead>
              <TableHead className="w-[100px]">Questions</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-24 text-center text-muted-foreground"
                >
                  Loading quizzes...
                </TableCell>
              </TableRow>
            ) : quizzes.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-24 text-center text-muted-foreground"
                >
                  No quizzes found.
                </TableCell>
              </TableRow>
            ) : (
              quizzes.map((quiz) => {
                const isSelected = selectedQuizzes.includes(quiz._id);
                return (
                  <TableRow
                    key={quiz._id}
                    data-state={isSelected ? "selected" : undefined}
                    className="transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    <TableCell className="pl-4">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelectQuiz(quiz._id)}
                        aria-label={`Select ${quiz.title}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      {quiz.title}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {quiz.section}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(quiz.dueDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {quiz.points}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {quiz.questions.length}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          quiz.status === "Published" ? "default" : "secondary"
                        }
                        className={cn(
                          "font-medium",
                          quiz.status === "Published"
                            ? "bg-green-500/15 text-green-500 hover:bg-green-500/25 border-green-500/20"
                            : "bg-neutral-500/15 text-neutral-400 hover:bg-neutral-500/25 border-neutral-500/20",
                        )}
                      >
                        {quiz.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 p-0"
                          >
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => console.log("Edit", quiz._id)}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDuplicate(quiz._id)}
                          >
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDelete(quiz._id)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
