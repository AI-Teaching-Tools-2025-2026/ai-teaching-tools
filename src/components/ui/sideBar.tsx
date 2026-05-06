"use client";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  NotebookTabs,
  FileQuestion,
  Database,
  ChevronLeft,
  MessageCircle,
  ArrowLeftCircle,
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
    { name: "Home", href: `/courses/${courseId}`, icon: LayoutDashboard },
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
        "fixed left-0 top-0 h-screen bg-background text-foreground flex flex-col pt-20 px-2 transition-all duration-300 ease-in-out border-r border-border z-40",
        isCollapsed ? "w-[60px]" : "w-[240px]",
      )}
    >
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-24 bg-background border border-border text-muted-foreground hover:text-foreground p-0.5 rounded-full shadow-md z-50 flex items-center justify-center cursor-pointer"
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
          "px-3 py-2 text-xs font-semibold text-muted-foreground transition-all duration-300 overflow-hidden",
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
              ? "cursor-not-allowed text-muted-foreground opacity-50"
              : isActive
                ? "bg-accent text-accent-foreground"
                : "hover:bg-accent hover:text-accent-foreground text-muted-foreground",
            isCollapsed && "justify-center px-2",
          );

          const iconClassName = cn(
            "h-5 w-5 shrink-0",
            item.disabled
              ? "text-muted-foreground"
              : isActive
                ? "text-accent-foreground"
                : "text-muted-foreground group-hover:text-accent-foreground",
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
            "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground",
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
