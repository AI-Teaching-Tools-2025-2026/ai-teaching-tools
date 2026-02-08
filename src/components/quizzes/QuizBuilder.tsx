"use client";

import React, { useState } from "react";
import { ChevronDown, Plus, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Tab = "details" | "questions";

export default function QuizBuilder() {
  const [activeTab, setActiveTab] = useState<Tab>("details");
  const [quizDetails, setQuizDetails] = useState({
    title: "Introduction to Psychology",
    description: "A basic quiz covering the fundamentals of psychology.",
    course: "",
    topic: "",
  });

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl">
      {/* Tabs */}
      <div className="bg-neutral-100 p-1 rounded-lg inline-flex self-start">
        <button
          onClick={() => setActiveTab("details")}
          className={cn(
            "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
            activeTab === "details"
              ? "bg-white text-neutral-900 shadow-sm"
              : "text-neutral-500 hover:text-neutral-900"
          )}
        >
          Details
        </button>
        <button
          onClick={() => setActiveTab("questions")}
          className={cn(
            "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
            activeTab === "questions"
              ? "bg-white text-neutral-900 shadow-sm"
              : "text-neutral-500 hover:text-neutral-900"
          )}
        >
          Questions
        </button>
      </div>

      {/* Content */}
      {activeTab === "details" ? (
        <Card className="p-8 flex flex-col gap-6 border-neutral-200 bg-neutral-900/5 dark:bg-neutral-900 dark:border-neutral-800">
           {/* Dark mode styled card in figma, but let's stick to system or light for now, or use figma colors. 
               Figma used bg-[#171717] which is very dark. I will use neutral-900 for dark theme or just apply the specific styles.
               For consistency with the rest of the app which seems light mode based on screenshots? Wait, the dashboard might be dark. 
               SideNavbar was dark. The content area usually is light. 
               However, the Figma design specifically showed dark cards for the builder.
               Let's try to match the design's dark aesthetic for the builder card if possible, or just standard shadcn Card.
               I'll use standard clean styles for now to integrate well.
           */}
          
          <div className="space-y-4">
             <div className="space-y-2">
                <Label htmlFor="quiz-title">Quiz Title</Label>
                <Input 
                    id="quiz-title" 
                    value={quizDetails.title} 
                    onChange={(e) => setQuizDetails({...quizDetails, title: e.target.value})}
                />
             </div>

             <div className="space-y-2">
                <Label htmlFor="quiz-desc">Description</Label>
                <textarea 
                    id="quiz-desc"
                    className="flex min-h-[80px] w-full rounded-md border border-neutral-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-950 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                    value={quizDetails.description}
                    onChange={(e) => setQuizDetails({...quizDetails, description: e.target.value})}
                />
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Course</Label>
                    <div className="relative">
                        <select className="flex h-9 w-full items-center justify-between rounded-md border border-neutral-200 bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-950 disabled:cursor-not-allowed disabled:opacity-50 appearance-none">
                            <option>Psychology 101</option>
                            <option>Statistics 200</option>
                        </select>
                         <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 opacity-50 pointer-events-none" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Topic</Label>
                    <div className="relative">
                         <select className="flex h-9 w-full items-center justify-between rounded-md border border-neutral-200 bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-950 disabled:cursor-not-allowed disabled:opacity-50 appearance-none">
                            <option>Research Methods</option>
                            <option>Cognition</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 opacity-50 pointer-events-none" />
                    </div>
                </div>
             </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
            {/* Question List */}
            <Card className="p-6 border-neutral-200 space-y-6 relative">
                 <div className="absolute right-4 top-4 flex gap-2">
                     <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                     </Button>
                     <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 cursor-grab">
                        <GripVertical className="h-4 w-4" />
                     </Button>
                 </div>

                 <div className="space-y-4 pr-12">
                     <div className="space-y-2">
                        <Label>Question 1</Label>
                        <Input defaultValue="What is the primary goal of psychology?" />
                     </div>

                     <div className="space-y-2">
                        <Label>Question Type</Label>
                         <div className="flex gap-4">
                            <label className="flex items-center gap-2 text-sm">
                                <input type="radio" name="q1-type" defaultChecked className="text-neutral-900 focus:ring-neutral-900" /> 
                                Multiple Choice
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                                <input type="radio" name="q1-type" className="text-neutral-900 focus:ring-neutral-900" /> 
                                Short Answer
                            </label>
                         </div>
                     </div>
                     
                     {/* Options for MC */}
                      <div className="pl-4 border-l-2 border-neutral-200 space-y-3">
                         {["To control people", "To understand behavior", "To prescribe medication"].map((opt, i) => (
                             <div key={i} className="flex items-center gap-2">
                                 <input type="radio" disabled name="q1-preview" />
                                 <Input defaultValue={opt} className="h-8" />
                             </div>
                         ))}
                         <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 h-8 px-2">
                            + Add Option
                         </Button>
                      </div>
                 </div>
            </Card>

             {/* Add Button */}
             <div className="border-2 border-dashed border-blue-200 rounded-lg p-8 flex flex-col items-center justify-center gap-2 bg-blue-50/50 hover:bg-blue-50 transition-colors cursor-pointer group">
                <div className="bg-blue-100 p-2 rounded-full group-hover:bg-blue-200 transition-colors">
                    <Plus className="h-6 w-6 text-blue-600" />
                </div>
                <span className="font-medium text-blue-700">Add Question</span>
             </div>
        </div>
      )}
    </div>
  );
}
