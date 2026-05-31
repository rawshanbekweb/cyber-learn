import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Info, Settings2, Sliders, ArrowDown, Sparkles, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AIEngine() {
  const { userRole, fuzzyWeights, updateFuzzyWeights, resetProgress, hasCompletedInitialTest, currentLevel, readinessScore } = useAppStore();
  const { toast } = useToast();

  const handleWeightChange = (key: keyof typeof fuzzyWeights, value: number) => {
    updateFuzzyWeights({ [key]: value });
  };

  const saveWeights = () => {
    toast({
      title: "Sozlamalar saqlandi",
      description: "Fuzzy AI Engine parametrlari muvaffaqiyatli yangilandi.",
    });
  };

  const restoreDefaults = () => {
    updateFuzzyWeights({
      rule1Weight: 0.2,
      rule2Weight: 0.5,
      rule3Weight: 0.9,
      beginnerThreshold: 0.4,
      intermediateThreshold: 0.7,
    });
    toast({
      title: "Standart qiymatlar tiklandi",
      description: "Tizim dastlabki fuzzy parametrlariga qaytarildi.",
    });
  };

  const flowSteps = [
    {
      title: "1. Tizim ishga tushishi (Start)",
      desc: "Loyiha o'quvchi ma'lumotlarini qabul qiladi va diagnostic jarayonini boshlaydi.",
      active: true,
    },
    {
      title: "2. O'quvchi diagnostikasi & Ma'lumot yig'ish",
      desc: "Yoshi, dastlabki bilimlari va kirish testi orqali ko'rsatkichlar tahlil qilinadi.",
      active: hasCompletedInitialTest,
    },
    {
      title: "3. Fuzzy bilimlarni baholash",
      desc: "Noma'lumlikka asoslangan (Low / Medium / High) baholash mexanizmi.",
      active: hasCompletedInitialTest,
    },
    {
      title: "4. Adaptiv traektoriya tanlash (ANFIS)",
      desc: "A'zolik funksiyalari orqali individual qoidalar asosida o'quv yo'li aniqlanadi.",
      active: hasCompletedInitialTest,
    },
    {
      title: "5. Shaxsiy o'quv dasturi generatsiyasi",
      desc: `IF-THEN qoidalari orqali: Hozirgi darajangiz - ${currentLevel}`,
      active: hasCompletedInitialTest,
    },
    {
      title: "6. O'quv modullari",
      desc: "1. InfoSec asoslari | 2. Tarmoq xavflari | 3. Kriptografiya | 4. Tizim himoyasi",
      active: hasCompletedInitialTest,
    },
    {
      title: "7. Fuzzy o'zlashtirish tahlili",
      desc: "To'g'rilik foizi, xatolar soni va topshiriqni bajarish tezligi baholanadi.",
      active: hasCompletedInitialTest,
    },
    {
      title: "8. O'tish qarori (Dynamic Transition)",
      desc: `Fuzzy ko'rsatkich: ${(readinessScore * 100).toFixed(0)}% (IF success = HIGH THEN go forward | IF success = MEDIUM THEN repeat + hints)`,
      active: hasCompletedInitialTest,
    }
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-black font-mono">Fuzzy AI Engine & ANFIS</h1>
        <p className="text-muted-foreground mt-1">
          Noma'lumlikka asoslangan intellektual moslashuvchan o'qitish tizimi boshqaruv markazi.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Side: Flowchart (Block Diagram) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/60 shadow-sm bg-white">
            <CardHeader className="border-b border-border/40 py-4">
              <CardTitle className="text-lg font-bold font-mono flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-black" />
                Loyihaning ishlash block-sxemasi (Fuzzy Model)
              </CardTitle>
              <CardDescription>
                O'quvchining ko'rsatkichlarini real-vaqtda baholovchi ANFIS va Fuzzy qoidalar sxemasi
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {flowSteps.map((step, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div 
                    className={`w-full max-w-xl p-4 rounded-xl border transition-all ${
                      step.active 
                        ? "bg-[#f8f9fa] border-black text-black shadow-sm" 
                        : "bg-white border-border/40 text-muted-foreground"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold font-mono mt-0.5 ${
                        step.active ? "bg-black text-white" : "bg-muted text-muted-foreground"
                      }`}>
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm font-mono">{step.title}</h4>
                        <p className="text-xs mt-1 leading-relaxed">{step.desc}</p>
                      </div>
                      {step.active && (
                        <CheckCircle2 className="w-4 h-4 text-black ml-auto shrink-0 mt-0.5" />
                      )}
                    </div>
                  </div>
                  {idx < flowSteps.length - 1 && (
                    <ArrowDown className="w-5 h-5 my-2 text-muted-foreground/60" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Configuration & Formulas */}
        <div className="space-y-6">
          {/* Rules Configuration (Teacher only) */}
          <Card className="border-border/60 shadow-sm bg-white">
            <CardHeader className="border-b border-border/40">
              <CardTitle className="text-md font-bold font-mono flex items-center gap-2">
                <Settings2 className="w-4.5 h-4.5 text-black" />
                {userRole === "Teacher" ? "AI Parametrlarini Sozlash" : "Fuzzy AI Engine Sozlamalari"}
              </CardTitle>
              <CardDescription>
                {userRole === "Teacher" 
                  ? "Tizimning qaror qabul qilish og'irliklari va a'zolik funksiyalarini boshqaring." 
                  : "Hozirgi vaqtda o'qituvchi tomonidan belgilangan fuzzy qoidalari."}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Rule 1 Weight */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="font-bold text-black">Qoida 1 (Beginner) og'irligi</span>
                  <span className="bg-[#f1f3f5] px-1.5 py-0.5 rounded text-black font-semibold">
                    {fuzzyWeights.rule1Weight.toFixed(2)}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Kam bilim darajasi va ko'p xatolar uchun javob beruvchi a'zolik funksiyasi og'irligi.
                </p>
                <Slider
                  disabled={userRole !== "Teacher"}
                  min={0.05}
                  max={0.5}
                  step={0.05}
                  value={[fuzzyWeights.rule1Weight]}
                  onValueChange={(val) => handleWeightChange("rule1Weight", val[0])}
                />
              </div>

              {/* Rule 2 Weight */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="font-bold text-black">Qoida 2 (Intermediate) og'irligi</span>
                  <span className="bg-[#f1f3f5] px-1.5 py-0.5 rounded text-black font-semibold">
                    {fuzzyWeights.rule2Weight.toFixed(2)}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  O'rtacha tezlik va o'rtacha bilimlar uchun javob beruvchi qoida og'irligi.
                </p>
                <Slider
                  disabled={userRole !== "Teacher"}
                  min={0.3}
                  max={0.7}
                  step={0.05}
                  value={[fuzzyWeights.rule2Weight]}
                  onValueChange={(val) => handleWeightChange("rule2Weight", val[0])}
                />
              </div>

              {/* Rule 3 Weight */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="font-bold text-black">Qoida 3 (Advanced) og'irligi</span>
                  <span className="bg-[#f1f3f5] px-1.5 py-0.5 rounded text-black font-semibold">
                    {fuzzyWeights.rule3Weight.toFixed(2)}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Yuqori bilim darajasi va kam xatolar uchun javob beruvchi qoida og'irligi.
                </p>
                <Slider
                  disabled={userRole !== "Teacher"}
                  min={0.7}
                  max={1.0}
                  step={0.05}
                  value={[fuzzyWeights.rule3Weight]}
                  onValueChange={(val) => handleWeightChange("rule3Weight", val[0])}
                />
              </div>

              {/* Beginner Threshold */}
              <div className="space-y-2 pt-2 border-t border-border/40">
                <div className="flex justify-between text-xs font-mono">
                  <span className="font-bold text-black">Beginner chegara qiymati</span>
                  <span className="bg-[#f1f3f5] px-1.5 py-0.5 rounded text-black font-semibold">
                    {fuzzyWeights.beginnerThreshold.toFixed(2)}
                  </span>
                </div>
                <Slider
                  disabled={userRole !== "Teacher"}
                  min={0.2}
                  max={0.5}
                  step={0.05}
                  value={[fuzzyWeights.beginnerThreshold]}
                  onValueChange={(val) => handleWeightChange("beginnerThreshold", val[0])}
                />
              </div>

              {/* Intermediate Threshold */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="font-bold text-black">Intermediate chegara qiymati</span>
                  <span className="bg-[#f1f3f5] px-1.5 py-0.5 rounded text-black font-semibold">
                    {fuzzyWeights.intermediateThreshold.toFixed(2)}
                  </span>
                </div>
                <Slider
                  disabled={userRole !== "Teacher"}
                  min={0.5}
                  max={0.8}
                  step={0.05}
                  value={[fuzzyWeights.intermediateThreshold]}
                  onValueChange={(val) => handleWeightChange("intermediateThreshold", val[0])}
                />
              </div>

              {userRole === "Teacher" && (
                <div className="flex gap-2 pt-2">
                  <Button onClick={saveWeights} className="flex-1 bg-black text-white hover:bg-black/90 text-xs font-mono font-bold">
                    O'zgarishlarni Saqlash
                  </Button>
                  <Button variant="outline" onClick={restoreDefaults} className="text-xs font-mono">
                    Standartga qaytarish
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mathematical Logic Card */}
          <Card className="border-border/60 shadow-sm bg-white">
            <CardHeader className="border-b border-border/40">
              <CardTitle className="text-md font-bold font-mono flex items-center gap-2">
                <Info className="w-4.5 h-4.5 text-black" />
                Matematik Modellar
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <span className="font-bold font-mono text-black block">A'zolik funksiyasi (Fuzzy Sets):</span>
                <p className="text-muted-foreground leading-relaxed">
                  Har bir kiruvchi ko'rsatkich uchburchak a'zolik funksiyasi yordamida baholanadi: 
                  <code className="bg-[#f1f3f5] px-1 py-0.5 rounded text-black font-mono ml-1">
                    μ(low), μ(mid), μ(high)
                  </code>
                </p>
              </div>
              <div className="space-y-1 pt-2 border-t border-border/40">
                <span className="font-bold font-mono text-black block">Defuzzifikatsiya (Qaror qabul qilish):</span>
                <p className="text-muted-foreground leading-relaxed">
                  Tizim quyidagi og'irlik formulasidan foydalanib o'quvchining yakuniy bilim tayyorgarligi darajasini baholaydi:
                  <span className="block bg-[#f8f9fa] p-2 rounded text-black font-mono text-[10px] mt-1.5 leading-normal">
                    Score = (R1*w1 + R2*w2 + R3*w3) / (R1 + R2 + R3)
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
