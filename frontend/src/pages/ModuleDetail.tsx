import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { runFuzzyEngine } from "@/lib/fuzzyEngine";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Shield, Wifi, Lock, Server, ArrowLeft, Terminal, AlertTriangle, CheckCircle2, XCircle, Download, Loader2, Flag, Lightbulb, Send } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { translateLevel } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

const PASSING_SCORE = 0.7;

const moduleData = {
  1: {
    title: "Kiberxavfsizlik Asoslari", icon: Shield,
    content: "Kiberxavfsizlik tizimlar, tarmoqlar va ilovalarni raqamli hujumlardan himoya qilish amaliyotidir. CIA Triadi — Maxfiylik, Butunlik va Mavjudlik — barcha xavfsizlik printsiplarining asosini tashkil etadi. Maxfiylik faqat ruxsat etilgan tomonlarga ma'lumotga kirishga imkon beradi. Butunlik ma'lumotning o'zgarmasligini ta'minlaydi. Mavjudlik esa tizimlarning kerak paytda ishlashini kafolatlaydi. Odatiy tahdidlar: zararli dastur, phishing, ijtimoiy muhandislik va xizmatni rad etish hujumlari.",
    concepts: ["CIA Triadi", "Tahdidlarni Modellashtirish", "Hujum vektorlar", "Chuqur himoya qatlamlari"],
    quiz: [
      {q: "CIA Triadidagi 'A' nima?", options: ["Autentifikatsiya","Mavjudlik","Avtorizatsiya","Kirish"], correct: 1},
      {q: "Quyidagilardan qaysi biri keng tarqalgan hujum vektori emas?", options: ["Phishing","Ijtimoiy muhandislik","Shifrlash","Zararli dastur"], correct: 2},
      {q: "Defense in Depth nima anglatadi?", options: ["Faqat bitta kuchli firewall","Bir nechta xavfsizlik qatlami","Chuqur veb himoyasi","Faqat antivirus"], correct: 1}
    ]
  },
  2: {
    title: "Tarmoq Xavflari", icon: Wifi,
    content: "Tarmoq xavfsizligi tarmoq va ma'lumotlarning yaxlitligi va foydalanish qobiliyatini himoya qiladi. Keng tarqalgan tahdidlar: Man-in-the-Middle (MitM), DDoS, paket ushlash va port tekshiruvi. Firewall, IDS/IPS va VPN asosiy himoya choralari hisoblanadi.",
    concepts: ["Firewall", "IDS/IPS", "VPN", "DDoS Himoyasi"],
    quiz: [
      {q: "DDoS nimaning qisqartmasi?", options: ["Distributed Denial of Service","Direct Data over SSL","Dynamic DNS over SMTP","Dual Disk Operating System"], correct: 0},
      {q: "MitM hujumi nima?", options: ["Mashina ichidagi zararli dastur","Ikki tomon orasidagi aloqa ushlash","Firewallni chetlab o'tish","Port skanerlash usuli"], correct: 1},
      {q: "VPN nima uchun himoya qiladi?", options: ["Uskunani","Faqat brauzer tarixini","Tarmoq trafikini va identifikatsiyani","Qattiq disk ma'lumotlarini"], correct: 2}
    ]
  },
  3: {
    title: "Kriptografiya", icon: Lock,
    content: "Kriptografiya xavfsiz aloqa fanidir. Simmetrik shifrlash (AES) bitta kalit bilan ishlaydi. Asimmetrik shifrlash (RSA) ochiq/maxfiy kalit juftliklarini ishlatadi. Hash funksiyalari (SHA-256) belgilangan uzunlikdagi barmoq izlarini yaratadi. TLS/SSL protokollari veb komunikatsiyalarni himoyalaydi.",
    concepts: ["AES shifrlash", "RSA algoritmi", "Hash funksiyalari", "TLS/SSL"],
    quiz: [
      {q: "AES qaysi turdagi shifrlash?", options: ["Asimmetrik","Simmetrik","Hash asosida","Kvant"], correct: 1},
      {q: "Ochiq kalit nima uchun ishlatiladi?", options: ["Faqat dekripsiya uchun","Shifrlash uchun (har kim shifrlashi, faqat egasi dekripti qiladi)","Parol saqlash","Faqat imzolash"], correct: 1},
      {q: "SHA-256 nima hosil qiladi?", options: ["Shifrlangan matn","Belgilangan uzunlikdagi hash/barmoq izi","Maxfiy kalit","Sertifikat"], correct: 1}
    ]
  },
  4: {
    title: "Tizim Himoyasi", icon: Server,
    content: "Tizim himoyasi end-point xavfsizligi, yangilanishlarni boshqarish va kirish nazoratini qamrab oladi. Minimal huquq printsipi ruxsatlarni cheklaydi. Ko'p faktorli autentifikatsiya qatlam qo'shadi. Muntazam yangilash ma'lum zaifliklarni yopadi. SIEM kengaytirilgan monitoringni ta'minlaydi.",
    concepts: ["Minimal huquq", "Yangilash boshqaruvi", "MFA", "SIEM"],
    quiz: [
      {q: "Minimal huquq printsipi nima?", options: ["Barcha foydalanuvchilarga admin berish","Faqat zarur ruxsatlarni berish","Parollarni xavfsiz ulashish","Barcha hisoblarni o'chirish"], correct: 1},
      {q: "Yangilash boshqaruvi nega muhim?", options: ["Funktsiyalar qo'shadi","Ma'lum xavfsizlik zaifliklarini yopadi","Foydalanuvchi interfeysini yaxshilaydi","Xotirani oshiradi"], correct: 1},
      {q: "SIEM nimaning qisqartmasi?", options: ["Xavfsizlik ma'lumotlari va voqealarni boshqarish","Tizim integratsiyasi va voqea monitoringi","Xavfsiz internet tugunini boshqaruvchi","Dasturiy ta'minot infratuzilmasi favqulodda moduli"], correct: 0}
    ]
  }
};

type CTFChallengeData = {
  id: number;
  moduleId: number;
  title: string;
  description: string;
  difficulty: "Oson" | "O'rta" | "Qiyin";
  points: number;
  hint: string;
  solved: boolean;
};

const ctfDifficultyColors: Record<string, string> = {
  "Oson": "border-emerald-200 text-emerald-700 bg-emerald-50",
  "O'rta": "border-amber-200 text-amber-700 bg-amber-50",
  "Qiyin": "border-red-200 text-red-700 bg-red-50",
};

function CTFChallenges({ moduleId, token }: { moduleId: number; token: string | null }) {
  const [challenges, setChallenges] = useState<CTFChallengeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [flagInputs, setFlagInputs] = useState<Record<number, string>>({});
  const [feedback, setFeedback] = useState<Record<number, { correct: boolean; message: string } | undefined>>({});
  const [submitting, setSubmitting] = useState<number | null>(null);
  const [revealedHints, setRevealedHints] = useState<Record<number, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.get<CTFChallengeData[]>(`/api/modules/${moduleId}/ctf`, token)
      .then(data => { if (!cancelled) setChallenges(data); })
      .catch(() => { if (!cancelled) setChallenges([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [moduleId, token]);

  const handleSubmit = async (challengeId: number) => {
    const flag = (flagInputs[challengeId] ?? "").trim();
    if (!flag) return;
    setSubmitting(challengeId);
    try {
      const res = await api.post<{ correct: boolean; alreadySolved: boolean; message: string; pointsAwarded?: number }>(
        `/api/ctf/${challengeId}/submit`, { flag }, token
      );
      setFeedback(prev => ({ ...prev, [challengeId]: { correct: res.correct, message: res.message } }));
      if (res.correct) {
        setChallenges(prev => prev.map(c => c.id === challengeId ? { ...c, solved: true } : c));
        if (!res.alreadySolved) {
          toast({ title: "🚩 Flag qabul qilindi!", description: `+${res.pointsAwarded ?? 0} XP qo'lga kiritdingiz.` });
        }
      }
    } catch (err) {
      setFeedback(prev => ({ ...prev, [challengeId]: { correct: false, message: err instanceof Error ? err.message : "Xatolik yuz berdi" } }));
    } finally {
      setSubmitting(null);
    }
  };

  if (loading || challenges.length === 0) return null;

  return (
    <Card className="bg-card/40 backdrop-blur border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="font-mono text-lg text-primary flex items-center gap-2">
          <Flag className="w-5 h-5" /> CTF Challenge'lar
        </CardTitle>
        <CardDescription className="font-mono text-xs">
          Bu modul mavzusiga oid flag'larni toping va XP qo'lga kiriting.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {challenges.map(ch => (
          <div
            key={ch.id}
            className={`rounded-xl border p-4 space-y-3 ${ch.solved ? "border-emerald-500/40 bg-emerald-500/5" : "border-border/50 bg-background/30"}`}
          >
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono font-bold text-sm">{ch.title}</span>
                <Badge variant="outline" className={`font-mono text-[10px] ${ctfDifficultyColors[ch.difficulty]}`}>
                  {ch.difficulty}
                </Badge>
                <Badge variant="outline" className="font-mono text-[10px] border-primary/30 text-primary bg-primary/5">
                  {ch.points} XP
                </Badge>
              </div>
              {ch.solved && (
                <Badge variant="outline" className="font-mono text-[10px] border-emerald-500 text-emerald-600 bg-emerald-500/10">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Yechildi
                </Badge>
              )}
            </div>
            <p className="text-xs font-mono text-muted-foreground leading-relaxed">
              {ch.description}
            </p>

            {ch.hint && !ch.solved && (
              revealedHints[ch.id] ? (
                <p className="text-xs font-mono text-amber-600 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 flex items-start gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 mt-0.5 shrink-0" /> {ch.hint}
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => setRevealedHints(prev => ({ ...prev, [ch.id]: true }))}
                  className="text-[10px] font-mono text-amber-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Lightbulb className="w-3 h-3" /> Maslahatni ko'rsatish
                </button>
              )
            )}

            {!ch.solved && (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="cyberai{...}"
                  value={flagInputs[ch.id] ?? ""}
                  onChange={e => setFlagInputs(prev => ({ ...prev, [ch.id]: e.target.value }))}
                  onKeyDown={e => { if (e.key === "Enter") handleSubmit(ch.id); }}
                  className="flex-1 text-xs font-mono px-3 py-2 rounded-lg border border-border/50 bg-background/50 outline-none focus:border-primary transition"
                />
                <Button
                  size="sm"
                  className="font-mono shrink-0"
                  onClick={() => handleSubmit(ch.id)}
                  disabled={submitting === ch.id || !(flagInputs[ch.id] ?? "").trim()}
                >
                  {submitting === ch.id ? "..." : <><Send className="w-3.5 h-3.5 mr-1" /> Yuborish</>}
                </Button>
              </div>
            )}

            {feedback[ch.id] && !ch.solved && (
              <p className={`text-xs font-mono ${feedback[ch.id]!.correct ? "text-emerald-600" : "text-destructive"}`}>
                {feedback[ch.id]!.message}
              </p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function ModuleDetail() {
  const [match, params] = useRoute("/module/:id");
  const id = params?.id ? parseInt(params.id) : 1;
  
  const { moduleProgress, completeModule, submitAssessment, token } = useAppStore();
  const modProgress = moduleProgress.find(m => m.id === id);
  const data = moduleData[id as keyof typeof moduleData];
  const { toast } = useToast();

  const [quizActive, setQuizActive] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizResult, setQuizResult] = useState<any>(null);
  const [quizPassed, setQuizPassed] = useState<boolean | null>(null);
  const [downloadingCert, setDownloadingCert] = useState(false);

  useEffect(() => {
    if (!quizActive || quizResult) return;
    if (timeLeft <= 0) {
      handleFinishQuiz();
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [quizActive, timeLeft, quizResult]);

  const handleStartQuiz = () => {
    setQuizActive(true);
    setCurrentQuestion(0);
    setAnswers([]);
    setTimeLeft(30);
    setSelectedOption(null);
    setQuizResult(null);
  };

  const handleNextQuestion = () => {
    const newAnswers = [...answers, selectedOption ?? -1];
    setAnswers(newAnswers);
    setSelectedOption(null);

    if (currentQuestion < data.quiz.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      handleFinishQuiz(newAnswers);
    }
  };

  const handleFinishQuiz = async (finalAnswers = answers) => {
    let correct = 0;
    finalAnswers.forEach((ans, i) => {
      if (ans === data.quiz[i].correct) correct++;
    });

    const knowledge = correct / data.quiz.length;
    const errors = (data.quiz.length - correct) / data.quiz.length;
    const speed = Math.max(0, timeLeft / 30);

    const result = runFuzzyEngine(knowledge, errors, speed);
    submitAssessment({ knowledge, errors, speed });
    setQuizResult(result);
    setQuizActive(false);

    const passed = knowledge >= PASSING_SCORE;
    setQuizPassed(passed);
    if (passed) completeModule(id);

    // Best-effort backend sync so the level/unlocks the certificate check
    // relies on stay consistent with what the student sees locally.
    try {
      await api.post("/api/assessment/submit", { knowledge, errors, speed }, token);
    } catch { /* non-blocking */ }

    if (passed) {
      try {
        await api.post(`/api/modules/${id}/complete`, { score: knowledge }, token);
      } catch (err) {
        toast({
          title: "Sertifikat serverga saqlanmadi",
          description: err instanceof Error
            ? err.message
            : "Modul mahalliy ravishda tugatildi, lekin serverga yozib bo'lmadi.",
        });
      }
    }
  };

  const downloadCertificate = async () => {
    setDownloadingCert(true);
    try {
      const blob = await api.downloadFile(`/api/modules/${id}/certificate`, token);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sertifikat-${id}.png`;
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
      setDownloadingCert(false);
    }
  };

  if (!modProgress || !data || !modProgress.unlocked) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-mono text-destructive">KIRISH TAQIQLANDI</h2>
        <p className="text-muted-foreground mt-2">Ushbu modul hozirda yopilgan yoki mavjud emas.</p>
        <Button variant="outline" className="mt-6" asChild>
          <Link href="/modules">Modullarga qaytish</Link>
        </Button>
      </div>
    );
  }

  const Icon = data.icon;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
      <Link href="/modules" className="inline-flex items-center text-sm font-mono text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Modullar
      </Link>

      <div className="flex items-start justify-between border-b border-border/50 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-card border border-border flex items-center justify-center glow-effect">
            <Icon className="w-8 h-8 text-primary" />
          </div>
          <div>
            <div className="text-sm font-mono text-muted-foreground mb-1">MOD-{id.toString().padStart(2, '0')}</div>
            <h1 className="text-3xl font-bold tracking-tight">{data.title}</h1>
          </div>
        </div>
        {modProgress.completed && (
          <Badge variant="outline" className="border-accent text-accent px-3 py-1 font-mono text-sm">
            <CheckCircle2 className="w-4 h-4 mr-2" /> Tugatildi
          </Badge>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-card/40 backdrop-blur border-border/50">
            <CardContent className="p-6">
              <h3 className="font-mono text-lg text-primary mb-4 border-b border-border/50 pb-2">Modul ma'lumotlari</h3>
              <p className="text-muted-foreground leading-relaxed">
                {data.content}
              </p>
            </CardContent>
          </Card>

          {quizResult && (
            <Alert className={`border-l-4 ${
              quizPassed ? 'border-primary bg-primary/10 text-primary' : 'border-destructive bg-destructive/10 text-destructive'
            }`}>
              <AlertTitle className="font-mono mb-2 flex items-center gap-2">
                {quizPassed ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                {quizPassed ? "Test topshirildi!" : "Test topshirilmadi"} — Daraja: {translateLevel(quizResult.level)}
              </AlertTitle>
              <AlertDescription>
                {quizPassed
                  ? "Tabriklaymiz! Siz talab qilingan 70% chegarasidan o'tdingiz va modul tugatildi deb belgilandi."
                  : "Afsuski, 70% chegarasidan o'ta olmadingiz. Materialni qayta ko'rib chiqib, testni qayta urinib ko'ring."}
              </AlertDescription>
            </Alert>
          )}

          {!quizActive && !modProgress.completed && (
            <Button
              size="lg"
              className="w-full font-mono text-lg glow-effect h-14"
              onClick={handleStartQuiz}
              data-testid="button-simulate-attack"
            >
              <Terminal className="w-5 h-5 mr-2" />
              {quizResult ? "Qayta urinish" : "Hujumni simulyatsiya qilish / Test"}
            </Button>
          )}

          {quizActive && (
            <Card className="border-primary/50 glow-effect bg-card/60 backdrop-blur">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-center font-mono text-sm mb-4">
                  <span className="text-muted-foreground">Simulyatsiya: {currentQuestion + 1}/{data.quiz.length}</span>
                  <span className={timeLeft < 10 ? 'text-destructive animate-pulse' : 'text-primary'}>
                    00:{timeLeft.toString().padStart(2, '0')}
                  </span>
                </div>
                <Progress value={(timeLeft / 30) * 100} className={`h-1 ${timeLeft < 10 ? '[&>div]:bg-destructive' : ''}`} />
                <CardTitle className="text-lg font-mono leading-relaxed mt-4">
                  {data.quiz[currentQuestion].q}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  {data.quiz[currentQuestion].options.map((opt, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      className={`h-auto p-3 justify-start font-mono text-left whitespace-normal text-sm ${selectedOption === i ? 'border-primary bg-primary/10 text-primary' : 'hover:border-primary/50'}`}
                      onClick={() => setSelectedOption(i)}
                    >
                      <span className="mr-3 text-muted-foreground">[{i}]</span>
                      {opt}
                    </Button>
                  ))}
                </div>
                <Button 
                  className="w-full font-mono mt-4" 
                  onClick={handleNextQuestion}
                  disabled={selectedOption === null}
                >
                  {currentQuestion === data.quiz.length - 1 ? 'Baholashni yakunlash' : 'Keyingi savol'}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="bg-card/40 backdrop-blur border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="font-mono text-sm text-muted-foreground">Asosiy tushunchalar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {data.concepts.map(c => (
                  <Badge key={c} variant="secondary" className="font-mono bg-secondary/50 hover:bg-secondary border border-border/50">
                    {c}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {modProgress.completed && (
            <Button
              size="lg"
              className="w-full font-mono h-12 bg-amber-500 hover:bg-amber-600 text-white border-0 shadow-sm"
              onClick={downloadCertificate}
              disabled={downloadingCert}
              data-testid="button-download-certificate"
            >
              {downloadingCert ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
              Sertifikatni yuklab olish
            </Button>
          )}
        </div>
      </div>

      <CTFChallenges moduleId={id} token={token} />
    </motion.div>
  );
}
