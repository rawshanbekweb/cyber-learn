import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAppStore } from "@/store/useAppStore";
import { Shield, Printer, Award, Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export default function Certificate() {
  const [, setLocation] = useLocation();
  const { readinessScore, currentLevel, currentUser } = useAppStore();
  const { toast } = useToast();
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (readinessScore < 0.8) setLocation("/");
  }, [readinessScore, setLocation]);

  if (readinessScore < 0.8) return null;

  const downloadOfficialCertificate = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`${API_URL}/api/certificate`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Sertifikatni yuklab bo'lmadi");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "sertifikat.png";
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
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 certificate-container font-sans bg-slate-50">
      <div className="max-w-4xl w-full relative">
        {/* Print + download buttons */}
        <div className="absolute top-4 right-4 z-10 print:hidden flex flex-col sm:flex-row gap-2">
          <button
            onClick={downloadOfficialCertificate}
            disabled={downloading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide uppercase bg-primary text-white shadow-xs hover:bg-primary/90 transition-all duration-150 disabled:opacity-60"
          >
            {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            Rasmiy Sertifikat (PNG)
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide uppercase bg-white border border-zinc-200 shadow-xs text-zinc-700 hover:bg-zinc-50 transition-all duration-150"
          >
            <Printer className="w-3.5 h-3.5" />
            Sertifikatni Chop Etish
          </button>
        </div>

        {/* Certificate frame */}
        <div
          className="relative overflow-hidden bg-white border border-zinc-200 rounded-3xl shadow-lg p-1 bg-gradient-to-tr from-slate-100 via-white to-indigo-50/10"
        >
          {/* Decorative double border */}
          <div className="border border-zinc-150 rounded-2xl p-6 sm:p-12 text-center relative">
            
            {/* Hex background pattern */}
            <div
              className="absolute inset-0 opacity-[0.015] pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='100' viewBox='0 0 60 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 17.32v34.64L30 69.28 0 51.96V17.32z' fill='none' stroke='%23000000' stroke-width='1'/%3E%3C/svg%3E")`,
                backgroundSize: "40px",
              }}
            />

            {/* Corner accents */}
            {[
              "top-4 left-4 border-t border-l rounded-tl-lg",
              "top-4 right-4 border-t border-r rounded-tr-lg",
              "bottom-4 left-4 border-b border-l rounded-bl-lg",
              "bottom-4 right-4 border-b border-r rounded-br-lg",
            ].map((cls, i) => (
              <div key={i} className={`absolute w-6 h-6 border-zinc-300 ${cls}`} />
            ))}

            {/* Shield icon */}
            <div className="flex justify-center mb-6">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center bg-indigo-50/50 border border-indigo-100"
              >
                <Shield
                  className="w-8 h-8 text-primary"
                />
              </div>
            </div>

            {/* Brand */}
            <div
              className="text-[9px] tracking-[0.3em] uppercase mb-4 text-zinc-500 font-bold"
            >
              CyberAI Platform — FUZZY/ANFIS AI
            </div>

            {/* Divider */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="h-px w-16 bg-zinc-200" />
              <Award className="w-4 h-4 text-primary" />
              <div className="h-px w-16 bg-zinc-200" />
            </div>

            {/* Title */}
            <h1
              className="text-3xl sm:text-4xl font-bold tracking-wide uppercase mb-6 text-zinc-900"
            >
              Yutuq Sertifikati
            </h1>

            <p className="text-xs mb-2 text-zinc-500 font-medium">
              Ushbu sertifikat quyidagi shaxsga beriladi:
            </p>

            {currentUser?.name && (
              <div
                className="text-2xl font-bold mb-4 tracking-wide text-zinc-900 border-b border-zinc-200 inline-block px-6 pb-2"
              >
                {currentUser.name}
              </div>
            )}

            <p className="text-xs mb-1 text-zinc-500 font-medium mt-3">
              Muvaffaqiyatli tamomlagan:
            </p>
            <p
              className="text-sm font-bold mb-1 tracking-wide text-zinc-800"
            >
              Moslashuvchan Kiberxavfsizlik Ta'lim Platformasi
            </p>

            <p className="text-[10px] mb-1 text-zinc-400 font-medium uppercase mt-4">
              Yo'nalish:
            </p>
            <p
              className="text-lg font-bold mb-10 tracking-wide uppercase text-primary"
            >
              Kiberxavfsizlik Bo'yicha Yuqori Malaka
            </p>

            {/* Score section */}
            <div className="grid sm:grid-cols-3 gap-6 items-end max-w-2xl mx-auto border-t border-zinc-150 pt-8">
              <div className="text-center">
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                  Fuzzy Mantiqiy Motor
                </div>
                <div className="text-[10px] text-zinc-400 mt-1 font-semibold">
                  Taqriz & Baholash
                </div>
              </div>

              <div className="text-center">
                <div
                  className="text-4xl font-bold mb-1 text-zinc-900"
                >
                  {(readinessScore * 100).toFixed(1)}%
                </div>
                <div className="text-[9px] font-bold tracking-widest uppercase text-zinc-500">
                  Tayyorgarlik Ko'rsatkichi
                </div>
              </div>

              <div className="text-center">
                <div className="text-sm font-bold text-zinc-800">
                  {new Date().toLocaleDateString()}
                </div>
                <div className="text-[9px] font-bold tracking-widest text-zinc-400 mt-1 uppercase">
                  Berilgan Sana
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
          .certificate-container { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          header, nav { display: none !important; }
        }
      `}} />
    </div>
  );
}
