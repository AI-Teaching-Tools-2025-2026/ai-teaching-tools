"use client";
import GradesGrid from "@/components/grades/GradesGrid";

export default function GradesPage() {
  return (
    <div className="p-6 h-[calc(100vh-64px)]">
        <h1 className="text-2xl font-bold text-left ml-3 mt-4">Grades</h1>

        {/* Grades table */}
        <div className="mt-8 w-full h-full">
          <GradesGrid />
        </div>
    </div>
  );
}
