"use client";

import { QuestionBank } from "@/types/questionBank";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface QuestionBankPreviewProps {
  questionBank: QuestionBank;
}

export default function QuestionBankPreview({
  questionBank,
}: QuestionBankPreviewProps) {
  const questions = questionBank.questions ?? [];

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">{questionBank.title}</CardTitle>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
            <span>Chapter: {questionBank.chapter}</span>
            <span>{questions.length} questions</span>
            {questionBank.lastModified && (
              <span>
                Last modified:{" "}
                {new Date(questionBank.lastModified).toLocaleDateString()}
              </span>
            )}
          </div>
        </CardHeader>
      </Card>

      <div className="flex flex-col gap-4">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Preview — correct answers shown
        </h2>

        {questions.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No questions in this bank yet.
            </CardContent>
          </Card>
        )}

        {questions.map((q, index) => (
          <Card key={q.questionId}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-start gap-2">
                <span className="text-muted-foreground shrink-0">
                  {index + 1}.
                </span>
                {q.questionText}
              </CardTitle>

              <p className="text-sm text-muted-foreground pl-6">
                {q.questionPoints} pt{q.questionPoints !== 1 ? "s" : ""} ·{" "}
                {q.questionType === "true-false"
                  ? "True / false"
                  : "Multiple choice"}
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
