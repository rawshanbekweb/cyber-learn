import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import type { AssignmentQuestion } from "@/store/useAppStore";
import { translateLevel } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Plus, Trash2, CheckCircle2, Clock, BookOpen,
  ChevronDown, ChevronUp, HelpCircle, GraduationCap,
  ClipboardList, User, Users, Send, X, CircleDot,
} from "lucide-react";

// Assigning to "hamma o'quvchilar" creates one backend row per student with
// identical title/description/module/date — group those rows back into a
// single card so the list doesn't turn into one row per student.
type AssignmentGroup = {
  key: string;
  rep: ReturnType<typeof useAppStore.getState>["assignments"][number];
  members: ReturnType<typeof useAppStore.getState>["assignments"][number][];
};

function groupAssignments(list: ReturnType<typeof useAppStore.getState>["assignments"]): AssignmentGroup[] {
  const map = new Map<string, AssignmentGroup>();
  for (const a of list) {
    const key = [a.title, a.description ?? "", a.targetModuleId, a.assignmentType, a.dateAssigned].join("||");
    const existing = map.get(key);
    if (existing) {
      existing.members.push(a);
    } else {
      map.set(key, { key, rep: a, members: [a] });
    }
  }
  return Array.from(map.values());
}

export default function Assignments() {
  const { students, assignments, moduleProgress, addAssignment, completeAssignment, userRole, fetchStudents, fetchAssignments } = useAppStore();
  const { toast } = useToast();

  useEffect(() => {
    if (userRole !== "Teacher") return;
    fetchStudents();
    fetchAssignments();
  }, [userRole]);

  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  // 0 = "hamma o'quvchilar" (assign to everyone at once)
  const [selectedStudent, setSelectedStudent] = useState<number>(0);
  const [selectedModule, setSelectedModule] = useState<number>(1);
  const [questions, setQuestions] = useState<AssignmentQuestion[]>([]);
  const [expandedAssignment, setExpandedAssignment] = useState<number | null>(null);
  const [filterStudent, setFilterStudent] = useState<number | "all">("all");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    const res = await addAssignment(taskTitle, selectedStudent, selectedModule, questions, taskDescription, "Amaliy");
    if (!res.success) {
      toast({ variant: "destructive", title: "❌ Topshiriq yuborilmadi", description: res.message });
      return;
    }
    const target = selectedStudent === 0
      ? `Hamma o'quvchilarga (${students.length} ta)`
      : "O'quvchiga";
    toast({
      title: "✅ Topshiriq yuborildi!",
      description: `${target} ${questions.length > 0 ? questions.length + " ta savol bilan " : ""}topshiriq muvaffaqiyatli biriktirildi.`,
    });
    setTaskTitle("");
    setTaskDescription("");
    setQuestions([]);
    setSelectedStudent(0);
    setSelectedModule(1);
  };

  const pending = assignments.filter(a => !a.completed);
  const done = assignments.filter(a => a.completed);

  const filteredPending = pending.filter(a => filterStudent === "all" || a.studentId === filterStudent);
  const filteredDone = done.filter(a => filterStudent === "all" || a.studentId === filterStudent);

  const groupedPending = groupAssignments(filteredPending);
  const groupedDone = groupAssignments(filteredDone);

  const pageVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  if (userRole !== "Teacher") {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-zinc-500">
        <GraduationCap className="w-10 h-10 text-zinc-400" />
        <p className="text-sm font-medium">
          Bu sahifa faqat o'qituvchilar uchun.
        </p>
      </div>
    );
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={pageVariants} className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <div className="text-[10px] font-bold tracking-widest text-primary uppercase">&gt; TEACHER / TOPSHIRIQLAR BOSHQARUVI</div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Topshiriqlar Boshqaruvi
        </h1>
        <p className="text-xs text-zinc-500">
          O'quvchilarga vazifa yuklang, savollar qo'shing va natijalarni kuzating.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* ── LEFT: Assignment Creation Form ── */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-200 bg-white shadow-xs overflow-hidden">
            {/* Card Header */}
            <div className="px-6 py-4 flex items-center gap-3 bg-zinc-50/50 border-b border-zinc-200">
              <ClipboardList className="w-5 h-5 text-primary" />
              <div>
                <h3 className="text-sm font-bold text-zinc-900">
                  Yangi Topshiriq Yaratish
                </h3>
                <div className="text-[10px] text-zinc-500">
                  Topshiriq nomi, o'quvchi, modul va savollari
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Topshiriq nomi */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Topshiriq nomi *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: Kriptografiya asoslari bo'yicha test"
                    value={taskTitle}
                    onChange={e => setTaskTitle(e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Tavsif */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
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
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      O'quvchini tanlang *
                    </label>
                    <select
                      value={selectedStudent}
                      onChange={e => setSelectedStudent(Number(e.target.value))}
                      className="w-full"
                    >
                      <option value={0}>👥 Hamma o'quvchilar</option>
                      {students.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({translateLevel(s.level)})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Maqsadli modul *
                    </label>
                    <select
                      value={selectedModule}
                      onChange={e => setSelectedModule(Number(e.target.value))}
                      className="w-full"
                    >
                      {moduleProgress.map(m => (
                        <option key={m.id} value={m.id}>{m.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* ── QUESTIONS SECTION ── */}
                <div className="space-y-3 rounded-xl p-4 bg-zinc-50 border border-zinc-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-primary" />
                      <span className="text-xs font-bold text-zinc-800">
                        Topshiriq savollari
                      </span>
                      {questions.length > 0 && (
                        <span className="text-[9px] px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-primary font-semibold">
                          {questions.length} ta
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowQuestionForm(v => !v)}
                      className={`flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer ${
                        showQuestionForm
                          ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100/50'
                          : 'bg-indigo-50 border-indigo-100 text-primary hover:bg-indigo-100/50'
                      }`}
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
                          className="flex items-start justify-between gap-2 px-3 py-2.5 rounded-xl bg-white border border-zinc-200 shadow-2xs"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-zinc-800 truncate">
                              {idx + 1}. {q.question}
                            </div>
                            <div className="text-[10px] mt-0.5 text-zinc-500">
                              {q.options.length} variant · To'g'ri: {q.options[q.correctAnswer] || "—"}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(q.id)}
                            className="shrink-0 mt-0.5 text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
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
                        <div className="space-y-3 pt-3 mt-2 border-t border-zinc-200">
                          {/* Question text */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
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
                            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                              Javob variantlari (kamida 2 ta) *
                            </label>
                            {newOptions.map((opt, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setCorrectAnswer(i)}
                                  title="To'g'ri javob"
                                  className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
                                    correctAnswer === i
                                      ? 'border-primary bg-indigo-50 text-primary'
                                      : 'border-zinc-300 bg-white text-transparent'
                                  }`}
                                >
                                  {correctAnswer === i && (
                                    <CircleDot className="w-2.5 h-2.5 text-primary" />
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
                            <p className="text-[9px] text-zinc-400">
                              ● belgisini bosib to'g'ri javobni belgilang
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={handleAddQuestion}
                            className="w-full flex items-center justify-center gap-1.5 text-xs h-9 rounded-xl font-bold tracking-wider uppercase bg-primary text-white border border-primary hover:bg-primary/95 cursor-pointer shadow-xs transition-all"
                          >
                            <Plus className="w-3 h-3" /> Savolni qo'shish
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {questions.length === 0 && !showQuestionForm && (
                    <p className="text-[10px] text-center py-1 text-zinc-400">
                      Savol qo'shilmagan. Ixtiyoriy.
                    </p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-bold tracking-wider uppercase bg-primary text-white border border-primary hover:bg-primary/95 cursor-pointer shadow-sm active:translate-y-0.5 transition-all"
                >
                  <Send className="w-4 h-4" /> Topshiriqni yuborish
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Assignment List ── */}
        <div className="space-y-6">
          {/* Student Filter Dropdown */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-zinc-700">Topshiriqlarni filtrlash:</span>
            </div>
            <select
              value={filterStudent}
              onChange={e => setFilterStudent(e.target.value === "all" ? "all" : Number(e.target.value))}
              className="text-xs px-3 py-1.5 rounded-lg border border-zinc-200 bg-white outline-none w-48 font-medium text-zinc-700"
            >
              <option value="all">Hamma o'quvchilar</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Pending */}
          <div className="rounded-2xl border border-zinc-200 bg-white shadow-xs overflow-hidden">
            <div className="px-5 py-4 flex items-center gap-2.5 bg-zinc-50/50 border-b border-zinc-200">
              <Clock className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-bold text-zinc-900 flex-1">
                Kutilayotgan topshiriqlar
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-semibold">
                {groupedPending.length} ta
              </span>
            </div>
            <div className="p-4 space-y-3">
              {groupedPending.length === 0 ? (
                <div className="text-center py-8 text-xs text-zinc-400">
                  Kutilayotgan topshiriqlar yo'q.
                </div>
              ) : (
                groupedPending.map(group => (
                  <AssignmentCard
                      key={group.key}
                      group={group}
                      expanded={expandedAssignment === group.rep.id}
                      onToggle={() => setExpandedAssignment(expandedAssignment === group.rep.id ? null : group.rep.id)}
                      onCompleteMember={async (id, label) => {
                        const res = await completeAssignment(id);
                        if (res.success) {
                          toast({ title: "Topshiriq bajarildi ✓", description: `"${group.rep.title}" (${label}) yakunlandi.` });
                        } else {
                          toast({ variant: "destructive", title: "Xatolik", description: res.message });
                        }
                      }}
                    />
                ))
              )}
            </div>
          </div>

          {/* Completed */}
          {groupedDone.length > 0 && (
            <div className="rounded-2xl border border-zinc-200 bg-white shadow-xs overflow-hidden">
              <div className="px-5 py-4 flex items-center gap-2.5 bg-zinc-50/50 border-b border-zinc-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-bold text-zinc-900 flex-1">
                  Bajarilgan topshiriqlar
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold">
                  {groupedDone.length} ta
                </span>
              </div>
              <div className="p-4 space-y-3">
                {groupedDone.map(group => (
                  <AssignmentCard
                    key={group.key}
                    group={group}
                    expanded={expandedAssignment === group.rep.id}
                    onToggle={() => setExpandedAssignment(expandedAssignment === group.rep.id ? null : group.rep.id)}
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
  group,
  expanded,
  onToggle,
  onCompleteMember,
}: {
  group: AssignmentGroup;
  expanded: boolean;
  onToggle: () => void;
  onCompleteMember?: (id: number, label: string) => void;
}) {
  const { rep, members } = group;
  const isBatch = members.length > 1;

  return (
    <div
      className={`rounded-xl border transition-all duration-200 overflow-hidden ${
        rep.completed
          ? "bg-emerald-50/10 border-emerald-100/70"
          : "bg-white border-zinc-200 shadow-2xs hover:shadow-xs"
      }`}
    >
      {/* Card header row */}
      <div
        className="flex items-start justify-between gap-3 p-3.5 cursor-pointer transition-colors bg-white hover:bg-zinc-50/50"
        onClick={onToggle}
      >
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-bold text-xs ${rep.completed ? "text-zinc-500" : "text-zinc-800"}`}>
              {rep.title}
            </span>
            {rep.completed ? (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold uppercase tracking-wider">
                Bajarildi
              </span>
            ) : (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-50 border border-amber-100 text-amber-700 font-bold uppercase tracking-wider">
                Kutilmoqda
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-[10px] text-zinc-400 flex-wrap">
            {isBatch ? (
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-zinc-300" /> Hamma o'quvchilar ({members.length} ta)
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-zinc-300" /> {rep.studentName}
              </span>
            )}
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-zinc-300" /> Modul {rep.targetModuleId}
            </span>
            <span>{rep.dateAssigned}</span>
            {(rep.questions ?? []).length > 0 && (
              <span className="flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-zinc-300" /> {rep.questions.length} savol
              </span>
            )}
          </div>
        </div>
        <div className="shrink-0 mt-0.5 text-zinc-400 hover:text-zinc-600">
          {expanded
            ? <ChevronUp className="w-4 h-4 text-primary" />
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
            <div className="px-4 pb-4 space-y-3 border-t border-zinc-100 bg-zinc-50/30">
              {rep.description && (
                <p className="text-xs pt-3 text-zinc-500 leading-relaxed">
                  {rep.description}
                </p>
              )}

              {(rep.questions ?? []).length > 0 ? (
                <div className="space-y-3 pt-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mt-2">
                    Savollar
                  </div>
                  {(rep.questions ?? []).map((q, idx) => (
                    <div
                      key={q.id}
                      className="rounded-xl p-3.5 space-y-2 bg-white border border-zinc-200 shadow-2xs"
                    >
                      <p className="text-xs font-bold text-zinc-800">
                        {idx + 1}. {q.question}
                      </p>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {q.options.map((opt, oi) => (
                          <div
                            key={oi}
                            className={`text-[10px] px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 ${
                              oi === q.correctAnswer
                                ? "border-emerald-200 bg-emerald-50/50 text-emerald-700 font-bold"
                                : "border-zinc-200 bg-zinc-50 text-zinc-500"
                            }`}
                          >
                            {oi === q.correctAnswer && (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            )}
                            <span className="font-bold mr-0.5">{String.fromCharCode(65 + oi)}.</span> {opt}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] pt-3 text-zinc-400">
                  Savol qo'shilmagan.
                </p>
              )}

              {onCompleteMember && !rep.completed && (
                isBatch ? (
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      O'quvchilar
                    </div>
                    {members.map(m => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-white border border-zinc-200"
                      >
                        <span className="text-xs font-semibold text-zinc-700 truncate">{m.studentName}</span>
                        <button
                          onClick={() => onCompleteMember(m.id, m.studentName)}
                          className="shrink-0 flex items-center gap-1 text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wider bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-all cursor-pointer"
                        >
                          <CheckCircle2 className="w-3 h-3" /> Bajarildi
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <button
                    onClick={() => onCompleteMember(rep.id, rep.studentName)}
                    className="w-full flex items-center justify-center gap-1.5 text-xs h-8.5 rounded-lg font-bold tracking-wider uppercase mt-1 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Bajarildi deb belgilash
                  </button>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
