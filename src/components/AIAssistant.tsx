import { useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Bot, Loader2, MessageSquare, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/store/useAppStore";
import { translateLevel } from "@/lib/utils";
import { askGeminiAssistant, hasGeminiApiKey, type AssistantMessage } from "@/lib/geminiAssistant";

interface ChatMessage extends AssistantMessage {
  id: number;
}

const starterPrompts = [
  "Bugun qaysi moduldan boshlay?",
  "Fuzzy bahoyimni tushuntir",
  "Kiberxavfsizlik asoslarini qisqa takrorla",
];

export function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: "model",
      text: "Salom! Men CyberAl AI yordamchisiman. Modul tanlash, mavzuni tushuntirish yoki fuzzy bahoni sharhlashda yordam beraman.",
    },
  ]);
  const nextId = useRef(2);

  const {
    currentUser,
    userRole,
    hasCompletedInitialTest,
    currentLevel,
    readinessScore,
    fuzzyMetrics,
    moduleProgress,
    assignments,
    lessons,
  } = useAppStore();

  const learningContext = useMemo(() => {
    const completedModules = moduleProgress.filter((module) => module.completed).map((module) => module.title);
    const unlockedModules = moduleProgress.filter((module) => module.unlocked).map((module) => module.title);
    const activeAssignments = assignments
      .filter((assignment) => userRole === "Teacher" || assignment.studentId === currentUser?.id)
      .filter((assignment) => !assignment.completed)
      .map((assignment) => assignment.title);
    const lessonTitles = lessons.slice(0, 6).map((lesson) => `${lesson.title} (${lesson.difficulty})`);

    return [
      "Platform konteksti:",
      `Foydalanuvchi: ${currentUser?.name || "Noma'lum"}`,
      `Rol: ${userRole === "Teacher" ? "O'qituvchi" : "O'quvchi"}`,
      `Diagnostika topshirilgan: ${hasCompletedInitialTest ? "ha" : "yo'q"}`,
      `Hozirgi daraja: ${translateLevel(currentLevel)}`,
      `Readiness/Fuzzy score: ${(readinessScore * 100).toFixed(0)}%`,
      `Bilim: ${(fuzzyMetrics.knowledge * 100).toFixed(0)}%, xatolar: ${(fuzzyMetrics.errors * 100).toFixed(0)}%, tezlik: ${(fuzzyMetrics.speed * 100).toFixed(0)}%`,
      `Ochilgan modullar: ${unlockedModules.join(", ") || "yo'q"}`,
      `Tugallangan modullar: ${completedModules.join(", ") || "yo'q"}`,
      `Faol topshiriqlar: ${activeAssignments.join(", ") || "yo'q"}`,
      `Darslar: ${lessonTitles.join(", ") || "hali qo'shilmagan"}`,
    ].join("\n");
  }, [
    assignments,
    currentLevel,
    currentUser,
    fuzzyMetrics,
    hasCompletedInitialTest,
    lessons,
    moduleProgress,
    readinessScore,
    userRole,
  ]);

  const submitPrompt = async (prompt: string) => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt || isLoading) return;

    const userMessage: ChatMessage = {
      id: nextId.current++,
      role: "user",
      text: trimmedPrompt,
    };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const reply = await askGeminiAssistant(
        nextMessages.map(({ role, text }) => ({ role, text })),
        learningContext,
      );
      setMessages((current) => [
        ...current,
        {
          id: nextId.current++,
          role: "model",
          text: reply,
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: nextId.current++,
          role: "model",
          text: error instanceof Error ? error.message : "AI yordamchi bilan bog'lanishda xatolik yuz berdi.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submitPrompt(input);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-[min(calc(100vw-2rem),420px)] overflow-hidden rounded-lg border border-border/70 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-black text-white">
                <Bot className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-black">AI yordamchi</div>
                <div className="text-[11px] text-muted-foreground">
                  {hasGeminiApiKey() ? "Google Gemini ulangan" : "API key kerak"}
                </div>
              </div>
            </div>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="h-[min(54vh,430px)]">
            <div className="space-y-3 p-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[86%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                      message.role === "user"
                        ? "bg-black text-white"
                        : "border border-border/60 bg-[#f8f9fa] text-black"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-[#f8f9fa] px-3 py-2 text-sm text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Javob tayyorlanmoqda
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="border-t border-border/60 p-3">
            <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
              {starterPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => void submitPrompt(prompt)}
                  disabled={isLoading}
                  className="shrink-0 rounded-md border border-border/70 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-black transition hover:bg-[#f8f9fa] disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="flex items-end gap-2">
              <Textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Savolingizni yozing..."
                className="min-h-11 max-h-28 resize-none text-sm"
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
              />
              <Button type="submit" size="icon" className="h-11 w-11 shrink-0 bg-black text-white hover:bg-black/90" disabled={isLoading || !input.trim()}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </div>
        </div>
      )}

      <Button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="h-12 w-12 rounded-full bg-black text-white shadow-lg hover:bg-black/90"
        size="icon"
      >
        {open ? <X className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
      </Button>
    </div>
  );
}
