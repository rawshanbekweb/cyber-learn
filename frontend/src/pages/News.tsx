import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Newspaper, ExternalLink, Clock, AlertCircle, Search, X,
  Lock, Database, Mail, Bug, Terminal, Layers,
} from "lucide-react";
import api from "@/lib/api";

type NewsArticle = {
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  source: string;
  publishedAt: string;
  category: string;
};

const pageVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const CATEGORIES = ["Barchasi", "Ransomware", "Data Breach", "Phishing", "Malware", "Hacking", "Umumiy"] as const;
type Category = typeof CATEGORIES[number];

const TIME_RANGES = ["Barchasi", "Bugun", "Shu hafta"] as const;
type TimeRange = typeof TIME_RANGES[number];

const categoryStyle: Record<string, { icon: React.ElementType; className: string }> = {
  "Ransomware": { icon: Lock, className: "bg-red-50 border-red-200 text-red-700" },
  "Data Breach": { icon: Database, className: "bg-purple-50 border-purple-200 text-purple-700" },
  "Phishing": { icon: Mail, className: "bg-amber-50 border-amber-200 text-amber-700" },
  "Malware": { icon: Bug, className: "bg-orange-50 border-orange-200 text-orange-700" },
  "Hacking": { icon: Terminal, className: "bg-indigo-50 border-primary/20 text-primary" },
  "Umumiy": { icon: Newspaper, className: "bg-zinc-50 border-zinc-200 text-zinc-600" },
};

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "hozirgina";
  if (mins < 60) return `${mins} daqiqa oldin`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} soat oldin`;
  const days = Math.floor(hours / 24);
  return `${days} kun oldin`;
}

function CategoryBadge({ category }: { category: string }) {
  const style = categoryStyle[category] ?? categoryStyle["Umumiy"];
  const Icon = style.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full border font-bold uppercase tracking-wider shrink-0 ${style.className}`}>
      <Icon className="w-2.5 h-2.5" />{category}
    </span>
  );
}

export default function News() {
  const [activeCategory, setActiveCategory] = useState<Category>("Barchasi");
  const [activeTime, setActiveTime] = useState<TimeRange>("Barchasi");
  const [search, setSearch] = useState("");

  const { data: articles, isLoading, isError } = useQuery({
    queryKey: ["news"],
    queryFn: () => api.get<NewsArticle[]>("/api/news"),
    staleTime: 15 * 60 * 1000,
  });

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const a of articles ?? []) {
      counts[a.category] = (counts[a.category] ?? 0) + 1;
    }
    return counts;
  }, [articles]);

  const filtered = useMemo(() => {
    const now = Date.now();
    const q = search.trim().toLowerCase();
    return (articles ?? []).filter(a => {
      const catMatch = activeCategory === "Barchasi" || a.category === activeCategory;
      const ageMs = now - new Date(a.publishedAt).getTime();
      const timeMatch =
        activeTime === "Barchasi" ? true :
        activeTime === "Bugun" ? ageMs <= 24 * 60 * 60 * 1000 :
        ageMs <= 7 * 24 * 60 * 60 * 1000;
      const searchMatch = !q || a.title.toLowerCase().includes(q) || a.description?.toLowerCase().includes(q);
      return catMatch && timeMatch && searchMatch;
    });
  }, [articles, activeCategory, activeTime, search]);

  const [featured, ...rest] = filtered;

  return (
    <motion.div initial="hidden" animate="visible" variants={pageVariants} className="space-y-6">
      <div className="space-y-1">
        <div className="text-[10px] font-bold tracking-widest text-primary uppercase">&gt; CYBERSECURITY / SO'NGI YANGILIKLAR</div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Yangiliklar
        </h1>
        <p className="text-xs text-zinc-500">
          Kiberxavfsizlik sohasidagi so'ngi voqealar va tahdidlar haqida xabardor bo'ling.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          type="text"
          placeholder="Yangiliklardan qidirish..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-9 py-2.5 text-sm rounded-xl border border-zinc-200 outline-none focus:border-primary transition"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 shrink-0">
          Turi:
        </span>
        {CATEGORIES.map(cat => {
          const isActive = activeCategory === cat;
          const count = cat === "Barchasi" ? (articles?.length ?? 0) : (categoryCounts[cat] ?? 0);
          const style = cat === "Barchasi" ? undefined : categoryStyle[cat];
          const Icon = style?.icon ?? Layers;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`inline-flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-full font-semibold border transition-all cursor-pointer ${
                isActive
                  ? "bg-indigo-50 border-primary text-primary shadow-2xs"
                  : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300"
              }`}
            >
              <Icon className="w-3 h-3" />
              {cat}
              <span className={`text-[9px] px-1.5 rounded-full font-bold ${isActive ? "bg-primary/10 text-primary" : "bg-zinc-100 text-zinc-500"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Time filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 shrink-0">
          Vaqt:
        </span>
        {TIME_RANGES.map(t => {
          const isActive = activeTime === t;
          return (
            <button
              key={t}
              onClick={() => setActiveTime(t)}
              className={`text-[11px] px-3 py-1.5 rounded-full font-semibold border transition-all cursor-pointer ${
                isActive
                  ? "bg-indigo-50 border-primary text-primary shadow-2xs"
                  : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300"
              }`}
            >
              {t}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-zinc-200 bg-white h-64 animate-pulse" />
          ))}
        </div>
      ) : isError || !articles || articles.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-12 flex flex-col items-center gap-3 shadow-2xs">
          <AlertCircle className="w-10 h-10 text-zinc-300" />
          <p className="text-sm text-center text-zinc-500 font-medium">
            Hozircha yangiliklarni yuklab bo'lmadi.<br />
            <span className="text-xs">Birozdan so'ng qayta urinib ko'ring.</span>
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-sm py-8 text-zinc-400 font-medium">
          Ushbu filtr bo'yicha yangilik topilmadi.
        </p>
      ) : (
        <div className="space-y-4">
          {/* Featured story */}
          <a
            href={featured.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group grid md:grid-cols-2 rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-xs hover:shadow-md transition-all duration-200"
          >
            <div className="h-56 md:h-full bg-zinc-100 overflow-hidden">
              {featured.imageUrl ? (
                <img
                  src={featured.imageUrl}
                  alt={featured.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Newspaper className="w-10 h-10 text-zinc-300" />
                </div>
              )}
            </div>
            <div className="p-6 flex flex-col gap-3 justify-center">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary text-white font-bold uppercase tracking-wider">
                  So'nggi
                </span>
                <CategoryBadge category={featured.category} />
                <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3" />{timeAgo(featured.publishedAt)}
                </span>
              </div>
              <h2 className="text-lg font-bold text-zinc-900 leading-snug group-hover:text-primary transition-colors">
                {featured.title}
              </h2>
              {featured.description && (
                <p className="text-xs text-zinc-500 line-clamp-3">{featured.description}</p>
              )}
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider truncate">
                  {featured.source}
                </span>
                <div className="flex items-center gap-1 text-[10px] font-bold text-primary uppercase tracking-wider shrink-0">
                  To'liq o'qish <ExternalLink className="w-3 h-3" />
                </div>
              </div>
            </div>
          </a>

          {/* Rest of the grid */}
          {rest.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rest.map((a, i) => (
                <a
                  key={a.url + i}
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
                >
                  <div className="h-36 bg-zinc-100 overflow-hidden shrink-0">
                    {a.imageUrl ? (
                      <img
                        src={a.imageUrl}
                        alt={a.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Newspaper className="w-8 h-8 text-zinc-300" />
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col gap-2 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <CategoryBadge category={a.category} />
                      <span className="flex items-center gap-1 shrink-0 text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">
                        <Clock className="w-3 h-3" />{timeAgo(a.publishedAt)}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-zinc-800 leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                      {a.title}
                    </h3>
                    {a.description && (
                      <p className="text-xs text-zinc-500 line-clamp-2 flex-1">{a.description}</p>
                    )}
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider truncate">
                        {a.source}
                      </span>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-primary uppercase tracking-wider shrink-0">
                        O'qish <ExternalLink className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
