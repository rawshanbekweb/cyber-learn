import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import {
  ShieldCheck, BookOpen, BarChart3, Users, Star,
  ArrowRightCircle, Cpu, Activity, Lock, Unlock, RefreshCw
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { translateLevel } from "@/lib/utils";

function DashboardCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs hover:shadow-sm transition-all duration-200 ${className}`}
    >
      {children}
    </div>
  );
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const {
    userRole,
    hasCompletedInitialTest,
    currentLevel,
    readinessScore,
    moduleProgress,
    resetProgress,
    assignments,
    students
  } = useAppStore();

  const pageVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  const getRecommendation = () => {
    if (!hasCompletedInitialTest) return { title: "Dastlabki diagnostika testi", reason: "Fuzzy hisoblash asosida boshlang'ich o'quv yo'lingiz aniqlanadi.", path: "/assessment" };
    if (currentLevel === "Beginner") return { title: "Kiberxavfsizlik asoslari", reason: "Fuzzy hisoblash asosida asoslarni mustahkamlang.", path: "/module/1" };
    if (currentLevel === "Intermediate") return { title: "Tarmoq xavflari", reason: "Fuzzy hisoblash asosida qiyinchilikni oshiring.", path: "/module/2" };
    const cryptoModule = moduleProgress.find(m => m.id === 3);
    if (cryptoModule && !cryptoModule.completed) return { title: "Kriptografiya", reason: "Fuzzy hisoblash asosida ilg'or kripto va tizim himoyasiga o'ting.", path: "/module/3" };
    return { title: "Tizim himoyasi", reason: "Fuzzy hisoblash asosida ilg'or tizim himoyasi moduliga o'ting.", path: "/module/4" };
  };

  const recommendation = getRecommendation();
  const completedCount = moduleProgress.filter(m => m.completed).length;
  const completionPercent = Math.max(
    hasCompletedInitialTest ? 15 : 0,
    Math.round((completedCount / moduleProgress.length) * 100)
  );

  return (
    <motion.div initial="hidden" animate="visible" variants={pageVariants} className="space-y-8">
      {userRole === "Student" ? (
        /* ── STUDENT VIEW ─────────────────────────────────────── */
        <div className="space-y-6">

          {/* Header */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold tracking-widest text-primary uppercase">
              Faol sessiya / O'quvchi paneli
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
              Moslashuvchan O'quv Paneli
            </h1>
            <p className="text-xs text-zinc-500">
              AI asosidagi kiberxavfsizlik ta'lim tizimi — ANFIS / Fuzzy Logic
            </p>
          </div>

          {/* ── Top 3 metric cards ── */}
          <div className="grid sm:grid-cols-3 gap-4">
            {/* Progress card */}
            <DashboardCard>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Umumiy Progress
                  </span>
                  <Activity className="w-4 h-4 text-primary" />
                </div>
                <div className="text-3xl font-bold text-zinc-900">
                  {completionPercent}%
                </div>
                {/* Progress bar */}
                <div className="h-2 rounded-full bg-zinc-100 border border-zinc-200/50 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-700"
                    style={{ width: `${completionPercent}%` }}
                  />
                </div>
              </div>
            </DashboardCard>

            {/* Fuzzy score card */}
            <DashboardCard>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Fuzzy Bahosi
                  </span>
                  <Cpu className="w-4 h-4 text-primary" />
                </div>
                <div className="text-3xl font-bold text-zinc-900">
                  {readinessScore.toFixed(2)}
                </div>
                <div className="text-[10px] font-semibold text-zinc-500">
                  Daraja: {translateLevel(currentLevel)}
                </div>
              </div>
            </DashboardCard>

            {/* Modules done */}
            <DashboardCard>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Tugatilgan
                  </span>
                  <ShieldCheck className="w-4 h-4 text-primary" />
                </div>
                <div className="text-3xl font-bold text-zinc-900">
                  {completedCount}/{moduleProgress.length}
                </div>
                <div className="text-[10px] font-semibold text-zinc-500">
                  Modullar bajarildi
                </div>
              </div>
            </DashboardCard>
          </div>

          {/* ── Next Recommendation ── */}
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold tracking-wider uppercase text-primary">
                    ANFIS Tavsiyasi
                  </span>
                  <span className="text-[9px] tracking-wider font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                    AKTIV
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-zinc-900">
                    {recommendation.title}
                  </h3>
                  <p className="text-xs text-zinc-600">
                    {recommendation.reason}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setLocation(recommendation.path)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-primary hover:bg-primary/95 transition-all duration-150 shrink-0 shadow-sm"
              >
                <ArrowRightCircle className="w-4 h-4" />
                Modulni boshlash
              </button>
            </div>
          </div>

          {/* ── Module Grid ── */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 py-1">
              <div className="h-px flex-1 bg-zinc-200/60" />
              <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-400 px-2">
                O'quv modullari
              </span>
              <div className="h-px flex-1 bg-zinc-200/60" />
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {moduleProgress.map((mod) => (
                <div
                  key={mod.id}
                  onClick={() => mod.unlocked && setLocation(`/module/${mod.id}`)}
                  className={`rounded-2xl border bg-white p-4 space-y-4 transition-all duration-200 relative overflow-hidden ${
                    mod.unlocked
                      ? "border-zinc-200 shadow-2xs hover:shadow-sm cursor-pointer hover:-translate-y-0.5"
                      : "border-zinc-100 opacity-60 cursor-not-allowed"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                        mod.unlocked 
                          ? "bg-indigo-50 border-indigo-100/50 text-primary" 
                          : "bg-zinc-50 border-zinc-100 text-zinc-400"
                      }`}
                    >
                      {mod.unlocked
                        ? <Unlock className="w-4 h-4" />
                        : <Lock className="w-4 h-4" />
                      }
                    </div>

                    {mod.completed ? (
                      <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 uppercase">
                        Tugadi
                      </span>
                    ) : mod.unlocked ? (
                      <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-primary uppercase">
                        Aktiv
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-zinc-50 border border-zinc-100 text-zinc-400 uppercase">
                        Yopiq
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="text-[9px] font-bold text-zinc-400 tracking-wider mb-0.5">
                      MOD-{mod.id.toString().padStart(2, "0")}
                    </div>
                    <h4 className="text-sm font-bold text-zinc-800 leading-snug">
                      {mod.title}
                    </h4>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Reset button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={resetProgress}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-500 hover:text-red-600 bg-red-50/50 hover:bg-red-50 border border-red-100 rounded-lg transition-all duration-150"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Tizim holatini tiklash
            </button>
          </div>
        </div>
      ) : (
        /* ── TEACHER VIEW ──────────────────────────────────────── */
        <div className="space-y-6">

          {/* Header */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold tracking-widest text-primary uppercase">
              Admin sessiya / O'qituvchi paneli
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
              O'qituvchi Boshqaruv Paneli
            </h1>
            <p className="text-xs text-zinc-500">
              Guruhni boshqarish va Fuzzy AI parametrlarini nazorat qilish.
            </p>
          </div>

          {/* ── Stats Grid ── */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Jami O'quvchilar", value: `${students.length} ta`, icon: Users },
              {
                label: "Fuzzy Bahosi (O'rtacha)",
                value: `${students.length > 0 ? (students.reduce((a, s) => a + s.fuzzyScore, 0) / students.length * 100).toFixed(0) : 0}%`,
                icon: Star
              },
              { label: "Faol Topshiriqlar", value: `${assignments.length} ta`, icon: BookOpen },
              { label: "AI Tizim Holati", value: "FAOL", icon: ShieldCheck, valueColor: "text-emerald-600" },
            ].map(({ label, value, icon: Icon, valueColor }) => (
              <DashboardCard key={label}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      {label}
                    </span>
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className={`text-2xl font-bold ${valueColor ?? "text-zinc-900"}`}>
                    {value}
                  </div>
                </div>
              </DashboardCard>
            ))}
          </div>

          {/* ── Quick Actions ── */}
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                title: "Fuzzy AI Sozlash (ANFIS)",
                desc: "IF-THEN qoidalari va a'zolik funksiyalarini boshqarish",
                path: "/ai-engine",
                icon: Cpu,
              },
              {
                title: "Guruh Analitikasi",
                desc: "O'quvchilar ro'yxati, diagnostic natijalar va topshiriqlar",
                path: "/analytics",
                icon: BarChart3,
              },
            ].map(({ title, desc, path, icon: Icon }) => (
              <div
                key={path}
                onClick={() => setLocation(path)}
                className="rounded-2xl border border-zinc-200 bg-white p-5 cursor-pointer hover:shadow-sm hover:border-zinc-300 transition-all duration-150 flex items-center justify-between gap-4 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-primary" />
                    <h4 className="font-bold text-sm tracking-tight text-zinc-800">
                      {title}
                    </h4>
                  </div>
                  <p className="text-xs text-zinc-500">
                    {desc}
                  </p>
                </div>
                <ArrowRightCircle className="w-5 h-5 text-zinc-400 group-hover:text-primary transition-colors duration-150" />
              </div>
            ))}
          </div>

          {/* ── Assignments ── */}
          <div className="rounded-2xl border border-zinc-200 bg-white shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="font-bold text-sm text-zinc-800">
                  Faol O'quv Vazifalari
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600">
                {assignments.length} ta
              </span>
            </div>

            <div className="p-5 space-y-2.5">
              {assignments.length === 0 ? (
                <div className="text-xs text-zinc-400 text-center py-8">
                  Faol topshiriqlar mavjud emas.
                </div>
              ) : (
                assignments.map(as => (
                  <div
                    key={as.id}
                    className="flex justify-between items-center p-3.5 rounded-xl border border-zinc-100 bg-zinc-50/50"
                  >
                    <div>
                      <span className="text-xs font-bold text-zinc-800">
                        {as.title}
                      </span>
                      <div className="text-[10px] text-zinc-500 mt-0.5">
                        O'quvchi: {as.studentName} | {as.dateAssigned}
                      </div>
                    </div>
                    {as.completed ? (
                      <span className="text-[9px] font-bold tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 uppercase">
                        Bajarildi
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold tracking-wider px-2.5 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-700 uppercase">
                        Kutilmoqda
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
