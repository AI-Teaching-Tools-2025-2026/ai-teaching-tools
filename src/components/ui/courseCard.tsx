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

export default function CourseCard() {
  return (
    <Link href="/dashboard" className="inline-block">
      <Card className="max-w-[345px] overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        <div className="relative w-full h-[140px]">
          <Image
            src="/blueCourseCover.png"
            alt="placeholder alt text"
            fill
            className="object-cover"
          />
        </div>
        <CardHeader className="pb-2">
          <CardTitle>Course 1</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            Fall 2025
            <br />
            Intro to Psychology by Jane Doe
          </CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
}
