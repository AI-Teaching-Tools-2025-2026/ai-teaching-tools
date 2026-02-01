"use client";

import { useState } from "react";
import Navbar from "@/components/ui/navbar";
import SideNavbar from "@/components/ui/sideNavbar";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Navbar />
      <SideNavbar isCollapsed={isCollapsed} toggleSidebar={() => setIsCollapsed(!isCollapsed)} />

      {/* Main Content Area */}
      <main className={cn(
        "flex-grow mt-16 transition-all duration-300 ease-in-out",
        isCollapsed ? "ml-[60px]" : "ml-[240px]"
      )}>
        {children}
      </main>
    </div>
  );
}
