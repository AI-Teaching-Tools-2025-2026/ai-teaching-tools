"use client";

import { useRouter } from "next/navigation";

import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import QuizBuilder from "@/components/quizzes/QuizBuilder";


export default function QuizBuilderPage() {
  const router = useRouter();

  return (
      <div className="flex flex-col h-[calc(100vh-4rem)] p-8 gap-8 max-w-[1600px] mx-auto w-full">
        <div className="flex items-center gap-4 py-6 px-8 border-b border-border">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Quiz Builder
          </h1>
        </div>

      <div className="flex flex-col items-center justify-center">
        <QuizBuilder />
      </div>
      </div>
  )
}
