import { useEffect } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { Slider } from "@/components/ui/slider";
import { Info, Settings2, ArrowDown, Sparkles, CheckCircle2, Circle, Cpu, Save, RefreshCw } from "lucide-react";
import { translateLevel } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

function AIEnginePanel({ children, className = "", title, icon: Icon, desc }: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon?: React.ElementType;
  desc?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-zinc-200 bg-white shadow-xs overflow-hidden ${className}`}
    >
      {title && (
        <div className="px-5 py-4 flex items-center gap-3 bg-zinc-50/50 border-b border-zinc-150">
          {Icon && <Icon className="w-5 h-5 shrink-0 text-primary" />}
          <div>
            <h3 className="text-sm font-bold tracking-tight text-zinc-900">
              {title}
            </h3>
            {desc && <div className="text-[10px] mt-0.5 text-zinc-500">{desc}</div>}
          </div>
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

export default function AIEngine() {
  const { userRole, fuzzyWeights, updateFuzzyWeights, hasCompletedInitialTest, currentLevel, readinessScore, fetchFuzzyWeights, saveFuzzyWeights } = useAppStore();
  const { toast } = useToast();

  useEffect(() => {
    fetchFuzzyWeights();
  }, []);

  const handleWeightChange = (key: keyof typeof fuzzyWeights, value: number) => {
    updateFuzzyWeights({ [key]: value });
  };

  const saveWeights = async () => {
    const res = await saveFuzzyWeights();
    if (res.success) {
      toast({ title: "SOZLAMALAR SAQLANDI", description: "Fuzzy AI Engine parametrlari muvaffaqiyatli yangilandi." });
    } else {
      toast({ variant: "destructive", title: "SAQLASHDA XATOLIK", description: res.message });
    }
  };

  const restoreDefaults = () => {
    updateFuzzyWeights({ rule1Weight: 0.2, rule2Weight: 0.5, rule3Weight: 0.9, beginnerThreshold: 0.4, intermediateThreshold: 0.7 });
    toast({ title: "STANDART TIKLANDI", description: "Tizim dastlabki fuzzy parametrlariga qaytarildi." });
  };

  const flowSteps = [
    { title: "1. Tizim ishga tushishi", desc: "Loyiha o'quvchi ma'lumotlarini qabul qiladi va diagnostika jarayonini boshlaydi.", active: true },
    { title: "2. O'quvchi diagnostikasi & Ma'lumot yig'ish", desc: "Yoshi, dastlabki bilimlari va kirish testi orqali ko'rsatkichlar tahlil qilinadi.", active: hasCompletedInitialTest },
    { title: "3. Fuzzy bilimlarni baholash", desc: "Noma'lumlikka asoslangan (Past / O'rta / Yuqori) baholash mexanizmi.", active: hasCompletedInitialTest },
    { title: "4. Adaptiv traektoriya tanlash (ANFIS)", desc: "A'zolik funksiyalari orqali individual qoidalar asosida o'quv yo'li aniqlanadi.", active: hasCompletedInitialTest },
    { title: "5. Shaxsiy o'quv dasturi generatsiyasi", desc: `Agar-qoidalar orqali aniqlanadi: Hozirgi darajangiz — ${translateLevel(currentLevel)}`, active: hasCompletedInitialTest },
    { title: "6. O'quv modullari", desc: "1. InfoSec asoslari | 2. Tarmoq xavsizligi | 3. Kriptografiya | 4. Tizim himoyasi", active: hasCompletedInitialTest },
    { title: "7. Fuzzy o'zlashtirish tahlili", desc: "To'g'rilik foizi, xatolar soni va topshiriqni bajarish tezligi baholanadi.", active: hasCompletedInitialTest },
    { title: "8. O'tish qarori", desc: `Fuzzy ko'rsatkich: ${(readinessScore * 100).toFixed(0)}% (Agar natija = Yuqori bo'lsa oldinga o'ting, agar O'rta bo'lsa takrorlang)`, active: hasCompletedInitialTest },
  ];

  const sliderConfig = [
    { key: "rule1Weight" as const, label: "Qoida 1 (Boshlang'ich) og'irligi", desc: "Kam bilim darajasi va ko'p xatolar uchun a'zolik funksiyasi.", min: 0.05, max: 0.5 },
    { key: "rule2Weight" as const, label: "Qoida 2 (O'rta) og'irligi", desc: "O'rtacha tezlik va o'rtacha bilimlar uchun qoida og'irligi.", min: 0.3, max: 0.7 },
    { key: "rule3Weight" as const, label: "Qoida 3 (Yuqori) og'irligi", desc: "Yuqori bilim darajasi va kam xatolar uchun qoida og'irligi.", min: 0.7, max: 1.0 },
    { key: "beginnerThreshold" as const, label: "Boshlang'ich chegarasi", desc: "Boshlang'ich darajaga o'tish uchun minimal fuzzy ball.", min: 0.2, max: 0.5, divider: true },
    { key: "intermediateThreshold" as const, label: "O'rta chegarasi", desc: "O'rta darajaga o'tish uchun minimal fuzzy ball.", min: 0.5, max: 0.8 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.4 } }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="space-y-1">
        <div className="text-[10px] font-bold tracking-widest text-primary uppercase">&gt; AI ENGINE / FUZZY-ANFIS BOSHQARUV MARKAZI</div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Fuzzy AI Motor & ANFIS
        </h1>
        <p className="text-xs text-zinc-500">
          Noma'lumlikka asoslangan intellektual moslashuvchan o'qitish tizimi boshqaruv markazi.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ── Flow Diagram ── */}
        <div className="lg:col-span-2">
          <AIEnginePanel title="Loyihaning Ishlash Block-Sxemasi (Fuzzy Model)" icon={Sparkles} desc="O'quvchining ko'rsatkichlarini real-vaqtda baholovchi ANFIS va Fuzzy qoidalar sxemasi">
            <div className="space-y-0">
              {flowSteps.map((step, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div
                    className={`w-full max-w-xl px-4 py-3 rounded-xl border transition-all duration-200 ${
                      step.active 
                        ? "bg-indigo-50/40 border-indigo-100 shadow-2xs" 
                        : "bg-white border-zinc-150 opacity-60"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 border border-zinc-200 bg-white text-zinc-700"
                      >
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs text-zinc-800">
                          {step.title}
                        </h4>
                        <p className="text-[10px] mt-1 leading-relaxed text-zinc-500">
                          {step.desc}
                        </p>
                      </div>
                      {step.active
                        ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                        : <Circle className="w-4 h-4 shrink-0 mt-0.5 text-zinc-300" />
                      }
                    </div>
                  </div>
                  {idx < flowSteps.length - 1 && (
                    <ArrowDown className="w-4 h-4 my-1.5 text-zinc-400" />
                  )}
                </div>
              ))}
            </div>
          </AIEnginePanel>
        </div>

        {/* ── Right Panel ── */}
        <div className="space-y-6">
          {/* Sliders */}
          <AIEnginePanel
            title={userRole === "Teacher" ? "AI Parametrlarini Sozlash" : "Fuzzy AI Engine Sozlamalari"}
            icon={Settings2}
            desc={userRole === "Teacher" ? "Qaror qabul qilish og'irliklari va a'zolik funksiyalarini boshqaring." : "O'qituvchi tomonidan belgilangan fuzzy qoidalari."}
          >
            <div className="space-y-5">
              {sliderConfig.map(({ key, label, desc, min, max, divider }) => (
                <div key={key} className={`space-y-2 ${divider ? "pt-4 border-t border-zinc-100" : ""}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-zinc-600">
                      {label}
                    </span>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-100/50 text-primary font-mono"
                    >
                      {fuzzyWeights[key].toFixed(2)}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-normal">{desc}</p>
                  <div style={{ opacity: userRole !== "Teacher" ? 0.5 : 1 }}>
                    <Slider
                      disabled={userRole !== "Teacher"}
                      min={min}
                      max={max}
                      step={0.05}
                      value={[fuzzyWeights[key]]}
                      onValueChange={(val) => handleWeightChange(key, val[0])}
                    />
                  </div>
                </div>
              ))}

              {userRole === "Teacher" && (
                <div className="flex gap-2 pt-3 border-t border-zinc-100">
                  <button
                    onClick={saveWeights}
                    className="flex-1 py-2 flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary/95 rounded-xl shadow-sm transition-all duration-150"
                  >
                    <Save className="w-3.5 h-3.5" /> Saqlash
                  </button>
                  <button
                    onClick={restoreDefaults}
                    className="flex items-center justify-center p-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 transition-all text-zinc-500"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </AIEnginePanel>

          {/* Math formulas */}
          <AIEnginePanel title="Matematik Modellar" icon={Info} desc="Tizim formulalari va hisoblash usullari">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <span className="font-bold text-[10px] text-zinc-500 uppercase block">
                  A'zolik Funksiyasi (Fuzzy Sets):
                </span>
                <p className="text-[10px] leading-relaxed text-zinc-400">
                  Har bir kiruvchi ko'rsatkich uchburchak a'zolik funksiyasi bilan baholanadi:
                </p>
                <code
                  className="block px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-100 text-xs font-mono text-zinc-650"
                >
                  μ(low), μ(mid), μ(high)
                </code>
              </div>

              <div className="space-y-1.5 pt-3 border-t border-zinc-100">
                <span className="font-bold text-[10px] text-zinc-500 uppercase block">
                  Defuzzifikatsiya (Qaror):
                </span>
                <p className="text-[10px] leading-relaxed text-zinc-400">
                  Yakuniy bilim tayyorgarligi darajasi:
                </p>
                <code
                  className="block px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-100 text-xs leading-relaxed font-mono text-zinc-650"
                >
                  Ball = (R1*w1 + R2*w2 + R3*w3) / (R1 + R2 + R3)
                </code>
              </div>
            </div>
          </AIEnginePanel>
        </div>
      </div>
    </motion.div>
  );
}
