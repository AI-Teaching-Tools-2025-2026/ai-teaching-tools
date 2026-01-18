"use client";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const drawerList = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Grades", href: "/dashboard/grades" },
  { name: "Quiz Builder", href: "/dashboard/quiz-builder" },
  { name: "Assignment Builder", href: "/dashboard/assignment-builder" },
  { name: "Question Banks", href: "/dashboard/question-banks" },
];

export default function SideNavbar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-muted text-foreground flex flex-col pt-16">
      <Separator />
      <nav className="flex flex-col">
        {drawerList.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="px-4 py-4 hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
