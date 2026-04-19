"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type Props = {
  onSuccess?: (newCourse: any) => void;
  course?: any;
};

export default function AddCourses({ onSuccess, course }: Props) {
  const [courseTitle, setCourseTitle] = useState("");
  const [courseTerm, setCourseTerm] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [cardColor, setCardColor] = useState<string>("#2563eb");
  const [loading, setLoading] = useState(false);

  // Validation state
  const [errors, setErrors] = useState({
    courseTitle: "",
    courseTerm: "",
    courseDescription: "",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    } else {
      setFile(null);
    }
  };

  useEffect(() => {
    if (course) {
      setCourseTitle(course.courseTitle || "");
      setCourseTerm(course.courseTerm || "");
      setCourseDescription(course.courseDescription || "");
      setCardColor(course.cardColor || "#2563eb");
      // Note: image/file not prefilled
    }
  }, [course]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    setErrors({ courseTitle: "", courseTerm: "", courseDescription: "" });

    // Validate fields
    const newErrors = {
      courseTitle: !courseTitle.trim() ? "Please provide a course title" : "",
      courseTerm: !courseTerm.trim() ? "Please provide a course term" : "",
      courseDescription: !courseDescription.trim()
        ? "Please provide a course description"
        : "",
    };

    const hasErrors = Object.values(newErrors).some((e) => e);
    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);

      const payload = {
        textbookID: file ? file.name : "",
        courseTitle,
        courseTerm,
        courseDescription,
        imageSrc: "",
        cardColor,
      };

      let response;
      // If editing an existing course (course prop provided), call update
      // We'll infer edit mode if the form element contains a data-course-id attribute set by parent
      const formEl = (e.target as HTMLElement).closest("form");
      const dataCourseId = formEl?.getAttribute("data-course-id");

      if (dataCourseId) {
        response = await axios.put(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/courses/${dataCourseId}`,
          payload,
          { withCredentials: true },
        );
      } else {
        response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/courses/create_course`,
          payload,
          { withCredentials: true },
        );
      }

      if (onSuccess) onSuccess(response.data);
      // Broadcast an application-level event so other parts of the app can react
      try {
        window.dispatchEvent(
          new CustomEvent("course:changed", { detail: response.data }),
        );
      } catch (e) {
        console.error("Failed to dispatch course:changed event:", e);
      }

      // Reset form
      setCourseTitle("");
      setCourseTerm("");
      setCourseDescription("");
      setFile(null);
      setCardColor("#2563eb");
      setErrors({ courseTitle: "", courseTerm: "", courseDescription: "" });
    } catch (e) {
      console.error(e);
      toast.error(
        course?._id ? "Error updating course." : "Error creating course.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Helper for red border
  const inputClass = (error: string) =>
    error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "";

  return (
    <form
      className="mx-auto max-w-3xl rounded-md border bg-background/40 p-6 shadow-sm"
      onSubmit={handleSubmit}
      autoComplete="off"
      data-course-id={course?._id}
    >
      <h2 className="mb-4 text-lg font-semibold">Course</h2>

      <div className="grid gap-4">
        {/* Course Title */}
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

        {/* Course Term */}
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

        {/* Course Description */}
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

        {/* File Upload */}
        <div className="grid gap-1.5">
          <Label htmlFor="courseFile">Upload Material</Label>
          <Input id="courseFile" type="file" onChange={handleFileChange} />
          <p className="text-sm text-muted-foreground">
            Please Upload a Textbook Here
          </p>
        </div>

        {/* Card Color */}
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

      {/* Submit Button */}
      <div className="mt-6 flex items-center justify-end gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}
