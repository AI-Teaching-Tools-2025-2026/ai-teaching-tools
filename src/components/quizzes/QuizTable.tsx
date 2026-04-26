"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { MoreHorizontal, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import SubmissionModal from "@/components/modal/submissionModal";
import { quizService } from "@/services/quizService";
import { QuizData } from "@/types/quiz";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FilterState = {
  search: string;
  section: string;
  status: string;
  dueDateFilter: string;
  minPoints: string;
  minQuestions: string;
};

const DEFAULT_FILTERS: FilterState = {
  search: "",
  section: "all",
  status: "all",
  dueDateFilter: "all",
  minPoints: "",
  minQuestions: "",
};

export default function QuizTable() {
  const [quizzes, setQuizzes] = useState<QuizData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuizzes, setSelectedQuizzes] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [showFilterTable, setShowFilterTable] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<QuizData | null>(null);

  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string | undefined;

  const getPreviewHref = (quizId: string) =>
    courseId
      ? `/courses/${courseId}/quizzes/preview/${quizId}`
      : `/dashboard/quizzes/preview/${quizId}`;

  useEffect(() => {
    const loadQuizzes = async () => {
      if (!courseId) {
        setLoading(false);
        return;
      }
      try {
        const data = await quizService.getAllQuizzes(courseId);
        setQuizzes(data);
      } catch (error) {
        toast.error("Failed to load quizzes");
        console.error("Failed to load quizzes:", error);
      } finally {
        setLoading(false);
      }
    };

    loadQuizzes();
  }, [courseId]);

  const sections = useMemo(
    () =>
      Array.from(new Set(quizzes.map((q) => q.section).filter(Boolean))).sort(),
    [quizzes],
  );

  const filteredQuizzes = useMemo(() => {
    return quizzes.filter((quiz) => {
      if (filters.search) {
        const search = filters.search.toLowerCase();
        if (!quiz.quizTitle.toLowerCase().includes(search)) return false;
      }
      if (filters.section !== "all" && quiz.section !== filters.section)
        return false;
      if (filters.status !== "all" && quiz.quizStatus !== filters.status)
        return false;
      if (filters.dueDateFilter !== "all") {
        const due = new Date(quiz.dueDate).getTime();
        const now = Date.now();
        if (filters.dueDateFilter === "overdue" && due >= now) return false;
        if (filters.dueDateFilter === "upcoming" && due < now) return false;
      }
      if (filters.minPoints) {
        const min = parseInt(filters.minPoints, 10);
        if (!isNaN(min) && quiz.totalPoints < min) return false;
      }
      if (filters.minQuestions) {
        const min = parseInt(filters.minQuestions, 10);
        if (!isNaN(min) && quiz.questions.length < min) return false;
      }
      return true;
    });
  }, [quizzes, filters]);

  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K],
  ) => setFilters((prev) => ({ ...prev, [key]: value }));

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const hasActiveFilters =
    filters.search ||
    filters.section !== "all" ||
    filters.status !== "all" ||
    filters.dueDateFilter !== "all" ||
    filters.minPoints !== "" ||
    filters.minQuestions !== "";

  const allSelected =
    selectedQuizzes.length === filteredQuizzes.length &&
    filteredQuizzes.length > 0;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedQuizzes([]);
    } else {
      setSelectedQuizzes(filteredQuizzes.map((q) => q._id));
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
      setSelectedQuizzes((prev) => prev.filter((id) => id !== quizId));
      toast.success("Quiz deleted successfully");
    } catch (error) {
      toast.error("Failed to delete quiz");
      console.error("Failed to delete quiz", error);
    }
  };

  const handleDuplicate = async (quizId: string) => {
    try {
      toast.info("Duplicating quiz...", { id: "duplicate-toast" });
      const newQuiz = await quizService.duplicateQuizById(quizId);
      setQuizzes((prev) => [...prev, newQuiz]);
      toast.success("Quiz duplicated successfully", { id: "duplicate-toast" });
      if (courseId) {
        router.push(`/courses/${courseId}/quizzes/${newQuiz._id}/edit`);
      }
    } catch (error) {
      toast.error("Failed to duplicate quiz", { id: "duplicate-toast" });
      console.error("Failed to duplicate quiz", error);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Filter section - button in top right when expanded, or minimal bar when collapsed */}
      <div className="rounded-md border bg-card">
        {showFilterTable ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="w-[50px] pl-4">
                  <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                </TableHead>
                <TableHead className="w-[300px]">Title</TableHead>
                <TableHead className="w-[150px]">Section</TableHead>
                <TableHead className="w-[150px]">Due Date</TableHead>
                <TableHead className="w-20">Points</TableHead>
                <TableHead className="w-20">Questions</TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead className="w-[120px]">
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "h-8 gap-2",
                        hasActiveFilters && "border-primary/50 bg-primary/5",
                      )}
                      onClick={() => setShowFilterTable(false)}
                    >
                      <Filter className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Filter
                      </span>
                    </Button>
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="hover:bg-transparent">
                <TableCell className="pl-4" />
                <TableCell>
                  <Input
                    placeholder="Search by title..."
                    value={filters.search}
                    onChange={(e) => updateFilter("search", e.target.value)}
                    className="h-8"
                  />
                </TableCell>
                <TableCell>
                  <Select
                    value={filters.section}
                    onValueChange={(v) => updateFilter("section", v)}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="All sections" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All sections</SelectItem>
                      {sections.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    value={filters.dueDateFilter}
                    onValueChange={(v) => updateFilter("dueDateFilter", v)}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    placeholder="Min"
                    min={0}
                    value={filters.minPoints}
                    onChange={(e) => updateFilter("minPoints", e.target.value)}
                    className="h-8"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    placeholder="Min"
                    min={0}
                    value={filters.minQuestions}
                    onChange={(e) =>
                      updateFilter("minQuestions", e.target.value)
                    }
                    className="h-8"
                  />
                </TableCell>
                <TableCell>
                  <Select
                    value={filters.status}
                    onValueChange={(v) => updateFilter("status", v)}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="Published">Published</SelectItem>
                      <SelectItem value="Draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-8 text-muted-foreground",
                      hasActiveFilters && "text-foreground",
                    )}
                    onClick={clearFilters}
                    disabled={!hasActiveFilters}
                  >
                    Clear
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        ) : (
          <div className="flex justify-end p-2">
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-8 gap-2",
                hasActiveFilters && "border-primary/50 bg-primary/5",
              )}
              onClick={() => setShowFilterTable(true)}
            >
              <Filter className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Filter
              </span>
            </Button>
          </div>
        )}
      </div>

      {/* Quiz table */}
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
              <TableHead className="w-[50px]" />
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
            ) : filteredQuizzes.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-24 text-center text-muted-foreground"
                >
                  {quizzes.length === 0
                    ? "No quizzes found."
                    : "No quizzes match your filters."}
                </TableCell>
              </TableRow>
            ) : (
              filteredQuizzes.map((quiz) => {
                const isSelected = selectedQuizzes.includes(quiz._id);

                return (
                  <TableRow
                    key={quiz._id}
                    data-state={isSelected ? "selected" : undefined}
                    className="transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    {/* Checkbox */}
                    <TableCell className="pl-4">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelectQuiz(quiz._id)}
                        aria-label={`Select ${quiz.quizTitle}`}
                      />
                    </TableCell>

                    {/* Title - clickable to preview */}
                    <TableCell className="font-medium text-foreground">
                      <Link
                        href={getPreviewHref(quiz._id)}
                        className="text-foreground hover:underline focus:outline-none focus:underline"
                      >
                        {quiz.quizTitle}
                      </Link>
                    </TableCell>

                    {/* Section */}
                    <TableCell className="text-muted-foreground">
                      {quiz.section}
                    </TableCell>

                    {/* Due Date */}
                    <TableCell className="text-muted-foreground">
                      {new Date(quiz.dueDate).toLocaleDateString()}
                    </TableCell>

                    {/* Points */}
                    <TableCell className="text-muted-foreground">
                      {quiz.totalPoints}
                    </TableCell>

                    {/* Questions Count */}
                    <TableCell className="text-muted-foreground">
                      {quiz.questions.length}
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Badge
                        variant={
                          quiz.quizStatus === "Published"
                            ? "default"
                            : "secondary"
                        }
                        className={cn(
                          "font-medium",
                          quiz.quizStatus === "Published"
                            ? "bg-green-500/15 text-green-500 hover:bg-green-500/25 border-green-500/20"
                            : "bg-neutral-500/15 text-neutral-400 hover:bg-neutral-500/25 border-neutral-500/20",
                        )}
                      >
                        {quiz.quizStatus}
                      </Badge>
                    </TableCell>

                    {/* Actions */}
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
                            onClick={() =>
                              router.push(
                                `/courses/${courseId}/quizzes/${quiz._id}/edit`,
                              )
                            }
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
                            onClick={() => {
                              setQuizToDelete(quiz);
                              setDeleteModalOpen(true);
                            }}
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

      <SubmissionModal
        isOpen={deleteModalOpen}
        onOpenChange={(open) => {
          setDeleteModalOpen(open);
          if (!open) {
            setQuizToDelete(null);
          }
        }}
        body={
          quizToDelete
            ? `This will permanently delete "${quizToDelete.quizTitle}". This cannot be undone.`
            : undefined
        }
        onSubmit={async () => {
          if (!quizToDelete) return;
          await handleDelete(quizToDelete._id);
          setQuizToDelete(null);
        }}
      />
    </div>
  );
}
