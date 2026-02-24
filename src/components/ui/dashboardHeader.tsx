import React from "react";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function DashboardHeader({
  title,
  description,
  children,
  className,
}: DashboardHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between w-full", className)}>
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
