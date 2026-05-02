"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  ClipboardList,
  FileQuestion,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  // Future card content?
  // CardDescription,
  // CardHeader,
  // CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// TODO: Are stats something that is within the scope of this project?
// const stats = [
//   {
//     label: "Students enrolled",
//     value: "—",
//     hint: "Sync roster from your LMS when ready",
//   },
//   {
//     label: "Quizzes this term",
//     value: "—",
//     hint: "Build from the quiz workspace",
//   },
//   {
//     label: "Question bank items",
//     value: "—",
//     hint: "Reuse across assessments",
//   },
// ] as const;

export default function CourseDashboardPage() {
  const params = useParams();
  const courseId = params.courseId as string;

  const base = `/courses/${courseId}`;

  const quickActions = [
    {
      title: "Quizzes",
      description: "View, create, and manage quizzes for this course.",
      href: `${base}/quizzes`,
      icon: FileQuestion,
    },
    {
      title: "Question Bank",
      description: "Find and use questions from your AI-powered question bank.",
      href: `${base}/question-banks`,
      icon: ClipboardList,
    },
    {
      title: "AI Tutor",
      description: "Course-aware help for your students.",
      href: `${base}/chatbot`,
      icon: MessageCircle,
    },
    {
      title: "Grades",
      description: "Gradebook and analytics when connected.",
      href: `${base}/grades`,
      icon: BookOpen,
      disabled: true,
    },
  ] as const;

  return (
    <div className="flex flex-col gap-10 p-8 max-w-[1200px] mx-auto w-full">
      <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-card via-card to-muted/40 p-8 md:p-10 shadow-sm">
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl"
          aria-hidden
        />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2 max-w-2xl">
            <p className="text-sm font-medium text-muted-foreground">
              AI Teaching Tools
            </p>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Course home
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed">
              Your workspace for quizzes, assessments, and AI-assisted support.
              Use the shortcuts below to move through this course. Student
              Analytics — planned for future development.
            </p>
          </div>
          <Button asChild className="shrink-0 gap-2">
            <Link href={`${base}/quizzes`}>
              Go to quizzes
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-primary" aria-hidden />
          <h2 className="text-lg font-semibold tracking-tight">
            Quick actions
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            const row = (
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Icon className="size-5 text-foreground" aria-hidden />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="font-medium leading-none">{action.title}</p>
                  <p className="text-sm text-muted-foreground leading-snug">
                    {action.description}
                  </p>
                </div>
                <ArrowRight
                  className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </div>
            );

            if ("disabled" in action && action.disabled) {
              return (
                <Card
                  key={action.title}
                  className="border-dashed opacity-60 shadow-none"
                >
                  <CardContent className="flex flex-col gap-3 p-6">
                    {row}
                    <p className="text-xs text-muted-foreground">Coming soon</p>
                  </CardContent>
                </Card>
              );
            }

            return (
              <Link key={action.title} href={action.href} className="group">
                <Card className="h-full border-muted/80 shadow-sm transition-colors hover:border-primary/30 hover:bg-muted/30">
                  <CardContent className="p-6">{row}</CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      <Separator />

      <section className="rounded-xl border bg-muted/30 px-6 py-5 text-sm text-muted-foreground">
        <p>
          <span className="font-medium text-foreground">Demo note:</span>{" "}
          Dashboard charts and live counts are intentionally omitted in the
          current version. This page is structured to allow seamless integration
          of student analytics, visualizations, and grade tables in future
          updates.
        </p>
      </section>
    </div>
  );
}
