"use client";
import React, { useState } from "react";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import AddCourses from "@/components/forms/addCourses";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export default function CourseCard({ course, onEdit }: any) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <div className="inline-block relative">
      <Link href={`/courses/${course._id}`} className="inline-block">
  <Card className="w-[360px] overflow-hidden hover:shadow-lg transition-shadow cursor-pointer relative">
          {/* color square (replaces image) */}
          <div
            style={{ backgroundColor: course.cardColor || "#2563eb" }}
            className="w-full h-[140px]"
          />

          <CardHeader className="pb-2">
            <CardTitle>{course.courseTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              {course.courseTerm}
              <br />
              {course.courseDescription}
            </CardDescription>
          </CardContent>

          {/* Edit button - bottom-right with vertical dots icon */}
          <div className="absolute bottom-2 right-2 z-20">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e: any) => {
                e.preventDefault();
                e.stopPropagation();
                setIsSheetOpen(true);
              }}
            >
              <MoreVertical size={16} />
            </Button>
          </div>
        </Card>
      </Link>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Edit Course</SheetTitle>
          </SheetHeader>
          <div className="px-4">
            <AddCourses
              course={course}
              onSuccess={(updated: any) => {
                setIsSheetOpen(false);
                if (onEdit) onEdit(updated);
              }}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
