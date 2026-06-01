import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, UserCheck, ShieldCheck, UserPlus, LogIn, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const { loginUser, registerStudent, students } = useAppStore();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"Student" | "Teacher">("Student");
  const [studentAction, setStudentAction] = useState<"login" | "register">("login");

  // Inputs
  const [studentName, setStudentName] = useState("");
  const [studentAge, setStudentAge] = useState("");
  const [teacherUser, setTeacherUser] = useState("");
  const [teacherPass, setTeacherPass] = useState("");

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) return;

    if (studentAction === "login") {
      const res = loginUser(studentName.trim(), "", "Student");
      if (res.success) {
        toast({
          title: "Tizimga kirildi",
          description: `Hush kelibsiz, ${studentName}!`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Xatolik",
          description: res.message,
        });
      }
    } else {
      // Register
      const ageNum = Number(studentAge);
      if (isNaN(ageNum) || ageNum <= 0) {
        toast({
          variant: "destructive",
          title: "Xatolik",
          description: "Yoshingizni to'g'ri kiriting!",
        });
        return;
      }
      
      const res = registerStudent(studentName.trim(), ageNum);
      if (res.success) {
        toast({
          title: "Ro'yxatdan o'tildi",
          description: "Yangi profil yaratildi. Dastlabki bilim testi tavsiya etiladi!",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Xatolik",
          description: res.message,
        });
      }
    }
  };

  const handleTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = loginUser(teacherUser, teacherPass, "Teacher");
    if (res.success) {
      toast({
        title: "O'qituvchi paneli",
        description: "Boshqaruv paneliga muvaffaqiyatli kirildi.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Kirishda xatolik",
        description: res.message || "Kirish nomi yoki parol noto'g'ri!",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center text-white shadow-sm">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold font-mono text-black">CyberAl Platform</h1>
          <p className="text-xs text-muted-foreground max-w-xs leading-normal">
            Fuzzy AI va ANFIS asosidagi moslashuvchan kiberxavfsizlik ta'lim tizimi.
          </p>
        </div>

        {/* Auth Card */}
        <Card className="border-border/65 shadow-sm bg-white overflow-hidden">
          <CardHeader className="p-0 border-b border-border/40">
            {/* Primary tabs */}
            <div className="grid grid-cols-2">
              <button
                onClick={() => {
                  setActiveTab("Student");
                  setStudentName("");
                }}
                className={`py-3.5 text-xs font-mono font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                  activeTab === "Student"
                    ? "border-black text-black bg-[#fcfcfc]"
                    : "border-transparent text-muted-foreground hover:text-black"
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                O'quvchi
              </button>
              <button
                onClick={() => {
                  setActiveTab("Teacher");
                  setTeacherUser("");
                  setTeacherPass("");
                }}
                className={`py-3.5 text-xs font-mono font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                  activeTab === "Teacher"
                    ? "border-black text-black bg-[#fcfcfc]"
                    : "border-transparent text-muted-foreground hover:text-black"
                }`}
              >
                <UserCheck className="w-4 h-4" />
                O'qituvchi
              </button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {activeTab === "Student" ? (
              /* STUDENT AUTHENTICATION FORM */
              <div className="space-y-6">
                {/* Secondary Sub-tabs for login/register */}
                <div className="flex bg-[#f1f3f5] p-1 rounded-lg">
                  <button
                    onClick={() => setStudentAction("login")}
                    className={`flex-1 py-1.5 text-xs font-mono font-medium rounded-md transition-all ${
                      studentAction === "login"
                        ? "bg-white text-black shadow-sm"
                        : "text-muted-foreground hover:text-black"
                    }`}
                  >
                    Kirish
                  </button>
                  <button
                    onClick={() => setStudentAction("register")}
                    className={`flex-1 py-1.5 text-xs font-mono font-medium rounded-md transition-all ${
                      studentAction === "register"
                        ? "bg-white text-black shadow-sm"
                        : "text-muted-foreground hover:text-black"
                    }`}
                  >
                    Ro'yxatdan o'tish
                  </button>
                </div>

                <form onSubmit={handleStudentSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold font-mono text-muted-foreground uppercase tracking-wider block">
                      To'liq ismingiz
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Masalan: Sardor"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full text-sm border border-border/80 px-3 py-2 rounded-lg bg-[#f8f9fa] text-black outline-none focus:border-black font-sans"
                    />
                  </div>

                  {studentAction === "register" && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold font-mono text-muted-foreground uppercase tracking-wider block">
                        Yoshingiz
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="Masalan: 20"
                        value={studentAge}
                        onChange={(e) => setStudentAge(e.target.value)}
                        className="w-full text-sm border border-border/80 px-3 py-2 rounded-lg bg-[#f8f9fa] text-black outline-none focus:border-black font-mono"
                      />
                    </div>
                  )}

                  <Button type="submit" className="w-full bg-black text-white hover:bg-black/90 font-mono font-bold text-xs py-2 mt-2">
                    {studentAction === "login" ? (
                      <>
                        <LogIn className="w-4 h-4 mr-2" /> Tizimga kirish
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" /> Ro'yxatdan o'tish
                      </>
                    )}
                  </Button>
                </form>

                {studentAction === "login" && (
                  <div className="pt-4 border-t border-border/25 space-y-2">
                    <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                      Mavjud o'quvchilar profillari (Testing uchun):
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {students.map((student) => (
                        <button
                          key={student.id}
                          onClick={() => setStudentName(student.name)}
                          className="bg-[#f1f3f5] hover:bg-[#e9ecef] text-black font-mono text-[10px] px-2 py-0.5 rounded transition-all"
                        >
                          {student.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* TEACHER AUTHENTICATION FORM */
              <div className="space-y-6">
                <form onSubmit={handleTeacherSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold font-mono text-muted-foreground uppercase tracking-wider block">
                      Foydalanuvchi nomi
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="teacher"
                      value={teacherUser}
                      onChange={(e) => setTeacherUser(e.target.value)}
                      className="w-full text-sm border border-border/80 px-3 py-2 rounded-lg bg-[#f8f9fa] text-black outline-none focus:border-black font-sans"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold font-mono text-muted-foreground uppercase tracking-wider block">
                      Parol
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={teacherPass}
                      onChange={(e) => setTeacherPass(e.target.value)}
                      className="w-full text-sm border border-border/80 px-3 py-2 rounded-lg bg-[#f8f9fa] text-black outline-none focus:border-black font-sans"
                    />
                  </div>

                  <Button type="submit" className="w-full bg-black text-white hover:bg-black/90 font-mono font-bold text-xs py-2 mt-2">
                    <LogIn className="w-4 h-4 mr-2" /> O'qituvchi sifatida kirish
                  </Button>
                </form>

                {/* Predefined values guide */}
                <div className="bg-[#f8f9fa] border border-border/30 rounded-lg p-3 space-y-1 flex items-start gap-2">
                  <Info className="w-4 h-4 text-black mt-0.5 shrink-0" />
                  <div className="text-[10px] text-muted-foreground leading-normal font-sans">
                    O'qituvchi hisobiga kirish uchun quyidagi ma'lumotlarni ishlating:
                    <div className="font-mono text-black mt-1 font-bold">
                      Foydalanuvchi: <span className="bg-[#f1f3f5] px-1 rounded">teacher</span> <br />
                      Parol: <span className="bg-[#f1f3f5] px-1 rounded">teacher123</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
