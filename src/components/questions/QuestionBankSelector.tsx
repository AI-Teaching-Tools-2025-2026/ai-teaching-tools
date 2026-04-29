"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  QuestionBank,
  Question,
  transformQBQuestionsToBuilder,
} from "@/types/questionBank";
import { BuilderQuestion } from "@/types/quiz";
import { questionBankService } from "@/services/questionBankService";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface QuestionBankSelectorProps {
  courseId?: string;
  onAddQuestions: (questions: BuilderQuestion[]) => void;
  onCancel: () => void;
}

export function QuestionBankSelector({
  courseId,
  onAddQuestions,
  onCancel,
}: QuestionBankSelectorProps) {
  const [banks, setBanks] = useState<QuestionBank[]>([]);
  const [selectedBankId, setSelectedBankId] = useState<string>("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // Fetch banks when the component mounts or courseId changes
  useEffect(() => {
    async function loadBanks() {
      if (!courseId) return;
      try {
        const fetchedBanks =
          await questionBankService.getAllQuestionBanks(courseId);
        setBanks(fetchedBanks || []);
      } catch (e) {
        console.error("Failed to load question banks", e);
      }
    }
    loadBanks();
  }, [courseId]);

  // Fetch questions for the selected bank
  useEffect(() => {
    async function loadBankDetails() {
      if (!selectedBankId) {
        setQuestions([]);
        setSelectedIds(new Set());
        return;
      }
      setLoading(true);
      try {
        const bankDetails =
          await questionBankService.getQuestionBankById(selectedBankId);
        setQuestions(bankDetails.questions || []);
      } catch (e) {
        console.error("Failed to load questions", e);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    }
    loadBankDetails();
  }, [selectedBankId]);

  // Filter questions by search query
  const filteredQuestions = useMemo(() => {
    if (!searchQuery.trim()) return questions;
    const lowerQuery = searchQuery.toLowerCase();
    return questions.filter((q) =>
      q.questionText.toLowerCase().includes(lowerQuery),
    );
  }, [questions, searchQuery]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(filteredQuestions.map((q) => q.questionId));
      setSelectedIds(allIds);
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const next = new Set(selectedIds);
    if (checked) {
      next.add(id);
    } else {
      next.delete(id);
    }
    setSelectedIds(next);
  };

  const handleSubmit = () => {
    const selectedQ = questions.filter((q) => selectedIds.has(q.questionId));
    if (selectedQ.length === 0) return;
    const builderQs = transformQBQuestionsToBuilder(selectedQ);
    onAddQuestions(builderQs);
  };

  return (
    <div className="grid gap-6 py-4 animate-in fade-in">
      <div className="grid gap-2">
        <Label className="text-[15px] font-medium text-foreground">
          Question Bank
        </Label>
        <Select value={selectedBankId} onValueChange={setSelectedBankId}>
          <SelectTrigger className="w-[300px] bg-card/50">
            <SelectValue placeholder="Select Question Bank" />
          </SelectTrigger>
          <SelectContent>
            {banks.map((bank) => (
              <SelectItem key={bank._id} value={bank._id}>
                {bank.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedBankId && (
        <div className="flex flex-col gap-4 animate-in fade-in pt-4 border-t border-border">
          <Input
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md bg-card/50"
          />

          <div className="rounded-md border bg-card/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[50px] text-center">
                    <Checkbox
                      checked={
                        filteredQuestions.length > 0 &&
                        selectedIds.size === filteredQuestions.length
                      }
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all questions"
                    />
                  </TableHead>
                  <TableHead className="w-[40%]">Question Name</TableHead>
                  <TableHead className="w-[20%]">Question Type</TableHead>
                  <TableHead>Correct Answer(s)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Loading questions...
                    </TableCell>
                  </TableRow>
                ) : filteredQuestions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No questions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredQuestions.map((q) => {
                    const correctAnswersText = q.answers
                      .filter((a) => a.isCorrect)
                      .map((a) => a.text)
                      .join(", ");

                    const isChecked = selectedIds.has(q.questionId);

                    return (
                      <TableRow
                        key={q.questionId}
                        className="group border-b-border/40"
                      >
                        <TableCell className="text-center align-middle">
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={(checked) =>
                              handleSelectOne(q.questionId, !!checked)
                            }
                            aria-label={`Select question ${q.questionText}`}
                          />
                        </TableCell>
                        <TableCell
                          className="font-medium max-w-[300px] truncate"
                          title={q.questionText}
                        >
                          {q.questionText}
                        </TableCell>
                        <TableCell className="capitalize text-muted-foreground">
                          {q.questionType === "multiple-choice"
                            ? "Multiple-Choice"
                            : "True/False"}
                        </TableCell>
                        <TableCell
                          className="text-muted-foreground max-w-[200px] truncate"
                          title={correctAnswersText}
                        >
                          {correctAnswersText || "-"}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={selectedIds.size === 0}
              className="bg-[#9E4042] hover:bg-[#9E4042]/90 text-white"
            >
              Add Selected ({selectedIds.size})
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
