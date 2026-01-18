import CourseCard from "@/components/ui/courseCard";

export default function CoursesPage() {
  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mt-8 text-center">Courses Page</h1>

      <div className="mt-8">
        <CourseCard />
      </div>
    </div>
  );
}
