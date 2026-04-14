"use client";
import Link from "next/link";
import Image from "next/image";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function CourseCard({ course }: any) {
  return (
    <Link href={`/courses/${course._id}`} className="inline-block">
      <Card className="max-w-[345px] overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        <div className="relative w-full h-[140px]">
          <Image
            src={course.imageSrc || "/blueCourseCover.png"}
            alt={course.courseTitle || "Course Cover"}
            width={345}
            height={140}
            className="w-full h-full object-cover"
          />
        </div>
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
      </Card>
    </Link>
  );
}
