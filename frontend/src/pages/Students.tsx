import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAppStore } from "@/store/useAppStore";
import { translateLevel } from "@/lib/utils";
import { Users, User, ChevronRight, GraduationCap } from "lucide-react";

export default function Students() {
  const { students, userRole, fetchStudents } = useAppStore();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (userRole === "Teacher") fetchStudents();
  }, [userRole]);

  if (userRole !== "Teacher") {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-zinc-500">
        <GraduationCap className="w-10 h-10 text-zinc-400" />
        <p className="text-sm font-medium">Bu sahifa faqat o'qituvchilar uchun.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="text-[10px] font-bold tracking-widest text-primary uppercase">
          &gt; TEACHER / O'QUVCHILAR RO'YXATI
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          O'quvchilar
        </h1>
        <p className="text-xs text-zinc-500">
          Har bir o'quvchining shaxsiy sahifasiga kirib, uning modullar bo'yicha ko'rsatkichini ko'ring.
        </p>
      </div>

      {students.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-12 flex flex-col items-center gap-3 shadow-2xs">
          <Users className="w-10 h-10 text-zinc-300" />
          <p className="text-sm text-center text-zinc-500 font-medium">
            Hali ro'yxatdan o'tgan o'quvchi yo'q.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map(student => (
            <button
              key={student.id}
              onClick={() => setLocation(`/students/${student.id}`)}
              className="text-left rounded-2xl border border-zinc-200 bg-white shadow-xs hover:shadow-sm hover:-translate-y-0.5 transition-all duration-150 p-5 space-y-4 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-indigo-50 border border-indigo-100/50">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm text-zinc-900 truncate">{student.name}</div>
                  <div className="text-[10px] text-zinc-500">{student.age} yosh</div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-300 shrink-0" />
              </div>

              <div className="flex items-center justify-between gap-2">
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
                <span className="text-xs font-bold text-primary">
                  {(student.fuzzyScore * 100).toFixed(0)}%
                </span>
              </div>

              <div className="w-full h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${student.fuzzyScore * 100}%` }}
                />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
