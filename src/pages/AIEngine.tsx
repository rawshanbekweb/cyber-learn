import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { Slider } from "@/components/ui/slider";
import { Info, Settings2, ArrowDown, Sparkles, CheckCircle2, Circle, Cpu, Save, RefreshCw } from "lucide-react";
import { translateLevel } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const neon = "hsl(150 100% 55%)";
const neonDim = "hsl(150 100% 50% / 0.12)";
const borderBase = "1px solid hsl(150 60% 20%)";

function CyberPanel({ children, className = "", title, icon: Icon, desc }: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon?: React.ElementType;
  desc?: string;
}) {
  return (
    <div
      className={`rounded-lg relative overflow-hidden ${className}`}
      style={{ background: "hsl(220 15% 8%)", border: borderBase }}
    >
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(to right, transparent, hsl(150 100% 50% / 0.4), transparent)" }} />
      {title && (
        <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: "1px solid hsl(150 50% 16%)" }}>
          {Icon && <Icon className="w-4 h-4 shrink-0" style={{ color: neon }} />}
          <div>
            <div className="text-xs font-bold tracking-widest uppercase" style={{ fontFamily: "Orbitron, monospace", color: "hsl(150 90% 75%)", fontSize: "0.65rem" }}>
              {title}
            </div>
            {desc && <div className="text-[9px] tracking-wider mt-0.5" style={{ color: "hsl(150 35% 48%)" }}>{desc}</div>}
          </div>
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

export default function AIEngine() {
  const { userRole, fuzzyWeights, updateFuzzyWeights, hasCompletedInitialTest, currentLevel, readinessScore } = useAppStore();
  const { toast } = useToast();

  const handleWeightChange = (key: keyof typeof fuzzyWeights, value: number) => {
    updateFuzzyWeights({ [key]: value });
  };

  const saveWeights = () => {
    toast({ title: "[ SOZLAMALAR SAQLANDI ]", description: "Fuzzy AI Engine parametrlari muvaffaqiyatli yangilandi." });
  };

  const restoreDefaults = () => {
    updateFuzzyWeights({ rule1Weight: 0.2, rule2Weight: 0.5, rule3Weight: 0.9, beginnerThreshold: 0.4, intermediateThreshold: 0.7 });
    toast({ title: "[ STANDART TIKLANDI ]", description: "Tizim dastlabki fuzzy parametrlariga qaytarildi." });
  };

  const flowSteps = [
    { title: "1. Tizim ishga tushishi", desc: "Loyiha o'quvchi ma'lumotlarini qabul qiladi va diagnostika jarayonini boshlaydi.", active: true },
    { title: "2. O'quvchi diagnostikasi & Ma'lumot yig'ish", desc: "Yoshi, dastlabki bilimlari va kirish testi orqali ko'rsatkichlar tahlil qilinadi.", active: hasCompletedInitialTest },
    { title: "3. Fuzzy bilimlarni baholash", desc: "Noma'lumlikka asoslangan (Past / O'rta / Yuqori) baholash mexanizmi.", active: hasCompletedInitialTest },
    { title: "4. Adaptiv traektoriya tanlash (ANFIS)", desc: "A'zolik funksiyalari orqali individual qoidalar asosida o'quv yo'li aniqlanadi.", active: hasCompletedInitialTest },
    { title: "5. Shaxsiy o'quv dasturi generatsiyasi", desc: `Agar-qoidalar orqali aniqlanadi: Hozirgi darajangiz — ${translateLevel(currentLevel)}`, active: hasCompletedInitialTest },
    { title: "6. O'quv modullari", desc: "1. InfoSec asoslari | 2. Tarmoq xavflari | 3. Kriptografiya | 4. Tizim himoyasi", active: hasCompletedInitialTest },
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
        <div className="text-[9px] tracking-widest" style={{ color: "hsl(150 40% 50%)" }}>&gt; AI ENGINE / FUZZY-ANFIS BOSHQARUV MARKAZI</div>
        <h1 className="text-2xl font-bold tracking-widest uppercase" style={{ fontFamily: "Orbitron, monospace", color: neon, textShadow: "0 0 20px hsl(150 100% 55% / 0.4)" }}>
          Fuzzy AI Motor & ANFIS
        </h1>
        <p className="text-xs tracking-wider" style={{ color: "hsl(150 35% 50%)" }}>
          Noma'lumlikka asoslangan intellektual moslashuvchan o'qitish tizimi boshqaruv markazi.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ── Flow Diagram ── */}
        <div className="lg:col-span-2">
          <CyberPanel title="Loyihaning Ishlash Block-Sxemasi (Fuzzy Model)" icon={Sparkles} desc="O'quvchining ko'rsatkichlarini real-vaqtda baholovchi ANFIS va Fuzzy qoidalar sxemasi">
            <div className="space-y-0">
              {flowSteps.map((step, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div
                    className="w-full max-w-xl px-4 py-3 rounded transition-all duration-200"
                    style={{
                      background: step.active ? neonDim : "hsl(220 18% 10%)",
                      border: step.active ? "1px solid hsl(150 100% 50% / 0.4)" : "1px solid hsl(150 40% 15%)",
                      boxShadow: step.active ? "0 0 12px hsl(150 100% 50% / 0.08)" : "none",
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5"
                        style={{
                          background: step.active ? "hsl(150 100% 50% / 0.2)" : "hsl(220 18% 15%)",
                          border: step.active ? "1px solid hsl(150 100% 50% / 0.5)" : "1px solid hsl(150 30% 20%)",
                          color: step.active ? neon : "hsl(150 20% 35%)",
                          fontFamily: "Orbitron, monospace",
                        }}
                      >
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-[10px] tracking-wider" style={{ color: step.active ? "hsl(150 85% 75%)" : "hsl(150 25% 40%)", fontFamily: "JetBrains Mono, monospace" }}>
                          {step.title}
                        </h4>
                        <p className="text-[9px] mt-1 leading-relaxed tracking-wider" style={{ color: step.active ? "hsl(150 40% 55%)" : "hsl(150 20% 35%)" }}>
                          {step.desc}
                        </p>
                      </div>
                      {step.active
                        ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: neon }} />
                        : <Circle className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "hsl(150 20% 30%)" }} />
                      }
                    </div>
                  </div>
                  {idx < flowSteps.length - 1 && (
                    <ArrowDown className="w-4 h-4 my-1" style={{ color: "hsl(150 50% 30%)" }} />
                  )}
                </div>
              ))}
            </div>
          </CyberPanel>
        </div>

        {/* ── Right Panel ── */}
        <div className="space-y-5">
          {/* Sliders */}
          <CyberPanel
            title={userRole === "Teacher" ? "AI Parametrlarini Sozlash" : "Fuzzy AI Engine Sozlamalari"}
            icon={Settings2}
            desc={userRole === "Teacher" ? "Qaror qabul qilish og'irliklari va a'zolik funksiyalarini boshqaring." : "O'qituvchi tomonidan belgilangan fuzzy qoidalari."}
          >
            <div className="space-y-5">
              {sliderConfig.map(({ key, label, desc, min, max, divider }) => (
                <div key={key} className={`space-y-2 ${divider ? "pt-4 mt-1" : ""}`} style={divider ? { borderTop: "1px solid hsl(150 50% 15%)" } : {}}>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] tracking-widest uppercase font-bold" style={{ color: "hsl(150 50% 55%)" }}>
                      {label}
                    </span>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded"
                      style={{
                        background: neonDim,
                        border: "1px solid hsl(150 100% 50% / 0.35)",
                        color: neon,
                        fontFamily: "Orbitron, monospace",
                      }}
                    >
                      {fuzzyWeights[key].toFixed(2)}
                    </span>
                  </div>
                  <p className="text-[8px] tracking-wider" style={{ color: "hsl(150 30% 45%)" }}>{desc}</p>
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
                <div className="flex gap-2 pt-3" style={{ borderTop: "1px solid hsl(150 50% 15%)" }}>
                  <button
                    onClick={saveWeights}
                    className="flex-1 py-2 flex items-center justify-center gap-1.5 text-[9px] font-bold tracking-widest uppercase rounded transition-all"
                    style={{
                      background: neonDim,
                      border: "1px solid hsl(150 100% 50% / 0.5)",
                      color: neon,
                      fontFamily: "JetBrains Mono, monospace",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "hsl(150 100% 50% / 0.22)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = neonDim; }}
                  >
                    <Save className="w-3 h-3" /> Saqlash
                  </button>
                  <button
                    onClick={restoreDefaults}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 text-[9px] font-bold tracking-widest uppercase rounded transition-all"
                    style={{
                      background: "transparent",
                      border: "1px solid hsl(150 50% 20%)",
                      color: "hsl(150 40% 55%)",
                      fontFamily: "JetBrains Mono, monospace",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "hsl(150 100% 50% / 0.4)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "hsl(150 50% 20%)"; }}
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </CyberPanel>

          {/* Math formulas */}
          <CyberPanel title="Matematik Modellar" icon={Info} desc="Tizim formulalari va hisoblash usullari">
            <div className="space-y-4 text-[9px]">
              <div className="space-y-1.5">
                <span className="font-bold tracking-widest uppercase block" style={{ color: "hsl(150 70% 65%)", fontFamily: "Orbitron, monospace", fontSize: "0.6rem" }}>
                  A'zolik Funksiyasi (Fuzzy Sets):
                </span>
                <p className="leading-relaxed tracking-wider" style={{ color: "hsl(150 35% 52%)" }}>
                  Har bir kiruvchi ko'rsatkich uchburchak a'zolik funksiyasi bilan baholanadi:
                </p>
                <code
                  className="block px-3 py-2 rounded tracking-wider"
                  style={{
                    background: "hsl(220 20% 10%)",
                    border: "1px solid hsl(150 50% 18%)",
                    color: neon,
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  μ(low), μ(mid), μ(high)
                </code>
              </div>

              <div className="space-y-1.5" style={{ borderTop: "1px solid hsl(150 50% 15%)", paddingTop: "12px" }}>
                <span className="font-bold tracking-widest uppercase block" style={{ color: "hsl(150 70% 65%)", fontFamily: "Orbitron, monospace", fontSize: "0.6rem" }}>
                  Defuzzifikatsiya (Qaror):
                </span>
                <p className="leading-relaxed tracking-wider" style={{ color: "hsl(150 35% 52%)" }}>
                  Yakuniy bilim tayyorgarligi darajasi:
                </p>
                <code
                  className="block px-3 py-2 rounded leading-relaxed tracking-wider"
                  style={{
                    background: "hsl(220 20% 10%)",
                    border: "1px solid hsl(150 50% 18%)",
                    color: neon,
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  Ball = (R1*w1 + R2*w2 + R3*w3)<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/ (R1 + R2 + R3)
                </code>
              </div>
            </div>
          </CyberPanel>
        </div>
      </div>
    </motion.div>
  );
}
