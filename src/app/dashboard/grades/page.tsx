"use client";
import SideNavbar from "@/components/ui/sideNavbar";
import GradesGrid from "@/components/grades/GradesGrid";

export default function GradesPage() {
  return (
    <div className="flex min-h-screen">
      {/* Top AppBar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-muted text-foreground">
        <div className="flex items-center px-4 py-3">
          <h1 className="text-lg font-semibold flex-grow">AI Teaching Tools</h1>
          {/* The following can be uncommented once we can check for persistent auth */}
          {/* <Button variant="ghost">Account</Button> */}
        </div>
      </header>

      <SideNavbar />

      {/* Main Content */}
      <main className="flex-grow p-6 ml-60 mt-16 h-[calc(100vh-64px)]">
        <h1 className="text-2xl font-bold text-left ml-3 mt-4">Grades</h1>

        {/* Grades table */}
        <div className="mt-8 w-full h-full">
          <GradesGrid />
        </div>
      </main>
    </div>
  );
}
