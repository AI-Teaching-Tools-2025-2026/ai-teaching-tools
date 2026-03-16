export interface ChatbotConfig {
  _id?: string;
  courseId: string;
  botName: string;
  persona: string; // e.g. "Socratic tutor", "Study buddy", "Strict professor"
  systemPrompt: string; // The full custom system prompt
  topics: string; // What topics/chapters to focus on
  restrictions: string; // What the bot should NOT do
  welcomeMessage: string; // First message students see
  temperature: number; // 0-1, how creative the responses are
  status: "active" | "draft";
  createdAt?: string;
  updatedAt?: string;
}
