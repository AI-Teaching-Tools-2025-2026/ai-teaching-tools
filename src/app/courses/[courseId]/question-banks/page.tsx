"use client";

import React from "react";
import QuestionBankTable from "@/components/questionbank/QuestionBankTable";
import { DashboardHeader } from "@/components/ui/dashboardHeader";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { Pencil, Brain } from "lucide-react";
import Link from "next/link";

export default function QuestionBankPage() {
  const { courseId } = useParams();

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-8 gap-8 max-w-[1600px] mx-auto w-full">
      <DashboardHeader title="Question Banks">
        <Button variant="default" className="gap-2">
          <Brain /> Generate Question Bank
        </Button>
        <Button variant="secondary" className="gap-2" asChild>
          <Link href={`/courses/${courseId}/question-banks/create`}>
            <Pencil /> Author Question Bank
          </Link>
        </Button>
      </DashboardHeader>

      <QuestionBankTable />
    </div>
  );
}
