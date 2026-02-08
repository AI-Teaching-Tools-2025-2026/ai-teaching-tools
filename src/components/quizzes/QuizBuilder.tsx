"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronDown, Plus, GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { mockCourses, mockSections } from "./mockData";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Define strict types for the builder data structure
type Tab = "details" | "questions";

interface QuizQuestion {
  id: string;
  text: string;
  type: "multiple-choice" | "true-false" | "short-answer";
  options?: string[];
  correctAnswer?: string;
}

export default function QuizBuilder() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("details");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [selectedCourse, setSelectedCourse] = useState(mockCourses[0]);
  const [selectedSection, setSelectedSection] = useState(mockSections[0]);

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#0a0a0a] text-[#fafafa]">
      {/* Top Navigation */}
      <div className="flex items-center gap-4 py-6 px-8 border-b border-[#404040]">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.back()}
          className="text-[#a3a3a3] hover:text-white hover:bg-[#262626]"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-3xl font-semibold tracking-tight">Create Quiz</h1>
      </div>

      <div className="flex flex-col max-w-5xl mx-auto w-full p-8 gap-8">
        
        {/* Tabs */}
        <div className="bg-[#171717] p-1 rounded-xl inline-flex self-start border border-[#404040]">
          <button
            onClick={() => setActiveTab("details")}
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === "details"
                ? "bg-white text-black shadow-sm"
                : "text-[#a3a3a3] hover:text-white"
            )}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab("questions")}
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === "questions"
                ? "bg-white text-black shadow-sm"
                : "text-[#a3a3a3] hover:text-white"
            )}
          >
            Questions
          </button>
        </div>

        {activeTab === "details" && (
          <div className="w-full max-w-3xl bg-[#171717] border border-[#404040] rounded-lg p-8 shadow-sm flex flex-col gap-6">
             {/* Title Input */}
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#fafafa]">Quiz Title</label>
                <input 
                    type="text" 
                    placeholder="Enter quiz title" 
                    className="flex h-10 w-full rounded-md border border-[#404040] bg-white/5 px-3 py-2 text-sm text-[#fafafa] placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-transparent disabled:cursor-not-allowed disabled:opacity-50"
                />
            </div>

            {/* Description Textarea */}
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#fafafa]">Description</label>
                <textarea 
                    placeholder="Enter quiz description" 
                    className="flex min-h-[120px] w-full rounded-md border border-[#404040] bg-white/5 px-3 py-2 text-sm text-[#fafafa] placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-transparent disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                />
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* Course Select */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[#fafafa]">Course</label>
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger asChild>
                        <button className="flex h-10 w-full items-center justify-between rounded-md border border-[#404040] bg-white/5 px-3 py-2 text-sm text-[#fafafa] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-transparent disabled:cursor-not-allowed disabled:opacity-50">
                          {selectedCourse.name}
                          <ChevronDown className="h-4 w-4 text-[#a3a3a3]" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-[300px] bg-[#171717] border-[#404040] text-white">
                        {mockCourses.map((course) => (
                          <DropdownMenuItem 
                            key={course.id}
                            onClick={() => setSelectedCourse(course)}
                            className="text-[#fafafa] focus:bg-[#262626] focus:text-white cursor-pointer"
                          >
                            {course.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                 {/* Section Select */}
                 <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[#fafafa]">Section</label>
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger asChild>
                        <button className="flex h-10 w-full items-center justify-between rounded-md border border-[#404040] bg-white/5 px-3 py-2 text-sm text-[#fafafa] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-transparent disabled:cursor-not-allowed disabled:opacity-50">
                          {selectedSection}
                          <ChevronDown className="h-4 w-4 text-[#a3a3a3]" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-[300px] bg-[#171717] border-[#404040] text-white">
                        {mockSections.map((section) => (
                          <DropdownMenuItem 
                            key={section}
                            onClick={() => setSelectedSection(section)}
                            className="text-[#fafafa] focus:bg-[#262626] focus:text-white cursor-pointer"
                          >
                            {section}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            
            <div className="h-px bg-[#404040] w-full my-2" />
            
            {/* Actions */}
            <div className="flex justify-end gap-3">
                 <Button variant="ghost" className="text-[#f5f5f5] hover:bg-[#262626] hover:text-white">Cancel</Button>
                 <Button className="bg-[#f5f5f5] text-black hover:bg-white">Save Changes</Button>
            </div>
          </div>
        )}

        {activeTab === "questions" && (
            <div className="flex flex-col gap-6 w-full max-w-3xl">
                {questions.map((q, index) => (
                    <div key={q.id} className="w-full bg-[#171717] border border-[#404040] rounded-lg p-6 flex flex-col gap-4 group hover:border-[#525252] transition-colors relative">
                        <div className="absolute right-4 top-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="text-[#a3a3a3] hover:text-white hover:bg-[#262626]">
                                <GripVertical className="h-4 w-4" />
                            </Button>
                             <Button variant="ghost" size="icon" className="text-[#a3a3a3] hover:text-red-400 hover:bg-[#262626]">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-medium text-[#a3a3a3] uppercase tracking-wider">Question {index + 1}</label>
                            <input 
                                type="text"
                                defaultValue={q.text}
                                className="bg-transparent border-none text-lg font-medium text-[#fafafa] focus:ring-0 px-0 w-full outline-none placeholder:text-neutral-600"
                            />
                        </div>

                         {/* Options Render (Mock Visual mostly) */}
                         <div className="flex flex-col gap-2 pl-4 border-l-2 border-[#262626]">
                            {q.options?.map((opt, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className={cn("h-4 w-4 rounded-full border flex items-center justify-center", opt === q.correctAnswer ? "border-green-500 bg-green-500/20" : "border-[#404040]")}>
                                        {opt === q.correctAnswer && <div className="h-2 w-2 rounded-full bg-green-500" />}
                                    </div>
                                    <span className={cn("text-sm", opt === q.correctAnswer ? "text-[#fafafa]" : "text-[#a3a3a3]")}>{opt}</span>
                                </div>
                            ))}
                            {q.type === 'true-false' && (
                                <div className="flex gap-4">
                                     <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 rounded-full border border-green-500 bg-green-500/20 flex items-center justify-center"><div className="h-2 w-2 rounded-full bg-green-500" /></div>
                                        <span className="text-sm text-[#fafafa]">True</span>
                                     </div>
                                     <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 rounded-full border border-[#404040]" />
                                        <span className="text-sm text-[#a3a3a3]">False</span>
                                     </div>
                                </div>
                            )}
                         </div>
                    </div>
                ))}

                {/* Add Question Button */}
                 <button className="w-full border border-dashed border-blue-500/50 rounded-lg p-8 flex flex-col items-center justify-center gap-3 hover:bg-blue-500/5 transition-colors group bg-[#171717]">
                    <div className="h-10 w-10 rounded-lg bg-blue-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                        <Plus className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium text-[#fafafa]">Add New Question</span>
                </button>
            </div>
        )}
      </div>
    </div>
  );
}
