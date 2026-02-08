"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { mockCourses, mockSections } from "../mockData";
import { CourseOption } from "@/types/quiz";

interface QuizDetailsProps {
  selectedCourse: CourseOption;
  setSelectedCourse: (course: CourseOption) => void;
  selectedSection: string;
  setSelectedSection: (section: string) => void;
}

export function QuizDetails({
  selectedCourse,
  setSelectedCourse,
  selectedSection,
  setSelectedSection,
}: QuizDetailsProps) {
  return (
    <div className="w-full max-w-3xl bg-card border border-border rounded-lg p-8 shadow-sm flex flex-col gap-6">
      {/* Title Input */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-foreground">Quiz Title</label>
        <input
          type="text"
          placeholder="Enter quiz title"
          className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      {/* Description Textarea */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-foreground">Description</label>
        <textarea
          placeholder="Enter quiz description"
          className="flex min-h-[120px] w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Course Select */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">Course</label>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background/50 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                {selectedCourse.name}
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[300px]">
              {mockCourses.map((course) => (
                <DropdownMenuItem
                  key={course.id}
                  onClick={() => setSelectedCourse(course)}
                  className="cursor-pointer"
                >
                  {course.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Section Select */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">Section</label>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background/50 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                {selectedSection}
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[300px]">
              {mockSections.map((section) => (
                <DropdownMenuItem
                  key={section}
                  onClick={() => setSelectedSection(section)}
                  className="cursor-pointer"
                >
                  {section}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="h-px bg-border w-full my-2" />

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button
          variant="ghost"
          className="text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          Cancel
        </Button>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          Save Changes
        </Button>
      </div>
    </div>
  );
}
