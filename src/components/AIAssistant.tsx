import { useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Bot, Loader2, MessageSquare, Send, X, Terminal, Wifi } from "lucide-react";
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

const neon = "hsl(150 100% 55%)";
const neonDim = "hsl(150 100% 50% / 0.12)";

export function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: "model",
      text: "// CyberAl AI yordamchisi ishga tushdi.\n// Modul tanlash, mavzuni tushuntirish yoki fuzzy bahoni sharhlashda yordam beraman.",
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
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div
          className="w-[min(calc(100vw-2rem),420px)] overflow-hidden rounded-lg"
          style={{
            background: "hsl(220 18% 6%)",
            border: "1px solid hsl(150 60% 22%)",
            boxShadow: "0 0 40px hsl(150 100% 50% / 0.15), 0 20px 60px rgba(0,0,0,0.8)",
          }}
        >
          {/* ── Header ── */}
          <div
            className="flex items-center justify-between px-4 py-3 relative"
            style={{
              background: "hsl(220 20% 8%)",
              borderBottom: "1px solid hsl(150 50% 18%)",
            }}
          >
            {/* Top glow line */}
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(to right, transparent, hsl(150 100% 55% / 0.6), transparent)" }} />

            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded"
                style={{
                  background: neonDim,
                  border: "1px solid hsl(150 100% 50% / 0.45)",
                }}
              >
                <Bot className="h-4 w-4" style={{ color: neon }} />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold tracking-widest uppercase" style={{ color: neon, fontFamily: "Orbitron, monospace" }}>
                  CyberAl AI
                </div>
                <div className="text-[8px] tracking-widest flex items-center gap-1" style={{ color: "hsl(150 40% 50%)" }}>
                  <Wifi className="w-2 h-2" style={{ color: hasGeminiApiKey() ? neon : "hsl(0 70% 55%)" }} />
                  {hasGeminiApiKey() ? "GEMINI ULANGAN" : "API KEY KERAK"}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="h-7 w-7 flex items-center justify-center rounded transition-all"
              style={{ color: "hsl(150 40% 50%)", border: "1px solid hsl(150 50% 18%)" }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = "hsl(0 70% 60%)";
                (e.currentTarget as HTMLElement).style.borderColor = "hsl(0 70% 55% / 0.5)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = "hsl(150 40% 50%)";
                (e.currentTarget as HTMLElement).style.borderColor = "hsl(150 50% 18%)";
              }}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* ── Messages ── */}
          <ScrollArea className="h-[min(54vh,400px)]">
            <div className="space-y-3 p-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "model" && (
                    <div className="mr-2 mt-1 shrink-0">
                      <Terminal className="w-3 h-3" style={{ color: "hsl(150 60% 50%)" }} />
                    </div>
                  )}
                  <div
                    className="max-w-[86%] rounded px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap"
                    style={
                      message.role === "user"
                        ? {
                            background: neonDim,
                            border: "1px solid hsl(150 100% 50% / 0.35)",
                            color: "hsl(150 90% 80%)",
                            fontFamily: "JetBrains Mono, monospace",
                          }
                        : {
                            background: "hsl(220 18% 10%)",
                            border: "1px solid hsl(150 50% 18%)",
                            color: "hsl(150 60% 70%)",
                            fontFamily: "JetBrains Mono, monospace",
                          }
                    }
                  >
                    {message.text}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="mr-2 mt-1"><Terminal className="w-3 h-3" style={{ color: "hsl(150 60% 50%)" }} /></div>
                  <div
                    className="flex items-center gap-2 rounded px-3 py-2 text-xs"
                    style={{
                      background: "hsl(220 18% 10%)",
                      border: "1px solid hsl(150 50% 18%)",
                      color: "hsl(150 60% 55%)",
                    }}
                  >
                    <Loader2 className="h-3 w-3 animate-spin" style={{ color: neon }} />
                    <span className="tracking-widest">JAVOB TAYYORLANMOQDA...</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* ── Input ── */}
          <div
            className="p-3 space-y-2"
            style={{ borderTop: "1px solid hsl(150 50% 16%)" }}
          >
            {/* Starter prompts */}
            <div className="flex gap-1.5 overflow-x-auto pb-0.5">
              {starterPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => void submitPrompt(prompt)}
                  disabled={isLoading}
                  className="shrink-0 rounded px-2 py-1 text-[9px] font-bold tracking-wider transition-all disabled:opacity-40"
                  style={{
                    background: "hsl(150 100% 50% / 0.06)",
                    border: "1px solid hsl(150 60% 20%)",
                    color: "hsl(150 70% 60%)",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = neonDim;
                    (e.currentTarget as HTMLElement).style.borderColor = "hsl(150 100% 50% / 0.4)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = "hsl(150 100% 50% / 0.06)";
                    (e.currentTarget as HTMLElement).style.borderColor = "hsl(150 60% 20%)";
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="flex items-end gap-2">
              <div className="flex-1 relative">
                <span
                  className="absolute left-2.5 top-2.5 text-[10px]"
                  style={{ color: "hsl(150 60% 45%)" }}
                >
                  &gt;
                </span>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Savolingizni yozing..."
                  className="w-full resize-none rounded pl-6 pr-3 py-2 text-xs leading-relaxed outline-none transition-all"
                  rows={2}
                  style={{
                    background: "hsl(220 18% 9%)",
                    border: "1px solid hsl(150 60% 20%)",
                    color: "hsl(150 90% 80%)",
                    fontFamily: "JetBrains Mono, monospace",
                    caretColor: neon,
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = "hsl(150 100% 50%)";
                    e.currentTarget.style.boxShadow = "0 0 0 2px hsl(150 100% 50% / 0.15)";
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = "hsl(150 60% 20%)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
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
                className="h-[56px] w-10 shrink-0 flex items-center justify-center rounded transition-all disabled:opacity-40"
                style={{
                  background: neonDim,
                  border: "1px solid hsl(150 100% 50% / 0.45)",
                  color: neon,
                }}
                onMouseEnter={e => {
                  if (!isLoading && input.trim()) {
                    (e.currentTarget as HTMLElement).style.background = "hsl(150 100% 50% / 0.25)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 0 15px hsl(150 100% 50% / 0.3)";
                  }
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = neonDim;
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }}
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
        className="h-13 w-13 p-3.5 rounded-full flex items-center justify-center transition-all duration-200 glow-pulse"
        style={{
          background: open ? "hsl(220 18% 10%)" : neonDim,
          border: "1px solid hsl(150 100% 50% / 0.55)",
          boxShadow: "0 0 20px hsl(150 100% 50% / 0.3), 0 8px 30px rgba(0,0,0,0.5)",
          color: neon,
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.boxShadow = "0 0 30px hsl(150 100% 50% / 0.5), 0 8px 30px rgba(0,0,0,0.5)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px hsl(150 100% 50% / 0.3), 0 8px 30px rgba(0,0,0,0.5)";
        }}
      >
        {open
          ? <X className="h-5 w-5" />
          : <MessageSquare className="h-5 w-5" />
        }
      </button>
    </div>
  );
}
