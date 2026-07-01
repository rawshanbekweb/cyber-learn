import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { runFuzzyEngine } from "@/lib/fuzzyEngine";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Shield, Wifi, Lock, Server, ArrowLeft, Terminal, AlertTriangle, CheckCircle2, XCircle, Download, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { translateLevel } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
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

export default function ModuleDetail() {
  const [match, params] = useRoute("/module/:id");
  const id = params?.id ? parseInt(params.id) : 1;
  
  const { moduleProgress, completeModule, submitAssessment } = useAppStore();
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

  const handleFinishQuiz = (finalAnswers = answers) => {
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
  };

  const downloadCertificate = async () => {
    setDownloadingCert(true);
    try {
      const res = await fetch(`${API_URL}/api/modules/${id}/certificate`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Sertifikatni yuklab bo'lmadi");
      }
      const blob = await res.blob();
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
              variant="outline"
              className="w-full font-mono text-accent hover:border-accent border-dashed border-2"
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
    </motion.div>
  );
}
