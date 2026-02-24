"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { mockQuizTypes, mockSections } from "../mockData";
import { QuizTypeOption } from "@/types/quiz";

interface QuizDetailsProps {
  selectedQuizType: QuizTypeOption;
  setSelectedQuizType: (type: QuizTypeOption) => void;
  selectedSection: string;
  setSelectedSection: (section: string) => void;
}

export function QuizDetails({
  selectedQuizType,
  setSelectedQuizType,
  selectedSection,
  setSelectedSection,
}: QuizDetailsProps) {
  return (
    <div className="w-full max-w-3xl mx-auto bg-card border border-border rounded-lg p-8 shadow-sm flex flex-col gap-6">
      {/* Title Input */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-foreground">
          Quiz Title
        </label>
        <Input type="text" placeholder="Enter quiz title" />
      </div>

      {/* Description Textarea */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-foreground">
          Description
        </label>
        <Textarea
          placeholder="Enter quiz description"
          className="min-h-[120px] resize-y"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quiz Type Select */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">
            Quiz Type
          </label>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                {selectedQuizType.name}
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[200px]">
              {mockQuizTypes.map((type) => (
                <DropdownMenuItem
                  key={type.id}
                  onClick={() => setSelectedQuizType(type)}
                  className="cursor-pointer"
                >
                  {type.name}
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
              <button className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                {selectedSection}
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[200px]">
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

        {/* Points Input */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">Points</label>
          <Input type="number" placeholder="100" min={0} />
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
