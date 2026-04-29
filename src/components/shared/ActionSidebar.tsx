import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface SidebarAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  className?: string;
  disabled?: boolean;
}

interface ActionSidebarProps {
  title?: string;
  actions: SidebarAction[];
}

export function ActionSidebar({
  title = "Actions",
  actions,
}: ActionSidebarProps) {
  return (
    <div className="lg:col-span-3 flex flex-col gap-6 h-fit sticky top-24">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || "default"}
              disabled={action.disabled}
              className={cn(
                "w-full gap-2 justify-start h-auto py-3 px-4 cursor-pointer whitespace-normal text-left",
                action.className,
              )}
              onClick={action.onClick}
            >
              {action.icon}
              {action.label}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
