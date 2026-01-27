import Navbar from "@/components/ui/navbar";
import SideNavbar from "@/components/ui/sideNavbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Navbar />
      <SideNavbar />

      {/* Main Content Area */}
      <main className="flex-grow ml-60 mt-16">
        {children}
      </main>
    </div>
  );
}
