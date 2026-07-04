import { useEffect } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { useAppStore } from "@/store/useAppStore";
import { translateLevel } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { ModuleRadarChart } from "@/components/ModuleRadarChart";
import { ArrowLeft, User, Hexagon, AlertTriangle, GraduationCap, Trash2 } from "lucide-react";

export default function StudentDetail() {
  const [, params] = useRoute("/students/:id");
  const id = params?.id ? parseInt(params.id) : null;
  const { students, userRole, fetchStudents, deleteStudent } = useAppStore();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

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

  const student = students.find(s => s.id === id);

  if (!student) {
    return (
      <div className="space-y-6">
        <Link href="/students" className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" /> O'quvchilar ro'yxatiga qaytish
        </Link>
        <div className="rounded-2xl border border-zinc-200 bg-white p-12 flex flex-col items-center gap-3 shadow-2xs">
          <AlertTriangle className="w-10 h-10 text-zinc-300" />
          <p className="text-sm text-center text-zinc-500 font-medium">
            O'quvchi topilmadi yoki hali yuklanmoqda.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/students" className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-primary transition-colors">
        <ArrowLeft className="w-4 h-4" /> O'quvchilar ro'yxatiga qaytish
      </Link>

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-indigo-50 border border-indigo-100/50">
          <User className="w-7 h-7 text-primary" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">{student.name}</h1>
          <p className="text-xs text-zinc-500">{student.age} yosh &middot; {translateLevel(student.level)}</p>
        </div>
        <button
          onClick={async () => {
            if (!window.confirm(`${student.name} ni butunlay o'chirmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.`)) return;
            const res = await deleteStudent(student.id);
            if (res.success) {
              toast({ title: "O'quvchi o'chirildi" });
              setLocation("/students");
            } else {
              toast({ variant: "destructive", title: "Xatolik", description: res.message });
            }
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 transition-all cursor-pointer shrink-0"
          title="O'quvchini o'chirish"
        >
          <Trash2 className="w-4 h-4" /> O'chirish
        </button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: "Fuzzy Tayyorgarlik", value: `${(student.fuzzyScore * 100).toFixed(0)}%` },
          { label: "Diagnostik Test", value: `${(student.diagnosticScore * 100).toFixed(0)}%` },
          { label: "Tugatilgan Modullar", value: `${student.completedModulesCount} ta` },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-2xl border border-zinc-200 bg-white shadow-xs p-5 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{label}</div>
            <div className="text-2xl font-bold text-zinc-900">{value}</div>
          </div>
        ))}
      </div>

      {/* Module radar */}
      <div className="rounded-2xl border border-zinc-200 bg-white shadow-xs overflow-hidden">
        <div className="px-5 py-4 flex items-center gap-3 bg-zinc-50/50 border-b border-zinc-100">
          <Hexagon className="w-4 h-4 text-primary" />
          <div>
            <h3 className="text-sm font-bold text-zinc-950">Modullar bo'yicha ko'rsatkich</h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">Har bir modul testidan olingan ball</p>
          </div>
        </div>
        <div className="p-5">
          <ModuleRadarChart moduleProgress={student.moduleProgress} />
        </div>
      </div>
    </div>
  );
}
