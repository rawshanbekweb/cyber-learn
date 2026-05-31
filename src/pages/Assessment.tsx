import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const questions = [
  { q: "What does CIA stand for in cybersecurity?", correct: 0, options: ["Confidentiality, Integrity, Availability","Central Intelligence Agency","Computer Information Access","Cyber Infrastructure Architecture"] },
  { q: "Which protocol encrypts web traffic?", correct: 2, options: ["HTTP","FTP","HTTPS","SMTP"] },
  { q: "What is a zero-day vulnerability?", correct: 1, options: ["A bug fixed immediately","An unknown exploit with no patch yet","A firewall rule","A type of malware"] },
  { q: "What does a firewall do?", correct: 1, options: ["Speeds up internet","Monitors and filters network traffic","Encrypts data","Backs up files"] },
  { q: "What is phishing?", correct: 1, options: ["A network scan technique","Fraudulent attempt to steal credentials","A type of encryption","A system monitoring tool"] },
  { q: "Which is a strong password?", correct: 2, options: ["password123","abc","Tr0ub4dor&3!","123456"] },
  { q: "What is two-factor authentication?", correct: 2, options: ["Using two passwords","Biometric + password","Security requiring two forms of verification","Double encryption"] },
  { q: "What is malware?", correct: 1, options: ["Hardware defect","Malicious software designed to harm systems","Network protocol","A firewall type"] }
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
            <CardTitle className="text-3xl font-mono text-primary">Assessment Complete</CardTitle>
            <CardDescription>Fuzzy Logic Engine Evaluation Results</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 border border-border rounded-lg bg-background">
                <div className="text-sm text-muted-foreground mb-1">Assigned Level</div>
                <div className="text-2xl font-mono text-primary">{lastFuzzyResult.level}</div>
              </div>
              <div className="p-4 border border-border rounded-lg bg-background">
                <div className="text-sm text-muted-foreground mb-1">Readiness Score</div>
                <div className="text-2xl font-mono text-primary">{(lastFuzzyResult.score * 100).toFixed(1)}%</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm font-mono">
                <span>System Alignment</span>
                <span>{(lastFuzzyResult.score * 100).toFixed(0)}%</span>
              </div>
              <Progress value={lastFuzzyResult.score * 100} className="h-2" />
            </div>

            <Button onClick={() => setLocation("/")} className="w-full font-mono text-lg h-12" data-testid="button-view-dashboard">
              Initialize Dashboard
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
          <span className="text-muted-foreground" data-testid="text-progress">Question {currentQuestion + 1} of {questions.length}</span>
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
              {currentQuestion === questions.length - 1 ? 'Submit Assessment' : 'Next Question'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
