import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { Shield, Wifi, Lock, Server, LockKeyhole } from "lucide-react";

const icons = { 1: Shield, 2: Wifi, 3: Lock, 4: Server };
const descriptions = {
  1: "Kiberxavfsizlikning asosiy tamoyillari: CIA triad, tahdidlarni modellashtirish va himoya qatlamlari.",
  2: "Tarmoq hujumlarini - Man-in-the-Middle, DDoS va paket ushlashni aniqlash va qarshi turish.",
  3: "Simmetrik/asimmetrik shifrlash va hash algoritmlari orqali xavfsiz aloqa.",
  4: "Endpoint xavfsizligi, kirish nazorati, ko'p faktorli autentifikatsiya va SIEM monitoring.",
};

export default function Modules() {
  const [, setLocation] = useLocation();
  const { moduleProgress, currentLevel } = useAppStore();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="text-[10px] font-bold tracking-widest text-primary uppercase">&gt; O'QUV MODULLARI / MODULE SELECTION</div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Ta'lim Modullari
        </h1>
        <p className="text-xs text-zinc-500">
          O'quv modullaridan birini tanlang va ta'limni boshlang yoki davom ettiring.
        </p>
      </div>

      {/* Alert for beginners */}
      {currentLevel === "Beginner" && (
        <div
          className="flex items-start gap-3 rounded-2xl p-4 bg-amber-50 border border-amber-100 shadow-xs"
        >
          <Shield className="w-5 h-5 mt-0.5 shrink-0 text-amber-600" />
          <div>
            <div className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
              Tizim Xabari
            </div>
            <div className="text-xs text-amber-900 leading-normal">
              Keyingi modul ochilishini kutmasdan avval 1-modulni yakunlang.
            </div>
          </div>
        </div>
      )}

      {/* Module grid */}
      <motion.div
        className="grid md:grid-cols-2 gap-4"
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
        initial="hidden"
        animate="visible"
      >
        {moduleProgress.map((mod) => {
          const Icon = icons[mod.id as keyof typeof icons] || Shield;
          return (
            <motion.div
              key={mod.id}
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            >
              <div
                className={`rounded-2xl relative overflow-hidden transition-all duration-200 border bg-white ${
                  mod.unlocked 
                    ? "border-zinc-200 shadow-2xs hover:shadow-sm cursor-pointer hover:-translate-y-0.5" 
                    : "border-zinc-100 opacity-60 cursor-not-allowed"
                }`}
                onClick={() => mod.unlocked && setLocation(`/module/${mod.id}`)}
                data-testid={`card-module-${mod.id}`}
              >
                {/* Lock overlay */}
                {!mod.unlocked && (
                  <div
                    className="absolute inset-0 z-10 flex items-center justify-center bg-zinc-200/40 backdrop-blur-xs"
                  >
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center shadow-md">
                      <LockKeyhole className="w-5 h-5 text-white" />
                    </div>
                  </div>
                )}

                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                        mod.unlocked 
                          ? "bg-indigo-50 border-indigo-100/50 text-primary" 
                          : "bg-zinc-50 border-zinc-150 text-zinc-400"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    {mod.completed ? (
                      <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 uppercase">
                        ✓ Tugadi
                      </span>
                    ) : mod.unlocked ? (
                      <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-primary uppercase">
                        Aktiv
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-zinc-50 border border-zinc-100 text-zinc-400 uppercase">
                        Yopiq
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="text-[9px] font-bold text-zinc-400 tracking-wider">
                      MOD-{mod.id.toString().padStart(2, "0")}
                    </div>
                    <h3 className={`text-sm font-bold ${mod.unlocked ? "text-zinc-900" : "text-zinc-400"}`}>
                      {mod.title}
                    </h3>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      {descriptions[mod.id as keyof typeof descriptions]}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
