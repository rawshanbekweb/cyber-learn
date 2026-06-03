import { useAppStore } from "@/store/useAppStore";
import { translateLevel } from "@/lib/utils";
import { GraduationCap, BookOpen, AlertCircle, Plus, User, Activity, BarChart3, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const neon = "hsl(150 100% 55%)";
const neonDim = "hsl(150 100% 50% / 0.12)";
const borderBase = "1px solid hsl(150 60% 20%)";

function CyberCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-lg relative overflow-hidden ${className}`}
      style={{ background: "hsl(220 15% 8%)", border: borderBase }}
    >
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(to right, transparent, hsl(150 100% 50% / 0.35), transparent)" }} />
      {children}
    </div>
  );
}

export default function Analytics() {
  const { userRole, students, assignments, addAssignment, completeAssignment, currentUser, readinessScore, fuzzyMetrics } = useAppStore();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const triggerRemediation = (studentId: number, studentName: string) => {
    addAssignment("Fuzzy Qayta o'rganish: Asoslarni mustahkamlash", studentId, 1);
    toast({ title: "[ REMEDIATION YUBORILDI ]", description: `${studentName} uchun asosiy tushunchalar moduli biriktirildi.` });
  };

  const triggerFastForward = (studentId: number, studentName: string) => {
    addAssignment("Fuzzy O'tish: Murakkab himoya tizimlari", studentId, 4);
    toast({ title: "[ O'TISH QARORI ]", description: `${studentName} muvaffaqiyatli o'tgani uchun murakkab modulga yo'naltirildi.` });
  };

  const studentAssignments = assignments.filter(a => a.studentId === currentUser?.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="text-[9px] tracking-widest" style={{ color: "hsl(150 40% 50%)" }}>
          &gt; {userRole === "Teacher" ? "ADMIN / GURUH TAHLILI" : "O'QUVCHI / SHAXSIY TAHLIL"}
        </div>
        <h1 className="text-2xl font-bold tracking-widest uppercase" style={{ fontFamily: "Orbitron, monospace", color: neon, textShadow: "0 0 20px hsl(150 100% 55% / 0.4)" }}>
          Tizim Tahlili & Analitika
        </h1>
        <p className="text-xs tracking-wider" style={{ color: "hsl(150 35% 50%)" }}>
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
              <CyberCard key={label}>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[8px] tracking-widest uppercase" style={{ color: "hsl(150 40% 50%)" }}>{label}</span>
                    <Icon className="w-4 h-4" style={{ color: neon }} />
                  </div>
                  <div className="text-2xl font-bold" style={{ fontFamily: "Orbitron, monospace", color: neon, textShadow: "0 0 10px hsl(150 100% 55% / 0.4)" }}>
                    {value}
                  </div>
                  <div className="text-[9px] tracking-wider mt-1" style={{ color: "hsl(150 30% 45%)" }}>{sub}</div>
                </div>
              </CyberCard>
            ))}
          </div>

          {/* Students table */}
          <CyberCard>
            <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: "1px solid hsl(150 50% 15%)" }}>
              <Activity className="w-4 h-4" style={{ color: neon }} />
              <div>
                <div className="text-xs font-bold tracking-widest uppercase" style={{ fontFamily: "Orbitron, monospace", color: "hsl(150 90% 75%)", fontSize: "0.65rem" }}>
                  Guruhdagi O'quvchilar Ko'rsatkichlari
                </div>
                <div className="text-[9px] tracking-wider mt-0.5" style={{ color: "hsl(150 35% 48%)" }}>
                  Har bir o'quvchining diagnostic test va fuzzy baholash natijalari
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[10px]" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "hsl(220 18% 10%)", borderBottom: "1px solid hsl(150 50% 15%)" }}>
                    {["O'quvchi", "Yosh", "Test (Diagnostic)", "Tayyorgarlik (Fuzzy)", "Daraja", "Xatolar / Tezlik", "Fuzzy Adaptatsiya"].map(h => (
                      <th key={h} className="px-4 py-3 font-bold tracking-widest uppercase" style={{ color: "hsl(150 40% 50%)", fontFamily: "JetBrains Mono, monospace", fontSize: "0.6rem" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, i) => (
                    <tr
                      key={student.id}
                      style={{
                        borderBottom: "1px solid hsl(150 40% 12%)",
                        background: i % 2 === 0 ? "transparent" : "hsl(220 18% 9%)",
                      }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded flex items-center justify-center shrink-0"
                            style={{ background: neonDim, border: "1px solid hsl(150 100% 50% / 0.3)" }}
                          >
                            <User className="w-3 h-3" style={{ color: neon }} />
                          </div>
                          <span className="font-bold tracking-wider" style={{ color: "hsl(150 80% 75%)" }}>{student.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3" style={{ color: "hsl(150 50% 60%)", fontFamily: "JetBrains Mono, monospace" }}>
                        {student.age} yosh
                      </td>
                      <td className="px-4 py-3 font-bold" style={{ color: neon, fontFamily: "Orbitron, monospace", fontSize: "0.7rem" }}>
                        {(student.diagnosticScore * 100).toFixed(0)}%
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold" style={{ color: neon, fontFamily: "JetBrains Mono, monospace" }}>
                            {(student.fuzzyScore * 100).toFixed(0)}%
                          </span>
                          <div className="w-14 h-1 rounded-full overflow-hidden" style={{ background: "hsl(150 100% 50% / 0.1)" }}>
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${student.fuzzyScore * 100}%`,
                                background: "linear-gradient(to right, hsl(150 100% 35%), hsl(150 100% 60%))",
                                boxShadow: "0 0 4px hsl(150 100% 55%)",
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase"
                          style={
                            student.level === "Advanced"
                              ? { background: neonDim, border: "1px solid hsl(150 100% 50% / 0.45)", color: neon }
                              : student.level === "Intermediate"
                              ? { background: "hsl(180 80% 50% / 0.1)", border: "1px solid hsl(180 80% 50% / 0.35)", color: "hsl(180 80% 65%)" }
                              : { background: "hsl(220 18% 12%)", border: "1px solid hsl(150 40% 18%)", color: "hsl(150 30% 50%)" }
                          }
                        >
                          {translateLevel(student.level)}
                        </span>
                      </td>
                      <td className="px-4 py-3" style={{ color: "hsl(150 35% 50%)", fontFamily: "JetBrains Mono, monospace" }}>
                        {student.errors * 10} xato / {student.speed * 20}s
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => triggerRemediation(student.id, student.name)}
                            className="px-2 py-1 rounded text-[9px] font-bold tracking-widest uppercase transition-all"
                            style={{
                              background: "transparent",
                              border: "1px solid hsl(40 90% 55% / 0.4)",
                              color: "hsl(40 90% 65%)",
                              fontFamily: "JetBrains Mono, monospace",
                            }}
                            onMouseEnter={e => {
                              (e.currentTarget as HTMLElement).style.background = "hsl(40 90% 55% / 0.1)";
                              (e.currentTarget as HTMLElement).style.borderColor = "hsl(40 90% 55% / 0.7)";
                            }}
                            onMouseLeave={e => {
                              (e.currentTarget as HTMLElement).style.background = "transparent";
                              (e.currentTarget as HTMLElement).style.borderColor = "hsl(40 90% 55% / 0.4)";
                            }}
                          >
                            Qayta
                          </button>
                          <button
                            onClick={() => triggerFastForward(student.id, student.name)}
                            className="px-2 py-1 rounded text-[9px] font-bold tracking-widest uppercase transition-all"
                            style={{
                              background: neonDim,
                              border: "1px solid hsl(150 100% 50% / 0.45)",
                              color: neon,
                              fontFamily: "JetBrains Mono, monospace",
                            }}
                            onMouseEnter={e => {
                              (e.currentTarget as HTMLElement).style.background = "hsl(150 100% 50% / 0.22)";
                            }}
                            onMouseLeave={e => {
                              (e.currentTarget as HTMLElement).style.background = neonDim;
                            }}
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
          </CyberCard>

          {/* Add assignment link */}
          <div
            className="rounded-lg p-5 flex items-center justify-between"
            style={{
              background: "hsl(150 100% 50% / 0.04)",
              border: "1px dashed hsl(150 60% 25%)",
            }}
          >
            <div className="space-y-1">
              <h4 className="text-xs font-bold tracking-widest uppercase" style={{ color: "hsl(150 80% 70%)", fontFamily: "Orbitron, monospace", fontSize: "0.65rem" }}>
                Topshiriq Yuklash
              </h4>
              <p className="text-[9px] tracking-wider" style={{ color: "hsl(150 30% 48%)" }}>
                O'quvchiga yangi vazifa va savollar biriktirish uchun Topshiriqlar bo'limiga o'ting.
              </p>
            </div>
            <button
              onClick={() => setLocation("/assignments")}
              className="flex items-center gap-2 px-4 py-2 rounded text-[9px] font-bold tracking-widest uppercase transition-all shrink-0 ml-4"
              style={{
                background: neonDim,
                border: "1px solid hsl(150 100% 50% / 0.5)",
                color: neon,
                fontFamily: "JetBrains Mono, monospace",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "hsl(150 100% 50% / 0.22)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = neonDim; }}
            >
              <Plus className="w-3.5 h-3.5" /> Topshiriq Qo'shish
            </button>
          </div>
        </div>
      ) : (
        /* ── STUDENT VIEW ── */
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left: stats */}
          <div className="md:col-span-2 space-y-5">
            <CyberCard>
              <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: "1px solid hsl(150 50% 15%)" }}>
                <TrendingUp className="w-4 h-4" style={{ color: neon }} />
                <div>
                  <div className="text-xs font-bold tracking-widest uppercase" style={{ fontFamily: "Orbitron, monospace", color: "hsl(150 90% 75%)", fontSize: "0.65rem" }}>
                    Shaxsiy Fuzzy Tahlilingiz
                  </div>
                  <div className="text-[9px] tracking-wider mt-0.5" style={{ color: "hsl(150 35% 48%)" }}>
                    Real-vaqtda ANFIS baholash moduli natijalari
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-5">
                {/* Main score */}
                <div
                  className="flex items-center justify-between pb-4"
                  style={{ borderBottom: "1px solid hsl(150 50% 15%)" }}
                >
                  <div>
                    <h4 className="text-xs font-bold tracking-widest uppercase" style={{ color: "hsl(150 70% 70%)" }}>
                      Hozirgi Tayyorgarlik Darajangiz
                    </h4>
                    <p className="text-[9px] tracking-wider mt-0.5" style={{ color: "hsl(150 30% 48%)" }}>
                      Fuzzy qoidalar bo'yicha yakuniy ko'rsatkich
                    </p>
                  </div>
                  <div
                    className="text-3xl font-bold"
                    style={{ fontFamily: "Orbitron, monospace", color: neon, textShadow: "0 0 15px hsl(150 100% 55% / 0.5)" }}
                  >
                    {(readinessScore * 100).toFixed(0)}%
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: "hsl(150 100% 50% / 0.1)", border: "1px solid hsl(150 100% 50% / 0.15)" }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${readinessScore * 100}%`,
                        background: "linear-gradient(to right, hsl(150 100% 35%), hsl(150 100% 65%))",
                        boxShadow: "0 0 8px hsl(150 100% 55% / 0.7)",
                      }}
                    />
                  </div>
                </div>

                {/* 3 metrics */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Bilim Darajasi", value: `${(fuzzyMetrics.knowledge * 100).toFixed(0)}%`, color: neon },
                    { label: "Bajarish Tezligi", value: `${(100 - fuzzyMetrics.speed * 100).toFixed(0)}%`, color: "hsl(180 80% 60%)" },
                    { label: "Xatolik Darajasi", value: `${(fuzzyMetrics.errors * 100).toFixed(0)}%`, color: "hsl(0 80% 65%)" },
                  ].map(({ label, value, color }) => (
                    <div
                      key={label}
                      className="text-center p-3 rounded"
                      style={{ background: "hsl(220 18% 10%)", border: "1px solid hsl(150 40% 16%)" }}
                    >
                      <div className="text-[8px] tracking-widest uppercase mb-1" style={{ color: "hsl(150 35% 48%)" }}>{label}</div>
                      <div className="text-lg font-bold" style={{ fontFamily: "Orbitron, monospace", color, textShadow: `0 0 8px ${color}` }}>
                        {value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Info note */}
                <div
                  className="flex items-start gap-2 p-3 rounded"
                  style={{ background: "hsl(150 100% 50% / 0.05)", border: "1px solid hsl(150 100% 50% / 0.2)" }}
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: neon }} />
                  <p className="text-[9px] leading-relaxed tracking-wider" style={{ color: "hsl(150 40% 55%)" }}>
                    Sizning ko'rsatkichlaringiz o'qituvchi belgilagan qoidalar asosida moslashuvchan o'qitish tizimiga yuboriladi va yo'nalishingiz dinamik tahrirlab boriladi.
                  </p>
                </div>
              </div>
            </CyberCard>
          </div>

          {/* Right: assignments */}
          <div>
            <CyberCard>
              <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: "1px solid hsl(150 50% 15%)" }}>
                <GraduationCap className="w-4 h-4" style={{ color: neon }} />
                <div>
                  <div className="text-xs font-bold tracking-widest uppercase" style={{ fontFamily: "Orbitron, monospace", color: "hsl(150 90% 75%)", fontSize: "0.65rem" }}>
                    O'qituvchi Topshiriqlari
                  </div>
                  <div className="text-[9px] tracking-wider mt-0.5" style={{ color: "hsl(150 35% 48%)" }}>
                    Individual o'quv vazifalari
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-2">
                {studentAssignments.length === 0 ? (
                  <div className="text-center py-8 text-[10px] tracking-wider" style={{ color: "hsl(150 25% 40%)" }}>
                    &gt; Hozircha topshiriqlar yo'q.
                  </div>
                ) : (
                  studentAssignments.map(as => (
                    <div
                      key={as.id}
                      className="p-3 rounded space-y-2"
                      style={{
                        background: "hsl(220 18% 10%)",
                        border: as.completed ? "1px solid hsl(150 100% 50% / 0.3)" : "1px solid hsl(150 40% 17%)",
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-bold leading-snug tracking-wider" style={{ color: "hsl(150 80% 75%)" }}>
                          {as.title}
                        </span>
                        <span
                          className="text-[8px] tracking-widest px-1.5 py-0.5 rounded uppercase shrink-0"
                          style={
                            as.completed
                              ? { background: neonDim, border: "1px solid hsl(150 100% 50% / 0.4)", color: neon }
                              : { background: "hsl(40 90% 55% / 0.1)", border: "1px solid hsl(40 90% 55% / 0.35)", color: "hsl(40 90% 65%)" }
                          }
                        >
                          {as.completed ? "✓ Bajarildi" : "Ochilgan"}
                        </span>
                      </div>
                      <div className="text-[8px] tracking-wider" style={{ color: "hsl(150 30% 42%)", fontFamily: "JetBrains Mono, monospace" }}>
                        {as.dateAssigned}
                      </div>
                      {!as.completed && (
                        <button
                          onClick={() => {
                            completeAssignment(as.id);
                            toast({ title: "[ TOPSHIRIQ BAJARILDI ]", description: "Tabriklaymiz! Topshiriq muvaffaqiyatli yakunlandi." });
                          }}
                          className="w-full py-1.5 text-[9px] font-bold tracking-widest uppercase rounded transition-all"
                          style={{
                            background: neonDim,
                            border: "1px solid hsl(150 100% 50% / 0.45)",
                            color: neon,
                            fontFamily: "JetBrains Mono, monospace",
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "hsl(150 100% 50% / 0.22)"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = neonDim; }}
                        >
                          Bajarish (Modulga O'tish)
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CyberCard>
          </div>
        </div>
      )}
    </div>
  );
}
