import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { useToast } from "@/hooks/use-toast";
import { Award, Lock, Download, Loader2, CheckCircle2 } from "lucide-react";
import api from "@/lib/api";

export default function Certificate() {
  const { moduleProgress, token } = useAppStore();
  const { toast } = useToast();
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const downloadCertificate = async (id: number) => {
    setDownloadingId(id);
    try {
      const blob = await api.downloadFile(`/api/modules/${id}/certificate`, token);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sertifikat-${id}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast({
        title: "Rasmiy sertifikatni yuklab bo'lmadi",
        description: err instanceof Error
          ? err.message
          : "Bu funksiya hozircha faqat backend'da ro'yxatdan o'tgan hisoblar uchun ishlaydi.",
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const completedCount = moduleProgress.filter(m => m.completed).length;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-1">
        <div className="text-[10px] font-bold tracking-widest text-primary uppercase">
          &gt; YUTUQLAR
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Mening Sertifikatlarim
        </h1>
        <p className="text-xs text-zinc-500">
          Har bir modulni testdan kamida 70% ball bilan o'tib tugatib, o'ziga xos sertifikat oling ({completedCount}/{moduleProgress.length} tugatilgan).
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {moduleProgress.map((m) => (
          <div
            key={m.id}
            className={`rounded-2xl border p-5 space-y-3 ${
              m.completed ? "bg-white border-zinc-200 shadow-xs" : "bg-zinc-50/50 border-zinc-150 border-dashed"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${m.completed ? "bg-amber-50 border border-amber-100" : "bg-zinc-100 border border-zinc-200"}`}>
                {m.completed ? <Award className="w-5 h-5 text-amber-500" /> : <Lock className="w-4 h-4 text-zinc-400" />}
              </div>
              {m.completed && (
                <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Tugatildi
                </span>
              )}
            </div>
            <div>
              <div className="text-[10px] font-mono text-zinc-400 mb-0.5">MOD-{m.id.toString().padStart(2, "0")}</div>
              <div className="text-sm font-bold text-zinc-900">{m.title}</div>
            </div>
            {m.completed ? (
              <button
                onClick={() => downloadCertificate(m.id)}
                disabled={downloadingId === m.id}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 shadow-sm transition-all duration-150 disabled:opacity-60"
              >
                {downloadingId === m.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                Sertifikatni yuklab olish
              </button>
            ) : (
              <Link
                href={m.unlocked ? `/module/${m.id}` : "#"}
                className={`block text-center py-2 rounded-xl text-xs font-semibold border transition-all duration-150 ${
                  m.unlocked
                    ? "text-primary border-primary/30 hover:bg-primary/5"
                    : "text-zinc-400 border-zinc-200 cursor-not-allowed pointer-events-none"
                }`}
              >
                {m.unlocked ? "Modulni boshlash" : "Hali ochilmagan"}
              </Link>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
