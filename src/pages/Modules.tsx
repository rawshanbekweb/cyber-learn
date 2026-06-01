import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Wifi, Lock, Server, LockKeyhole } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const icons = {
  1: Shield,
  2: Wifi,
  3: Lock,
  4: Server,
};

const descriptions = {
  1: "Kiberxavfsizlikning asosiy tamoyillari: CIA triad, tahdidlarni modellashtirish va himoya qatlamlari.",
  2: "Tarmoq hujumlarini - Man-in-the-Middle, DDoS va paket ushlashni aniqlash va qarshi turish.",
  3: "Simmetrik/asimmetrik shifrlash va hash algoritmlari orqali xavfsiz aloqa.",
  4: "Endpoint xavfsizligi, kirish nazorati, ko‘p faktorli autentifikatsiya va SIEM monitoring.",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function Modules() {
  const [, setLocation] = useLocation();
  const { moduleProgress, currentLevel } = useAppStore();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-mono tracking-tight text-primary">Ta'lim modullari</h1>
          <p className="text-muted-foreground mt-1">O'quv modullaridan birini tanlang va ta'limni boshlang yoki davom ettiring.</p>
        </div>
      </div>

      {currentLevel === "Beginner" && (
        <Alert className="border-primary/50 bg-primary/10 text-primary glow-effect">
          <Shield className="h-4 w-4" />
          <AlertTitle className="font-mono">Tizim xabari</AlertTitle>
          <AlertDescription>
            Keyingi modul ochilishini kutmasdan avval 1-modulni yakunlang.
          </AlertDescription>
        </Alert>
      )}

      <motion.div 
        className="grid md:grid-cols-2 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {moduleProgress.map((mod) => {
          const Icon = icons[mod.id as keyof typeof icons] || Shield;
          
          return (
            <motion.div key={mod.id} variants={itemVariants}>
              <Card 
                className={`h-full border-border/50 transition-all duration-300 relative overflow-hidden group
                  ${mod.unlocked 
                    ? 'cursor-pointer hover:border-primary hover:shadow-[0_0_15px_rgba(var(--primary),0.2)] bg-card/60 backdrop-blur' 
                    : 'opacity-60 bg-muted/20 grayscale'
                  }`}
                onClick={() => mod.unlocked && setLocation(`/module/${mod.id}`)}
                data-testid={`card-module-${mod.id}`}
              >
                {!mod.unlocked && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/40 backdrop-blur-[2px]">
                    <LockKeyhole className="w-12 h-12 text-muted-foreground opacity-50" />
                  </div>
                )}
                
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div className="w-12 h-12 rounded-lg bg-background border border-border flex items-center justify-center group-hover:border-primary/50 transition-colors">
                    <Icon className={`w-6 h-6 ${mod.unlocked ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  {mod.completed ? (
                    <Badge variant="outline" className="border-accent text-accent font-mono">Tugatildi</Badge>
                  ) : mod.unlocked ? (
                    <Badge variant="outline" className="border-primary text-primary font-mono">Ochilgan</Badge>
                  ) : (
                    <Badge variant="outline" className="border-muted-foreground text-muted-foreground font-mono">Yopilgan</Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="text-xs font-mono text-muted-foreground mb-2">MOD-{mod.id.toString().padStart(2, '0')}</div>
                  <CardTitle className="mb-2">{mod.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {descriptions[mod.id as keyof typeof descriptions]}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
