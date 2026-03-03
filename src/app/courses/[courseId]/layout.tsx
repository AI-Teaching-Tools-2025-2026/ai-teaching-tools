"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import Navbar from "@/components/ui/navbar";
import SideBar from "@/components/ui/sideBar";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();
  const params = useParams();
  const courseId = params?.courseId as string;

  // Checks if the user is authorized to access this courseId
  useEffect(() => {
    const verifyCourseAccess = async () => {
      try {
        await axios.get(`http://localhost:8000/courses/${courseId}`, {
          withCredentials: true,
        });
        setIsAuthorized(true);
      } catch (error) {
        // Chore: Should redirect the user to 404 page.
        alert("You do not have access to this page.")
        router.push("/courses");
      }
    };

    if (courseId) {
      verifyCourseAccess();
    }
  }, [courseId, router]);

  if (!isAuthorized) {
    return null; 
  }

  return (
    <div className="flex min-h-screen">
      <Navbar />
      <SideBar
        isCollapsed={isCollapsed}
        toggleSidebar={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Main Content Area */}
      <main
        className={cn(
          "flex-grow mt-16 transition-all duration-300 ease-in-out",
          isCollapsed ? "ml-[60px]" : "ml-[240px]",
        )}
      >
        {children}
      </main>
    </div>
  );
}
