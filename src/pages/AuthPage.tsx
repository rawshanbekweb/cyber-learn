import { useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import {
  GraduationCap, UserCheck, ShieldCheck, UserPlus,
  LogIn, Info, Terminal, Lock, Wifi, AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/* Animated counter of random hex chars for the matrix rain effect */
function MatrixChar({ delay = 0 }: { delay?: number }) {
  const [char, setChar] = useState("0");
  useEffect(() => {
    const chars = "01アイウエオカキクケコABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    const interval = setInterval(() => {
      setChar(chars[Math.floor(Math.random() * chars.length)]);
    }, 100 + delay * 10);
    return () => clearInterval(interval);
  }, [delay]);
  return (
    <span style={{ opacity: Math.random() * 0.5 + 0.1, color: "hsl(150 100% 50%)" }}>
      {char}
    </span>
  );
}

export default function AuthPage() {
  const { loginUser, registerStudent, students } = useAppStore();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"Student" | "Teacher">("Student");
  const [studentAction, setStudentAction] = useState<"login" | "register">("login");
  const [studentName, setStudentName] = useState("");
  const [studentAge, setStudentAge] = useState("");
  const [teacherUser, setTeacherUser] = useState("");
  const [teacherPass, setTeacherPass] = useState("");

  // Typing animation for the terminal header
  const [displayedText, setDisplayedText] = useState("");
  const fullText = "CYBERAI PLATFORM v2.4.1 — KIRISH TIZIMI";
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < fullText.length) {
        setDisplayedText(fullText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 45);
    return () => clearInterval(timer);
  }, []);

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) return;

    if (studentAction === "login") {
      const res = loginUser(studentName.trim(), "", "Student");
      if (res.success) {
        toast({ title: "[ KIRISH MUVAFFAQIYATLI ]", description: `Xush kelibsiz, ${studentName}!` });
      } else {
        toast({ variant: "destructive", title: "[ KIRISH XATOSI ]", description: res.message });
      }
    } else {
      const ageNum = Number(studentAge);
      if (isNaN(ageNum) || ageNum <= 0) {
        toast({ variant: "destructive", title: "[ XATOLIK ]", description: "Yoshingizni to'g'ri kiriting!" });
        return;
      }
      const res = registerStudent(studentName.trim(), ageNum);
      if (res.success) {
        toast({ title: "[ RO'YXATDAN O'TILDI ]", description: "Yangi profil yaratildi. Dastlabki bilim testi tavsiya etiladi!" });
      } else {
        toast({ variant: "destructive", title: "[ XATOLIK ]", description: res.message });
      }
    }
  };

  const handleTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = loginUser(teacherUser, teacherPass, "Teacher");
    if (res.success) {
      toast({ title: "[ ADMIN PANELI ]", description: "Boshqaruv paneliga muvaffaqiyatli kirildi." });
    } else {
      toast({ variant: "destructive", title: "[ AUTENTIFIKATSIYA XATOSI ]", description: res.message || "Kirish nomi yoki parol noto'g'ri!" });
    }
  };

  const cyberInputStyle: React.CSSProperties = {
    width: "100%",
    fontSize: "0.8rem",
    fontFamily: "'JetBrains Mono', monospace",
    background: "hsl(220 18% 8%)",
    border: "1px solid hsl(150 60% 20%)",
    borderRadius: "4px",
    padding: "10px 12px",
    color: "hsl(150 100% 75%)",
    outline: "none",
    letterSpacing: "0.05em",
    transition: "all 0.2s ease",
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center p-4 relative overflow-hidden"
      style={{ background: "hsl(220 15% 4%)" }}
    >
      {/* Matrix background columns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" style={{ zIndex: 0 }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute top-0 flex flex-col gap-1 text-[10px] font-mono"
            style={{
              left: `${i * 5 + 2}%`,
              animation: `scanline ${4 + (i % 5)}s linear infinite`,
              animationDelay: `${i * 0.3}s`,
              opacity: 0.15,
            }}
          >
            {Array.from({ length: 30 }).map((_, j) => (
              <MatrixChar key={j} delay={i * 3 + j} />
            ))}
          </div>
        ))}
      </div>

      {/* Radial glow center */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: "radial-gradient(circle, hsl(150 100% 50% / 0.06) 0%, transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 0,
        }}
      />

      {/* Main content */}
      <div className="w-full max-w-md space-y-5 relative" style={{ zIndex: 1 }}>

        {/* ── Terminal Header ── */}
        <div
          className="rounded-lg overflow-hidden"
          style={{
            border: "1px solid hsl(150 60% 20%)",
            background: "hsl(220 18% 6%)",
            boxShadow: "0 0 30px hsl(150 100% 50% / 0.1)",
          }}
        >
          {/* Terminal title bar */}
          <div
            className="flex items-center gap-2 px-4 py-2.5"
            style={{
              background: "hsl(220 20% 8%)",
              borderBottom: "1px solid hsl(150 50% 16%)",
            }}
          >
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: "hsl(0 70% 55%)" }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: "hsl(40 90% 55%)" }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: "hsl(150 80% 45%)" }} />
            </div>
            <span className="text-[9px] tracking-widest ml-2" style={{ color: "hsl(150 40% 45%)" }}>
              terminal@cyberai:~$
            </span>
            <div className="ml-auto flex items-center gap-2">
              <Wifi className="w-3 h-3" style={{ color: "hsl(150 100% 50%)" }} />
              <Lock className="w-3 h-3" style={{ color: "hsl(150 100% 50%)" }} />
            </div>
          </div>

          {/* Terminal body */}
          <div className="p-5 space-y-4">
            {/* Logo & typing text */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center glow-pulse"
                style={{
                  background: "hsl(150 100% 50% / 0.08)",
                  border: "1px solid hsl(150 100% 50% / 0.5)",
                }}
              >
                <ShieldCheck className="w-9 h-9" style={{ color: "hsl(150 100% 55%)", filter: "drop-shadow(0 0 8px hsl(150 100% 55% / 0.7))" }} />
              </div>

              <div>
                <div
                  className="text-[10px] tracking-widest text-left px-2 py-1 rounded"
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    color: "hsl(150 100% 55%)",
                    background: "hsl(150 100% 50% / 0.05)",
                    border: "1px solid hsl(150 100% 50% / 0.15)",
                    minHeight: "28px",
                  }}
                >
                  &gt; {displayedText}
                  <span
                    style={{ animation: "blink-cursor 1s step-end infinite", color: "hsl(150 100% 65%)" }}
                  >
                    █
                  </span>
                </div>
              </div>

              <p className="text-[10px] tracking-wider" style={{ color: "hsl(150 40% 50%)" }}>
                Fuzzy AI + ANFIS asosidagi moslashuvchan kiberxavfsizlik ta'lim tizimi
              </p>
            </div>

            {/* Divider */}
            <div className="cyber-divider" />

            {/* Tab switcher */}
            <div
              className="grid grid-cols-2 rounded overflow-hidden"
              style={{ border: "1px solid hsl(150 50% 18%)" }}
            >
              {(["Student", "Teacher"] as const).map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      setStudentName(""); setTeacherUser(""); setTeacherPass("");
                    }}
                    className="py-3 flex items-center justify-center gap-2 text-[10px] font-bold tracking-widest uppercase transition-all duration-200"
                    style={{
                      background: isActive ? "hsl(150 100% 50% / 0.12)" : "hsl(220 18% 8%)",
                      color: isActive ? "hsl(150 100% 65%)" : "hsl(150 30% 45%)",
                      borderBottom: isActive ? "2px solid hsl(150 100% 55%)" : "2px solid transparent",
                      textShadow: isActive ? "0 0 8px hsl(150 100% 55% / 0.5)" : "none",
                    }}
                  >
                    {tab === "Student"
                      ? <GraduationCap className="w-3.5 h-3.5" />
                      : <UserCheck className="w-3.5 h-3.5" />
                    }
                    {tab === "Student" ? "O'quvchi" : "O'qituvchi"}
                  </button>
                );
              })}
            </div>

            {/* ── STUDENT FORM ── */}
            {activeTab === "Student" ? (
              <div className="space-y-4">
                {/* login / register sub-tabs */}
                <div
                  className="flex rounded overflow-hidden"
                  style={{
                    background: "hsl(220 18% 9%)",
                    border: "1px solid hsl(150 50% 16%)",
                    padding: "3px",
                    gap: "3px",
                  }}
                >
                  {(["login", "register"] as const).map((action) => (
                    <button
                      key={action}
                      onClick={() => setStudentAction(action)}
                      className="flex-1 py-1.5 text-[10px] font-bold tracking-widest uppercase rounded transition-all duration-200"
                      style={{
                        background: studentAction === action ? "hsl(150 100% 50% / 0.15)" : "transparent",
                        color: studentAction === action ? "hsl(150 100% 65%)" : "hsl(150 30% 45%)",
                        border: studentAction === action ? "1px solid hsl(150 100% 50% / 0.4)" : "1px solid transparent",
                      }}
                    >
                      {action === "login" ? "[ Kirish ]" : "[ Ro'yxat ]"}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleStudentSubmit} className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[9px] tracking-widest uppercase block" style={{ color: "hsl(150 50% 50%)" }}>
                      &gt; To'liq ism
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Masalan: Sardor Yusupov"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      style={cyberInputStyle}
                      onFocus={e => {
                        e.currentTarget.style.borderColor = "hsl(150 100% 50%)";
                        e.currentTarget.style.boxShadow = "0 0 0 2px hsl(150 100% 50% / 0.2), 0 0 16px hsl(150 100% 50% / 0.25)";
                      }}
                      onBlur={e => {
                        e.currentTarget.style.borderColor = "hsl(150 60% 20%)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    />
                  </div>

                  {studentAction === "register" && (
                    <div className="space-y-1.5">
                      <label className="text-[9px] tracking-widest uppercase block" style={{ color: "hsl(150 50% 50%)" }}>
                        &gt; Yosh
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="Masalan: 20"
                        value={studentAge}
                        onChange={(e) => setStudentAge(e.target.value)}
                        style={cyberInputStyle}
                        onFocus={e => {
                          e.currentTarget.style.borderColor = "hsl(150 100% 50%)";
                          e.currentTarget.style.boxShadow = "0 0 0 2px hsl(150 100% 50% / 0.2), 0 0 16px hsl(150 100% 50% / 0.25)";
                        }}
                        onBlur={e => {
                          e.currentTarget.style.borderColor = "hsl(150 60% 20%)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 flex items-center justify-center gap-2 text-[11px] font-bold tracking-widest uppercase rounded transition-all duration-200 mt-1"
                    style={{
                      background: "hsl(150 100% 50% / 0.15)",
                      border: "1px solid hsl(150 100% 50% / 0.6)",
                      color: "hsl(150 100% 65%)",
                      fontFamily: "JetBrains Mono, monospace",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = "hsl(150 100% 50% / 0.25)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px hsl(150 100% 50% / 0.35)";
                      (e.currentTarget as HTMLElement).style.textShadow = "0 0 10px hsl(150 100% 55% / 0.7)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = "hsl(150 100% 50% / 0.15)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "none";
                      (e.currentTarget as HTMLElement).style.textShadow = "none";
                    }}
                  >
                    {studentAction === "login"
                      ? <><LogIn className="w-3.5 h-3.5" /> Tizimga Kirish</>
                      : <><UserPlus className="w-3.5 h-3.5" /> Ro'yxatdan O'tish</>
                    }
                  </button>
                </form>

                {/* Quick profile buttons */}
                {studentAction === "login" && students.length > 0 && (
                  <div
                    className="pt-3 space-y-2"
                    style={{ borderTop: "1px solid hsl(150 50% 14%)" }}
                  >
                    <div className="text-[8px] tracking-widest uppercase" style={{ color: "hsl(150 30% 40%)" }}>
                      &gt; Mavjud Profillar (Test uchun):
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {students.map((student) => (
                        <button
                          key={student.id}
                          onClick={() => setStudentName(student.name)}
                          className="text-[9px] font-mono px-2 py-1 rounded tracking-wider transition-all duration-150"
                          style={{
                            background: "hsl(150 100% 50% / 0.07)",
                            border: "1px solid hsl(150 60% 22%)",
                            color: "hsl(150 80% 65%)",
                          }}
                          onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.background = "hsl(150 100% 50% / 0.15)";
                            (e.currentTarget as HTMLElement).style.borderColor = "hsl(150 100% 50% / 0.5)";
                          }}
                          onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.background = "hsl(150 100% 50% / 0.07)";
                            (e.currentTarget as HTMLElement).style.borderColor = "hsl(150 60% 22%)";
                          }}
                        >
                          {student.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ── TEACHER FORM ── */
              <div className="space-y-4">
                <form onSubmit={handleTeacherSubmit} className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[9px] tracking-widest uppercase block" style={{ color: "hsl(150 50% 50%)" }}>
                      &gt; Foydalanuvchi Nomi
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="teacher"
                      value={teacherUser}
                      onChange={(e) => setTeacherUser(e.target.value)}
                      style={cyberInputStyle}
                      onFocus={e => {
                        e.currentTarget.style.borderColor = "hsl(150 100% 50%)";
                        e.currentTarget.style.boxShadow = "0 0 0 2px hsl(150 100% 50% / 0.2), 0 0 16px hsl(150 100% 50% / 0.25)";
                      }}
                      onBlur={e => {
                        e.currentTarget.style.borderColor = "hsl(150 60% 20%)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] tracking-widest uppercase block" style={{ color: "hsl(150 50% 50%)" }}>
                      &gt; Maxfiy Kalit (Parol)
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={teacherPass}
                      onChange={(e) => setTeacherPass(e.target.value)}
                      style={cyberInputStyle}
                      onFocus={e => {
                        e.currentTarget.style.borderColor = "hsl(150 100% 50%)";
                        e.currentTarget.style.boxShadow = "0 0 0 2px hsl(150 100% 50% / 0.2), 0 0 16px hsl(150 100% 50% / 0.25)";
                      }}
                      onBlur={e => {
                        e.currentTarget.style.borderColor = "hsl(150 60% 20%)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 flex items-center justify-center gap-2 text-[11px] font-bold tracking-widest uppercase rounded transition-all duration-200"
                    style={{
                      background: "hsl(150 100% 50% / 0.15)",
                      border: "1px solid hsl(150 100% 50% / 0.6)",
                      color: "hsl(150 100% 65%)",
                      fontFamily: "JetBrains Mono, monospace",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = "hsl(150 100% 50% / 0.25)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px hsl(150 100% 50% / 0.35)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = "hsl(150 100% 50% / 0.15)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "none";
                    }}
                  >
                    <LogIn className="w-3.5 h-3.5" /> Admin Sifatida Kirish
                  </button>
                </form>

                {/* Credentials info box */}
                <div
                  className="rounded p-3 flex items-start gap-2"
                  style={{
                    background: "hsl(40 100% 50% / 0.05)",
                    border: "1px solid hsl(40 100% 50% / 0.25)",
                  }}
                >
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "hsl(40 100% 60%)" }} />
                  <div className="text-[9px] leading-relaxed tracking-wider" style={{ color: "hsl(40 60% 60%)", fontFamily: "JetBrains Mono, monospace" }}>
                    O'qituvchi hisobi ma'lumotlari:
                    <div className="mt-1.5 space-y-0.5" style={{ color: "hsl(150 80% 65%)" }}>
                      <div>
                        Login:{" "}
                        <span
                          className="px-1 py-0.5 rounded"
                          style={{ background: "hsl(150 100% 50% / 0.1)", border: "1px solid hsl(150 100% 50% / 0.25)" }}
                        >
                          teacher
                        </span>
                      </div>
                      <div>
                        Parol:{" "}
                        <span
                          className="px-1 py-0.5 rounded"
                          style={{ background: "hsl(150 100% 50% / 0.1)", border: "1px solid hsl(150 100% 50% / 0.25)" }}
                        >
                          teacher123
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="text-center text-[8px] tracking-widest" style={{ color: "hsl(150 30% 30%)" }}>
          SECURED BY FUZZY-ANFIS NEURAL AUTHENTICATION PROTOCOL © 2024
        </div>
      </div>
    </div>
  );
}
