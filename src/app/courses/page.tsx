"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import CourseCard from "@/components/ui/courseCard";

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/courses/retrieve_courses`,
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
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mt-8 text-center">Courses Page</h1>

      <div className="mt-8">
        {courses.map((course) => (
          <CourseCard key={course._id} course={course} />
        ))}
      </div>
    </div>
  );
}
