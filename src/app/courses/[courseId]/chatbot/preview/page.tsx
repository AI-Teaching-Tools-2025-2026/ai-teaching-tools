"use client";

import { useParams, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatInterface from "@/components/chatbot/ChatInterface";

export default function ChatbotPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-8 gap-6 max-w-[1600px] mx-auto w-full">
      <div className="flex items-center gap-4 py-2 border-b border-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/courses/${courseId}/chatbot`)}
          className="text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            AI Tutor — Preview
          </h1>
          <p className="text-sm text-muted-foreground">
            Test your chatbot configuration. This is what students will see.
          </p>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <ChatInterface courseId={courseId} />
      </div>
    </div>
  );
}
