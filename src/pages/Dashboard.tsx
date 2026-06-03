import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ShieldCheck, BookOpen, BarChart3, Users, Star,
  ArrowRightCircle, Cpu, Activity, Lock, Unlock, RefreshCw
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { translateLevel } from "@/lib/utils";

const neonGreen = "hsl(150 100% 55%)";
const neonGreenDim = "hsl(150 100% 50% / 0.15)";
const neonBorder = "1px solid hsl(150 60% 22%)";

function CyberCard({ children, className = "", glowing = false }: { children: React.ReactNode; className?: string; glowing?: boolean }) {
  return (
    <div
      className={`rounded-lg relative overflow-hidden ${className}`}
      style={{
        background: "hsl(220 15% 8%)",
        border: glowing ? "1px solid hsl(150 100% 50% / 0.45)" : neonBorder,
        boxShadow: glowing
          ? "0 0 20px hsl(150 100% 50% / 0.12), inset 0 0 20px hsl(150 100% 50% / 0.03)"
          : "0 0 10px hsl(150 100% 50% / 0.05)",
      }}
    >
      {/* Top glow line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: `linear-gradient(to right, transparent, ${glowing ? "hsl(150 100% 55% / 0.7)" : "hsl(150 100% 50% / 0.25)"}, transparent)`,
        }}
      />
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
            <div className="text-[9px] tracking-widest mb-1" style={{ color: "hsl(150 40% 50%)" }}>
              &gt; FAOL SESSIYA / O'QUVCHI PANELI
            </div>
            <h1
              className="text-2xl font-bold tracking-widest uppercase"
              style={{
                fontFamily: "Orbitron, monospace",
                color: neonGreen,
                textShadow: "0 0 20px hsl(150 100% 55% / 0.4)",
              }}
            >
              Moslashuvchan O'quv Paneli
            </h1>
            <p className="text-xs tracking-wider" style={{ color: "hsl(150 35% 50%)" }}>
              AI asosidagi kiberxavfsizlik ta'lim tizimi — ANFIS / Fuzzy Logic
            </p>
          </div>

          {/* ── Top 3 metric cards ── */}
          <div className="grid sm:grid-cols-3 gap-4">
            {/* Progress card */}
            <CyberCard glowing>
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] tracking-widest uppercase" style={{ color: "hsl(150 40% 55%)" }}>
                    Umumiy Progress
                  </span>
                  <Activity className="w-4 h-4" style={{ color: neonGreen }} />
                </div>
                <div
                  className="text-3xl font-bold"
                  style={{
                    fontFamily: "Orbitron, monospace",
                    color: neonGreen,
                    textShadow: "0 0 15px hsl(150 100% 55% / 0.5)",
                  }}
                >
                  {completionPercent}%
                </div>
                {/* Progress bar */}
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ background: "hsl(150 100% 50% / 0.1)", border: "1px solid hsl(150 100% 50% / 0.2)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${completionPercent}%`,
                      background: "linear-gradient(to right, hsl(150 100% 35%), hsl(150 100% 65%))",
                      boxShadow: "0 0 8px hsl(150 100% 55% / 0.7)",
                    }}
                  />
                </div>
              </div>
            </CyberCard>

            {/* Fuzzy score card */}
            <CyberCard glowing>
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] tracking-widest uppercase" style={{ color: "hsl(150 40% 55%)" }}>
                    Fuzzy Bahosi
                  </span>
                  <Cpu className="w-4 h-4" style={{ color: neonGreen }} />
                </div>
                <div
                  className="text-3xl font-bold"
                  style={{
                    fontFamily: "Orbitron, monospace",
                    color: neonGreen,
                    textShadow: "0 0 15px hsl(150 100% 55% / 0.5)",
                  }}
                >
                  {readinessScore.toFixed(2)}
                </div>
                <div className="text-[9px] tracking-wider" style={{ color: "hsl(150 40% 50%)" }}>
                  Daraja: {translateLevel(currentLevel)}
                </div>
              </div>
            </CyberCard>

            {/* Modules done */}
            <CyberCard glowing>
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] tracking-widest uppercase" style={{ color: "hsl(150 40% 55%)" }}>
                    Tugatilgan
                  </span>
                  <ShieldCheck className="w-4 h-4" style={{ color: neonGreen }} />
                </div>
                <div
                  className="text-3xl font-bold"
                  style={{
                    fontFamily: "Orbitron, monospace",
                    color: neonGreen,
                    textShadow: "0 0 15px hsl(150 100% 55% / 0.5)",
                  }}
                >
                  {completedCount}/{moduleProgress.length}
                </div>
                <div className="text-[9px] tracking-wider" style={{ color: "hsl(150 40% 50%)" }}>
                  Modullar bajarildi
                </div>
              </div>
            </CyberCard>
          </div>

          {/* ── Next Recommendation ── */}
          <CyberCard glowing>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4" style={{ color: neonGreen }} />
                <span className="text-[10px] tracking-widest uppercase font-bold" style={{ color: neonGreen }}>
                  ANFIS Tavsiyasi
                </span>
                <div
                  className="ml-auto text-[8px] tracking-widest px-2 py-0.5 rounded"
                  style={{
                    background: neonGreenDim,
                    border: "1px solid hsl(150 100% 50% / 0.3)",
                    color: "hsl(150 80% 65%)",
                  }}
                >
                  AKTIV
                </div>
              </div>

              <div className="space-y-1.5">
                <div
                  className="text-sm font-bold tracking-wider"
                  style={{
                    fontFamily: "Orbitron, monospace",
                    color: "hsl(150 90% 75%)",
                  }}
                >
                  {recommendation.title}
                </div>
                <div className="text-[10px] tracking-wider leading-relaxed" style={{ color: "hsl(150 35% 50%)" }}>
                  &gt; {recommendation.reason}
                </div>
              </div>

              <button
                onClick={() => setLocation(recommendation.path)}
                className="flex items-center gap-2 px-4 py-2 rounded text-[10px] font-bold tracking-widest uppercase transition-all duration-200"
                style={{
                  background: neonGreenDim,
                  border: "1px solid hsl(150 100% 50% / 0.5)",
                  color: neonGreen,
                  fontFamily: "JetBrains Mono, monospace",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = "hsl(150 100% 50% / 0.25)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px hsl(150 100% 50% / 0.3)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = neonGreenDim;
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }}
              >
                <ArrowRightCircle className="w-3.5 h-3.5" />
                Modulni boshlash
              </button>
            </div>
          </CyberCard>

          {/* ── Module Grid ── */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <div
                className="h-px flex-1"
                style={{ background: "linear-gradient(to right, hsl(150 100% 50% / 0.4), transparent)" }}
              />
              <span className="text-[9px] tracking-widest uppercase px-2" style={{ color: "hsl(150 40% 50%)" }}>
                O'quv modullari
              </span>
              <div
                className="h-px flex-1"
                style={{ background: "linear-gradient(to left, hsl(150 100% 50% / 0.4), transparent)" }}
              />
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {moduleProgress.map((mod) => (
                <div
                  key={mod.id}
                  onClick={() => mod.unlocked && setLocation(`/module/${mod.id}`)}
                  className="rounded-lg relative overflow-hidden transition-all duration-200"
                  style={{
                    background: "hsl(220 15% 8%)",
                    border: mod.completed
                      ? "1px solid hsl(150 100% 50% / 0.55)"
                      : mod.unlocked
                        ? "1px solid hsl(150 60% 22%)"
                        : "1px solid hsl(220 15% 15%)",
                    opacity: mod.unlocked ? 1 : 0.45,
                    cursor: mod.unlocked ? "pointer" : "not-allowed",
                    boxShadow: mod.completed ? "0 0 15px hsl(150 100% 50% / 0.1)" : "none",
                  }}
                  onMouseEnter={e => {
                    if (mod.unlocked) {
                      (e.currentTarget as HTMLElement).style.borderColor = "hsl(150 100% 50% / 0.55)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px hsl(150 100% 50% / 0.15)";
                    }
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = mod.completed
                      ? "hsl(150 100% 50% / 0.55)"
                      : mod.unlocked ? "hsl(150 60% 22%)" : "hsl(220 15% 15%)";
                    (e.currentTarget as HTMLElement).style.boxShadow = mod.completed ? "0 0 15px hsl(150 100% 50% / 0.1)" : "none";
                  }}
                >
                  {/* Top bar */}
                  <div
                    className="absolute top-0 left-0 right-0 h-px"
                    style={{
                      background: mod.completed
                        ? "linear-gradient(to right, transparent, hsl(150 100% 55% / 0.7), transparent)"
                        : "linear-gradient(to right, transparent, hsl(150 100% 50% / 0.2), transparent)",
                    }}
                  />

                  <div className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div
                        className="w-9 h-9 rounded flex items-center justify-center"
                        style={{
                          background: mod.unlocked ? neonGreenDim : "hsl(220 15% 12%)",
                          border: mod.unlocked ? "1px solid hsl(150 100% 50% / 0.35)" : "1px solid hsl(220 15% 20%)",
                        }}
                      >
                        {mod.unlocked
                          ? <Unlock className="w-4 h-4" style={{ color: neonGreen }} />
                          : <Lock className="w-4 h-4" style={{ color: "hsl(150 20% 40%)" }} />
                        }
                      </div>

                      {mod.completed ? (
                        <span
                          className="text-[8px] tracking-widest px-1.5 py-0.5 rounded uppercase"
                          style={{
                            background: "hsl(150 100% 50% / 0.12)",
                            border: "1px solid hsl(150 100% 50% / 0.45)",
                            color: neonGreen,
                          }}
                        >
                          ✓ Tugadi
                        </span>
                      ) : mod.unlocked ? (
                        <span
                          className="text-[8px] tracking-widest px-1.5 py-0.5 rounded uppercase"
                          style={{
                            background: "hsl(180 80% 50% / 0.1)",
                            border: "1px solid hsl(180 80% 50% / 0.35)",
                            color: "hsl(180 80% 60%)",
                          }}
                        >
                          Aktiv
                        </span>
                      ) : (
                        <span
                          className="text-[8px] tracking-widest px-1.5 py-0.5 rounded uppercase"
                          style={{
                            background: "hsl(220 15% 14%)",
                            border: "1px solid hsl(220 15% 20%)",
                            color: "hsl(150 20% 35%)",
                          }}
                        >
                          Yopiq
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="text-[8px] tracking-widest mb-0.5" style={{ color: "hsl(150 30% 40%)" }}>
                        MOD-{mod.id.toString().padStart(2, "0")}
                      </div>
                      <div
                        className="text-xs font-bold leading-snug"
                        style={{ color: mod.unlocked ? "hsl(150 80% 75%)" : "hsl(150 20% 40%)" }}
                      >
                        {mod.title}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Reset button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={resetProgress}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[9px] tracking-widest uppercase rounded transition-all duration-150"
              style={{
                background: "transparent",
                border: "1px solid hsl(0 70% 55% / 0.3)",
                color: "hsl(0 60% 55%)",
                fontFamily: "JetBrains Mono, monospace",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = "hsl(0 70% 55% / 0.08)";
                (e.currentTarget as HTMLElement).style.borderColor = "hsl(0 70% 55% / 0.6)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = "transparent";
                (e.currentTarget as HTMLElement).style.borderColor = "hsl(0 70% 55% / 0.3)";
              }}
            >
              <RefreshCw className="w-3 h-3" />
              Tizim holatini tiklash
            </button>
          </div>
        </div>
      ) : (
        /* ── TEACHER VIEW ──────────────────────────────────────── */
        <div className="space-y-6">

          {/* Header */}
          <div className="space-y-1">
            <div className="text-[9px] tracking-widest mb-1" style={{ color: "hsl(150 40% 50%)" }}>
              &gt; ADMIN SESSIYA / O'QITUVCHI PANELI
            </div>
            <h1
              className="text-2xl font-bold tracking-widest uppercase"
              style={{
                fontFamily: "Orbitron, monospace",
                color: neonGreen,
                textShadow: "0 0 20px hsl(150 100% 55% / 0.4)",
              }}
            >
              O'qituvchi Boshqaruv Paneli
            </h1>
            <p className="text-xs tracking-wider" style={{ color: "hsl(150 35% 50%)" }}>
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
              { label: "AI Tizim Holati", value: "FAOL", icon: ShieldCheck, valueColor: neonGreen },
            ].map(({ label, value, icon: Icon, valueColor }) => (
              <CyberCard key={label} glowing>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[8px] tracking-widest uppercase" style={{ color: "hsl(150 40% 50%)" }}>
                      {label}
                    </span>
                    <Icon className="w-4 h-4" style={{ color: neonGreen }} />
                  </div>
                  <div
                    className="text-2xl font-bold"
                    style={{
                      fontFamily: "Orbitron, monospace",
                      color: valueColor ?? "hsl(150 80% 75%)",
                      textShadow: valueColor ? "0 0 12px hsl(150 100% 55% / 0.5)" : "none",
                    }}
                  >
                    {value}
                  </div>
                </div>
              </CyberCard>
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
                className="rounded-lg relative overflow-hidden cursor-pointer transition-all duration-200 group"
                style={{
                  background: "hsl(220 15% 8%)",
                  border: "1px solid hsl(150 60% 20%)",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "hsl(150 100% 50% / 0.5)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 0 25px hsl(150 100% 50% / 0.12)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "hsl(150 60% 20%)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }}
              >
                <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(to right, transparent, hsl(150 100% 50% / 0.3), transparent)" }} />
                <div className="p-5 flex items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" style={{ color: neonGreen }} />
                      <h4
                        className="font-bold text-sm tracking-wider uppercase"
                        style={{ fontFamily: "Orbitron, monospace", color: "hsl(150 90% 75%)", fontSize: "0.7rem" }}
                      >
                        {title}
                      </h4>
                    </div>
                    <p className="text-[9px] tracking-wider leading-relaxed" style={{ color: "hsl(150 30% 48%)" }}>
                      {desc}
                    </p>
                  </div>
                  <ArrowRightCircle className="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:translate-x-1" style={{ color: neonGreen }} />
                </div>
              </div>
            ))}
          </div>

          {/* ── Assignments ── */}
          <CyberCard>
            <div
              className="px-5 py-3.5 flex items-center gap-2"
              style={{ borderBottom: "1px solid hsl(150 50% 16%)" }}
            >
              <BookOpen className="w-4 h-4" style={{ color: neonGreen }} />
              <span
                className="font-bold text-xs tracking-widest uppercase"
                style={{ fontFamily: "Orbitron, monospace", color: "hsl(150 90% 75%)" }}
              >
                Faol O'quv Vazifalari
              </span>
              <span
                className="ml-auto text-[8px] tracking-widest px-2 py-0.5 rounded"
                style={{
                  background: neonGreenDim,
                  border: "1px solid hsl(150 100% 50% / 0.3)",
                  color: "hsl(150 70% 65%)",
                }}
              >
                {assignments.length} ta
              </span>
            </div>

            <div className="p-5 space-y-2">
              {assignments.length === 0 ? (
                <div className="text-[10px] tracking-wider text-center py-6" style={{ color: "hsl(150 25% 40%)" }}>
                  &gt; Faol topshiriqlar mavjud emas.
                </div>
              ) : (
                assignments.map(as => (
                  <div
                    key={as.id}
                    className="flex justify-between items-center p-3 rounded"
                    style={{
                      background: "hsl(220 15% 10%)",
                      border: "1px solid hsl(150 50% 14%)",
                    }}
                  >
                    <div>
                      <span className="text-xs font-bold tracking-wider" style={{ color: "hsl(150 80% 75%)" }}>
                        {as.title}
                      </span>
                      <div className="text-[8px] tracking-widest mt-0.5" style={{ color: "hsl(150 30% 45%)", fontFamily: "JetBrains Mono, monospace" }}>
                        O'quvchi: {as.studentName} | {as.dateAssigned}
                      </div>
                    </div>
                    <span
                      className="text-[8px] tracking-widest px-2 py-0.5 rounded uppercase"
                      style={
                        as.completed
                          ? { background: "hsl(150 100% 50% / 0.1)", border: "1px solid hsl(150 100% 50% / 0.4)", color: neonGreen }
                          : { background: "hsl(40 100% 50% / 0.08)", border: "1px solid hsl(40 100% 50% / 0.3)", color: "hsl(40 90% 65%)" }
                      }
                    >
                      {as.completed ? "✓ Bajarildi" : "⏳ Kutilmoqda"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CyberCard>
        </div>
      )}
    </motion.div>
  );
}
