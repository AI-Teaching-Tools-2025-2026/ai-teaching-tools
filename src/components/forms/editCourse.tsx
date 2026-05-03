"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import SubmissionModal from "@/components/modal/submissionModal";

type Props = {
  onSuccess?: (updatedCourse: any) => void;
  course: any;
};

export default function EditCourse({ onSuccess, course }: Props) {
  const [courseTitle, setCourseTitle] = useState("");
  const [courseTerm, setCourseTerm] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [cardColor, setCardColor] = useState("#2563eb");
  const [loading, setLoading] = useState(false);

  //   modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

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

  //   UPDATE
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

    if (Object.values(newErrors).some(Boolean)) {
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

      onSuccess?.(response.data);

      window.dispatchEvent(
        new CustomEvent("course:changed", {
          detail: response.data,
        }),
      );
    } catch (err) {
      console.error("Update failed:", err);
    } finally {
      setLoading(false);
    }
  };

  //   DELETE
  const handleDelete = async () => {
    if (!course?._id) return;

    await axios.delete(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/courses/${course._id}`,
      { withCredentials: true },
    );

    //   send delete signal
    onSuccess?.({ deletedId: course._id });

    window.dispatchEvent(
      new CustomEvent("course:deleted", {
        detail: course._id,
      }),
    );
  };

  return (
    <>
      {/*   MODAL */}
      <SubmissionModal
        isOpen={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        body={
          <>
            This will permanently delete{" "}
            <span className="font-semibold">{courseTitle}</span>.
            <br />
            This action cannot be undone.
          </>
        }
        onSubmit={handleDelete}
      />

      <form
        className="mx-auto max-w-3xl rounded-md border bg-background/40 p-6 shadow-sm"
        onSubmit={handleSubmit}
      >
        <h2 className="mb-4 text-lg font-semibold">Edit Course</h2>

        <div className="grid gap-4">
          <div>
            <Label>Course Name</Label>
            <Input
              value={courseTitle}
              onChange={(e) => setCourseTitle(e.target.value)}
              className={inputClass(errors.courseTitle)}
            />
            {errors.courseTitle && (
              <p className="text-red-500 text-sm">{errors.courseTitle}</p>
            )}
          </div>

          <div>
            <Label>Course Term</Label>
            <Input
              value={courseTerm}
              onChange={(e) => setCourseTerm(e.target.value)}
              className={inputClass(errors.courseTerm)}
            />
            {errors.courseTerm && (
              <p className="text-red-500 text-sm">{errors.courseTerm}</p>
            )}
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={courseDescription}
              onChange={(e) => setCourseDescription(e.target.value)}
              className={inputClass(errors.courseDescription)}
            />
            {errors.courseDescription && (
              <p className="text-red-500 text-sm">{errors.courseDescription}</p>
            )}
          </div>

          <div>
            <Label>Card Color</Label>
            <input
              type="color"
              value={cardColor}
              onChange={(e) => setCardColor(e.target.value)}
              className="h-10 w-20 border rounded-md"
            />
          </div>
        </div>

        {/* ACTIONS */}
        <div className="mt-6 flex justify-between">
          <Button
            type="button"
            variant="destructive"
            onClick={() => setDeleteModalOpen(true)}
            className="cursor-pointer"
            disabled={loading}
          >
            Delete Course
          </Button>

          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </>
  );
}
