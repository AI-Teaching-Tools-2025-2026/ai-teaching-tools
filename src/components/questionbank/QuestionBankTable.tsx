"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { MoreHorizontal, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import SubmissionModal from "@/components/modal/submissionModal";
import { cn } from "@/lib/utils";
import { questionBankService } from "@/services/questionBankService";
import { QuestionBank } from "@/types/questionBank";
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
  chapter: string;
};

const DEFAULT_FILTERS: FilterState = {
  search: "",
  chapter: "all",
};

export default function QuestionBankTable() {
  const [banks, setBanks] = useState<QuestionBank[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBanks, setSelectedBanks] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [showFilterTable, setShowFilterTable] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bankToDelete, setBankToDelete] = useState<QuestionBank | null>(null);

  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string | undefined;

  const getPreviewHref = (bankId: string) =>
    courseId
      ? `/courses/${courseId}/question-banks/preview/${bankId}`
      : `/dashboard/question-banks/preview/${bankId}`;

  useEffect(() => {
    const loadBanks = async () => {
      if (!courseId) {
        setLoading(false);
        return;
      }
      try {
        const data = await questionBankService.getAllQuestionBanks(courseId);
        setBanks(data);
      } catch (error) {
        toast.error("Failed to load question banks");
        console.error("Failed to load question banks:", error);
      } finally {
        setLoading(false);
      }
    };

    loadBanks(); // initial load on mount 

    window.addEventListener("questionBanksUpdated", loadBanks); // when job completes 

    return () => {
      window.removeEventListener("questionBanksUpdated", loadBanks);
    };
  }, [courseId]);

  const chapters = useMemo(
    () =>
      Array.from(new Set(banks.map((b) => b.chapter).filter(Boolean))).sort(),
    [banks],
  );

  const filteredBanks = useMemo(() => {
    return banks.filter((bank) => {
      if (filters.search) {
        const search = filters.search.toLowerCase();
        if (!bank.title.toLowerCase().includes(search)) return false;
      }
      if (filters.chapter !== "all" && bank.chapter !== filters.chapter)
        return false;
      return true;
    });
  }, [banks, filters]);

  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K],
  ) => setFilters((prev) => ({ ...prev, [key]: value }));

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const hasActiveFilters = filters.search || filters.chapter !== "all";

  const allSelected =
    selectedBanks.length === filteredBanks.length && filteredBanks.length > 0;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedBanks([]);
    } else {
      setSelectedBanks(filteredBanks.map((b) => b._id));
    }
  };

  const toggleSelectBank = (id: string) => {
    if (selectedBanks.includes(id)) {
      setSelectedBanks(selectedBanks.filter((bId) => bId !== id));
    } else {
      setSelectedBanks([...selectedBanks, id]);
    }
  };

  const handleDelete = async (bankId: string) => {
    try {
      await questionBankService.deleteQuestionBankById(bankId);
      setBanks((prev) => prev.filter((b) => b._id !== bankId));
      setSelectedBanks((prev) => prev.filter((id) => id !== bankId));
      toast.success("Question Bank deleted successfully");
    } catch (error) {
      toast.error("Failed to delete question bank");
      console.error("Failed to delete question bank", error);
    }
  };

  const handleDuplicate = async (bankId: string) => {
    try {
      toast.info("Duplicating question bank...", { id: "duplicate-toast" });
      const newBank =
        await questionBankService.duplicateQuestionBankById(bankId);
      setBanks((prev) => [...prev, newBank]);
      toast.success("Question Bank duplicated successfully", {
        id: "duplicate-toast",
      });
    } catch (error) {
      toast.error("Failed to duplicate question bank", {
        id: "duplicate-toast",
      });
      console.error("Failed to duplicate question bank", error);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Filter section */}
      <div className="rounded-md border bg-card">
        {showFilterTable ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="w-[50px] pl-4">
                  <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                </TableHead>
                <TableHead className="w-[400px]">Title</TableHead>
                <TableHead className="w-[200px]">Chapter</TableHead>
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
                    value={filters.chapter}
                    onValueChange={(v) => updateFilter("chapter", v)}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="All chapters" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All chapters</SelectItem>
                      {chapters.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end">
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
                  </div>
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

      {/* Bank table */}
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
              <TableHead className="w-[400px]">Title</TableHead>
              <TableHead className="w-[200px]">Chapter</TableHead>
              <TableHead className="w-[150px]">Questions</TableHead>
              <TableHead className="w-[200px]">Last Modified</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  Loading question banks...
                </TableCell>
              </TableRow>
            ) : filteredBanks.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  {banks.length === 0
                    ? "No question banks found."
                    : "No question banks match your filters."}
                </TableCell>
              </TableRow>
            ) : (
              filteredBanks.map((bank) => {
                const isSelected = selectedBanks.includes(bank._id);

                return (
                  <TableRow
                    key={bank._id}
                    data-state={isSelected ? "selected" : undefined}
                    className="transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    {/* Checkbox */}
                    <TableCell className="pl-4">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelectBank(bank._id)}
                        aria-label={`Select ${bank.title}`}
                      />
                    </TableCell>

                    {/* Title — opens read-only preview (like quizzes) */}
                    <TableCell className="font-medium text-foreground">
                      <Link
                        href={getPreviewHref(bank._id)}
                        className="text-foreground hover:underline focus:outline-none focus:underline"
                      >
                        {bank.title}
                      </Link>
                    </TableCell>

                    {/* Chapter */}
                    <TableCell className="text-muted-foreground">
                      {bank.chapter}
                    </TableCell>

                    {/* Questions Count */}
                    <TableCell className="text-muted-foreground">
                      {bank.questionCount}
                    </TableCell>

                    {/* Last Modified */}
                    <TableCell className="text-muted-foreground">
                      {new Date(bank.lastModified).toLocaleDateString()}
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
                                `/courses/${courseId}/question-banks/${bank._id}/edit`,
                              )
                            }
                          >
                            Edit
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => handleDuplicate(bank._id)}
                          >
                            Duplicate
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                              setBankToDelete(bank);
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
            setBankToDelete(null);
          }
        }}
        body={
          bankToDelete
            ? `This will permanently delete "${bankToDelete.title}". This cannot be undone.`
            : undefined
        }
        onSubmit={async () => {
          if (!bankToDelete) return;
          await handleDelete(bankToDelete._id);
          setBankToDelete(null);
        }}
      />
    </div>
  );
}
