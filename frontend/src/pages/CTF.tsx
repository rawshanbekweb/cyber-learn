import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Flag, Trophy, Sparkles, Plus, Trash2, X, KeyRound } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { CTFChallengeCard, ctfDifficultyColors, type CTFChallengeData } from "@/components/CTFChallengeCard";

const pageVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

// ─────────────────────────────────────────────
// TEACHER: CTF challenge boshqaruvi
// ─────────────────────────────────────────────
function TeacherView() {
  const { token, moduleProgress } = useAppStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: challenges, isLoading } = useQuery({
    queryKey: ["ctf-all"],
    queryFn: () => api.get<CTFChallengeData[]>("/api/ctf", token),
  });

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [moduleId, setModuleId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<"Oson" | "O'rta" | "Qiyin">("Oson");
  const [points, setPoints] = useState(50);
  const [hint, setHint] = useState("");
  const [flag, setFlag] = useState("");

  const resetForm = () => {
    setModuleId(""); setTitle(""); setDescription("");
    setDifficulty("Oson"); setPoints(50); setHint(""); setFlag("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleId || !title.trim() || !flag.trim()) return;

    setSubmitting(true);
    try {
      await api.post("/api/ctf", {
        moduleId: Number(moduleId),
        title: title.trim(),
        description: description.trim(),
        difficulty,
        points,
        hint: hint.trim(),
        flag: flag.trim(),
      }, token);

      await queryClient.invalidateQueries({ queryKey: ["ctf-all"] });
      toast({ title: "✅ Challenge qo'shildi!", description: `"${title}" muvaffaqiyatli yaratildi.` });
      resetForm();
      setShowForm(false);
    } catch (err) {
      toast({ variant: "destructive", title: "❌ Challenge saqlanmadi", description: err instanceof Error ? err.message : "Xatolik yuz berdi" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    setDeletingId(id);
    try {
      await api.del(`/api/ctf/${id}`, token);
      await queryClient.invalidateQueries({ queryKey: ["ctf-all"] });
      toast({ title: "Challenge o'chirildi", description: `"${title}" o'chirildi.` });
    } catch (err) {
      toast({ variant: "destructive", title: "Xatolik", description: err instanceof Error ? err.message : "O'chirishda xatolik" });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-[10px] font-bold tracking-widest text-primary uppercase">&gt; TEACHER / CTF BOSHQARUVI</div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            CTF Challenge Boshqaruvi
          </h1>
          <p className="text-xs text-zinc-500">
            Modullarga oid flag-capture challenge'lar yarating va boshqaring.
          </p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all duration-150 shadow-sm border cursor-pointer ${
            showForm
              ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100/50'
              : 'bg-primary text-white border-primary hover:bg-primary/95'
          }`}
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Bekor qilish" : "Yangi Challenge"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { icon: Flag, label: "Jami Challenge", value: challenges?.length ?? 0 },
          { icon: Trophy, label: "Jami mumkin XP", value: (challenges ?? []).reduce((sum, c) => sum + c.points, 0) },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-2xl p-4 flex items-center gap-3 bg-white border border-zinc-200 shadow-xs">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-primary/10 border border-primary/20">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-zinc-950">{value}</div>
              <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-white border border-zinc-200 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="sticky top-0 px-6 py-4 flex items-center justify-between bg-white/95 backdrop-blur-md border-b border-zinc-100 z-10">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold tracking-wider uppercase text-zinc-800">
                    Yangi CTF Challenge
                  </span>
                </div>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-1.5 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Modul *
                    </label>
                    <select required value={moduleId} onChange={e => setModuleId(e.target.value)} className="w-full">
                      <option value="" disabled>Modulni tanlang</option>
                      {moduleProgress.map(m => (
                        <option key={m.id} value={m.id}>{m.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Sarlavha *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Masalan: Yashirin xabar"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Qiyinchilik
                      </label>
                      <select value={difficulty} onChange={e => setDifficulty(e.target.value as any)} className="w-full">
                        {(["Oson", "O'rta", "Qiyin"] as const).map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        XP mukofoti
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={points}
                        onChange={e => setPoints(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Tavsif (topshiriq matni)
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Challenge tavsifi, kodlangan/shifrlangan qator va h.k."
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      className="w-full text-sm px-3 py-2 rounded-lg outline-none transition resize-none border border-zinc-200 focus:border-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Maslahat (ixtiyoriy)
                    </label>
                    <input
                      type="text"
                      placeholder="O'quvchiga yordam beruvchi maslahat"
                      value={hint}
                      onChange={e => setHint(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      To'g'ri Flag *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="cyberai{...}"
                      value={flag}
                      onChange={e => setFlag(e.target.value)}
                      className="w-full font-mono"
                    />
                    <p className="text-[10px] text-zinc-400">
                      Flag serverda hash qilinib saqlanadi va hech qachon ochiq ko'rinishda qaytarilmaydi — yaratgach uni qayta ko'ra olmaysiz.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 rounded-xl bg-primary text-white text-xs font-bold tracking-wider uppercase hover:bg-primary/95 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? "Saqlanmoqda..." : "Challenge yaratish"}
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Challenge list */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-zinc-200 bg-white h-28 animate-pulse" />
          ))}
        </div>
      ) : (challenges ?? []).length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-12 flex flex-col items-center gap-3 shadow-2xs">
          <Flag className="w-10 h-10 text-zinc-300" />
          <p className="text-sm text-center text-zinc-500 font-medium">
            Hozircha challenge yo'q.<br />
            <span className="text-xs">"Yangi Challenge" tugmasi orqali birinchisini yarating.</span>
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {(challenges ?? []).map(ch => (
            <div key={ch.id} className="rounded-2xl border border-zinc-200 bg-white p-4 space-y-2 shadow-xs">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-sm text-zinc-900">{ch.title}</span>
                  {ch.moduleTitle && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold border border-primary/30 text-primary bg-primary/5">
                      {ch.moduleTitle}
                    </span>
                  )}
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${ctfDifficultyColors[ch.difficulty]}`}>
                    {ch.difficulty}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold border border-primary/30 text-primary bg-primary/5">
                    {ch.points} XP
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(ch.id, ch.title)}
                  disabled={deletingId === ch.id}
                  className="p-1.5 border border-zinc-200 hover:bg-red-50 rounded-lg text-zinc-400 hover:text-red-600 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                  title="O'chirish"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              {ch.description && (
                <p className="text-xs text-zinc-500 line-clamp-2">{ch.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// STUDENT: CTF challenge'larni yechish
// ─────────────────────────────────────────────
function StudentView() {
  const { token } = useAppStore();
  const [activeModule, setActiveModule] = useState<string>("Barchasi");

  const { data: challenges, isLoading } = useQuery({
    queryKey: ["ctf-all"],
    queryFn: () => api.get<CTFChallengeData[]>("/api/ctf", token),
  });

  const moduleTitles = useMemo(() => {
    const set = new Set<string>();
    for (const c of challenges ?? []) if (c.moduleTitle) set.add(c.moduleTitle);
    return Array.from(set);
  }, [challenges]);

  const filtered = useMemo(() => {
    if (activeModule === "Barchasi") return challenges ?? [];
    return (challenges ?? []).filter(c => c.moduleTitle === activeModule);
  }, [challenges, activeModule]);

  const solvedCount = (challenges ?? []).filter(c => c.solved).length;
  const earnedPoints = (challenges ?? []).filter(c => c.solved).reduce((sum, c) => sum + c.points, 0);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="text-[10px] font-bold tracking-widest text-primary uppercase">&gt; CYBERSECURITY / CTF CHALLENGE'LAR</div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          CTF Challenge'lar
        </h1>
        <p className="text-xs text-zinc-500">
          Har bir modul mavzusiga oid flag'larni toping va XP qo'lga kiriting.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Flag, label: "Jami Challenge", value: challenges?.length ?? 0 },
          { icon: Trophy, label: "Yechilgan", value: solvedCount },
          { icon: Sparkles, label: "Qo'lga kiritilgan XP", value: earnedPoints },
        ].map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="rounded-2xl p-4 flex items-center gap-3 bg-white border border-zinc-200 shadow-xs"
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-primary/10 border border-primary/20">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-zinc-950">{value}</div>
              <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Module filter */}
      {moduleTitles.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 shrink-0">
            Modul:
          </span>
          {["Barchasi", ...moduleTitles].map(m => {
            const isActive = activeModule === m;
            const count = m === "Barchasi" ? (challenges?.length ?? 0) : (challenges ?? []).filter(c => c.moduleTitle === m).length;
            return (
              <button
                key={m}
                onClick={() => setActiveModule(m)}
                className={`inline-flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-full font-semibold border transition-all cursor-pointer ${
                  isActive
                    ? "bg-indigo-50 border-primary text-primary shadow-2xs"
                    : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300"
                }`}
              >
                {m}
                <span className={`text-[9px] px-1.5 rounded-full font-bold ${isActive ? "bg-primary/10 text-primary" : "bg-zinc-100 text-zinc-500"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-zinc-200 bg-white h-40 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-12 flex flex-col items-center gap-3 shadow-2xs">
          <Flag className="w-10 h-10 text-zinc-300" />
          <p className="text-sm text-center text-zinc-500 font-medium">
            Hozircha challenge yo'q.<br />
            <span className="text-xs">Modullarni oching, yangi challenge'lar shu yerda paydo bo'ladi.</span>
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map(ch => (
            <CTFChallengeCard key={ch.id} challenge={ch} token={token} showModuleBadge />
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────
export default function CTF() {
  const { userRole } = useAppStore();

  return (
    <motion.div initial="hidden" animate="visible" variants={pageVariants}>
      {userRole === "Teacher" ? <TeacherView /> : <StudentView />}
    </motion.div>
  );
}
