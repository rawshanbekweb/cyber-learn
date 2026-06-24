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
          <div className="text-[10px] font-bold tracking-widest text-primary uppercase">&gt; BAHOLASH YAKUNLANDI</div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Fuzzy Analiz Natijalari
          </h1>
        </div>

        {/* Result card */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm relative overflow-hidden">
          <div className="space-y-5">
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-emerald-50 border border-emerald-100 text-emerald-600 shadow-2xs">
                <CheckCircle className="w-8 h-8" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {[
                { label: "Tayinlangan Daraja", value: translateLevel(lastFuzzyResult.level) },
                { label: "Tayyorgarlik Ko'rsatkichi", value: `${(lastFuzzyResult.score * 100).toFixed(1)}%` },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="p-4 rounded-xl bg-zinc-50 border border-zinc-200"
                >
                  <div className="text-[10px] font-bold tracking-wider uppercase text-zinc-400 mb-1">{label}</div>
                  <div className="text-2xl font-bold text-zinc-900">
                    {value}
                  </div>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold tracking-wider uppercase text-zinc-400">
                <span>Tizim Mosligi</span>
                <span className="text-primary">{(lastFuzzyResult.score * 100).toFixed(0)}%</span>
              </div>
              <div className="h-2.5 rounded-full overflow-hidden bg-zinc-100 border border-zinc-200/50">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-700"
                  style={{ width: `${lastFuzzyResult.score * 100}%` }}
                />
              </div>
            </div>

            <button
              onClick={() => setLocation("/")}
              data-testid="button-view-dashboard"
              className="w-full py-3.5 flex items-center justify-center gap-2 text-xs font-semibold tracking-wider uppercase rounded-xl transition-all duration-150 text-white bg-primary hover:bg-primary/95 shadow-sm active:translate-y-0.5 border border-primary cursor-pointer"
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
        <div className="text-[10px] font-bold tracking-widest text-primary uppercase">&gt; DIAGNOSTIKA TESTI — FUZZY BAHOLASH TIZIMI</div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Kiberxavfsizlik Bilim Testi
        </h1>
      </div>

      {/* Timer + progress bar */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-primary">
              SAVOL {currentQuestion + 1}/{questions.length}
            </div>
          </div>
          <div
            className={`flex items-center gap-1.5 font-bold text-lg ${
              timerCritical ? "text-red-600 animate-pulse" : "text-primary"
            }`}
            data-testid="text-timer"
          >
            <Clock className="w-4 h-4" />
            00:{timeLeft.toString().padStart(2, "0")}
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-1.5">
          <div className="h-2 rounded-full overflow-hidden bg-zinc-100 border border-zinc-200/50">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="h-1 rounded-full overflow-hidden bg-zinc-100 border border-zinc-200/30">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${timerCritical ? "bg-red-500" : "bg-sky-500"}`}
              style={{ width: `${(timeLeft / 60) * 100}%` }}
            />
          </div>
        </div>

        {timerCritical && (
          <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-red-500">
            <AlertTriangle className="w-3.5 h-3.5" />
            VAQT TUGAMOQDA!
          </div>
        )}
      </div>

      {/* Question card */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs relative overflow-hidden">
        <div className="space-y-5">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 mt-0.5 shrink-0 text-primary" />
            <h2
              className="text-sm md:text-base leading-relaxed font-bold text-zinc-900"
              data-testid="text-question"
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
                  className={`w-full text-left px-4 py-3.5 rounded-xl flex items-start gap-3 transition-all duration-150 text-xs font-medium border cursor-pointer ${
                    isSelected
                      ? "bg-indigo-50 border-primary text-primary shadow-xs"
                      : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50/50 hover:border-zinc-300"
                  }`}
                >
                  <span
                    className={`shrink-0 font-bold text-[10px] w-5 h-5 flex items-center justify-center rounded-lg border ${
                      isSelected
                        ? "bg-primary border-primary text-white"
                        : "bg-zinc-100 border-zinc-200 text-zinc-500"
                    }`}
                  >
                    {["A", "B", "C", "D"][i]}
                  </span>
                  <span className="flex-1 pt-0.5 leading-normal">{opt}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2">
            <button
              className={`w-full py-3.5 flex items-center justify-center gap-2 text-xs font-bold tracking-wider uppercase rounded-xl transition-all duration-150 border ${
                selectedOption !== null
                  ? "bg-primary text-white border-primary hover:bg-primary/95 cursor-pointer shadow-sm active:translate-y-0.5"
                  : "bg-zinc-100 text-zinc-400 border-zinc-200 cursor-not-allowed"
              }`}
              onClick={handleNext}
              disabled={selectedOption === null}
              data-testid="button-next"
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
