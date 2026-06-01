import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { translateLevel } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const questions = [
  { q: "Kiberxavfsizlikda CIA nimaning qisqartmasi?", correct: 0, options: ["Maxfiylik, Butunlik, Mavjudlik","Markaziy Razvedka Agentligi","Kompyuter Ma'lumotlariga Kirish","Kiber Infratuzilma Arxitekturasi"] },
  { q: "Qaysi protokol veb trafikni shifrlaydi?", correct: 2, options: ["HTTP","FTP","HTTPS","SMTP"] },
  { q: "Zero-day zaiflik nima?", correct: 1, options: ["Zudlik bilan tuzatilgan xato","Hali patch mavjud bo'lmagan noma'lum ekspluat","Firewall qoidasidir","Zararli dastur turi"] },
  { q: "Firewall nima qiladi?", correct: 1, options: ["Internetni tezlashtiradi","Tarmoq traffikini nazorat qiladi va filtrlaydi","Ma'lumotni shifrlaydi","Fayllarni zaxiralaydi"] },
  { q: "Phishing nima?", correct: 1, options: ["Tarmoq skanerlash usuli","Kirish ma'lumotlarini o'g'irlashga qaratilgan firibgarlik","Shifrlash turi","Tizimni monitoring qilish vositasi"] },
  { q: "Qaysi parol kuchli?", correct: 2, options: ["password123","abc","Tr0ub4dor&3!","123456"] },
  { q: "Ikki faktorli autentifikatsiya nima?", correct: 2, options: ["Ikki paroldan foydalanish","Biometrik + parol","Ikki turdagi tekshiruvni talab qiluvchi xavfsizlik","Ikki marotaba shifrlash"] },
  { q: "Malware nima?", correct: 1, options: ["Uskuna nosozligi","Tizimga zarar yetkazuvchi zararli dastur","Tarmoq protokoli","Firewall turi"] }
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
    if (timeLeft <= 0) {
      handleFinish();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
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
    finalAnswers.forEach((ans, i) => {
      if (ans === questions[i].correct) correct++;
    });
    
    const knowledge = correct / questions.length;
    const errors = (questions.length - correct) / questions.length;
    const speed = Math.max(0, timeLeft / 60);

    submitAssessment({ knowledge, errors, speed });
    setIsFinished(true);
  };

  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (isFinished && lastFuzzyResult) {
    return (
      <motion.div initial="hidden" animate="visible" variants={pageVariants} className="max-w-2xl mx-auto space-y-8">
        <Card className="border-primary/50 glow-effect bg-card/50 backdrop-blur">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-mono text-primary">Baholash yakunlandi</CardTitle>
            <CardDescription>Fuzzy Logika Motorining natijalari</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 border border-border rounded-lg bg-background">
                <div className="text-sm text-muted-foreground mb-1">Tayinlangan daraja</div>
                <div className="text-2xl font-mono text-primary">{translateLevel(lastFuzzyResult.level)}</div>
              </div>
              <div className="p-4 border border-border rounded-lg bg-background">
                <div className="text-sm text-muted-foreground mb-1">Tayyorgarlik ko'rsatkichi</div>
                <div className="text-2xl font-mono text-primary">{(lastFuzzyResult.score * 100).toFixed(1)}%</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm font-mono">
                <span>Tizim mosligi</span>
                <span>{(lastFuzzyResult.score * 100).toFixed(0)}%</span>
              </div>
              <Progress value={lastFuzzyResult.score * 100} className="h-2" />
            </div>

            <Button onClick={() => setLocation("/")} className="w-full font-mono text-lg h-12" data-testid="button-view-dashboard">
              Boshqaruv paneliga qaytish
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const q = questions[currentQuestion];

  return (
    <motion.div initial="hidden" animate="visible" variants={pageVariants} className="max-w-2xl mx-auto">
      <div className="mb-8 space-y-4">
        <div className="flex justify-between items-center font-mono">
          <span className="text-muted-foreground" data-testid="text-progress">{currentQuestion + 1}-savol / {questions.length} ta</span>
          <span className={`text-xl ${timeLeft < 10 ? 'text-destructive animate-pulse' : 'text-primary'}`} data-testid="text-timer">
            00:{timeLeft.toString().padStart(2, '0')}
          </span>
        </div>
        <Progress value={(timeLeft / 60) * 100} className={`h-1 ${timeLeft < 10 ? '[&>div]:bg-destructive' : ''}`} />
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl font-mono leading-relaxed" data-testid="text-question">
            {q.q}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            {q.options.map((opt, i) => (
              <Button
                key={i}
                variant="outline"
                className={`h-auto p-4 justify-start font-mono text-left whitespace-normal ${selectedOption === i ? 'border-primary bg-primary/10 text-primary' : 'hover:border-primary/50'}`}
                onClick={() => setSelectedOption(i)}
                data-testid={`button-option-${i}`}
              >
                <span className="mr-4 text-muted-foreground">[{i}]</span>
                {opt}
              </Button>
            ))}
          </div>

          <div className="pt-6">
            <Button 
              className="w-full font-mono" 
              onClick={handleNext}
              disabled={selectedOption === null}
              data-testid="button-next"
            >
              {currentQuestion === questions.length - 1 ? 'Baholashni topshirish' : 'Keyingi savol'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
