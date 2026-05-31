import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ShieldCheck, BookOpen, BarChart3, Sliders, Users, Star, ArrowRight, ArrowRightCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { 
    userRole,
    hasCompletedInitialTest, 
    currentLevel, 
    readinessScore, 
    moduleProgress, 
    resetProgress, 
    assignments,
    students
  } = useAppStore();

  const pageVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
  };

  // Determine Student's Recommended Module and reason
  const getRecommendation = () => {
    if (!hasCompletedInitialTest) {
      return { 
        title: "Dastlabki Tashxis Testi (Initial Assessment)", 
        reason: "Based on fuzzy logic: run evaluation to determine starting learning path",
        path: "/assessment"
      };
    }
    
    if (currentLevel === "Beginner") {
      return {
        title: "Cybersecurity Basics",
        reason: "Based on fuzzy logic: strengthen fundamentals and build basic awareness.",
        path: "/module/1"
      };
    }
    
    if (currentLevel === "Intermediate") {
      return {
        title: "Network Threats",
        reason: "Based on fuzzy logic: increase difficulty slightly.",
        path: "/module/2"
      };
    }
    
    // Advanced
    const cryptoModule = moduleProgress.find(m => m.id === 3);
    if (cryptoModule && !cryptoModule.completed) {
      return {
        title: "Cryptography",
        reason: "Based on fuzzy logic: transition to advanced crypto and systems defense protocols.",
        path: "/module/3"
      };
    }
    
    return {
      title: "System Protection",
      reason: "Based on fuzzy logic: transition to advanced system defense protocols.",
      path: "/module/4"
    };
  };

  const recommendation = getRecommendation();

  // Simple completion percent calculation based on completed modules
  const completedCount = moduleProgress.filter(m => m.completed).length;
  const completionPercent = Math.max(
    hasCompletedInitialTest ? 15 : 0, 
    Math.round((completedCount / moduleProgress.length) * 100)
  );

  return (
    <motion.div initial="hidden" animate="visible" variants={pageVariants} className="space-y-8">
      {userRole === "Student" ? (
        /* STUDENT VIEW (Matches the screenshot layout perfectly!) */
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-black font-sans">Adaptive Learning Dashboard</h1>
            <p className="text-muted-foreground mt-1 text-sm font-sans">
              AI-powered cybersecurity training system
            </p>
          </div>

          {/* Card 1: Your Progress */}
          <Card className="border-border/60 shadow-sm bg-white">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-sm text-black font-sans">Your Progress</h3>
              <Progress value={completionPercent} className="h-4 [&>div]:bg-black" />
              <div className="text-xs font-semibold text-muted-foreground font-sans">
                Completion: {completionPercent}%
              </div>
            </CardContent>
          </Card>

          {/* Card 2: AI Fuzzy Evaluation */}
          <Card className="border-border/60 shadow-sm bg-white">
            <CardContent className="p-6 space-y-2">
              <h3 className="font-bold text-sm text-black font-sans">AI Fuzzy Evaluation</h3>
              <div className="font-mono text-sm font-bold text-black mt-1">
                Current Level: {currentLevel} (Fuzzy: {readinessScore.toFixed(2)})
              </div>
              <div className="text-xs text-muted-foreground font-sans">
                ANFIS model adjusts your learning path dynamically
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Next Recommendation */}
          <Card className="border-border/60 shadow-sm bg-white">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-sm text-black font-sans">Next Recommendation</h3>
              <div className="space-y-1">
                <div className="text-sm font-semibold text-black">
                  Module: {recommendation.title}
                </div>
                <div className="text-xs text-muted-foreground font-sans">
                  {recommendation.reason}
                </div>
              </div>
              <div>
                <Button 
                  onClick={() => setLocation(recommendation.path)}
                  className="bg-black text-white hover:bg-black/90 text-xs font-mono font-bold py-2 px-4 rounded-md"
                >
                  Start Module
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Training Modules Grid */}
          <section className="pt-4">
            <h2 className="text-xl font-bold mb-4 font-sans text-black">Training Modules</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {moduleProgress.map((mod) => (
                <Card 
                  key={mod.id} 
                  className={`border-border/60 shadow-sm bg-white transition-all ${
                    mod.unlocked 
                      ? "cursor-pointer hover:border-black/50 hover:shadow" 
                      : "opacity-50"
                  }`}
                  onClick={() => mod.unlocked && setLocation(`/module/${mod.id}`)}
                >
                  <CardContent className="p-5 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-10 rounded-lg bg-[#f8f9fa] flex items-center justify-center border border-border/40">
                        <BookOpen className={`w-4 h-4 ${mod.unlocked ? 'text-black' : 'text-muted-foreground'}`} />
                      </div>
                      {mod.completed ? (
                        <Badge variant="outline" className="border-black bg-black text-white font-mono text-[9px]">Done</Badge>
                      ) : mod.unlocked ? (
                        <Badge variant="outline" className="border-black text-black font-mono text-[9px]">Open</Badge>
                      ) : (
                        <Badge variant="outline" className="border-muted text-muted-foreground font-mono text-[9px]">Locked</Badge>
                      )}
                    </div>
                    <div>
                      <div className="text-[10px] font-mono text-muted-foreground mb-1">MOD-{mod.id.toString().padStart(2, '0')}</div>
                      <div className="font-bold text-sm text-black line-clamp-1">{mod.title}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Reset button */}
          <div className="flex justify-end pt-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={resetProgress} 
              className="text-muted-foreground font-mono text-xs hover:text-black hover:bg-transparent"
            >
              [ Reset System State ]
            </Button>
          </div>
        </div>
      ) : (
        /* TEACHER VIEW */
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-black font-sans">Teacher Control Panel</h1>
            <p className="text-muted-foreground mt-1 text-sm font-sans">
              O'qituvchi boshqaruv markazi. Guruhni boshqarish va AI parametrlarini nazorat qilish.
            </p>
          </div>

          {/* Teacher Summary Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-border/60 bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-muted-foreground uppercase">Jami O'quvchilar</span>
                  <Users className="w-5 h-5 text-black" />
                </div>
                <div className="text-3xl font-bold font-mono mt-2 text-black">{students.length} ta</div>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-muted-foreground uppercase">Fuzzy Bahosi (O'rtacha)</span>
                  <Star className="w-5 h-5 text-black" />
                </div>
                <div className="text-3xl font-bold font-mono mt-2 text-black">
                  {students.length > 0 ? (students.reduce((acc, s) => acc + s.fuzzyScore, 0) / students.length * 100).toFixed(0) : 0}%
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-muted-foreground uppercase">Faol Topshiriqlar</span>
                  <BookOpen className="w-5 h-5 text-black" />
                </div>
                <div className="text-3xl font-bold font-mono mt-2 text-black">{assignments.length} ta</div>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-muted-foreground uppercase">AI Tizim Holati</span>
                  <ShieldCheck className="w-5 h-5 text-black" />
                </div>
                <div className="text-3xl font-bold font-mono mt-2 text-black text-green-600">Active</div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Action Navigation */}
          <div className="grid md:grid-cols-2 gap-6 pt-4">
            <Card 
              className="border-border/60 bg-white cursor-pointer hover:shadow-md transition-all"
              onClick={() => setLocation("/ai-engine")}
            >
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="font-bold text-md text-black font-mono">Fuzzy AI Sozlash (ANFIS)</h4>
                  <p className="text-xs text-muted-foreground">IF-THEN qoidalari va a'zolik funksiyalarini boshqarish</p>
                </div>
                <ArrowRightCircle className="w-6 h-6 text-black shrink-0 ml-4" />
              </CardContent>
            </Card>

            <Card 
              className="border-border/60 bg-white cursor-pointer hover:shadow-md transition-all"
              onClick={() => setLocation("/analytics")}
            >
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="font-bold text-md text-black font-mono">Guruh Analitikasi</h4>
                  <p className="text-xs text-muted-foreground">O'quvchilar ro'yxati, diagnostic natijalar va topshiriqlar</p>
                </div>
                <ArrowRightCircle className="w-6 h-6 text-black shrink-0 ml-4" />
              </CardContent>
            </Card>
          </div>

          {/* Class Assignments summary */}
          <Card className="border-border/60 bg-white">
            <CardHeader className="border-b border-border/40">
              <CardTitle className="text-md font-bold font-mono">Faol O'quv Vazifalari</CardTitle>
              <CardDescription>O'quvchilarga topshirilgan individual mashqlar</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {assignments.length === 0 ? (
                <div className="text-xs text-muted-foreground text-center py-6">Faol topshiriqlar mavjud emas.</div>
              ) : (
                <div className="space-y-2">
                  {assignments.map(as => (
                    <div key={as.id} className="flex justify-between items-center p-3 border border-border/30 rounded-lg bg-[#f8f9fa] text-xs">
                      <div>
                        <span className="font-bold text-black">{as.title}</span>
                        <div className="text-[10px] text-muted-foreground font-mono mt-0.5">O'quvchi: {as.studentName} | Sana: {as.dateAssigned}</div>
                      </div>
                      <Badge variant="outline" className={`font-mono text-[9px] ${as.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {as.completed ? "Bajarildi" : "Kutilmoqda"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </motion.div>
  );
}
