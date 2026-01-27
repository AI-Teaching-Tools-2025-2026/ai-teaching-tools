import SideNavbar from "@/components/ui/sideNavbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Top Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-muted text-foreground">
        <div className="flex items-center px-4 py-3">
          <h1 className="text-lg font-semibold flex-grow">AI Teaching Tools</h1>
          {/* The following can be uncommented once we can check for persistent auth... */}
          {/* <Button variant="ghost">Account</Button> */}
        </div>
      </header>

      <SideNavbar />

      {/* Main Content Area */}
      <main className="flex-grow ml-60 mt-16">
        {children}
      </main>
    </div>
  );
}
