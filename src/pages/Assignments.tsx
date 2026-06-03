import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import type { AssignmentQuestion } from "@/store/useAppStore";
import { translateLevel } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Plus, Trash2, CheckCircle2, Clock, BookOpen,
  ChevronDown, ChevronUp, HelpCircle, GraduationCap,
  ClipboardList, User, Send, X, CircleDot
} from "lucide-react";

export default function Assignments() {
  const { students, assignments, moduleProgress, addAssignment, completeAssignment, userRole } = useAppStore();
  const { toast } = useToast();

  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<number>(students[0]?.id ?? 1);
  const [selectedModule, setSelectedModule] = useState<number>(1);
  const [questions, setQuestions] = useState<AssignmentQuestion[]>([]);
  const [expandedAssignment, setExpandedAssignment] = useState<number | null>(null);

  const [newQuestion, setNewQuestion] = useState("");
  const [newOptions, setNewOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [showQuestionForm, setShowQuestionForm] = useState(false);

  const handleAddQuestion = () => {
    if (!newQuestion.trim()) return;
    const filledOptions = newOptions.filter(o => o.trim() !== "");
    if (filledOptions.length < 2) {
      toast({ title: "Kamida 2 ta variant kiriting", description: "Variantlar bo'sh bo'lmasligi kerak." });
      return;
    }
    const q: AssignmentQuestion = {
      id: Date.now(),
      question: newQuestion.trim(),
      options: newOptions.map(o => o.trim()).filter(o => o),
      correctAnswer,
    };
    setQuestions(prev => [...prev, q]);
    setNewQuestion("");
    setNewOptions(["", "", "", ""]);
    setCorrectAnswer(0);
    setShowQuestionForm(false);
  };

  const handleRemoveQuestion = (id: number) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    addAssignment(taskTitle, selectedStudent, selectedModule, questions, taskDescription);
    toast({
      title: "✅ Topshiriq yuborildi!",
      description: `O'quvchiga ${questions.length > 0 ? questions.length + " ta savol bilan " : ""}topshiriq muvaffaqiyatli biriktirildi.`,
    });
    setTaskTitle("");
    setTaskDescription("");
    setQuestions([]);
    setSelectedStudent(students[0]?.id ?? 1);
    setSelectedModule(1);
  };

  const pending = assignments.filter(a => !a.completed);
  const done = assignments.filter(a => a.completed);

  const pageVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  if (userRole !== "Teacher") {
    return (
      <div
        className="flex flex-col items-center justify-center h-64 gap-3"
        style={{ color: 'hsl(150 30% 50%)' }}
      >
        <GraduationCap className="w-10 h-10 opacity-40" style={{ color: 'hsl(150 100% 55%)' }} />
        <p className="text-sm" style={{ fontFamily: 'JetBrains Mono, monospace', color: 'hsl(150 30% 55%)' }}>
          Bu sahifa faqat o'qituvchilar uchun.
        </p>
      </div>
    );
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={pageVariants} className="space-y-8">
      {/* Header */}
      <div>
        <h1
          className="text-3xl font-bold tracking-tight"
          style={{
            fontFamily: 'Orbitron, monospace',
            color: 'hsl(150 100% 65%)',
            textShadow: '0 0 20px hsl(150 100% 55% / 0.5)',
          }}
        >
          Topshiriqlar Boshqaruvi
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'hsl(150 30% 55%)' }}>
          O'quvchilarga vazifa yukla, savol qo'sh va natijalarni kuzat.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* ── LEFT: Assignment Creation Form ── */}
        <div className="space-y-6">
          <div
            className="rounded-lg overflow-hidden"
            style={{
              background: 'hsl(220 15% 8%)',
              border: '1px solid hsl(150 100% 50% / 0.25)',
              boxShadow: '0 0 20px hsl(150 100% 50% / 0.06)',
            }}
          >
            {/* Card Header */}
            <div
              className="px-6 py-4 flex items-center gap-2"
              style={{ borderBottom: '1px solid hsl(150 60% 16%)' }}
            >
              <ClipboardList className="w-4 h-4" style={{ color: 'hsl(150 100% 55%)' }} />
              <div>
                <div
                  className="text-sm font-bold tracking-wider uppercase"
                  style={{ fontFamily: 'Orbitron, monospace', color: 'hsl(150 100% 70%)' }}
                >
                  Yangi Topshiriq Yaratish
                </div>
                <div className="text-[11px]" style={{ color: 'hsl(150 30% 50%)' }}>
                  Topshiriq nomi, o'quvchi, modul va savollari
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Topshiriq nomi */}
                <div className="space-y-1.5">
                  <label
                    className="text-[11px] font-bold uppercase tracking-wider"
                    style={{ color: 'hsl(150 30% 55%)', fontFamily: 'JetBrains Mono, monospace' }}
                  >
                    Topshiriq nomi *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: Kriptografiya asoslari bo'yicha test"
                    value={taskTitle}
                    onChange={e => setTaskTitle(e.target.value)}
                    className="w-full text-sm px-3 py-2.5 rounded-lg outline-none transition"
                  />
                </div>

                {/* Tavsif */}
                <div className="space-y-1.5">
                  <label
                    className="text-[11px] font-bold uppercase tracking-wider"
                    style={{ color: 'hsl(150 30% 55%)', fontFamily: 'JetBrains Mono, monospace' }}
                  >
                    Tavsif (ixtiyoriy)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Topshiriq haqida qisqacha izoh..."
                    value={taskDescription}
                    onChange={e => setTaskDescription(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg outline-none transition resize-none"
                  />
                </div>

                {/* O'quvchi va Modul */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label
                      className="text-[11px] font-bold uppercase tracking-wider"
                      style={{ color: 'hsl(150 30% 55%)', fontFamily: 'JetBrains Mono, monospace' }}
                    >
                      O'quvchini tanlang *
                    </label>
                    <select
                      value={selectedStudent}
                      onChange={e => setSelectedStudent(Number(e.target.value))}
                      className="w-full text-sm px-3 py-2.5 rounded-lg outline-none transition"
                    >
                      {students.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({translateLevel(s.level)})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label
                      className="text-[11px] font-bold uppercase tracking-wider"
                      style={{ color: 'hsl(150 30% 55%)', fontFamily: 'JetBrains Mono, monospace' }}
                    >
                      Maqsadli modul *
                    </label>
                    <select
                      value={selectedModule}
                      onChange={e => setSelectedModule(Number(e.target.value))}
                      className="w-full text-sm px-3 py-2.5 rounded-lg outline-none transition"
                    >
                      {moduleProgress.map(m => (
                        <option key={m.id} value={m.id}>{m.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* ── QUESTIONS SECTION ── */}
                <div
                  className="space-y-3 rounded-xl p-4"
                  style={{
                    background: 'hsl(220 18% 6%)',
                    border: '1px solid hsl(150 50% 18%)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4" style={{ color: 'hsl(150 100% 55%)' }} />
                      <span
                        className="text-sm font-bold"
                        style={{ color: 'hsl(150 100% 75%)', fontFamily: 'JetBrains Mono, monospace' }}
                      >
                        Topshiriq savollari
                      </span>
                      {questions.length > 0 && (
                        <span
                          className="text-[10px] px-2 py-0.5 rounded font-mono font-bold"
                          style={{
                            background: 'hsl(150 100% 50% / 0.15)',
                            border: '1px solid hsl(150 100% 50% / 0.4)',
                            color: 'hsl(150 100% 70%)',
                          }}
                        >
                          {questions.length} ta
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowQuestionForm(v => !v)}
                      className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded transition-all"
                      style={
                        showQuestionForm
                          ? {
                              background: 'hsl(0 85% 60% / 0.1)',
                              border: '1px solid hsl(0 85% 60% / 0.4)',
                              color: 'hsl(0 70% 65%)',
                              fontFamily: 'JetBrains Mono, monospace',
                            }
                          : {
                              background: 'hsl(150 100% 50% / 0.08)',
                              border: '1px solid hsl(150 100% 50% / 0.3)',
                              color: 'hsl(150 100% 65%)',
                              fontFamily: 'JetBrains Mono, monospace',
                            }
                      }
                    >
                      {showQuestionForm ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                      {showQuestionForm ? "Bekor qilish" : "Savol qo'shish"}
                    </button>
                  </div>

                  {/* Existing questions list */}
                  {questions.length > 0 && (
                    <div className="space-y-2">
                      {questions.map((q, idx) => (
                        <div
                          key={q.id}
                          className="flex items-start justify-between gap-2 px-3 py-2.5 rounded-lg"
                          style={{
                            background: 'hsl(220 15% 10%)',
                            border: '1px solid hsl(150 50% 18%)',
                          }}
                        >
                          <div className="flex-1 min-w-0">
                            <div
                              className="text-xs font-bold truncate"
                              style={{ color: 'hsl(150 90% 80%)' }}
                            >
                              {idx + 1}. {q.question}
                            </div>
                            <div
                              className="text-[10px] mt-0.5"
                              style={{ color: 'hsl(150 30% 50%)', fontFamily: 'JetBrains Mono, monospace' }}
                            >
                              {q.options.length} variant · To'g'ri: {q.options[q.correctAnswer] || "—"}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(q.id)}
                            className="shrink-0 mt-0.5 transition-colors"
                            style={{ color: 'hsl(150 30% 45%)' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'hsl(0 85% 60%)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'hsl(150 30% 45%)'; }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* New question form */}
                  <AnimatePresence>
                    {showQuestionForm && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div
                          className="space-y-3 pt-3 mt-2"
                          style={{ borderTop: '1px solid hsl(150 50% 16%)' }}
                        >
                          {/* Question text */}
                          <div className="space-y-1">
                            <label
                              className="text-[10px] font-bold uppercase"
                              style={{ color: 'hsl(150 30% 50%)', fontFamily: 'JetBrains Mono, monospace' }}
                            >
                              Savol matni *
                            </label>
                            <input
                              type="text"
                              placeholder="Masalan: SSL nima uchun ishlatiladi?"
                              value={newQuestion}
                              onChange={e => setNewQuestion(e.target.value)}
                              className="w-full text-xs px-3 py-2 rounded-lg outline-none transition"
                            />
                          </div>

                          {/* Options */}
                          <div className="space-y-1.5">
                            <label
                              className="text-[10px] font-bold uppercase"
                              style={{ color: 'hsl(150 30% 50%)', fontFamily: 'JetBrains Mono, monospace' }}
                            >
                              Javob variantlari (kamida 2 ta) *
                            </label>
                            {newOptions.map((opt, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setCorrectAnswer(i)}
                                  title="To'g'ri javob"
                                  className="shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                                  style={
                                    correctAnswer === i
                                      ? {
                                          borderColor: 'hsl(150 100% 50%)',
                                          background: 'hsl(150 100% 50% / 0.2)',
                                          boxShadow: '0 0 8px hsl(150 100% 50% / 0.4)',
                                        }
                                      : {
                                          borderColor: 'hsl(150 50% 22%)',
                                          background: 'transparent',
                                        }
                                  }
                                >
                                  {correctAnswer === i && (
                                    <CircleDot className="w-2.5 h-2.5" style={{ color: 'hsl(150 100% 65%)' }} />
                                  )}
                                </button>
                                <input
                                  type="text"
                                  placeholder={`Variant ${String.fromCharCode(65 + i)}`}
                                  value={opt}
                                  onChange={e => {
                                    const updated = [...newOptions];
                                    updated[i] = e.target.value;
                                    setNewOptions(updated);
                                  }}
                                  className="flex-1 text-xs px-3 py-1.5 rounded-lg outline-none transition"
                                />
                              </div>
                            ))}
                            <p
                              className="text-[10px]"
                              style={{ color: 'hsl(150 30% 45%)', fontFamily: 'JetBrains Mono, monospace' }}
                            >
                              ● belgisini bosib to'g'ri javobni belgilang
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={handleAddQuestion}
                            className="w-full flex items-center justify-center gap-1.5 text-xs h-8 rounded-lg font-bold tracking-wider uppercase transition-all"
                            style={{
                              background: 'hsl(150 100% 50% / 0.12)',
                              border: '1px solid hsl(150 100% 50% / 0.4)',
                              color: 'hsl(150 100% 70%)',
                              fontFamily: 'JetBrains Mono, monospace',
                            }}
                            onMouseEnter={e => {
                              (e.currentTarget as HTMLElement).style.background = 'hsl(150 100% 50% / 0.2)';
                              (e.currentTarget as HTMLElement).style.boxShadow = '0 0 15px hsl(150 100% 50% / 0.2)';
                            }}
                            onMouseLeave={e => {
                              (e.currentTarget as HTMLElement).style.background = 'hsl(150 100% 50% / 0.12)';
                              (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                            }}
                          >
                            <Plus className="w-3 h-3" /> Savolni qo'shish
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {questions.length === 0 && !showQuestionForm && (
                    <p
                      className="text-[11px] text-center py-1"
                      style={{ color: 'hsl(150 30% 40%)', fontFamily: 'JetBrains Mono, monospace' }}
                    >
                      Savol qo'shilmagan. Ixtiyoriy.
                    </p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold tracking-wider uppercase transition-all duration-200"
                  style={{
                    background: 'hsl(150 100% 50% / 0.15)',
                    border: '1px solid hsl(150 100% 50% / 0.5)',
                    color: 'hsl(150 100% 70%)',
                    boxShadow: '0 0 20px hsl(150 100% 50% / 0.15)',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = 'hsl(150 100% 50% / 0.25)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 0 30px hsl(150 100% 50% / 0.3)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'hsl(150 100% 50% / 0.15)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px hsl(150 100% 50% / 0.15)';
                  }}
                >
                  <Send className="w-4 h-4" /> Topshiriqni yuborish
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Assignment List ── */}
        <div className="space-y-6">
          {/* Pending */}
          <div
            className="rounded-lg overflow-hidden"
            style={{
              background: 'hsl(220 15% 8%)',
              border: '1px solid hsl(150 60% 16%)',
            }}
          >
            <div
              className="px-5 py-4 flex items-center gap-2"
              style={{ borderBottom: '1px solid hsl(150 60% 14%)' }}
            >
              <Clock className="w-4 h-4" style={{ color: 'hsl(45 100% 60%)' }} />
              <span
                className="text-sm font-bold uppercase tracking-wider flex-1"
                style={{ fontFamily: 'Orbitron, monospace', color: 'hsl(150 80% 70%)' }}
              >
                Kutilayotgan topshiriqlar
              </span>
              <span
                className="text-[10px] px-2 py-0.5 rounded font-mono font-bold"
                style={{
                  background: 'hsl(45 100% 60% / 0.1)',
                  border: '1px solid hsl(45 100% 60% / 0.35)',
                  color: 'hsl(45 100% 65%)',
                }}
              >
                {pending.length} ta
              </span>
            </div>
            <div className="p-4 space-y-3">
              {pending.length === 0 ? (
                <div
                  className="text-center py-8 text-xs"
                  style={{ color: 'hsl(150 30% 45%)', fontFamily: 'JetBrains Mono, monospace' }}
                >
                  Kutilayotgan topshiriqlar yo'q.
                </div>
              ) : (
                pending.map(as => (
                  <AssignmentCard
                    key={as.id}
                    assignment={as}
                    expanded={expandedAssignment === as.id}
                    onToggle={() => setExpandedAssignment(expandedAssignment === as.id ? null : as.id)}
                    onComplete={() => {
                      completeAssignment(as.id);
                      toast({ title: "Topshiriq bajarildi ✓", description: `"${as.title}" yakunlandi.` });
                    }}
                  />
                ))
              )}
            </div>
          </div>

          {/* Completed */}
          {done.length > 0 && (
            <div
              className="rounded-lg overflow-hidden"
              style={{
                background: 'hsl(220 15% 8%)',
                border: '1px solid hsl(150 60% 16%)',
              }}
            >
              <div
                className="px-5 py-4 flex items-center gap-2"
                style={{ borderBottom: '1px solid hsl(150 60% 14%)' }}
              >
                <CheckCircle2 className="w-4 h-4" style={{ color: 'hsl(150 100% 55%)' }} />
                <span
                  className="text-sm font-bold uppercase tracking-wider flex-1"
                  style={{ fontFamily: 'Orbitron, monospace', color: 'hsl(150 80% 70%)' }}
                >
                  Bajarilgan topshiriqlar
                </span>
                <span
                  className="text-[10px] px-2 py-0.5 rounded font-mono font-bold"
                  style={{
                    background: 'hsl(150 100% 50% / 0.1)',
                    border: '1px solid hsl(150 100% 50% / 0.35)',
                    color: 'hsl(150 100% 65%)',
                  }}
                >
                  {done.length} ta
                </span>
              </div>
              <div className="p-4 space-y-3">
                {done.map(as => (
                  <AssignmentCard
                    key={as.id}
                    assignment={as}
                    expanded={expandedAssignment === as.id}
                    onToggle={() => setExpandedAssignment(expandedAssignment === as.id ? null : as.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Sub-component: Assignment Card ──
function AssignmentCard({
  assignment,
  expanded,
  onToggle,
  onComplete,
}: {
  assignment: ReturnType<typeof useAppStore.getState>["assignments"][number];
  expanded: boolean;
  onToggle: () => void;
  onComplete?: () => void;
}) {
  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-200"
      style={{
        background: assignment.completed
          ? 'hsl(150 100% 50% / 0.04)'
          : 'hsl(220 18% 7%)',
        border: assignment.completed
          ? '1px solid hsl(150 100% 50% / 0.25)'
          : '1px solid hsl(150 50% 18%)',
        boxShadow: expanded ? '0 0 15px hsl(150 100% 50% / 0.07)' : 'none',
      }}
    >
      {/* Card header row */}
      <div
        className="flex items-start justify-between gap-3 p-3.5 cursor-pointer transition-colors"
        style={{ background: expanded ? 'hsl(150 100% 50% / 0.03)' : 'transparent' }}
        onClick={onToggle}
        onMouseEnter={e => { if (!expanded) (e.currentTarget as HTMLElement).style.background = 'hsl(150 100% 50% / 0.02)'; }}
        onMouseLeave={e => { if (!expanded) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
      >
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="font-bold text-xs"
              style={{ color: 'hsl(150 100% 80%)' }}
            >
              {assignment.title}
            </span>
            {assignment.completed ? (
              <span
                className="text-[9px] px-1.5 py-0.5 rounded font-mono border"
                style={{
                  borderColor: 'hsl(150 100% 50% / 0.4)',
                  color: 'hsl(150 100% 65%)',
                  background: 'hsl(150 100% 50% / 0.08)',
                }}
              >
                Bajarildi
              </span>
            ) : (
              <span
                className="text-[9px] px-1.5 py-0.5 rounded font-mono border"
                style={{
                  borderColor: 'hsl(45 100% 60% / 0.4)',
                  color: 'hsl(45 100% 65%)',
                  background: 'hsl(45 100% 60% / 0.08)',
                }}
              >
                Kutilmoqda
              </span>
            )}
          </div>
          <div
            className="flex items-center gap-3 text-[10px]"
            style={{ color: 'hsl(150 30% 48%)', fontFamily: 'JetBrains Mono, monospace' }}
          >
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" /> {assignment.studentName}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" /> Modul {assignment.targetModuleId}
            </span>
            <span>{assignment.dateAssigned}</span>
            {(assignment.questions ?? []).length > 0 && (
              <span className="flex items-center gap-1">
                <HelpCircle className="w-3 h-3" /> {assignment.questions.length} savol
              </span>
            )}
          </div>
        </div>
        <div className="shrink-0 mt-0.5" style={{ color: 'hsl(150 50% 45%)' }}>
          {expanded
            ? <ChevronUp className="w-4 h-4" style={{ color: 'hsl(150 100% 55%)' }} />
            : <ChevronDown className="w-4 h-4" />
          }
        </div>
      </div>

      {/* Expandable detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div
              className="px-4 pb-4 space-y-3"
              style={{ borderTop: '1px solid hsl(150 50% 14%)' }}
            >
              {assignment.description && (
                <p
                  className="text-xs pt-3"
                  style={{ color: 'hsl(150 40% 55%)' }}
                >
                  {assignment.description}
                </p>
              )}

              {(assignment.questions ?? []).length > 0 ? (
                <div className="space-y-3 pt-2">
                  <div
                    className="text-[11px] font-bold uppercase tracking-wider"
                    style={{ color: 'hsl(150 30% 50%)', fontFamily: 'JetBrains Mono, monospace' }}
                  >
                    Savollar
                  </div>
                  {(assignment.questions ?? []).map((q, idx) => (
                    <div
                      key={q.id}
                      className="rounded-lg p-3 space-y-2"
                      style={{
                        background: 'hsl(220 18% 6%)',
                        border: '1px solid hsl(150 50% 15%)',
                      }}
                    >
                      <p
                        className="text-xs font-bold"
                        style={{ color: 'hsl(150 90% 80%)' }}
                      >
                        {idx + 1}. {q.question}
                      </p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {q.options.map((opt, oi) => (
                          <div
                            key={oi}
                            className="text-[11px] font-mono px-2.5 py-1.5 rounded-md flex items-center gap-1.5"
                            style={
                              oi === q.correctAnswer
                                ? {
                                    border: '1px solid hsl(150 100% 50% / 0.4)',
                                    background: 'hsl(150 100% 50% / 0.08)',
                                    color: 'hsl(150 100% 70%)',
                                    fontWeight: 700,
                                  }
                                : {
                                    border: '1px solid hsl(150 50% 16%)',
                                    background: 'transparent',
                                    color: 'hsl(150 30% 48%)',
                                  }
                            }
                          >
                            {oi === q.correctAnswer && (
                              <CheckCircle2
                                className="w-3 h-3 shrink-0"
                                style={{ color: 'hsl(150 100% 55%)' }}
                              />
                            )}
                            <span className="font-bold mr-0.5">{String.fromCharCode(65 + oi)}.</span> {opt}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p
                  className="text-[11px] pt-3"
                  style={{ color: 'hsl(150 30% 45%)', fontFamily: 'JetBrains Mono, monospace' }}
                >
                  Savol qo'shilmagan.
                </p>
              )}

              {onComplete && !assignment.completed && (
                <button
                  onClick={onComplete}
                  className="w-full flex items-center justify-center gap-1.5 text-xs h-8 rounded-lg font-bold tracking-wider uppercase mt-1 transition-all"
                  style={{
                    background: 'hsl(150 100% 50% / 0.1)',
                    border: '1px solid hsl(150 100% 50% / 0.35)',
                    color: 'hsl(150 100% 65%)',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = 'hsl(150 100% 50% / 0.2)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 0 15px hsl(150 100% 50% / 0.2)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'hsl(150 100% 50% / 0.1)';
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  }}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Bajarildi deb belgilash
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
