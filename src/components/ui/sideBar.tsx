"use client";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  NotebookTabs,
  FileQuestion,
  SquarePen,
  Database,
  ChevronLeft,
  MessageCircle,
  ArrowLeftCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SideBarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

type DrawerItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  disabled?: boolean;
};

export default function SideBar({ isCollapsed, toggleSidebar }: SideBarProps) {
  const pathname = usePathname();
  const params = useParams();
  const courseId = params?.courseId as string;

  const drawerList: DrawerItem[] = [
    { name: "Dashboard", href: `/courses/${courseId}`, icon: LayoutDashboard },
    {
      name: "Grades",
      href: `/courses/${courseId}/grades`,
      icon: NotebookTabs,
      disabled: true,
    },
    {
      name: "Quizzes",
      href: `/courses/${courseId}/quizzes`,
      icon: FileQuestion,
    },
    {
      name: "Assignment Builder",
      href: `/courses/${courseId}/quizzes/builder`,
      icon: SquarePen,
      disabled: true,
    },
    {
      name: "Question Banks",
      href: `/courses/${courseId}/question-banks`,
      icon: Database,
    },
    {
      name: "AI Tutor",
      href: `/courses/${courseId}/chatbot`,
      icon: MessageCircle,
    },
  ];

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-neutral-900 text-neutral-200 flex flex-col pt-20 px-2 transition-all duration-300 ease-in-out border-r border-neutral-800 z-40",
        isCollapsed ? "w-[60px]" : "w-[240px]",
      )}
      style={{ backgroundColor: "#171717" }}
    >
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-24 bg-neutral-800 border border-neutral-700 text-neutral-400 hover:text-neutral-200 p-0.5 rounded-full shadow-md z-50 flex items-center justify-center cursor-pointer"
        aria-label="Toggle Sidebar"
      >
        <ChevronLeft
          className={cn(
            "h-4 w-4 transition-transform duration-300",
            isCollapsed && "rotate-180",
          )}
        />
      </button>

      <div
        className={cn(
          "px-3 py-2 text-xs font-semibold text-neutral-500 transition-all duration-300 overflow-hidden",
          isCollapsed ? "opacity-0 h-0 py-0" : "opacity-100 h-auto",
        )}
      >
        Course Navigation
      </div>
      <nav className="flex flex-col gap-1 overflow-x-hidden">
        {drawerList.map((item) => {
          const isActive =
            !item.disabled &&
            (pathname === item.href ||
              (item.href !== `/courses/${courseId}` &&
                pathname.startsWith(item.href)));

          const rowClassName = cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors relative group",
            item.disabled
              ? "cursor-not-allowed text-neutral-600 opacity-50"
              : isActive
                ? "bg-neutral-800 text-neutral-50"
                : "hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200",
            isCollapsed && "justify-center px-2",
          );

          const iconClassName = cn(
            "h-5 w-5 shrink-0",
            item.disabled
              ? "text-neutral-600"
              : isActive
                ? "text-neutral-50"
                : "text-neutral-400 group-hover:text-neutral-200",
          );

          const label = (
            <span
              className={cn(
                "whitespace-nowrap transition-all duration-300 origin-left overflow-hidden",
                isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100",
              )}
            >
              {item.name}
            </span>
          );

          if (item.disabled) {
            return (
              <div
                key={item.name}
                className={rowClassName}
                aria-disabled="true"
                title="Unavailable"
              >
                <item.icon className={iconClassName} aria-hidden />
                {label}
              </div>
            );
          }

          return (
            <Link key={item.name} href={item.href} className={rowClassName}>
              <item.icon className={iconClassName} aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pb-4">
        <Link
          href="/courses"
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200",
            isCollapsed && "justify-center px-2",
          )}
        >
          <ArrowLeftCircle className="h-5 w-5 shrink-0" />
          <span
            className={cn(
              "whitespace-nowrap transition-all duration-300 origin-left overflow-hidden",
              isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100",
            )}
          >
            Back to Courses
          </span>
        </Link>
      </div>
    </aside>
  );
}
