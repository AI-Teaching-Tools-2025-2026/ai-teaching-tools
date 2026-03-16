"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import axios from "axios";
import { ChatbotConfig } from "@/types/chatbot";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  courseId: string;
}

export default function ChatInterface({ courseId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<ChatbotConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load chatbot config
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/chatbot/config/${courseId}`,
          { withCredentials: true },
        );
        setConfig(response.data);
      } catch {
        // No config — use defaults
        setConfig(null);
      } finally {
        setConfigLoading(false);
      }
    };
    loadConfig();
  }, [courseId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  const botName = config?.botName || "AI Tutor";
  const welcomeMessage =
    config?.welcomeMessage ||
    "Hi! I'm your AI tutor for this course. How can I help you today?";

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const history = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/chatbot/chat`,
        {
          courseId,
          messages: history,
        },
        { withCredentials: true },
      );

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response.data.reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      const errMsg =
        error.response?.data?.detail ||
        "Something went wrong. Please try again.";

      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `Error: ${errMsg}`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  if (configLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full rounded-lg border border-border bg-card overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              {botName}
            </h3>
            <p className="text-xs text-muted-foreground">
              {config?.persona || "AI Teaching Assistant"}
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearChat}
            className="text-muted-foreground hover:text-destructive h-8 gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </Button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center">
              <Bot className="h-7 w-7 text-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                {botName}
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                {welcomeMessage}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 mt-2 max-w-md justify-center">
              {[
                "Explain the key concepts from Chapter 1",
                "Quiz me on this week's reading",
                "Help me understand the material",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setInput(suggestion);
                    textareaRef.current?.focus();
                  }}
                  className="text-xs px-3 py-1.5 rounded-full border border-border bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3 max-w-[85%]",
              message.role === "user" ? "ml-auto flex-row-reverse" : "",
            )}
          >
            <div
              className={cn(
                "h-7 w-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                message.role === "assistant"
                  ? "bg-blue-600"
                  : "bg-neutral-600",
              )}
            >
              {message.role === "assistant" ? (
                <Bot className="h-3.5 w-3.5 text-white" />
              ) : (
                <User className="h-3.5 w-3.5 text-white" />
              )}
            </div>

            <div
              className={cn(
                "rounded-xl px-4 py-2.5 text-sm leading-relaxed",
                message.role === "assistant"
                  ? "bg-muted/50 border border-border text-foreground"
                  : "bg-blue-600 text-white",
              )}
            >
              {message.content.startsWith("Error:") ? (
                <span className="text-destructive">{message.content}</span>
              ) : (
                <div className="whitespace-pre-wrap">{message.content}</div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 max-w-[85%]">
            <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
              <Bot className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="bg-muted/50 border border-border rounded-xl px-4 py-3 flex items-center gap-1.5">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-muted/20 px-4 py-3">
        <div className="flex items-end gap-2 max-w-[1400px] mx-auto">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            rows={1}
            disabled={isLoading}
            className="flex-1 resize-none rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background disabled:opacity-50"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-10 w-10 shrink-0 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1.5 text-center">
          AI responses may not always be accurate. Verify important information.
        </p>
      </div>
    </div>
  );
}
