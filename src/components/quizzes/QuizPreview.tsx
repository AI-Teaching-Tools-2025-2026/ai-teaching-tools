"use client";

import { QuizData } from "@/types/quiz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface QuizPreviewProps {
  quiz: QuizData;
}

function formatDueDate(iso: string) {
  if (!iso?.trim()) return "Not set";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "Not set" : d.toLocaleDateString();
}

export default function QuizPreview({ quiz }: QuizPreviewProps) {
  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
      {/* Quiz header */}
      <Card>
        <CardHeader className="pb-2">
          {/* Title + status */}
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-xl">{quiz.quizTitle}</CardTitle>

            <Badge
              variant={
                quiz.quizStatus === "Published" ? "default" : "secondary"
              }
              className={cn(
                "font-medium",
                quiz.quizStatus === "Published"
                  ? "bg-green-500/15 text-green-500 border-green-500/20"
                  : "bg-neutral-500/15 text-neutral-400 border-neutral-500/20",
              )}
            >
              {quiz.quizStatus}
            </Badge>
          </div>

          {/* ✅ Description (NEW) */}
          {quiz.description && (
            <p className="text-sm text-muted-foreground mt-2">
              {quiz.description}
            </p>
          )}

          {/* Meta info */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
            <span>Section: {quiz.section}</span>
            <span>Due: {formatDueDate(quiz.dueDate)}</span>
            <span>{quiz.totalPoints} pts</span>
            <span>{quiz.questions.length} questions</span>
          </div>
        </CardHeader>
      </Card>

      {/* Questions */}
      <div className="flex flex-col gap-4">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Preview — correct answers shown
        </h2>

        {quiz.questions.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No questions yet. Add questions in the Questions tab to see them
              here.
            </CardContent>
          </Card>
        )}

        {quiz.questions.map((q, index) => (
          <Card key={q.questionId}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-start gap-2">
                <span className="text-muted-foreground shrink-0">
                  {index + 1}.
                </span>
                {q.question}
              </CardTitle>

              <p className="text-sm text-muted-foreground pl-6">
                {q.questionPoints} pt{q.questionPoints !== 1 ? "s" : ""}
              </p>
            </CardHeader>

            <CardContent className="pt-0 pl-6">
              <ul className="space-y-2">
                {q.answers.map((answer, i) => (
                  <li
                    key={i}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm border",
                      answer.isCorrect
                        ? "bg-green-500/10 border-green-500/30 text-foreground"
                        : "bg-muted/30 border-transparent text-muted-foreground",
                    )}
                  >
                    <div
                      className={cn(
                        "h-4 w-4 rounded-full border flex items-center justify-center shrink-0",
                        answer.isCorrect
                          ? "border-green-500 bg-green-500/20"
                          : "border-border",
                      )}
                    >
                      {answer.isCorrect && (
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                      )}
                    </div>

                    <span className="min-w-0 flex-1">{answer.text}</span>

                    {answer.isCorrect && (
                      <span className="shrink-0 text-xs font-medium text-green-600 dark:text-green-400">
                        Correct
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}