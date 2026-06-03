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

const neon = "hsl(150 100% 55%)";
const neonDim = "hsl(150 100% 50% / 0.12)";

export default function Modules() {
  const [, setLocation] = useLocation();
  const { moduleProgress, currentLevel } = useAppStore();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="text-[9px] tracking-widest" style={{ color: "hsl(150 40% 50%)" }}>&gt; O'QUV MODULLARI / MODULE SELECTION</div>
        <h1 className="text-2xl font-bold tracking-widest uppercase" style={{ fontFamily: "Orbitron, monospace", color: neon, textShadow: "0 0 20px hsl(150 100% 55% / 0.4)" }}>
          Ta'lim Modullari
        </h1>
        <p className="text-xs tracking-wider" style={{ color: "hsl(150 35% 50%)" }}>
          O'quv modullaridan birini tanlang va ta'limni boshlang yoki davom ettiring.
        </p>
      </div>

      {/* Alert for beginners */}
      {currentLevel === "Beginner" && (
        <div
          className="flex items-start gap-3 rounded-lg p-4"
          style={{
            background: "hsl(150 100% 50% / 0.06)",
            border: "1px solid hsl(150 100% 50% / 0.3)",
          }}
        >
          <Shield className="w-4 h-4 mt-0.5 shrink-0" style={{ color: neon }} />
          <div>
            <div className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: neon }}>
              Tizim Xabari
            </div>
            <div className="text-[10px] tracking-wider" style={{ color: "hsl(150 50% 55%)" }}>
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
                className="rounded-lg relative overflow-hidden transition-all duration-200 group"
                style={{
                  background: "hsl(220 15% 8%)",
                  border: mod.completed
                    ? "1px solid hsl(150 100% 50% / 0.55)"
                    : mod.unlocked
                    ? "1px solid hsl(150 60% 22%)"
                    : "1px solid hsl(220 15% 15%)",
                  opacity: mod.unlocked ? 1 : 0.5,
                  cursor: mod.unlocked ? "pointer" : "not-allowed",
                  boxShadow: mod.completed ? "0 0 20px hsl(150 100% 50% / 0.1)" : "none",
                }}
                onClick={() => mod.unlocked && setLocation(`/module/${mod.id}`)}
                data-testid={`card-module-${mod.id}`}
                onMouseEnter={e => {
                  if (mod.unlocked) {
                    (e.currentTarget as HTMLElement).style.borderColor = "hsl(150 100% 50% / 0.55)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 0 25px hsl(150 100% 50% / 0.14)";
                  }
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = mod.completed
                    ? "hsl(150 100% 50% / 0.55)"
                    : mod.unlocked ? "hsl(150 60% 22%)" : "hsl(220 15% 15%)";
                  (e.currentTarget as HTMLElement).style.boxShadow = mod.completed ? "0 0 20px hsl(150 100% 50% / 0.1)" : "none";
                }}
              >
                {/* Top glow line */}
                <div className="absolute top-0 left-0 right-0 h-px" style={{
                  background: `linear-gradient(to right, transparent, ${mod.completed ? "hsl(150 100% 55% / 0.7)" : "hsl(150 100% 50% / 0.2)"}, transparent)`,
                }} />

                {/* Lock overlay */}
                {!mod.unlocked && (
                  <div
                    className="absolute inset-0 z-10 flex items-center justify-center"
                    style={{ background: "hsl(220 15% 6% / 0.5)", backdropFilter: "blur(2px)" }}
                  >
                    <LockKeyhole className="w-10 h-10" style={{ color: "hsl(150 20% 30%)" }} />
                  </div>
                )}

                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div
                      className="w-11 h-11 rounded flex items-center justify-center"
                      style={{
                        background: mod.unlocked ? neonDim : "hsl(220 15% 12%)",
                        border: mod.unlocked ? "1px solid hsl(150 100% 50% / 0.35)" : "1px solid hsl(220 15% 20%)",
                      }}
                    >
                      <Icon
                        className="w-5 h-5"
                        style={{
                          color: mod.unlocked ? neon : "hsl(150 20% 35%)",
                          filter: mod.unlocked ? "drop-shadow(0 0 4px hsl(150 100% 55% / 0.5))" : "none",
                        }}
                      />
                    </div>

                    {mod.completed ? (
                      <span className="text-[8px] tracking-widest px-1.5 py-0.5 rounded uppercase"
                        style={{ background: neonDim, border: "1px solid hsl(150 100% 50% / 0.45)", color: neon }}>
                        ✓ Tugadi
                      </span>
                    ) : mod.unlocked ? (
                      <span className="text-[8px] tracking-widest px-1.5 py-0.5 rounded uppercase"
                        style={{ background: "hsl(180 80% 50% / 0.1)", border: "1px solid hsl(180 80% 50% / 0.35)", color: "hsl(180 80% 60%)" }}>
                        Aktiv
                      </span>
                    ) : (
                      <span className="text-[8px] tracking-widest px-1.5 py-0.5 rounded uppercase"
                        style={{ background: "hsl(220 15% 14%)", border: "1px solid hsl(220 15% 22%)", color: "hsl(150 20% 35%)" }}>
                        Yopiq
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="text-[8px] tracking-widest mb-1" style={{ color: "hsl(150 30% 40%)" }}>
                      MOD-{mod.id.toString().padStart(2, "0")}
                    </div>
                    <div className="text-sm font-bold mb-1.5" style={{
                      fontFamily: "Orbitron, monospace",
                      color: mod.unlocked ? "hsl(150 80% 75%)" : "hsl(150 20% 40%)",
                      fontSize: "0.75rem",
                    }}>
                      {mod.title}
                    </div>
                    <div className="text-[10px] leading-relaxed" style={{ color: "hsl(150 30% 48%)" }}>
                      {descriptions[mod.id as keyof typeof descriptions]}
                    </div>
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
