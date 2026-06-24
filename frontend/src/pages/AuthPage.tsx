import { useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import {
  GraduationCap, UserCheck, ShieldCheck, UserPlus,
  LogIn, AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
        toast({ title: "KIRISH MUVAFFAQIYATLI", description: `Xush kelibsiz, ${studentName}!` });
      } else {
        toast({ variant: "destructive", title: "KIRISH XATOSI", description: res.message });
      }
    } else {
      const ageNum = Number(studentAge);
      if (isNaN(ageNum) || ageNum <= 0) {
        toast({ variant: "destructive", title: "XATOLIK", description: "Yoshingizni to'g'ri kiriting!" });
        return;
      }
      const res = registerStudent(studentName.trim(), ageNum);
      if (res.success) {
        toast({ title: "RO'YXATDAN O'TILDI", description: "Yangi profil yaratildi. Dastlabki bilim testi tavsiya etiladi!" });
      } else {
        toast({ variant: "destructive", title: "XATOLIK", description: res.message });
      }
    }
  };

  const handleTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = loginUser(teacherUser, teacherPass, "Teacher");
    if (res.success) {
      toast({ title: "ADMIN PANELI", description: "Boshqaruv paneliga muvaffaqiyatli kirildi." });
    } else {
      toast({ variant: "destructive", title: "AUTENTIFIKATSIYA XATOSI", description: res.message || "Kirish nomi yoki parol noto'g'ri!" });
    }
  };

  const modernInputStyle: React.CSSProperties = {
    width: "100%",
    fontSize: "0.875rem",
    background: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "var(--radius)",
    padding: "10px 12px",
    color: "hsl(var(--foreground))",
    outline: "none",
    transition: "all 0.2s ease",
  };

  return (
    <div
      className="min-h-[100dvh] w-full flex flex-col justify-center items-center p-4 relative overflow-hidden bg-gradient-to-br from-slate-50 via-zinc-100/50 to-indigo-50/30"
    >
      {/* Background visual graphics: subtle blur circles */}
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-indigo-200/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-violet-200/15 blur-[120px] pointer-events-none" />

      {/* Main content */}
      <div className="w-full max-w-md space-y-5 relative" style={{ zIndex: 1 }}>

        {/* ── Login Card ── */}
        <div
          className="rounded-2xl border border-zinc-200 bg-white/95 backdrop-blur-md shadow-md overflow-hidden"
        >
          {/* Header bar */}
          <div
            className="flex items-center gap-2 px-6 py-4 border-b border-zinc-100 bg-zinc-50/50"
          >
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            </div>
            <span className="text-[10px] font-semibold text-zinc-400 ml-2 font-mono">
              secure-login@cyberai:~$
            </span>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            {/* Logo */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center bg-indigo-50 border border-indigo-100/50 shadow-xs"
              >
                <ShieldCheck className="w-8 h-8 text-primary" />
              </div>

              <div>
                <h2 className="text-xl font-bold tracking-tight text-zinc-950">
                  CyberAI Platform
                </h2>
                <div className="text-[10px] font-semibold text-primary mt-1 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100/50 inline-block font-mono">
                  &gt; {displayedText}
                </div>
              </div>

              <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">
                Fuzzy AI + ANFIS o'quvchi ma'lumotlarini tahlil qilib, individual o'quv dasturi yaratuvchi aqlli platforma
              </p>
            </div>

            {/* Divider */}
            <div className="h-px bg-zinc-100" />

            {/* Tab switcher */}
            <div
              className="grid grid-cols-2 rounded-xl bg-zinc-100 p-1 border border-zinc-200/30"
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
                    className={`py-2 rounded-lg flex items-center justify-center gap-2 text-xs font-semibold tracking-wide transition-all duration-200 ${
                      isActive 
                        ? "bg-white text-primary shadow-xs border border-zinc-200/50" 
                        : "text-zinc-500 hover:text-zinc-800"
                    }`}
                  >
                    {tab === "Student"
                      ? <GraduationCap className="w-4 h-4" />
                      : <UserCheck className="w-4 h-4" />
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
                  className="flex rounded-xl bg-zinc-50 border border-zinc-200/50 p-1 gap-1"
                >
                  {(["login", "register"] as const).map((action) => (
                    <button
                      key={action}
                      onClick={() => setStudentAction(action)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 ${
                        studentAction === action 
                          ? "bg-white text-primary border border-zinc-200/50 shadow-2xs" 
                          : "text-zinc-500 hover:text-zinc-800"
                      }`}
                    >
                      {action === "login" ? "Kirish" : "Ro'yxatdan o'tish"}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleStudentSubmit} className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase block">
                      To'liq ism
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Masalan: Sardor Yusupov"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      style={modernInputStyle}
                    />
                  </div>

                  {studentAction === "register" && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase block">
                        Yosh
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="Masalan: 20"
                        value={studentAge}
                        onChange={(e) => setStudentAge(e.target.value)}
                        style={modernInputStyle}
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 flex items-center justify-center gap-2 text-xs font-semibold rounded-xl text-white bg-primary hover:bg-primary/95 shadow-sm transition-all duration-150 mt-2"
                  >
                    {studentAction === "login"
                      ? <><LogIn className="w-4 h-4" /> Tizimga Kirish</>
                      : <><UserPlus className="w-4 h-4" /> Ro'yxatdan O'tish</>
                    }
                  </button>
                </form>

                {/* Quick profile buttons */}
                {studentAction === "login" && students.length > 0 && (
                  <div
                    className="pt-4 space-y-2 border-t border-zinc-100"
                  >
                    <div className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
                      Mavjud Profillar (Test uchun):
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {students.map((student) => (
                        <button
                          key={student.id}
                          onClick={() => setStudentName(student.name)}
                          className="text-xs px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 hover:border-zinc-300 transition-all duration-150"
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
                    <label className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase block">
                      Foydalanuvchi Nomi
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="teacher"
                      value={teacherUser}
                      onChange={(e) => setTeacherUser(e.target.value)}
                      style={modernInputStyle}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase block">
                      Maxfiy Kalit (Parol)
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={teacherPass}
                      onChange={(e) => setTeacherPass(e.target.value)}
                      style={modernInputStyle}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 flex items-center justify-center gap-2 text-xs font-semibold rounded-xl text-white bg-primary hover:bg-primary/95 shadow-sm transition-all duration-150 mt-2"
                  >
                    <LogIn className="w-4 h-4" /> Admin Sifatida Kirish
                  </button>
                </form>

                {/* Credentials info box */}
                <div
                  className="rounded-xl p-3 flex items-start gap-2.5 bg-amber-50/50 border border-amber-100"
                >
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  <div className="text-xs leading-relaxed text-amber-800">
                    O'qituvchi hisobi ma'lumotlari:
                    <div className="mt-1.5 space-y-0.5 text-zinc-700">
                      <div>
                        Login:{" "}
                        <span
                          className="px-1.5 py-0.5 rounded-md bg-white border border-amber-200/50 font-mono text-[10px]"
                        >
                          teacher
                        </span>
                      </div>
                      <div>
                        Parol:{" "}
                        <span
                          className="px-1.5 py-0.5 rounded-md bg-white border border-amber-200/50 font-mono text-[10px]"
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
        <div className="text-center text-[9px] tracking-widest text-zinc-400 font-semibold uppercase">
          SECURED BY FUZZY-ANFIS NEURAL AUTHENTICATION PROTOCOL © 2024
        </div>
      </div>
    </div>
  );
}
