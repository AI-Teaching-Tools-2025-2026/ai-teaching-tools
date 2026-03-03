import React from "react";

// In Next.js App Router, dynamic route parameters are passed via the `params` prop.
export default async function CourseDashboard({
  params,
}: {
  params: { courseId: string };
}) {
  // Await the params object if you are using Next.js 15+
  const { courseId } = await params; 

  // You can now use `courseId` to fetch data, render specific components, or perform CRUD operations.
  // Example: const courseData = await fetchCourseById(courseId);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Course Dashboard</h1>
      <p>Managing course ID: {courseId}</p>
      
      {/* Add your specific course components here */}
    </div>
  );
}