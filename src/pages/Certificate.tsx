import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Shield, Printer } from "lucide-react";

export default function Certificate() {
  const [, setLocation] = useLocation();
  const { readinessScore, currentLevel } = useAppStore();

  useEffect(() => {
    if (readinessScore < 0.8) {
      setLocation("/");
    }
  }, [readinessScore, setLocation]);

  if (readinessScore < 0.8) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 bg-background certificate-container">
      <div className="max-w-4xl w-full relative">
        <div className="absolute top-4 right-4 z-10 print:hidden">
          <Button onClick={() => window.print()} variant="outline" className="font-mono border-primary text-primary hover:bg-primary/10">
            <Printer className="w-4 h-4 mr-2" /> Print Certificate
          </Button>
        </div>

        <div className="border-4 border-primary/40 bg-card p-2 shadow-[0_0_50px_rgba(var(--primary),0.1)] glow-effect relative overflow-hidden">
          
          {/* Decorative hex pattern background */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='100' viewBox='0 0 60 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 17.32v34.64L30 69.28 0 51.96V17.32zM15 26l15-8.66 15 8.66v17.32L30 52 15 43.34zM0 86.6L30 69.28l30 17.32V100H0z' fill='%23ffffff' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            backgroundSize: "40px" 
          }} />

          <div className="border border-primary/20 p-8 sm:p-16 text-center relative z-10 bg-background/80 backdrop-blur-sm">
            
            <div className="flex justify-center mb-8">
              <Shield className="w-20 h-20 text-primary drop-shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
            </div>

            <h2 className="text-primary font-mono text-sm tracking-[0.3em] uppercase mb-4">CyberLearn AI</h2>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight mb-8 text-foreground">
              CERTIFICATE OF ACHIEVEMENT
            </h1>

            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="h-[1px] w-16 bg-primary/50" />
              <div className="w-2 h-2 rotate-45 bg-primary" />
              <div className="h-[1px] w-16 bg-primary/50" />
            </div>

            <p className="text-muted-foreground text-lg mb-2 font-mono">This certifies successful completion of the</p>
            <p className="text-2xl font-bold mb-8 font-mono text-foreground">Adaptive Cybersecurity Learning Platform</p>
            
            <p className="text-muted-foreground text-lg mb-2 font-mono">with</p>
            <p className="text-3xl font-bold text-accent drop-shadow-[0_0_10px_rgba(var(--accent),0.3)] mb-12">
              Advanced Cybersecurity Proficiency
            </p>

            <div className="grid sm:grid-cols-3 gap-8 items-end mt-16 max-w-3xl mx-auto">
              <div className="border-t border-border/50 pt-2">
                <p className="font-mono text-sm text-muted-foreground">Fuzzy Logic Engine</p>
              </div>
              
              <div className="text-center">
                <div className="text-5xl font-mono font-bold text-primary drop-shadow-[0_0_15px_rgba(var(--primary),0.4)] mb-2">
                  {(readinessScore * 100).toFixed(1)}%
                </div>
                <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Readiness Score</p>
              </div>

              <div className="border-t border-border/50 pt-2">
                <p className="font-mono text-sm text-foreground">{new Date().toLocaleDateString()}</p>
                <p className="font-mono text-xs text-muted-foreground mt-1">Date of Issuance</p>
              </div>
            </div>

          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          .certificate-container, .certificate-container * { visibility: visible; }
          .certificate-container { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; background: #000; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          header, nav { display: none !important; }
        }
      `}} />
    </div>
  );
}
