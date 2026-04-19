"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type Props = {
  onSuccess?: (updatedCourse: any) => void;
  course: any;
};

export default function EditCourse({ onSuccess, course }: Props) {
  const [courseTitle, setCourseTitle] = useState("");
  const [courseTerm, setCourseTerm] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [cardColor, setCardColor] = useState<string>("#2563eb");
  const [loading, setLoading] = useState(false);

  // Validation state
  const [errors, setErrors] = useState({
    courseTitle: "",
    courseTerm: "",
    courseDescription: "",
  });

  useEffect(() => {
    if (course) {
      setCourseTitle(course.courseTitle || "");
      setCourseTerm(course.courseTerm || "");
      setCourseDescription(course.courseDescription || "");
      setCardColor(course.cardColor || "#2563eb");
    }
  }, [course]);

  const inputClass = (error: string) =>
    error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({ courseTitle: "", courseTerm: "", courseDescription: "" });

    const newErrors = {
      courseTitle: !courseTitle.trim() ? "Please provide a course title" : "",
      courseTerm: !courseTerm.trim() ? "Please provide a course term" : "",
      courseDescription: !courseDescription.trim()
        ? "Please provide a course description"
        : "",
    };

    const hasErrors = Object.values(newErrors).some((v) => v);
    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);

      const payload = {
        textbookID: course?.textbookID || "",
        courseTitle,
        courseTerm,
        courseDescription,
        imageSrc: course?.imageSrc || "",
        cardColor,
      };

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/courses/${course._id}`,
        payload,
        { withCredentials: true },
      );

      if (onSuccess) onSuccess(response.data);

      try {
        window.dispatchEvent(
          new CustomEvent("course:changed", { detail: response.data }),
        );
      } catch (e) {
        console.error("Failed to dispatch course:changed event:", e);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="mx-auto max-w-3xl rounded-md border bg-background/40 p-6 shadow-sm"
      onSubmit={handleSubmit}
      autoComplete="off"
      data-course-id={course?._id}
    >
      <h2 className="mb-4 text-lg font-semibold">Edit Course</h2>

      <div className="grid gap-4">
        <div className="grid gap-1.5">
          <Label htmlFor="courseTitle">Course Name / Textbook</Label>
          <Input
            id="courseTitle"
            value={courseTitle}
            onChange={(e) => setCourseTitle(e.target.value)}
            placeholder="e.g. Introduction to Psychology"
            className={inputClass(errors.courseTitle)}
          />
          {errors.courseTitle && (
            <p className="text-red-500 text-sm">{errors.courseTitle}</p>
          )}
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="courseTerm">Course Term</Label>
          <Input
            id="courseTerm"
            value={courseTerm}
            onChange={(e) => setCourseTerm(e.target.value)}
            placeholder="e.g. Fall 2026"
            className={inputClass(errors.courseTerm)}
          />
          {errors.courseTerm && (
            <p className="text-red-500 text-sm">{errors.courseTerm}</p>
          )}
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="courseDescription">Course Description</Label>
          <Textarea
            id="courseDescription"
            value={courseDescription}
            onChange={(e) => setCourseDescription(e.target.value)}
            placeholder="Short description of the course"
            rows={4}
            className={inputClass(errors.courseDescription)}
          />
          {errors.courseDescription && (
            <p className="text-red-500 text-sm">{errors.courseDescription}</p>
          )}
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="cardColor">Card Color</Label>
          <input
            id="cardColor"
            type="color"
            value={cardColor}
            onChange={(e) => setCardColor(e.target.value)}
            className="h-10 w-20 rounded-md border"
          />
          <p className="text-sm text-muted-foreground">
            Pick a color for the course card.
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}
