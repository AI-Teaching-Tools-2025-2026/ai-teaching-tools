"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { DashboardHeader } from "@/components/ui/dashboardHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bot, Save, Eye, Loader2 } from "lucide-react";
import { ChatbotConfig } from "@/types/chatbot";

const PERSONA_PRESETS: Record<
  string,
  { persona: string; systemPrompt: string; temperature: number }
> = {
  socratic: {
    persona: "Socratic Tutor",
    systemPrompt:
      "You are a Socratic tutor. Never give direct answers. Instead, ask guiding questions that lead the student to discover the answer themselves. When a student asks a question, respond with a thought-provoking question that helps them think through the problem. Be patient and encouraging.",
    temperature: 0.7,
  },
  study_buddy: {
    persona: "Study Buddy",
    systemPrompt:
      "You are a friendly study buddy. Explain concepts in simple, casual language. Use analogies, examples, and mnemonics to make things memorable. Be encouraging and break down complex topics into digestible pieces. Use emojis occasionally to keep the tone light.",
    temperature: 0.8,
  },
  quiz_master: {
    persona: "Quiz Master",
    systemPrompt:
      "You are a quiz master. Your primary job is to test the student's knowledge by generating questions. Start by asking what topic they want to be quizzed on, then generate questions one at a time. After each answer, tell them if they're correct, explain why, and move to the next question. Track their score.",
    temperature: 0.6,
  },
  strict_professor: {
    persona: "Strict Professor",
    systemPrompt:
      "You are a rigorous, no-nonsense professor. Give thorough, academic explanations with proper terminology. Correct misconceptions firmly but fairly. Expect precision in the student's understanding. Reference relevant theories and research when applicable.",
    temperature: 0.4,
  },
  custom: {
    persona: "Custom",
    systemPrompt: "",
    temperature: 0.7,
  },
};

export default function ChatbotConfigPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState("socratic");

  const [config, setConfig] = useState<Partial<ChatbotConfig>>({
    courseId,
    botName: "AI Tutor",
    persona: "Socratic Tutor",
    systemPrompt: PERSONA_PRESETS.socratic.systemPrompt,
    topics: "",
    restrictions:
      "Do not provide direct answers to graded assignments. Do not write essays or complete homework for students.",
    welcomeMessage:
      "Hi! I'm your AI tutor for this course. How can I help you today?",
    temperature: 0.7,
    status: "draft",
  });

  // Load existing config
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/chatbot/config/${courseId}`,
          { withCredentials: true },
        );
        if (response.data) {
          setConfig(response.data);
          const match = Object.entries(PERSONA_PRESETS).find(
            ([, preset]) => preset.persona === response.data.persona,
          );
          setSelectedPreset(match ? match[0] : "custom");
        }
      } catch (error: any) {
        if (error.response?.status !== 404) {
          console.error("Failed to load chatbot config:", error);
        }
      } finally {
        setLoading(false);
      }
    };
    loadConfig();
  }, [courseId]);

  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset);
    const p = PERSONA_PRESETS[preset];
    if (preset !== "custom") {
      setConfig((prev) => ({
        ...prev,
        persona: p.persona,
        systemPrompt: p.systemPrompt,
        temperature: p.temperature,
      }));
    }
  };

  const handleSave = async (status: "draft" | "active") => {
    setSaving(true);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/chatbot/config`,
        { ...config, courseId, status },
        { withCredentials: true },
      );
      setConfig((prev) => ({ ...prev, status }));
      alert(
        status === "active"
          ? "Chatbot is now live for students!"
          : "Draft saved.",
      );
    } catch (error: any) {
      console.error("Failed to save config:", error);
      alert("Failed to save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] p-8 gap-6 max-w-[1600px] mx-auto w-full">
        <DashboardHeader title="AI Tutor — Configure" />
        <div className="flex items-center justify-center flex-1">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-8 gap-6 max-w-[1600px] mx-auto w-full overflow-auto">
      <DashboardHeader title="AI Tutor — Configure">
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => router.push(`/courses/${courseId}/chatbot/preview`)}
          >
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          <Button
            variant="secondary"
            className="gap-2"
            onClick={() => handleSave("draft")}
            disabled={saving}
          >
            <Save className="h-4 w-4" />
            Save Draft
          </Button>
          <Button
            className="gap-2 bg-blue-600 hover:bg-blue-700"
            onClick={() => handleSave("active")}
            disabled={saving}
          >
            <Bot className="h-4 w-4" />
            Activate
          </Button>
        </div>
      </DashboardHeader>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Config Form */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Identity */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Identity</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6 grid gap-5">
              <div className="grid gap-2">
                <Label htmlFor="botName">Bot Name</Label>
                <Input
                  id="botName"
                  value={config.botName}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      botName: e.target.value,
                    }))
                  }
                  placeholder="e.g. Professor Bot, Study Buddy"
                />
              </div>

              <div className="grid gap-2">
                <Label>Persona Preset</Label>
                <Select
                  value={selectedPreset}
                  onValueChange={handlePresetChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a persona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="socratic">
                      Socratic Tutor — guides with questions
                    </SelectItem>
                    <SelectItem value="study_buddy">
                      Study Buddy — casual and friendly
                    </SelectItem>
                    <SelectItem value="quiz_master">
                      Quiz Master — tests knowledge
                    </SelectItem>
                    <SelectItem value="strict_professor">
                      Strict Professor — rigorous and academic
                    </SelectItem>
                    <SelectItem value="custom">
                      Custom — write your own
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="welcomeMessage">Welcome Message</Label>
                <p className="text-xs text-muted-foreground">
                  The first message students see when they open the chatbot.
                </p>
                <Textarea
                  id="welcomeMessage"
                  value={config.welcomeMessage}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      welcomeMessage: e.target.value,
                    }))
                  }
                  rows={2}
                  placeholder="Hi! I'm here to help you study..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Behavior */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Behavior</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6 grid gap-5">
              <div className="grid gap-2">
                <Label htmlFor="systemPrompt">System Prompt</Label>
                <p className="text-xs text-muted-foreground">
                  This is the core instruction that defines how the AI behaves.
                  The persona preset fills this in, but you can edit it freely.
                </p>
                <Textarea
                  id="systemPrompt"
                  value={config.systemPrompt}
                  onChange={(e) => {
                    setConfig((prev) => ({
                      ...prev,
                      systemPrompt: e.target.value,
                    }));
                    setSelectedPreset("custom");
                  }}
                  rows={6}
                  className="font-mono text-sm"
                  placeholder="You are a helpful tutor..."
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="topics">Topic Focus</Label>
                <p className="text-xs text-muted-foreground">
                  Specific chapters, topics, or material the bot should focus
                  on. Leave blank for general course coverage.
                </p>
                <Textarea
                  id="topics"
                  value={config.topics}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      topics: e.target.value,
                    }))
                  }
                  rows={3}
                  placeholder="e.g. Chapter 1-3: Research Methods, Experimental Design, Hypothesis Testing"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="restrictions">Restrictions</Label>
                <p className="text-xs text-muted-foreground">
                  What should the bot NOT do? These are appended as rules.
                </p>
                <Textarea
                  id="restrictions"
                  value={config.restrictions}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      restrictions: e.target.value,
                    }))
                  }
                  rows={3}
                  placeholder="e.g. Do not provide direct answers to homework questions"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-6 h-fit lg:sticky lg:top-24">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Settings</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6 grid gap-5">
              <div className="grid gap-2">
                <Label>Creativity (Temperature)</Label>
                <p className="text-xs text-muted-foreground">
                  Lower = more focused and deterministic. Higher = more creative
                  and varied.
                </p>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.1}
                    value={config.temperature}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        temperature: parseFloat(e.target.value),
                      }))
                    }
                    className="flex-1 accent-blue-600"
                  />
                  <span className="text-sm font-mono text-foreground w-8 text-right">
                    {config.temperature}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>Precise</span>
                  <span>Creative</span>
                </div>
              </div>

              <Separator />

              <div className="grid gap-2">
                <Label>Status</Label>
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium ${
                    config.status === "active"
                      ? "bg-green-500/15 text-green-500 border border-green-500/20"
                      : "bg-neutral-500/15 text-neutral-400 border border-neutral-500/20"
                  }`}
                >
                  <div
                    className={`h-2 w-2 rounded-full ${
                      config.status === "active"
                        ? "bg-green-500"
                        : "bg-neutral-500"
                    }`}
                  />
                  {config.status === "active"
                    ? "Active — students can use this"
                    : "Draft — not visible to students"}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
