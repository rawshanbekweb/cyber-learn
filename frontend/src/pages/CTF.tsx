import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Flag, Trophy, Sparkles } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import api from "@/lib/api";
import { CTFChallengeCard, type CTFChallengeData } from "@/components/CTFChallengeCard";

const pageVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function CTF() {
  const { token } = useAppStore();
  const [activeModule, setActiveModule] = useState<string>("Barchasi");

  const { data: challenges, isLoading } = useQuery({
    queryKey: ["ctf-all"],
    queryFn: () => api.get<CTFChallengeData[]>("/api/ctf", token),
  });

  const moduleTitles = useMemo(() => {
    const set = new Set<string>();
    for (const c of challenges ?? []) if (c.moduleTitle) set.add(c.moduleTitle);
    return Array.from(set);
  }, [challenges]);

  const filtered = useMemo(() => {
    if (activeModule === "Barchasi") return challenges ?? [];
    return (challenges ?? []).filter(c => c.moduleTitle === activeModule);
  }, [challenges, activeModule]);

  const solvedCount = (challenges ?? []).filter(c => c.solved).length;
  const earnedPoints = (challenges ?? []).filter(c => c.solved).reduce((sum, c) => sum + c.points, 0);

  return (
    <motion.div initial="hidden" animate="visible" variants={pageVariants} className="space-y-6">
      <div className="space-y-1">
        <div className="text-[10px] font-bold tracking-widest text-primary uppercase">&gt; CYBERSECURITY / CTF CHALLENGE'LAR</div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          CTF Challenge'lar
        </h1>
        <p className="text-xs text-zinc-500">
          Har bir modul mavzusiga oid flag'larni toping va XP qo'lga kiriting.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Flag, label: "Jami Challenge", value: challenges?.length ?? 0 },
          { icon: Trophy, label: "Yechilgan", value: solvedCount },
          { icon: Sparkles, label: "Qo'lga kiritilgan XP", value: earnedPoints },
        ].map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="rounded-2xl p-4 flex items-center gap-3 bg-white border border-zinc-200 shadow-xs"
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-primary/10 border border-primary/20">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-zinc-950">{value}</div>
              <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Module filter */}
      {moduleTitles.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 shrink-0">
            Modul:
          </span>
          {["Barchasi", ...moduleTitles].map(m => {
            const isActive = activeModule === m;
            const count = m === "Barchasi" ? (challenges?.length ?? 0) : (challenges ?? []).filter(c => c.moduleTitle === m).length;
            return (
              <button
                key={m}
                onClick={() => setActiveModule(m)}
                className={`inline-flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-full font-semibold border transition-all cursor-pointer ${
                  isActive
                    ? "bg-indigo-50 border-primary text-primary shadow-2xs"
                    : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300"
                }`}
              >
                {m}
                <span className={`text-[9px] px-1.5 rounded-full font-bold ${isActive ? "bg-primary/10 text-primary" : "bg-zinc-100 text-zinc-500"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-zinc-200 bg-white h-40 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-12 flex flex-col items-center gap-3 shadow-2xs">
          <Flag className="w-10 h-10 text-zinc-300" />
          <p className="text-sm text-center text-zinc-500 font-medium">
            Hozircha challenge yo'q.<br />
            <span className="text-xs">Modullarni oching, yangi challenge'lar shu yerda paydo bo'ladi.</span>
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map(ch => (
            <CTFChallengeCard key={ch.id} challenge={ch} token={token} showModuleBadge />
          ))}
        </div>
      )}
    </motion.div>
  );
}
