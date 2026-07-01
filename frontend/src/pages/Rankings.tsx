import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Flame, Trophy, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useIsMobile } from "@/hooks/use-mobile";
import { translateLevel } from "@/lib/utils";
import api from "@/lib/api";

const PAGE_SIZE = 20;

type Level = "Beginner" | "Intermediate" | "Advanced";

type Entry = {
  rank: number;
  userId: number;
  name: string;
  avatar?: string;
  xp: number;
  level: Level;
  totalScore: number;
  completedTasks: number;
};

// ── Avatar colors ────────────────────────────────────────────────────────────
const AV_COLORS = [
  "#6366f1", "#0f6e56", "#be185d", "#0369a1", "#854d0e",
  "#7c3aed", "#15803d", "#b45309", "#0e7490", "#9f1239",
];
const getAvColor = (id: number) => AV_COLORS[id % AV_COLORS.length];

function Avatar({ e, size = 44 }: { e: Entry; size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0 overflow-hidden relative"
      style={{ width: size, height: size, background: getAvColor(e.userId) }}
    >
      {e.avatar && (
        <img
          src={e.avatar}
          alt={e.name}
          className="absolute inset-0 w-full h-full object-cover"
          onError={(ev) => (ev.target as HTMLImageElement).remove()}
        />
      )}
      <span className="text-white font-extrabold leading-none select-none" style={{ fontSize: size * 0.38 }}>
        {e.name[0]?.toUpperCase()}
      </span>
    </div>
  );
}

// ── SVG medal badge ────────────────────────────────────────────────────────
function Medal({ rank, size = 24 }: { rank: 1 | 2 | 3; size?: number }) {
  const fill = rank === 1 ? "#f59e0b" : rank === 2 ? "#94a3b8" : "#c2793e";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="11" fill={fill} stroke="#fff" strokeWidth="1.5" />
      <text x="12" y="17" textAnchor="middle" fontSize="10" fontWeight="900" fill="white">{rank}</text>
    </svg>
  );
}

// ── Podium config ─────────────────────────────────────────────────────────
const PCFG: Record<1 | 2 | 3, {
  barH: number; avSize: number; ring: string; wrapGrad: string; glow: string;
  rankColor: string; xpBg: string; xpBorder: string; xpColor: string; crown: boolean;
}> = {
  1: { barH: 110, avSize: 74, ring: "#f59e0b", wrapGrad: "linear-gradient(175deg,#fef08a,#f59e0b)", glow: "#f59e0b40", rankColor: "#92400e", xpBg: "#f59e0b20", xpBorder: "#f59e0b50", xpColor: "#92400e", crown: true },
  2: { barH: 80, avSize: 58, ring: "#94a3b8", wrapGrad: "linear-gradient(175deg,#e2e8f0,#94a3b8)", glow: "#94a3b830", rankColor: "#475569", xpBg: "#94a3b820", xpBorder: "#94a3b840", xpColor: "#475569", crown: false },
  3: { barH: 60, avSize: 52, ring: "#c2793e", wrapGrad: "linear-gradient(175deg,#fed7aa,#c2793e)", glow: "#c2793e30", rankColor: "#7c2d12", xpBg: "#c2793e20", xpBorder: "#c2793e40", xpColor: "#7c2d12", crown: false },
};
const PCFG_M: typeof PCFG = {
  1: { ...PCFG[1], barH: 70, avSize: 52 },
  2: { ...PCFG[2], barH: 50, avSize: 42 },
  3: { ...PCFG[3], barH: 36, avSize: 38 },
};

function PodiumCard({ entry, rank, isMobile }: { entry: Entry; rank: 1 | 2 | 3; isMobile: boolean }) {
  const c = (isMobile ? PCFG_M : PCFG)[rank];
  const isFirst = rank === 1;

  return (
    <div className={`flex flex-col items-center ${isMobile ? "flex-1" : rank === 1 ? "flex-none w-[200px]" : "flex-none w-40"}`}>
      <div className="flex items-end justify-center mb-1" style={{ height: isMobile ? 22 : 34 }}>
        {c.crown && (
          <motion.span
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            style={{ fontSize: isMobile ? 18 : 26, lineHeight: 1 }}
          >👑</motion.span>
        )}
      </div>

      <div className="relative mb-2.5">
        <div
          className="rounded-full"
          style={{ padding: isFirst ? 4 : 3, background: c.wrapGrad, boxShadow: `0 0 0 2px #fff, 0 6px 20px ${c.glow}` }}
        >
          <div
            className="rounded-full overflow-hidden flex items-center justify-center"
            style={{ width: c.avSize, height: c.avSize, background: getAvColor(entry.userId), border: `3px solid ${c.ring}` }}
          >
            {entry.avatar
              ? <img src={entry.avatar} className="w-full h-full object-cover" />
              : <span className="text-white font-extrabold" style={{ fontSize: c.avSize * 0.38 }}>{entry.name[0]?.toUpperCase()}</span>
            }
          </div>
        </div>
        <div
          className="absolute -bottom-1 -right-1 rounded-full border-[2.5px] border-white"
          style={{ background: c.wrapGrad, boxShadow: `0 2px 8px ${c.glow}` }}
        >
          <Medal rank={rank} size={isFirst ? 30 : 24} />
        </div>
      </div>

      <div className="text-center mb-2.5 px-2">
        <div
          className="font-bold text-zinc-900 overflow-hidden text-ellipsis whitespace-nowrap"
          style={{ fontSize: isFirst ? 15 : 13, maxWidth: isMobile ? "100%" : isFirst ? 180 : 140 }}
        >
          {entry.name}
        </div>
        <div
          className="inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full"
          style={{ background: c.xpBg, border: `1px solid ${c.xpBorder}` }}
        >
          <span className="font-extrabold" style={{ fontSize: isFirst ? 11 : 10, color: c.xpColor }}>
            {entry.xp.toLocaleString()} XP
          </span>
        </div>
      </div>

      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: c.barH, opacity: 1 }}
        transition={{ delay: rank === 1 ? 0.1 : rank === 2 ? 0.2 : 0.3, duration: 0.55, ease: "easeOut" }}
        className="w-full rounded-t-2xl flex flex-col items-center justify-start pt-3.5 gap-1 shrink-0 overflow-hidden"
        style={{ background: c.wrapGrad, boxShadow: `0 -4px 20px ${c.glow}` }}
      >
        <Medal rank={rank} size={isFirst ? 26 : 20} />
        <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: c.rankColor }}>
          {rank}-o'rin
        </span>
        <span className="text-[10px]" style={{ color: c.rankColor, opacity: 0.8 }}>
          {entry.completedTasks} vazifa
        </span>
      </motion.div>
    </div>
  );
}

const DCFG: Record<number, { bg: string; border: string; tagBg: string; tagColor: string }> = {
  1: { bg: "#fffbeb", border: "#fde68a", tagBg: "#fef3c7", tagColor: "#92400e" },
  2: { bg: "#f8fafc", border: "#e2e8f0", tagBg: "#f1f5f9", tagColor: "#475569" },
  3: { bg: "#fff7ed", border: "#fed7aa", tagBg: "#fff7ed", tagColor: "#9a3412" },
};

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-zinc-200 bg-white shadow-xs overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

export default function Rankings() {
  const { currentUser } = useAppStore();
  const isMobile = useIsMobile();
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  const { data: raw, isLoading } = useQuery({
    queryKey: ["rankings"],
    queryFn: () => api.get<Entry[]>("/api/rankings?limit=500"),
  });

  const sorted = useMemo(() => (raw || []).slice().sort((a, b) => a.rank - b.rank), [raw]);
  const filtered = useMemo(() => sorted.filter((e) => {
    const s = !search || e.name.toLowerCase().includes(search.toLowerCase());
    const l = levelFilter === "all" || e.level === levelFilter;
    return s && l;
  }), [sorted, search, levelFilter]);

  const top3 = sorted.filter((e) => e.rank <= 3);
  const rest = filtered.filter((e) => e.rank > 3);
  const pageCount = Math.max(1, Math.ceil(rest.length / PAGE_SIZE));
  const pageData = rest.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const myEntry = sorted.find((e) => e.userId === currentUser?.id);
  const levels = [...new Set(sorted.map((e) => e.level))];
  const maxXP = Math.max(0, ...sorted.map((e) => e.xp));
  const avgXP = sorted.length ? Math.round(sorted.reduce((s, e) => s + e.xp, 0) / sorted.length) : 0;
  const totalTasks = sorted.reduce((s, e) => s + e.completedTasks, 0);

  if (isLoading) {
    return (
      <div className="flex justify-center pt-20">
        <div className="w-10 h-10 border-[3px] border-zinc-200 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto flex flex-col gap-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3.5">
          <div className="w-[50px] h-[50px] rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br from-amber-200 to-amber-500 shadow-[0_4px_14px_#f59e0b40]">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-zinc-900 tracking-tight">Reyting</h1>
            <p className="text-xs text-zinc-400 mt-0.5">XP asosida · {sorted.length} o'quvchi</p>
          </div>
        </div>
        {myEntry && (
          <div className="bg-amber-50 border-[1.5px] border-amber-200 rounded-2xl px-4.5 py-2.5 text-right">
            <div className="text-[9px] font-bold text-amber-800 uppercase tracking-widest">Mening o'rnim</div>
            <div className="text-2xl font-extrabold text-amber-500 leading-tight">#{myEntry.rank}</div>
          </div>
        )}
      </div>

      {/* Podium */}
      {top3.length >= 1 && (
        <div className="rounded-2xl overflow-hidden border border-zinc-200 shadow-[0_4px_24px_rgba(0,0,0,0.07)]">
          <div
            className="bg-gradient-to-b from-sky-50 via-sky-50/60 to-indigo-50/30 flex items-end justify-center gap-2.5"
            style={{ padding: isMobile ? "14px 8px 0" : "24px 28px 0", minHeight: isMobile ? 180 : 270 }}
          >
            {top3.find((e) => e.rank === 2) && <PodiumCard entry={top3.find((e) => e.rank === 2)!} rank={2} isMobile={isMobile} />}
            {top3.find((e) => e.rank === 1) && <PodiumCard entry={top3.find((e) => e.rank === 1)!} rank={1} isMobile={isMobile} />}
            {top3.find((e) => e.rank === 3) && <PodiumCard entry={top3.find((e) => e.rank === 3)!} rank={3} isMobile={isMobile} />}
          </div>

          <div className="bg-zinc-50 border-t border-zinc-200 flex gap-2 p-2.5">
            {top3.map((entry) => {
              const dc = DCFG[entry.rank] || DCFG[1];
              return (
                <div
                  key={entry.userId}
                  className="flex-1 rounded-xl px-3 py-2.5 text-center border"
                  style={{ background: dc.bg, borderColor: dc.border }}
                >
                  <div className="flex justify-center mb-1">
                    <Medal rank={entry.rank as 1 | 2 | 3} size={28} />
                  </div>
                  <div className="font-bold text-xs text-zinc-900 overflow-hidden text-ellipsis whitespace-nowrap">
                    {entry.name}
                  </div>
                  <div className="flex gap-1 justify-center mt-1.5 flex-wrap">
                    <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                      {translateLevel(entry.level)}
                    </span>
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded font-bold"
                      style={{ background: dc.tagBg, color: dc.tagColor }}
                    >
                      {entry.completedTasks} vazifa
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search + filter */}
      <Card className="p-3 flex gap-2.5 flex-wrap">
        <div className="flex-1 min-w-[180px] bg-zinc-50 border border-zinc-200 rounded-lg flex items-center px-3 gap-2">
          <Search className="w-3.5 h-3.5 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="O'quvchi ismini qidirish..."
            className="flex-1 border-none bg-transparent outline-none text-sm text-zinc-900 py-2"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-zinc-400 hover:text-zinc-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <select
          value={levelFilter}
          onChange={(e) => { setLevelFilter(e.target.value); setPage(1); }}
          className="bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-700 outline-none w-40"
        >
          <option value="all">Barcha darajalar</option>
          {levels.map((l) => <option key={l} value={l}>{translateLevel(l)}</option>)}
        </select>
        {(search || levelFilter !== "all") && (
          <div className="flex items-center text-xs text-zinc-400">{filtered.length} natija</div>
        )}
      </Card>

      {/* List */}
      {pageData.length > 0 && (
        <Card>
          <div className="grid grid-cols-[52px_1fr_90px_80px_60px] px-4.5 py-2.5 bg-zinc-50 border-b border-zinc-100">
            {["#", "O'quvchi", "Daraja", "XP", "Vazifa"].map((h, i) => (
              <div key={i} className={`text-[9px] font-bold text-zinc-400 uppercase tracking-wider ${i > 1 ? "text-right" : "text-left"}`}>
                {h}
              </div>
            ))}
          </div>

          <AnimatePresence>
            {pageData.map((entry, idx) => {
              const isMe = entry.userId === currentUser?.id;
              return (
                <motion.div
                  key={entry.userId}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.025 }}
                  className={`grid grid-cols-[52px_1fr_90px_80px_60px] items-center px-4.5 py-2.5 border-b border-zinc-50 border-l-[3px] ${isMe ? "border-l-primary bg-indigo-50/40" : "border-l-transparent hover:bg-zinc-50"}`}
                >
                  <div className={`text-sm font-extrabold ${isMe ? "text-primary" : "text-zinc-300"}`}>#{entry.rank}</div>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar e={entry} size={34} />
                    <div className="text-sm font-semibold text-zinc-900 overflow-hidden text-ellipsis whitespace-nowrap">
                      {entry.name}
                      {isMe && (
                        <span className="ml-1.5 text-[9px] bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded font-bold">SIZ</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                      {translateLevel(entry.level)}
                    </span>
                  </div>
                  <div className="text-right text-sm font-extrabold text-emerald-600">{entry.xp.toLocaleString()}</div>
                  <div className="text-right text-xs text-zinc-400">{entry.completedTasks}</div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </Card>
      )}

      {/* Empty state */}
      {pageData.length === 0 && search && (
        <Card className="text-center py-12 px-6 text-zinc-400">
          <div className="text-3xl mb-2">🔍</div>
          <div>"{search}" — o'quvchi topilmadi</div>
        </Card>
      )}

      {/* Pagination */}
      {rest.length > PAGE_SIZE && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 disabled:opacity-40 hover:bg-zinc-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-zinc-500">{page} / {pageCount}</span>
          <button
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            disabled={page === pageCount}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 disabled:opacity-40 hover:bg-zinc-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stats */}
      {sorted.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 px-4.5 pt-3.5 pb-2.5 border-b border-zinc-100">
            <Flame className="w-3.5 h-3.5 text-red-500" />
            <span className="text-xs font-bold text-zinc-900">Statistika</span>
          </div>
          <div className="grid grid-cols-4">
            {[
              { icon: "👥", v: sorted.length, l: "Jami o'quvchilar" },
              { icon: "⚡", v: maxXP.toLocaleString(), l: "Maksimum XP" },
              { icon: "📊", v: avgXP.toLocaleString(), l: "O'rtacha XP" },
              { icon: "✅", v: totalTasks, l: "Jami bajarilgan" },
            ].map(({ icon, v, l }, i) => (
              <div key={i} className={`text-center py-4 px-2 ${i < 3 ? "border-r border-zinc-100" : ""}`}>
                <div className="text-lg mb-1">{icon}</div>
                <div className="text-xl font-extrabold text-zinc-900">{v}</div>
                <div className="text-[10px] text-zinc-400 mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </motion.div>
  );
}
