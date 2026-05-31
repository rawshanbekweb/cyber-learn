import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { runFuzzyEngine } from "@/lib/fuzzyEngine";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Shield, Wifi, Lock, Server, ArrowLeft, Terminal, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const moduleData = {
  1: {
    title: "Cybersecurity Basics", icon: Shield,
    content: "Cybersecurity is the practice of protecting systems, networks, and programs from digital attacks. The CIA Triad — Confidentiality, Integrity, and Availability — forms the foundation of all security principles. Confidentiality ensures only authorized parties access information. Integrity ensures data remains accurate and unmodified. Availability ensures systems remain accessible when needed. Common threats include malware, phishing, social engineering, and denial-of-service attacks.",
    concepts: ["CIA Triad", "Threat Modeling", "Attack Vectors", "Defense in Depth"],
    quiz: [
      {q: "What is the 'A' in CIA Triad?", options: ["Authentication","Availability","Authorization","Access"], correct: 1},
      {q: "Which is NOT a common attack vector?", options: ["Phishing","Social Engineering","Encryption","Malware"], correct: 2},
      {q: "What does Defense in Depth mean?", options: ["One strong firewall","Multiple security layers","Deep web protection","Antivirus only"], correct: 1}
    ]
  },
  2: {
    title: "Network Threats", icon: Wifi,
    content: "Network security protects the integrity and usability of network and data. Common threats include Man-in-the-Middle (MitM) attacks, Distributed Denial of Service (DDoS), packet sniffing, and port scanning. Firewalls, intrusion detection systems (IDS), and virtual private networks (VPNs) are key defenses.",
    concepts: ["Firewalls", "IDS/IPS", "VPN", "DDoS Protection"],
    quiz: [
      {q: "What does DDoS stand for?", options: ["Distributed Denial of Service","Direct Data over SSL","Dynamic DNS over SMTP","Dual Disk Operating System"], correct: 0},
      {q: "What is a MitM attack?", options: ["Malware in the machine","Intercepting communication between two parties","A firewall bypass","A port scanning method"], correct: 1},
      {q: "What does a VPN protect?", options: ["Hardware","Browser history only","Network traffic and identity","Hard disk data"], correct: 2}
    ]
  },
  3: {
    title: "Cryptography", icon: Lock,
    content: "Cryptography is the science of secure communication. Symmetric encryption (AES) uses one key. Asymmetric encryption (RSA) uses public/private key pairs. Hash functions (SHA-256) create fixed-size fingerprints. TLS/SSL protocols secure web communications.",
    concepts: ["AES Encryption", "RSA Algorithm", "Hash Functions", "TLS/SSL"],
    quiz: [
      {q: "AES is which type of encryption?", options: ["Asymmetric","Symmetric","Hash-based","Quantum"], correct: 1},
      {q: "What is a public key used for?", options: ["Decryption only","Encryption (anyone can encrypt, only owner decrypts)","Password storage","Signing only"], correct: 1},
      {q: "SHA-256 produces what?", options: ["Encrypted text","A fixed-size hash/fingerprint","A private key","A certificate"], correct: 1}
    ]
  },
  4: {
    title: "System Protection", icon: Server,
    content: "System protection encompasses endpoint security, patch management, and access control. Principle of least privilege limits permissions. Multi-factor authentication adds layers. Regular patching closes known vulnerabilities. SIEM provides comprehensive monitoring.",
    concepts: ["Least Privilege", "Patch Management", "MFA", "SIEM"],
    quiz: [
      {q: "What is the Principle of Least Privilege?", options: ["Give all users admin","Grant only minimum necessary permissions","Share credentials safely","Disable all accounts"], correct: 1},
      {q: "Why is patch management important?", options: ["Adds features","Closes known security vulnerabilities","Improves UI","Increases storage"], correct: 1},
      {q: "What does SIEM stand for?", options: ["Security Information and Event Management","System Integration and Event Monitoring","Secure Internet Endpoint Manager","Software Infrastructure Emergency Module"], correct: 0}
    ]
  }
};

export default function ModuleDetail() {
  const [match, params] = useRoute("/module/:id");
  const id = params?.id ? parseInt(params.id) : 1;
  
  const { moduleProgress, completeModule, submitAssessment } = useAppStore();
  const modProgress = moduleProgress.find(m => m.id === id);
  const data = moduleData[id as keyof typeof moduleData];
  
  const [quizActive, setQuizActive] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizResult, setQuizResult] = useState<any>(null);

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
  };

  if (!modProgress || !data || !modProgress.unlocked) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-mono text-destructive">ACCESS DENIED</h2>
        <p className="text-muted-foreground mt-2">This module is currently locked or does not exist.</p>
        <Button variant="outline" className="mt-6" asChild>
          <Link href="/modules">Return to Modules</Link>
        </Button>
      </div>
    );
  }

  const Icon = data.icon;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
      <Link href="/modules" className="inline-flex items-center text-sm font-mono text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Modules
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
            <CheckCircle2 className="w-4 h-4 mr-2" /> Completed
          </Badge>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-card/40 backdrop-blur border-border/50">
            <CardContent className="p-6">
              <h3 className="font-mono text-lg text-primary mb-4 border-b border-border/50 pb-2">SYSTEM_DATA</h3>
              <p className="text-muted-foreground leading-relaxed">
                {data.content}
              </p>
            </CardContent>
          </Card>

          {quizResult && (
            <Alert className={`border-l-4 ${
              quizResult.level === 'Advanced' ? 'border-primary bg-primary/10 text-primary' : 
              quizResult.level === 'Intermediate' ? 'border-accent bg-accent/10 text-accent' : 
              'border-destructive bg-destructive/10 text-destructive'
            }`}>
              <AlertTitle className="font-mono mb-2 flex items-center gap-2">
                <Terminal className="w-4 h-4" /> Assessment Result: {quizResult.level}
              </AlertTitle>
              <AlertDescription>
                {quizResult.level === 'Beginner' && "Keep practicing. Retry this module to reinforce concepts."}
                {quizResult.level === 'Intermediate' && "Progressing well. Continue to the next module."}
                {quizResult.level === 'Advanced' && "Module mastered. Next module unlocked."}
              </AlertDescription>
            </Alert>
          )}

          {!quizActive && !quizResult && (
            <Button 
              size="lg" 
              className="w-full font-mono text-lg glow-effect h-14" 
              onClick={handleStartQuiz}
              data-testid="button-simulate-attack"
            >
              <Terminal className="w-5 h-5 mr-2" />
              Simulate Attack / Test
            </Button>
          )}

          {quizActive && (
            <Card className="border-primary/50 glow-effect bg-card/60 backdrop-blur">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-center font-mono text-sm mb-4">
                  <span className="text-muted-foreground">Simulation: {currentQuestion + 1}/{data.quiz.length}</span>
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
                  {currentQuestion === data.quiz.length - 1 ? 'Execute Evaluation' : 'Next Node'}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="bg-card/40 backdrop-blur border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="font-mono text-sm text-muted-foreground">Core Concepts</CardTitle>
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

          {!modProgress.completed && (
            <Button 
              variant="outline" 
              className="w-full font-mono text-muted-foreground hover:text-accent hover:border-accent border-dashed border-2" 
              onClick={() => completeModule(id)}
              data-testid="button-mark-complete"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Mark as Complete
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
