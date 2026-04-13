"use client";

import QuizTable from "@/components/quizzes/QuizTable";
import { DashboardHeader } from "@/components/ui/dashboardHeader";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function QuizzesPage() {
  const { courseId } = useParams();

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-8 gap-8 max-w-[1600px] mx-auto w-full">
      <DashboardHeader title="Quizzes">
        <Button variant="default" className="gap-2" asChild>
          <Link href={`/courses/${courseId}/quizzes/create`}>
            <Plus /> Create Quiz
          </Link>
        </Button>
      </DashboardHeader>

      <QuizTable />
    </div>
  );
}
