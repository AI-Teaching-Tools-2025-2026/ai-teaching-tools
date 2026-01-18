"use client";
import Image from "next/image";
import SideNavbar from "@/components/ui/sideNavbar";

export default function DashboardPage() {
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
      <main className="flex-grow p-6 ml-60 mt-16">
        <h1 className="text-2xl font-bold text-left ml-3">Dashboard Page</h1>

        <div className="mt-8">
          <div className="grid grid-cols-16 gap-4">
            {/* Left Column - 10/16 */}
            <div className="col-span-10 space-y-4">
              <div className="bg-muted rounded-lg">
                <h2 className="p-4 text-xl font-bold">Overview</h2>
                <div className="p-8">
                  <Image
                    src="/barChartPlaceholder.png"
                    width={800}
                    height={400}
                    alt="Bar Chart Placeholder"
                  />
                </div>
              </div>

              <div className="bg-muted rounded-lg">
                <h2 className="p-4 text-xl font-bold">More Data</h2>
                <div className="p-8">
                  <Image
                    src="/barChartPlaceholder.png"
                    width={800}
                    height={400}
                    alt="Bar Chart Placeholder"
                  />
                </div>
              </div>
            </div>

            {/* Right Column - 6/16 */}
            <div className="col-span-6 bg-muted rounded-lg">
              <h2 className="p-4 text-xl font-bold">Student-Specific Data</h2>
              <div className="p-8 space-y-4">
                <Image
                  src="/pieChartPlaceholder.png"
                  width={400}
                  height={400}
                  alt="Pie Chart Placeholder"
                />
                <Image
                  src="/pieChartPlaceholder.png"
                  width={400}
                  height={400}
                  alt="Pie Chart Placeholder"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
