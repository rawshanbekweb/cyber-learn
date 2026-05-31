import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import type { AssignmentQuestion } from "@/store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

  // Form state
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<number>(students[0]?.id ?? 1);
  const [selectedModule, setSelectedModule] = useState<number>(1);
  const [questions, setQuestions] = useState<AssignmentQuestion[]>([]);
  const [expandedAssignment, setExpandedAssignment] = useState<number | null>(null);

  // New question draft state
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
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
        <GraduationCap className="w-10 h-10" />
        <p className="text-sm font-mono">Bu sahifa faqat o'qituvchilar uchun.</p>
      </div>
    );
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={pageVariants} className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-black font-mono">Topshiriqlar Boshqaruvi</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          O'quvchilarga vazifa yukla, savol qo'sh va natijalarni kuzat.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* ── LEFT: Assignment Creation Form ── */}
        <div className="space-y-6">
          <Card className="border-border/60 bg-white shadow-sm">
            <CardHeader className="border-b border-border/40">
              <CardTitle className="text-base font-bold font-mono flex items-center gap-2">
                <ClipboardList className="w-4 h-4" /> Yangi Topshiriq Yaratish
              </CardTitle>
              <CardDescription>Topshiriq nomi, o'quvchi, modul va savollari</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Topshiriq nomi */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold font-mono text-muted-foreground uppercase tracking-wider">
                    Topshiriq nomi *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: Kriptografiya asoslari bo'yicha test"
                    value={taskTitle}
                    onChange={e => setTaskTitle(e.target.value)}
                    className="w-full text-sm border border-border/80 px-3 py-2.5 rounded-lg bg-[#f8f9fa] text-black outline-none focus:border-black transition font-sans"
                  />
                </div>

                {/* Tavsif */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold font-mono text-muted-foreground uppercase tracking-wider">
                    Tavsif (ixtiyoriy)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Topshiriq haqida qisqacha izoh..."
                    value={taskDescription}
                    onChange={e => setTaskDescription(e.target.value)}
                    className="w-full text-sm border border-border/80 px-3 py-2 rounded-lg bg-[#f8f9fa] text-black outline-none focus:border-black transition font-sans resize-none"
                  />
                </div>

                {/* O'quvchi va Modul */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold font-mono text-muted-foreground uppercase tracking-wider">
                      O'quvchini tanlang *
                    </label>
                    <select
                      value={selectedStudent}
                      onChange={e => setSelectedStudent(Number(e.target.value))}
                      className="w-full text-sm border border-border/80 px-3 py-2.5 rounded-lg bg-[#f8f9fa] text-black outline-none focus:border-black transition font-mono"
                    >
                      {students.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.level})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold font-mono text-muted-foreground uppercase tracking-wider">
                      Maqsadli modul *
                    </label>
                    <select
                      value={selectedModule}
                      onChange={e => setSelectedModule(Number(e.target.value))}
                      className="w-full text-sm border border-border/80 px-3 py-2.5 rounded-lg bg-[#f8f9fa] text-black outline-none focus:border-black transition font-mono"
                    >
                      {moduleProgress.map(m => (
                        <option key={m.id} value={m.id}>{m.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* ── QUESTIONS SECTION ── */}
                <div className="space-y-3 border border-border/50 rounded-xl p-4 bg-[#f8f9fa]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-black" />
                      <span className="text-sm font-bold font-mono text-black">
                        Topshiriq savollari
                      </span>
                      {questions.length > 0 && (
                        <Badge variant="outline" className="font-mono text-[10px] border-black bg-black text-white">
                          {questions.length} ta
                        </Badge>
                      )}
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setShowQuestionForm(v => !v)}
                      className="text-[11px] h-7 font-mono border-black/40 hover:border-black"
                    >
                      {showQuestionForm ? <X className="w-3 h-3 mr-1" /> : <Plus className="w-3 h-3 mr-1" />}
                      {showQuestionForm ? "Bekor qilish" : "Savol qo'shish"}
                    </Button>
                  </div>

                  {/* Existing questions list */}
                  {questions.length > 0 && (
                    <div className="space-y-2">
                      {questions.map((q, idx) => (
                        <div key={q.id} className="flex items-start justify-between gap-2 bg-white rounded-lg border border-border/40 px-3 py-2.5">
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-black truncate">
                              {idx + 1}. {q.question}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                              {q.options.length} variant · To'g'ri: {q.options[q.correctAnswer] || "—"}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(q.id)}
                            className="text-muted-foreground hover:text-red-500 transition-colors shrink-0 mt-0.5"
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
                        <div className="space-y-3 pt-2 border-t border-border/40 mt-2">
                          {/* Question text */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold font-mono text-muted-foreground uppercase">
                              Savol matni *
                            </label>
                            <input
                              type="text"
                              placeholder="Masalan: SSL nima uchun ishlatiladi?"
                              value={newQuestion}
                              onChange={e => setNewQuestion(e.target.value)}
                              className="w-full text-xs border border-border/80 px-3 py-2 rounded-lg bg-white text-black outline-none focus:border-black transition font-sans"
                            />
                          </div>

                          {/* Options */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold font-mono text-muted-foreground uppercase">
                              Javob variantlari (kamida 2 ta) *
                            </label>
                            {newOptions.map((opt, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setCorrectAnswer(i)}
                                  title="To'g'ri javob"
                                  className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                    correctAnswer === i
                                      ? "border-black bg-black"
                                      : "border-border/60 hover:border-black/40"
                                  }`}
                                >
                                  {correctAnswer === i && <CircleDot className="w-2.5 h-2.5 text-white" />}
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
                                  className="flex-1 text-xs border border-border/80 px-3 py-1.5 rounded-lg bg-white text-black outline-none focus:border-black transition font-sans"
                                />
                              </div>
                            ))}
                            <p className="text-[10px] text-muted-foreground font-mono">
                              ● belgisini bosib to'g'ri javobni belgilang
                            </p>
                          </div>

                          <Button
                            type="button"
                            size="sm"
                            onClick={handleAddQuestion}
                            className="w-full bg-black text-white hover:bg-black/85 font-mono text-xs h-8"
                          >
                            <Plus className="w-3 h-3 mr-1.5" /> Savolni qo'shish
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {questions.length === 0 && !showQuestionForm && (
                    <p className="text-[11px] text-muted-foreground font-mono text-center py-1">
                      Savol qo'shilmagan. Ixtiyoriy.
                    </p>
                  )}
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  className="w-full bg-black text-white hover:bg-black/90 font-mono font-bold text-sm py-5"
                >
                  <Send className="w-4 h-4 mr-2" /> Topshiriqni yuborish
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* ── RIGHT: Assignment List ── */}
        <div className="space-y-6">
          {/* Pending */}
          <Card className="border-border/60 bg-white shadow-sm">
            <CardHeader className="border-b border-border/40">
              <CardTitle className="text-base font-bold font-mono flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                Kutilayotgan topshiriqlar
                <Badge variant="outline" className="font-mono text-[10px] ml-auto border-yellow-400 text-yellow-700 bg-yellow-50">
                  {pending.length} ta
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {pending.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground font-mono">
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
            </CardContent>
          </Card>

          {/* Completed */}
          {done.length > 0 && (
            <Card className="border-border/60 bg-white shadow-sm">
              <CardHeader className="border-b border-border/40">
                <CardTitle className="text-base font-bold font-mono flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Bajarilgan topshiriqlar
                  <Badge variant="outline" className="font-mono text-[10px] ml-auto border-green-400 text-green-700 bg-green-50">
                    {done.length} ta
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {done.map(as => (
                  <AssignmentCard
                    key={as.id}
                    assignment={as}
                    expanded={expandedAssignment === as.id}
                    onToggle={() => setExpandedAssignment(expandedAssignment === as.id ? null : as.id)}
                  />
                ))}
              </CardContent>
            </Card>
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
    <div className={`border rounded-xl overflow-hidden transition-all ${
      assignment.completed ? "border-green-200 bg-green-50/30" : "border-border/50 bg-white"
    }`}>
      {/* Card header row */}
      <div
        className="flex items-start justify-between gap-3 p-3.5 cursor-pointer hover:bg-[#f8f9fa] transition-colors"
        onClick={onToggle}
      >
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-xs text-black">{assignment.title}</span>
            {assignment.completed ? (
              <Badge variant="outline" className="font-mono text-[9px] border-green-500 text-green-700 bg-green-100">
                Bajarildi
              </Badge>
            ) : (
              <Badge variant="outline" className="font-mono text-[9px] border-yellow-400 text-yellow-700 bg-yellow-50">
                Kutilmoqda
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-mono">
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
        <div className="shrink-0 text-muted-foreground mt-0.5">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
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
            <div className="px-4 pb-4 space-y-3 border-t border-border/30">
              {assignment.description && (
                <p className="text-xs text-muted-foreground pt-3">{assignment.description}</p>
              )}

              {(assignment.questions ?? []).length > 0 ? (
                <div className="space-y-3 pt-2">
                  <div className="text-[11px] font-bold font-mono text-muted-foreground uppercase tracking-wider">
                    Savollar
                  </div>
                  {(assignment.questions ?? []).map((q, idx) => (
                    <div key={q.id} className="bg-[#f8f9fa] rounded-lg p-3 border border-border/30 space-y-2">
                      <p className="text-xs font-bold text-black">
                        {idx + 1}. {q.question}
                      </p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {q.options.map((opt, oi) => (
                          <div
                            key={oi}
                            className={`text-[11px] font-mono px-2.5 py-1.5 rounded-md border flex items-center gap-1.5 ${
                              oi === q.correctAnswer
                                ? "border-green-400 bg-green-50 text-green-800 font-bold"
                                : "border-border/40 text-muted-foreground"
                            }`}
                          >
                            {oi === q.correctAnswer && <CheckCircle2 className="w-3 h-3 shrink-0" />}
                            <span className="font-bold mr-0.5">{String.fromCharCode(65 + oi)}.</span> {opt}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-muted-foreground font-mono pt-3">Savol qo'shilmagan.</p>
              )}

              {onComplete && !assignment.completed && (
                <Button
                  size="sm"
                  onClick={onComplete}
                  className="w-full bg-black text-white hover:bg-black/90 font-mono text-xs h-8 mt-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Bajarildi deb belgilash
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
