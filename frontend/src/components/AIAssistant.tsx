import { useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Bot, Loader2, MessageSquare, Send, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppStore } from "@/store/useAppStore";
import { translateLevel } from "@/lib/utils";
import { askGeminiAssistant, hasGeminiApiKey, type AssistantMessage } from "@/lib/geminiAssistant";

interface ChatMessage extends AssistantMessage {
  id: number;
}

const starterPrompts = [
  "Qaysi moduldan boshlay?",
  "Fuzzy bahoyimni tushuntir",
  "CIA triad nima?",
];

export function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: "model",
      text: "CyberAI AI yordamchisi ishga tushdi.\nModul tanlash, mavzuni tushuntirish yoki fuzzy bahoni sharhlashda yordam beraman.",
    },
  ]);
  const nextId = useRef(2);

  const {
    currentUser, userRole, hasCompletedInitialTest,
    currentLevel, readinessScore, fuzzyMetrics,
    moduleProgress, assignments, lessons,
  } = useAppStore();

  const learningContext = useMemo(() => {
    const completedModules = moduleProgress.filter(m => m.completed).map(m => m.title);
    const unlockedModules = moduleProgress.filter(m => m.unlocked).map(m => m.title);
    const activeAssignments = assignments
      .filter(a => userRole === "Teacher" || a.studentId === currentUser?.id)
      .filter(a => !a.completed)
      .map(a => a.title);
    const lessonTitles = lessons.slice(0, 6).map(l => `${l.title} (${l.difficulty})`);

    return [
      "Platform konteksti:",
      `Foydalanuvchi: ${currentUser?.name || "Noma'lum"}`,
      `Rol: ${userRole === "Teacher" ? "O'qituvchi" : "O'quvchi"}`,
      `Diagnostika: ${hasCompletedInitialTest ? "ha" : "yo'q"}`,
      `Daraja: ${translateLevel(currentLevel)}`,
      `Readiness: ${(readinessScore * 100).toFixed(0)}%`,
      `Bilim: ${(fuzzyMetrics.knowledge * 100).toFixed(0)}%, xatolar: ${(fuzzyMetrics.errors * 100).toFixed(0)}%, tezlik: ${(fuzzyMetrics.speed * 100).toFixed(0)}%`,
      `Ochilgan: ${unlockedModules.join(", ") || "yo'q"}`,
      `Tugallangan: ${completedModules.join(", ") || "yo'q"}`,
      `Topshiriqlar: ${activeAssignments.join(", ") || "yo'q"}`,
      `Darslar: ${lessonTitles.join(", ") || "hali qo'shilmagan"}`,
    ].join("\n");
  }, [assignments, currentLevel, currentUser, fuzzyMetrics, hasCompletedInitialTest, lessons, moduleProgress, readinessScore, userRole]);

  const submitPrompt = async (prompt: string) => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt || isLoading) return;

    const userMessage: ChatMessage = { id: nextId.current++, role: "user", text: trimmedPrompt };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const reply = await askGeminiAssistant(nextMessages.map(({ role, text }) => ({ role, text })), learningContext);
      setMessages(current => [...current, { id: nextId.current++, role: "model", text: reply }]);
    } catch (error) {
      setMessages(current => [...current, {
        id: nextId.current++,
        role: "model",
        text: error instanceof Error ? error.message : "AI yordamchi bilan bog'lanishda xatolik yuz berdi.",
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submitPrompt(input);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 font-sans">
      {open && (
        <div
          className="w-[min(calc(100vw-2rem),400px)] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl flex flex-col"
        >
          {/* ── Header ── */}
          <div
            className="flex items-center justify-between px-4 py-3 bg-white border-b border-zinc-100 text-zinc-800"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100/50 text-primary"
              >
                <Bot className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-zinc-900 tracking-tight">
                  CyberAI Ko'makchisi
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="h-7 w-7 flex items-center justify-center rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-500 hover:text-zinc-800 transition-colors"
            >
              <X className="h-3.5 h-3.5" />
            </button>
          </div>

          {/* Network status line */}
          <div className="px-4 py-1.5 bg-zinc-50 border-b border-zinc-100 text-[10px] text-zinc-500 flex justify-between font-semibold">
            <span>STATUS: ONLINE</span>
            <span className={hasGeminiApiKey() ? "text-emerald-600" : "text-rose-600"}>
              {hasGeminiApiKey() ? "GEMINI CONNECTED" : "GEMINI DISCONNECTED"}
            </span>
          </div>

          {/* ── Messages ── */}
          <ScrollArea className="h-[min(50vh,380px)] bg-white">
            <div className="space-y-3.5 p-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "model" && (
                    <div className="mr-2 mt-1 shrink-0">
                      <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-100/50 flex items-center justify-center">
                        <Bot className="w-3.5 h-3.5 text-primary" />
                      </div>
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed whitespace-pre-wrap border ${
                      message.role === "user"
                        ? "bg-indigo-550/10 text-zinc-800 border-indigo-100 shadow-2xs rounded-tr-none"
                        : "bg-zinc-50 text-zinc-800 border-zinc-150 shadow-2xs rounded-tl-none"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="mr-2 mt-1 w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-100/50 flex items-center justify-center shrink-0">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  </div>
                  <div className="bg-zinc-50 text-zinc-500 rounded-2xl border border-zinc-150 px-3.5 py-2 text-xs italic rounded-tl-none">
                    Javob tayyorlanmoqda...
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* ── Input ── */}
          <div
            className="p-3 space-y-2 border-t border-zinc-100 bg-zinc-50/50"
          >
            {/* Starter prompts */}
            <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
              {starterPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => void submitPrompt(prompt)}
                  disabled={isLoading}
                  className="shrink-0 rounded-lg px-2.5 py-1 text-[10px] font-semibold transition-all disabled:opacity-40 bg-white border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-zinc-700 shadow-2xs"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="flex items-end gap-2">
              <div className="flex-1">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Savolingizni yozing..."
                  className="w-full resize-none rounded-xl px-3 py-2 text-xs bg-white border border-zinc-200 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all text-zinc-800"
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      e.currentTarget.form?.requestSubmit();
                    }
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="h-[40px] px-3.5 shrink-0 flex items-center justify-center rounded-xl bg-primary text-white hover:bg-primary/95 transition-all duration-150 shadow-sm disabled:opacity-40 disabled:hover:bg-primary"
              >
                {isLoading
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <Send className="h-4 w-4" />
                }
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Toggle button ── */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="h-12 w-12 rounded-full flex items-center justify-center transition-all bg-primary text-white shadow-lg hover:bg-primary/95 hover:scale-105 active:scale-95 duration-150"
      >
        {open
          ? <X className="h-5 w-5" />
          : <MessageSquare className="h-5 w-5" />
        }
      </button>
    </div>
  );
}
