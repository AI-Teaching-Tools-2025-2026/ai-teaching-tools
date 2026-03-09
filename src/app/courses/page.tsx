"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "@/components/ui/navbar";
import CourseCard from "@/components/ui/courseCard";
import AddCourses from "@/components/forms/addCourses";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/courses/fetch_courses`,
          { withCredentials: true },
        );

        setCourses(response.data);
      } catch (error: any) {
        console.error(error);
        alert("Failed to load courses");
      }
    };

    loadCourses();
  }, []);

  return (
    <div className="relative">
      <Navbar />

      <div className="absolute top-6 right-6 z-50">
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button onClick={() => setIsSheetOpen(true)}>Add Course</Button>
          </SheetTrigger>

          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Courses</SheetTitle>
            </SheetHeader>
            <div className="px-4">
              <AddCourses
                onSuccess={(newCourse) => {
                  setCourses((prev) => [newCourse, ...prev]);
                  setIsSheetOpen(false);
                }}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="container mx-auto px-4 mt-25">
        <h1 className="text-2xl font-bold mt-8 text-center">Courses</h1>
        <div className="mt-8">
          {courses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      </div>
    </div>
  );
}
