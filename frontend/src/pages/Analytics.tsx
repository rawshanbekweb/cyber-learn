import { useEffect, useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import { translateLevel } from "@/lib/utils";
import { GraduationCap, BookOpen, AlertCircle, Plus, User, Activity, BarChart3, TrendingUp, Hexagon, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip,
} from "recharts";

function AnalyticsCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-zinc-200 bg-white shadow-xs overflow-hidden transition-all duration-200 ${className}`}
    >
      {children}
    </div>
  );
}

export default function Analytics() {
  const { userRole, students, assignments, addAssignment, completeAssignment, currentUser, readinessScore, fuzzyMetrics, moduleProgress, fetchStudents, fetchAssignments } = useAppStore();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const moduleRadarData = useMemo(
    () => moduleProgress.map(m => ({
      module: m.title,
      score: m.completed ? Math.round((m.score ?? 0) * 100) : 0,
    })),
    [moduleProgress]
  );

  const moduleRecommendation = useMemo(() => {
    const completedModules = moduleProgress.filter(m => m.completed);
    const lockedCount = moduleProgress.filter(m => !m.unlocked).length;

    let text: string;
    if (completedModules.length === 0) {
      text = "Hali hech qanday modulni tugatmagansiz. Birinchi modulni tugating — statistikangiz shu yerda paydo bo'ladi.";
    } else {
      const weakest = completedModules.reduce((min, m) => (m.score ?? 0) < (min.score ?? 0) ? m : min);
      text = (weakest.score ?? 0) < 0.85
        ? `Eng past ko'rsatkichingiz — "${weakest.title}" (${Math.round((weakest.score ?? 0) * 100)}%). Ushbu mavzuni qayta ko'rib chiqish va tegishli dars/CTF challenge'larni yechishni tavsiya qilamiz.`
        : "Barcha tugallangan modullar bo'yicha yuqori natija ko'rsatyapsiz! Yangi modullarni ochib, bilimingizni yanada mustahkamlang.";
    }
    if (lockedCount > 0) {
      text += ` Yana ${lockedCount} ta modul ochilishini kutmoqda.`;
    }
    return text;
  }, [moduleProgress]);

  useEffect(() => {
    if (userRole === "Teacher") fetchStudents();
    fetchAssignments();
  }, [userRole]);

  const triggerRemediation = async (studentId: number, studentName: string) => {
    const res = await addAssignment("Fuzzy Qayta o'rganish: Asoslarni mustahkamlash", studentId, 1);
    if (res.success) {
      toast({ title: "REMEDIATION YUBORILDI", description: `${studentName} uchun asosiy tushunchalar moduli biriktirildi.` });
    } else {
      toast({ variant: "destructive", title: "Xatolik", description: res.message });
    }
  };

  const triggerFastForward = async (studentId: number, studentName: string) => {
    const res = await addAssignment("Fuzzy O'tish: Murakkab himoya tizimlari", studentId, 4);
    if (res.success) {
      toast({ title: "O'TISH QARORI", description: `${studentName} muvaffaqiyatli o'tgani uchun murakkab modulga yo'naltirildi.` });
    } else {
      toast({ variant: "destructive", title: "Xatolik", description: res.message });
    }
  };

  const studentAssignments = assignments.filter(a => a.studentId === currentUser?.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="text-[10px] font-bold tracking-widest text-primary uppercase">
          &gt; {userRole === "Teacher" ? "ADMIN / GURUH TAHLILI" : "O'QUVCHI / SHAXSIY TAHLIL"}
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Tizim Tahlili & Analitika
        </h1>
        <p className="text-xs text-zinc-500">
          {userRole === "Teacher"
            ? "Guruh o'quvchilarining ko'rsatkichlari va moslashuvchan o'quv traektoriyalarini boshqarish."
            : "Sizning shaxsiy o'quv natijalaringiz va o'qituvchi topshiriqlari."}
        </p>
      </div>

      {userRole === "Teacher" ? (
        /* ── TEACHER VIEW ── */
        <div className="space-y-6">
          {/* Summary cards */}
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                label: "Guruh O'rtacha Ko'rsatkichi",
                value: `${(students.reduce((a, s) => a + s.fuzzyScore, 0) / Math.max(students.length, 1) * 100).toFixed(0)}%`,
                sub: "ANFIS baholash bo'yicha",
                icon: BarChart3,
              },
              {
                label: "Faol O'quvchilar",
                value: `${students.length} nafar`,
                sub: "Tizimda ro'yxatdan o'tgan",
                icon: User,
              },
              {
                label: "Biriktirilgan Topshiriqlar",
                value: `${assignments.length} ta`,
                sub: "O'qituvchi tomonidan yuborilgan",
                icon: BookOpen,
              },
            ].map(({ label, value, sub, icon: Icon }) => (
              <AnalyticsCard key={label}>
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{label}</span>
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-zinc-900">
                    {value}
                  </div>
                  <div className="text-[10px] text-zinc-500">{sub}</div>
                </div>
              </AnalyticsCard>
            ))}
          </div>

          {/* Students table */}
          <AnalyticsCard>
            <div className="px-5 py-4 flex items-center gap-3 bg-zinc-50/50 border-b border-zinc-100">
              <Activity className="w-4 h-4 text-primary" />
              <div>
                <h3 className="text-sm font-bold text-zinc-950">
                  Guruhdagi O'quvchilar Ko'rsatkichlari
                </h3>
                <p className="text-[10px] text-zinc-500 mt-0.5">
                  Har bir o'quvchining diagnostic test va fuzzy baholash natijalari
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-zinc-50/50 border-b border-zinc-100">
                    {["O'quvchi", "Yosh", "Test (Diagnostic)", "Tayyorgarlik (Fuzzy)", "Daraja", "Xatolar / Tezlik", "Fuzzy Adaptatsiya"].map(h => (
                      <th key={h} className="px-4 py-3 font-semibold text-zinc-500 text-[10px] uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {students.map((student, i) => (
                    <tr
                      key={student.id}
                      className={i % 2 === 0 ? "bg-white" : "bg-zinc-50/20"}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 bg-indigo-50 border border-indigo-100/50"
                          >
                            <User className="w-3.5 h-3.5 text-primary" />
                          </div>
                          <span className="font-bold text-zinc-800">{student.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-zinc-500">
                        {student.age} yosh
                      </td>
                      <td className="px-4 py-3 font-bold text-zinc-800">
                        {(student.diagnosticScore * 100).toFixed(0)}%
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-primary min-w-[32px]">
                            {(student.fuzzyScore * 100).toFixed(0)}%
                          </span>
                          <div className="w-14 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${student.fuzzyScore * 100}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-semibold tracking-wider uppercase border ${
                            student.level === "Advanced"
                              ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                              : student.level === "Intermediate"
                              ? "bg-indigo-50 border-indigo-100 text-primary"
                              : "bg-zinc-50 border-zinc-150 text-zinc-500"
                          }`}
                        >
                          {translateLevel(student.level)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-500">
                        {student.errors * 10} xato / {student.speed * 20}s
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => triggerRemediation(student.id, student.name)}
                            className="px-2 py-1 rounded-lg text-[10px] font-semibold text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-100 transition-all"
                          >
                            Qayta
                          </button>
                          <button
                            onClick={() => triggerFastForward(student.id, student.name)}
                            className="px-2 py-1 rounded-lg text-[10px] font-semibold text-primary bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 transition-all"
                          >
                            O'tish
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AnalyticsCard>

          {/* Add assignment link */}
          <div
            className="rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-indigo-50/30 border border-dashed border-indigo-200"
          >
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-indigo-900 tracking-wide uppercase">
                Topshiriq Yuklash
              </h4>
              <p className="text-xs text-zinc-500">
                O'quvchiga yangi vazifa va savollar biriktirish uchun Topshiriqlar bo'limiga o'ting.
              </p>
            </div>
            <button
              onClick={() => setLocation("/assignments")}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-primary hover:bg-primary/95 transition-all duration-150 shadow-sm shrink-0"
            >
              <Plus className="w-4 h-4" /> Topshiriq Qo'shish
            </button>
          </div>
        </div>
      ) : (
        /* ── STUDENT VIEW ── */
        <div className="space-y-6">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left: stats */}
          <div className="md:col-span-2 space-y-5">
            <AnalyticsCard>
              <div className="px-5 py-4 flex items-center gap-3 bg-zinc-50/50 border-b border-zinc-100">
                <TrendingUp className="w-4 h-4 text-primary" />
                <div>
                  <h3 className="text-sm font-bold text-zinc-950">
                    Shaxsiy Fuzzy Tahlilingiz
                  </h3>
                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    Real-vaqtda ANFIS baholash moduli natijalari
                  </p> 
                </div>
              </div>

              <div className="p-5 space-y-5">
                {/* Main score */}
                <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Hozirgi Tayyorgarlik Darajangiz
                    </h4>
                    <p className="text-[10px] text-zinc-500 mt-0.5">
                      Fuzzy qoidalar bo'yicha yakuniy ko'rsatkich
                    </p>
                  </div>
                  <div className="text-3xl font-bold text-primary">
                    {(readinessScore * 100).toFixed(0)}%
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="h-2 rounded-full overflow-hidden bg-zinc-100 border border-zinc-205/60">
                    <div
                      className="h-full rounded-full transition-all duration-700 bg-primary"
                      style={{ width: `${readinessScore * 100}%` }}
                    />
                  </div>
                </div>

                {/* 3 metrics */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Bilim Darajasi", value: `${(fuzzyMetrics.knowledge * 100).toFixed(0)}%`, bg: "bg-indigo-50/50 border-indigo-100 text-primary" },
                    { label: "Bajarish Tezligi", value: `${(100 - fuzzyMetrics.speed * 100).toFixed(0)}%`, bg: "bg-emerald-50/50 border-emerald-100 text-emerald-700" },
                    { label: "Xatolik Darajasi", value: `${(fuzzyMetrics.errors * 100).toFixed(0)}%`, bg: "bg-red-50/50 border-red-100 text-red-650" },
                  ].map(({ label, value, bg }) => (
                    <div
                      key={label}
                      className={`text-center p-3 rounded-xl border ${bg}`}
                    >
                      <div className="text-[9px] font-bold tracking-wider uppercase mb-1 opacity-70">{label}</div>
                      <div className="text-lg font-bold">
                        {value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Info note */}
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-indigo-50/30 border border-indigo-100/50">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                  <p className="text-[11px] leading-relaxed text-zinc-600">
                    Sizning ko'rsatkichlaringiz o'qituvchi belgilagan qoidalar asosida moslashuvchan o'qitish tizimiga yuboriladi va yo'nalishingiz dinamik tahrirlab boriladi.
                  </p>
                </div>
              </div>
            </AnalyticsCard>
          </div>

          {/* Right: assignments */}
          <div>
            <AnalyticsCard>
              <div className="px-5 py-4 flex items-center gap-3 bg-zinc-50/50 border-b border-zinc-100">
                <GraduationCap className="w-4 h-4 text-primary" />
                <div>
                  <h3 className="text-sm font-bold text-zinc-950">
                    O'qituvchi Topshiriqlari
                  </h3>
                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    Individual o'quv vazifalari
                  </p>
                </div>
              </div>

              <div className="p-4 space-y-2.5">
                {studentAssignments.length === 0 ? (
                  <div className="text-center py-8 text-xs text-zinc-400">
                    Hozircha topshiriqlar yo'q.
                  </div>
                ) : (
                  studentAssignments.map(as => (
                    <div
                      key={as.id}
                      className={`p-3.5 rounded-xl border space-y-2.5 transition-colors ${
                        as.completed 
                          ? "bg-zinc-50/40 border-zinc-150" 
                          : "bg-indigo-50/20 border-indigo-100/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-zinc-800 leading-snug">
                          {as.title}
                        </span>
                        {as.completed ? (
                          <span className="text-[9px] font-semibold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 uppercase shrink-0">
                            ✓ Tugadi
                          </span>
                        ) : (
                          <span className="text-[9px] font-semibold tracking-wider px-2 py-0.5 rounded-full bg-amber-50 border border-amber-100 text-amber-700 uppercase shrink-0">
                            Aktiv
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        {as.dateAssigned}
                      </div>
                      {!as.completed && (
                        <button
                          onClick={async () => {
                            const res = await completeAssignment(as.id);
                            if (res.success) {
                              toast({ title: "TOPSHIRIQ BAJARILDI", description: "Tabriklaymiz! Topshiriq muvaffaqiyatli yakunlandi." });
                            } else {
                              toast({ variant: "destructive", title: "Xatolik", description: res.message });
                            }
                          }}
                          className="w-full py-2 flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary/95 rounded-xl shadow-sm transition-all duration-150"
                        >
                          Bajarish (Modulga O'tish)
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </AnalyticsCard>
          </div>
        </div>

        {/* Module-by-module radar */}
        <AnalyticsCard>
          <div className="px-5 py-4 flex items-center gap-3 bg-zinc-50/50 border-b border-zinc-100">
            <Hexagon className="w-4 h-4 text-primary" />
            <div>
              <h3 className="text-sm font-bold text-zinc-950">
                Modullar bo'yicha ko'rsatkich
              </h3>
              <p className="text-[10px] text-zinc-500 mt-0.5">
                Har bir modul testidan olingan ball
              </p>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={moduleRadarData} outerRadius="70%">
                <PolarGrid stroke="hsl(240 6% 90%)" />
                <PolarAngleAxis dataKey="module" tick={{ fontSize: 11, fill: "hsl(240 4% 46%)" }} />
                <PolarRadiusAxis domain={[0, 100]} tickCount={5} tick={{ fontSize: 9, fill: "hsl(240 4% 65%)" }} />
                <Radar
                  name="Ball"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="hsl(var(--primary))"
                  fillOpacity={0.25}
                  dot={{ r: 3, fill: "hsl(var(--primary))", strokeWidth: 0 }}
                  isAnimationActive
                  animationDuration={900}
                  animationEasing="ease-out"
                />
                <Tooltip
                  formatter={(value: number) => [`${value}%`, "Ball"]}
                  contentStyle={{ borderRadius: 12, border: "1px solid #e4e4e7", fontSize: 11 }}
                />
              </RadarChart>
            </ResponsiveContainer>

            {/* Accessible text breakdown, mirrors the chart */}
            <div className="grid grid-cols-2 gap-2">
              {moduleProgress.map(m => (
                <div
                  key={m.id}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-50/60 border border-zinc-100"
                >
                  <span className="text-[11px] font-medium text-zinc-600 truncate">{m.title}</span>
                  <span className="text-[11px] font-bold text-zinc-800 shrink-0 ml-2">
                    {m.completed ? `${Math.round((m.score ?? 0) * 100)}%` : "—"}
                  </span>
                </div>
              ))}
            </div>

            {/* Recommendation */}
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50/50 border border-amber-100">
              <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <p className="text-[11px] leading-relaxed text-zinc-700">
                {moduleRecommendation}
              </p>
            </div>
          </div>
        </AnalyticsCard>
        </div>
      )}
    </div>
  );
}
