import QuizBuilder from "@/components/quizzes/QuizBuilder";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export default function QuizBuilderPage() {
  return (
    <div className="w-full flex-1 p-6 space-y-6">
       <div className="flex items-center gap-2 text-sm text-neutral-500 mb-4">
          <Link href="/dashboard/quizzes" className="hover:text-neutral-900 transition-colors">Quizzes</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-neutral-900 font-medium">New Quiz</span>
       </div>
       
       <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-neutral-900">Quiz Builder</h1>
       </div>

      <QuizBuilder />
    </div>
  );
}
