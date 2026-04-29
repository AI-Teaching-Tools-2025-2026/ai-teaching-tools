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

  // 🔁 reusable fetch function
  const fetchCourses = async () => {
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

  // 📥 initial load
  useEffect(() => {
    fetchCourses();
  }, []);

  // 🔴 refetch when course is deleted
  useEffect(() => {
    const handleDeleted = () => {
      fetchCourses();
    };

    window.addEventListener("course:deleted", handleDeleted);

    return () => {
      window.removeEventListener("course:deleted", handleDeleted);
    };
  }, []);

  return (
    <div className="relative">
      <Navbar />

      {/* ADD COURSE BUTTON */}
      <div className="absolute top-6 right-6 z-50">
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button onClick={() => setIsSheetOpen(true)}>
              Add Course
            </Button>
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

      {/* COURSE GRID */}
      <div className="container mx-auto px-4 mt-25">
        <h1 className="text-2xl font-bold mt-8 text-center">
          Courses
        </h1>

        <div className="grid gap-4 mt-12 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {courses.map((course) => (
            <div key={course._id} className="w-full">
              <CourseCard
                course={course}
                onEdit={(result: any) => {
                  // 🔴 ignore deletes (handled by refetch)
                  if (result?.deletedId) return;

                  setCourses((prev) =>
                    prev.map((c) =>
                      c._id === result._id ? result : c
                    ),
                  );
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}