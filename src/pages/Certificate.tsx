import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAppStore } from "@/store/useAppStore";
import { Shield, Printer, Award } from "lucide-react";

const neon = "hsl(150 100% 55%)";

export default function Certificate() {
  const [, setLocation] = useLocation();
  const { readinessScore, currentLevel, currentUser } = useAppStore();

  useEffect(() => {
    if (readinessScore < 0.8) setLocation("/");
  }, [readinessScore, setLocation]);

  if (readinessScore < 0.8) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 certificate-container" style={{ background: "hsl(220 15% 4%)" }}>
      <div className="max-w-4xl w-full relative">
        {/* Print button */}
        <div className="absolute top-4 right-4 z-10 print:hidden">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 rounded text-xs font-bold tracking-widest uppercase transition-all"
            style={{
              background: "hsl(150 100% 50% / 0.1)",
              border: "1px solid hsl(150 100% 50% / 0.45)",
              color: neon,
              fontFamily: "JetBrains Mono, monospace",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = "hsl(150 100% 50% / 0.2)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 0 15px hsl(150 100% 50% / 0.3)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = "hsl(150 100% 50% / 0.1)";
              (e.currentTarget as HTMLElement).style.boxShadow = "none";
            }}
          >
            <Printer className="w-3.5 h-3.5" />
            Sertifikatni Chop Etish
          </button>
        </div>

        {/* Certificate frame */}
        <div
          className="relative overflow-hidden"
          style={{
            background: "hsl(220 18% 6%)",
            border: "3px solid hsl(150 100% 50% / 0.4)",
            boxShadow: "0 0 60px hsl(150 100% 50% / 0.15), inset 0 0 60px hsl(150 100% 50% / 0.03)",
          }}
        >
          {/* Hex background pattern */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='100' viewBox='0 0 60 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 17.32v34.64L30 69.28 0 51.96V17.32z' fill='none' stroke='%2300ff88' stroke-width='1'/%3E%3C/svg%3E")`,
              backgroundSize: "40px",
            }}
          />

          {/* Top glow bar */}
          <div className="absolute top-0 left-0 right-0 h-1" style={{ background: `linear-gradient(to right, transparent, ${neon}, transparent)` }} />
          <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: `linear-gradient(to right, transparent, ${neon}, transparent)` }} />

          {/* Corner accents */}
          {[
            "top-3 left-3 border-t-2 border-l-2",
            "top-3 right-3 border-t-2 border-r-2",
            "bottom-3 left-3 border-b-2 border-l-2",
            "bottom-3 right-3 border-b-2 border-r-2",
          ].map((cls, i) => (
            <div key={i} className={`absolute w-6 h-6 ${cls}`} style={{ borderColor: "hsl(150 100% 55% / 0.7)" }} />
          ))}

          <div
            className="relative z-10 p-8 sm:p-16 text-center"
            style={{ border: "1px solid hsl(150 100% 50% / 0.15)", margin: "16px" }}
          >
            {/* Shield icon */}
            <div className="flex justify-center mb-6">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center glow-pulse"
                style={{
                  background: "hsl(150 100% 50% / 0.1)",
                  border: "2px solid hsl(150 100% 50% / 0.5)",
                }}
              >
                <Shield
                  className="w-10 h-10"
                  style={{
                    color: neon,
                    filter: "drop-shadow(0 0 12px hsl(150 100% 55% / 0.7))",
                  }}
                />
              </div>
            </div>

            {/* Brand */}
            <div
              className="text-[10px] tracking-[0.4em] uppercase mb-3"
              style={{ color: "hsl(150 60% 55%)", fontFamily: "JetBrains Mono, monospace" }}
            >
              CyberAl Platform — FUZZY/ANFIS AI
            </div>

            {/* Divider */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-16" style={{ background: "hsl(150 100% 50% / 0.4)" }} />
              <Award className="w-4 h-4" style={{ color: neon }} />
              <div className="h-px w-16" style={{ background: "hsl(150 100% 50% / 0.4)" }} />
            </div>

            {/* Title */}
            <h1
              className="text-4xl sm:text-5xl font-bold tracking-widest uppercase mb-6"
              style={{
                fontFamily: "Orbitron, monospace",
                color: neon,
                textShadow: "0 0 30px hsl(150 100% 55% / 0.5), 0 0 60px hsl(150 100% 55% / 0.3)",
              }}
            >
              Yutuq Sertifikati
            </h1>

            <p className="text-sm mb-2" style={{ color: "hsl(150 40% 55%)", fontFamily: "JetBrains Mono, monospace" }}>
              Ushbu sertifikat quyidagi shaxsga beriladi:
            </p>

            {currentUser?.name && (
              <div
                className="text-2xl font-bold mb-4 tracking-wider"
                style={{
                  fontFamily: "Orbitron, monospace",
                  color: "hsl(150 100% 80%)",
                  textShadow: "0 0 15px hsl(150 100% 55% / 0.4)",
                }}
              >
                {currentUser.name}
              </div>
            )}

            <p className="text-sm mb-2" style={{ color: "hsl(150 40% 55%)", fontFamily: "JetBrains Mono, monospace" }}>
              Muvaffaqiyatli tamomlagan:
            </p>
            <p
              className="text-xl font-bold mb-2 tracking-wider"
              style={{ fontFamily: "JetBrains Mono, monospace", color: "hsl(150 80% 75%)" }}
            >
              Moslashuvchan Kiberxavfsizlik Ta'lim Platformasi
            </p>

            <p className="text-sm mb-1" style={{ color: "hsl(150 40% 55%)", fontFamily: "JetBrains Mono, monospace" }}>
              Yo'nalish:
            </p>
            <p
              className="text-2xl font-bold mb-10 tracking-wider uppercase"
              style={{
                fontFamily: "Orbitron, monospace",
                color: neon,
                textShadow: "0 0 15px hsl(150 100% 55% / 0.5)",
                fontSize: "1.2rem",
              }}
            >
              Kiberxavfsizlik Bo'yicha Yuqori Malaka
            </p>

            {/* Score section */}
            <div className="grid sm:grid-cols-3 gap-6 items-end max-w-2xl mx-auto">
              <div className="text-center">
                <div
                  className="py-2"
                  style={{ borderTop: "1px solid hsl(150 100% 50% / 0.3)" }}
                >
                  <div className="text-xs tracking-widest" style={{ color: "hsl(150 40% 50%)", fontFamily: "JetBrains Mono, monospace" }}>
                    Fuzzy Mantiqiy Motor
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div
                  className="text-5xl font-bold mb-2"
                  style={{
                    fontFamily: "Orbitron, monospace",
                    color: neon,
                    textShadow: "0 0 20px hsl(150 100% 55% / 0.6)",
                  }}
                >
                  {(readinessScore * 100).toFixed(1)}%
                </div>
                <div className="text-[9px] tracking-widest uppercase" style={{ color: "hsl(150 40% 50%)", fontFamily: "JetBrains Mono, monospace" }}>
                  Tayyorgarlik Ko'rsatkichi
                </div>
              </div>

              <div className="text-center">
                <div
                  className="py-2"
                  style={{ borderTop: "1px solid hsl(150 100% 50% / 0.3)" }}
                >
                  <div className="text-sm font-bold" style={{ color: "hsl(150 80% 70%)", fontFamily: "JetBrains Mono, monospace" }}>
                    {new Date().toLocaleDateString()}
                  </div>
                  <div className="text-[9px] tracking-widest mt-1" style={{ color: "hsl(150 40% 50%)", fontFamily: "JetBrains Mono, monospace" }}>
                    Berilgan Sana
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          .certificate-container, .certificate-container * { visibility: visible; }
          .certificate-container { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; background: #000; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          header, nav { display: none !important; }
        }
      `}} />
    </div>
  );
}
