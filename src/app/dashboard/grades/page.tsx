"use client";
import GradesGrid from "@/components/grades/GradesGrid";
import { DashboardHeader } from "@/components/ui/dashboardHeader";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function GradesPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-8 gap-8 max-w-[1600px] mx-auto w-full">
      <DashboardHeader title="Grades">
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </DashboardHeader>

      <div className="flex-1 w-full min-h-0">
        <GradesGrid />
      </div>
    </div>
  );
}
