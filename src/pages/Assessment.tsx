import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { translateLevel } from "@/lib/utils";
import { Shield, Clock, ChevronRight, CheckCircle, AlertTriangle } from "lucide-react";

const questions = [
  { q: "Kiberxavfsizlikda CIA nimaning qisqartmasi?", correct: 0, options: ["Maxfiylik, Butunlik, Mavjudlik", "Markaziy Razvedka Agentligi", "Kompyuter Ma'lumotlariga Kirish", "Kiber Infratuzilma Arxitekturasi"] },
  { q: "Qaysi protokol veb trafikni shifrlaydi?", correct: 2, options: ["HTTP", "FTP", "HTTPS", "SMTP"] },
  { q: "Zero-day zaiflik nima?", correct: 1, options: ["Zudlik bilan tuzatilgan xato", "Hali patch mavjud bo'lmagan noma'lum ekspluat", "Firewall qoidasidir", "Zararli dastur turi"] },
  { q: "Firewall nima qiladi?", correct: 1, options: ["Internetni tezlashtiradi", "Tarmoq traffikini nazorat qiladi va filtrlaydi", "Ma'lumotni shifrlaydi", "Fayllarni zaxiralaydi"] },
  { q: "Phishing nima?", correct: 1, options: ["Tarmoq skanerlash usuli", "Kirish ma'lumotlarini o'g'irlashga qaratilgan firibgarlik", "Shifrlash turi", "Tizimni monitoring qilish vositasi"] },
  { q: "Qaysi parol kuchli?", correct: 2, options: ["password123", "abc", "Tr0ub4dor&3!", "123456"] },
  { q: "Ikki faktorli autentifikatsiya nima?", correct: 2, options: ["Ikki paroldan foydalanish", "Biometrik + parol", "Ikki turdagi tekshiruvni talab qiluvchi xavfsizlik", "Ikki marotaba shifrlash"] },
  { q: "Malware nima?", correct: 1, options: ["Uskuna nosozligi", "Tizimga zarar yetkazuvchi zararli dastur", "Tarmoq protokoli", "Firewall turi"] }
];

const neon = "hsl(150 100% 55%)";
const neonDim = "hsl(150 100% 50% / 0.12)";

export default function Assessment() {
  const [, setLocation] = useLocation();
  const { submitAssessment, lastFuzzyResult } = useAppStore();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isFinished, setIsFinished] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  useEffect(() => {
    if (isFinished) return;
    if (timeLeft <= 0) { handleFinish(); return; }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isFinished]);

  const handleNext = () => {
    const newAnswers = [...answers, selectedOption ?? -1];
    setAnswers(newAnswers);
    setSelectedOption(null);
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      handleFinish(newAnswers);
    }
  };

  const handleFinish = (finalAnswers = answers) => {
    let correct = 0;
    finalAnswers.forEach((ans, i) => { if (ans === questions[i].correct) correct++; });
    const knowledge = correct / questions.length;
    const errors = (questions.length - correct) / questions.length;
    const speed = Math.max(0, timeLeft / 60);
    submitAssessment({ knowledge, errors, speed });
    setIsFinished(true);
  };

  const pageVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  /* ── RESULTS SCREEN ── */
  if (isFinished && lastFuzzyResult) {
    return (
      <motion.div initial="hidden" animate="visible" variants={pageVariants} className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <div className="text-[9px] tracking-widest" style={{ color: "hsl(150 40% 50%)" }}>&gt; BAHOLASH YAKUNLANDI</div>
          <h1 className="text-xl font-bold tracking-widest uppercase" style={{ fontFamily: "Orbitron, monospace", color: neon, textShadow: "0 0 15px hsl(150 100% 55% / 0.4)" }}>
            Fuzzy Analiz Natijalari
          </h1>
        </div>

        {/* Result card */}
        <div
          className="rounded-lg overflow-hidden relative"
          style={{
            background: "hsl(220 15% 8%)",
            border: "1px solid hsl(150 100% 50% / 0.45)",
            boxShadow: "0 0 30px hsl(150 100% 50% / 0.12)",
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(to right, transparent, hsl(150 100% 55% / 0.7), transparent)" }} />

          <div className="p-6 space-y-5">
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: neonDim, border: "2px solid hsl(150 100% 50% / 0.5)" }}>
                <CheckCircle className="w-8 h-8" style={{ color: neon, filter: "drop-shadow(0 0 8px hsl(150 100% 55% / 0.7))" }} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {[
                { label: "Tayinlangan Daraja", value: translateLevel(lastFuzzyResult.level) },
                { label: "Tayyorgarlik Ko'rsatkichi", value: `${(lastFuzzyResult.score * 100).toFixed(1)}%` },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="p-4 rounded"
                  style={{ background: "hsl(220 18% 10%)", border: "1px solid hsl(150 60% 18%)" }}
                >
                  <div className="text-[9px] tracking-widest uppercase mb-1" style={{ color: "hsl(150 40% 50%)" }}>{label}</div>
                  <div className="text-2xl font-bold" style={{ fontFamily: "Orbitron, monospace", color: neon, textShadow: "0 0 10px hsl(150 100% 55% / 0.4)" }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[9px] tracking-widest uppercase" style={{ color: "hsl(150 40% 55%)" }}>
                <span>Tizim Mosligi</span>
                <span style={{ color: neon }}>{(lastFuzzyResult.score * 100).toFixed(0)}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "hsl(150 100% 50% / 0.1)", border: "1px solid hsl(150 100% 50% / 0.2)" }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${lastFuzzyResult.score * 100}%`,
                    background: "linear-gradient(to right, hsl(150 100% 35%), hsl(150 100% 65%))",
                    boxShadow: "0 0 10px hsl(150 100% 55% / 0.7)",
                  }}
                />
              </div>
            </div>

            <button
              onClick={() => setLocation("/")}
              data-testid="button-view-dashboard"
              className="w-full py-3 flex items-center justify-center gap-2 text-[11px] font-bold tracking-widest uppercase rounded transition-all duration-200"
              style={{
                background: neonDim,
                border: "1px solid hsl(150 100% 50% / 0.55)",
                color: neon,
                fontFamily: "JetBrains Mono, monospace",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = "hsl(150 100% 50% / 0.22)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px hsl(150 100% 50% / 0.3)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = neonDim;
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              <ChevronRight className="w-4 h-4" /> Boshqaruv Paneliga Qaytish
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  const q = questions[currentQuestion];
  const progress = (currentQuestion / questions.length) * 100;
  const timerCritical = timeLeft < 10;

  /* ── QUIZ SCREEN ── */
  return (
    <motion.div initial="hidden" animate="visible" variants={pageVariants} className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="space-y-1">
        <div className="text-[9px] tracking-widest" style={{ color: "hsl(150 40% 50%)" }}>&gt; DIAGNOSTIKA TESTI — FUZZY BAHOLASH TIZIMI</div>
        <h1 className="text-xl font-bold tracking-widest uppercase" style={{ fontFamily: "Orbitron, monospace", color: neon }}>
          Kiberxavfsizlik Bilim Testi
        </h1>
      </div>

      {/* Timer + progress bar */}
      <div
        className="rounded-lg p-4 space-y-3"
        style={{ background: "hsl(220 15% 8%)", border: "1px solid hsl(150 60% 18%)" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="text-[9px] tracking-widest px-2 py-0.5 rounded"
              style={{ background: neonDim, border: "1px solid hsl(150 100% 50% / 0.3)", color: "hsl(150 70% 65%)" }}
            >
              SAVOL {currentQuestion + 1}/{questions.length}
            </div>
          </div>
          <div
            className="flex items-center gap-1.5 font-bold text-lg"
            data-testid="text-timer"
            style={{
              fontFamily: "Orbitron, monospace",
              color: timerCritical ? "hsl(0 85% 60%)" : neon,
              textShadow: timerCritical ? "0 0 12px hsl(0 85% 60% / 0.6)" : "0 0 12px hsl(150 100% 55% / 0.5)",
              animation: timerCritical ? "pulse-glow 0.8s ease-in-out infinite" : "none",
            }}
          >
            <Clock className="w-4 h-4" />
            00:{timeLeft.toString().padStart(2, "0")}
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-1">
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(150 100% 50% / 0.1)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(to right, hsl(150 100% 35%), hsl(150 100% 60%))",
                boxShadow: "0 0 8px hsl(150 100% 55% / 0.6)",
              }}
            />
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: timerCritical ? "hsl(0 85% 60% / 0.1)" : "hsl(150 100% 50% / 0.08)" }}>
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${(timeLeft / 60) * 100}%`,
                background: timerCritical
                  ? "linear-gradient(to right, hsl(0 85% 45%), hsl(0 85% 65%))"
                  : "linear-gradient(to right, hsl(180 90% 40%), hsl(180 90% 60%))",
                boxShadow: `0 0 6px ${timerCritical ? "hsl(0 85% 60% / 0.5)" : "hsl(180 90% 55% / 0.5)"}`,
              }}
            />
          </div>
        </div>

        {timerCritical && (
          <div className="flex items-center gap-1.5 text-[9px] tracking-widest" style={{ color: "hsl(0 80% 65%)" }}>
            <AlertTriangle className="w-3 h-3" />
            VAQT TUGAMOQDA!
          </div>
        )}
      </div>

      {/* Question card */}
      <div
        className="rounded-lg overflow-hidden relative"
        style={{
          background: "hsl(220 15% 8%)",
          border: "1px solid hsl(150 60% 20%)",
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(to right, transparent, hsl(150 100% 50% / 0.4), transparent)" }} />

        <div className="p-5 space-y-4">
          <div className="flex items-start gap-3">
            <Shield className="w-4 h-4 mt-0.5 shrink-0" style={{ color: neon, filter: "drop-shadow(0 0 4px hsl(150 100% 55% / 0.6))" }} />
            <h2
              className="text-sm leading-relaxed font-bold"
              data-testid="text-question"
              style={{ color: "hsl(150 85% 80%)", fontFamily: "JetBrains Mono, monospace" }}
            >
              {q.q}
            </h2>
          </div>

          <div className="space-y-2 pt-1">
            {q.options.map((opt, i) => {
              const isSelected = selectedOption === i;
              return (
                <button
                  key={i}
                  onClick={() => setSelectedOption(i)}
                  data-testid={`button-option-${i}`}
                  className="w-full text-left px-4 py-3 rounded flex items-start gap-3 transition-all duration-150 text-xs"
                  style={{
                    background: isSelected ? neonDim : "hsl(220 18% 10%)",
                    border: isSelected ? "1px solid hsl(150 100% 50% / 0.55)" : "1px solid hsl(150 50% 15%)",
                    color: isSelected ? "hsl(150 100% 70%)" : "hsl(150 50% 60%)",
                    boxShadow: isSelected ? "0 0 15px hsl(150 100% 50% / 0.1)" : "none",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) {
                      (e.currentTarget as HTMLElement).style.borderColor = "hsl(150 100% 50% / 0.35)";
                      (e.currentTarget as HTMLElement).style.color = "hsl(150 70% 70%)";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) {
                      (e.currentTarget as HTMLElement).style.borderColor = "hsl(150 50% 15%)";
                      (e.currentTarget as HTMLElement).style.color = "hsl(150 50% 60%)";
                    }
                  }}
                >
                  <span
                    className="shrink-0 font-bold text-[10px] w-5 h-5 flex items-center justify-center rounded-sm"
                    style={{
                      background: isSelected ? "hsl(150 100% 50% / 0.2)" : "hsl(220 18% 14%)",
                      border: `1px solid ${isSelected ? "hsl(150 100% 50% / 0.5)" : "hsl(150 40% 18%)"}`,
                      color: isSelected ? neon : "hsl(150 40% 50%)",
                    }}
                  >
                    {["A", "B", "C", "D"][i]}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>

          <div className="pt-2">
            <button
              className="w-full py-3 flex items-center justify-center gap-2 text-[11px] font-bold tracking-widest uppercase rounded transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={handleNext}
              disabled={selectedOption === null}
              data-testid="button-next"
              style={{
                background: selectedOption !== null ? neonDim : "hsl(220 18% 10%)",
                border: `1px solid ${selectedOption !== null ? "hsl(150 100% 50% / 0.55)" : "hsl(150 40% 18%)"}`,
                color: selectedOption !== null ? neon : "hsl(150 30% 40%)",
                fontFamily: "JetBrains Mono, monospace",
              }}
              onMouseEnter={e => {
                if (selectedOption !== null) {
                  (e.currentTarget as HTMLElement).style.background = "hsl(150 100% 50% / 0.22)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px hsl(150 100% 50% / 0.3)";
                }
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = selectedOption !== null ? neonDim : "hsl(220 18% 10%)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              <ChevronRight className="w-4 h-4" />
              {currentQuestion === questions.length - 1 ? "Baholashni Topshirish" : "Keyingi Savol"}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
