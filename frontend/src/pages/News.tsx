import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Newspaper, ExternalLink, Clock, AlertCircle } from "lucide-react";
import api from "@/lib/api";

type NewsArticle = {
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  source: string;
  publishedAt: string;
};

const pageVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
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

export default function News() {
  const { data: articles, isLoading, isError } = useQuery({
    queryKey: ["news"],
    queryFn: () => api.get<NewsArticle[]>("/api/news"),
    staleTime: 15 * 60 * 1000,
  });

  return (
    <motion.div initial="hidden" animate="visible" variants={pageVariants} className="space-y-8">
      <div className="space-y-1">
        <div className="text-[10px] font-bold tracking-widest text-primary uppercase">&gt; CYBERSECURITY / SO'NGI YANGILIKLAR</div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Yangiliklar
        </h1>
        <p className="text-xs text-zinc-500">
          Kiberxavfsizlik sohasidagi so'ngi voqealar va tahdidlar haqida xabardor bo'ling.
        </p>
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
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((a, i) => (
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
                <div className="flex items-center justify-between gap-2 text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">
                  <span className="truncate">{a.source}</span>
                  <span className="flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3" />{timeAgo(a.publishedAt)}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-zinc-800 leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                  {a.title}
                </h3>
                {a.description && (
                  <p className="text-xs text-zinc-500 line-clamp-2 flex-1">{a.description}</p>
                )}
                <div className="flex items-center gap-1 text-[10px] font-bold text-primary uppercase tracking-wider mt-1">
                  To'liq o'qish <ExternalLink className="w-3 h-3" />
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </motion.div>
  );
}
