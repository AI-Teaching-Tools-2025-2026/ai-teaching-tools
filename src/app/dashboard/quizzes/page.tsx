import QuizList from "@/components/quizzes/QuizList";
import { DashboardHeader } from "@/components/ui/dashboardHeader";
import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";

export default function QuizzesPage() {
  return (
      <div className="flex flex-col h-[calc(100vh-4rem)] p-8 gap-8 max-w-[1600px] mx-auto w-full">
        <DashboardHeader
          title="Quizzes"
        >
          <Button variant="default" className="gap-2">
            <Plus /> Create Quiz
          </Button>
        </DashboardHeader>

        <QuizList />
      </div>
  )
}
