import { useEffect, useState } from "react";
import {
  ShieldCheck, GraduationCap, UserCheck, BrainCircuit, Flag, Award,
  BarChart3, Newspaper, ClipboardList, BookOpen, ArrowRight, CheckCircle2,
  Sparkles, Lock, Bot, Menu, X, Trophy,
} from "lucide-react";

interface LandingProps {
  onGetStarted: (tab: "Student" | "Teacher") => void;
}

/* ------------------------------------------------------------------ */
/*  Signature hero widget — a live-look simulation of the platform's   */
/*  real ANFIS fuzzy-logic engine (knowledge + errors + speed → level) */
/* ------------------------------------------------------------------ */
const scenarios = [
  { name: "Sardor Y.", knowledge: 28, errors: 62, speed: 71, score: 0.31, level: "Boshlang'ich", tone: "amber" },
  { name: "Madina K.", knowledge: 58, errors: 34, speed: 46, score: 0.63, level: "O'rta", tone: "indigo" },
  { name: "Jasur N.", knowledge: 87, errors: 9, speed: 21, score: 0.89, level: "Yuqori", tone: "violet" },
] as const;

const toneMap = {
  amber: { bar: "bg-amber-500", text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
  indigo: { bar: "bg-primary", text: "text-primary", bg: "bg-indigo-50", border: "border-indigo-100" },
  violet: { bar: "bg-violet-500", text: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100" },
};

function FuzzyDemoCard() {
  const [i, setI] = useState(0);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setI((v) => (v + 1) % scenarios.length);
      setTick((t) => t + 1);
    }, 3400);
    return () => clearInterval(id);
  }, []);

  const s = scenarios[i];
  const tone = toneMap[s.tone];

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white/95 backdrop-blur-md shadow-xl overflow-hidden w-full max-w-md">
      {/* header bar */}
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-zinc-100 bg-zinc-50/60">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
        </div>
        <span className="text-[10px] font-semibold text-zinc-400 ml-2 font-mono truncate">
          fuzzy-engine@cyberai:~$ ./anfis --analyze
        </span>
      </div>

      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
            Kiritilgan profil
          </span>
          <span key={tick} className="text-xs font-bold text-zinc-700 font-mono anim-fade-in">
            {s.name}
          </span>
        </div>

        {/* input metrics */}
        <div className="space-y-2.5">
          {[
            { label: "Bilim darajasi", value: s.knowledge },
            { label: "Xatolar", value: s.errors },
            { label: "Ishlash tezligi", value: s.speed },
          ].map((m) => (
            <div key={m.label} className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-semibold text-zinc-500">
                <span>{m.label}</span>
                <span className="font-mono">{m.value}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                <div
                  className={`h-full rounded-full ${tone.bar} transition-all duration-[1400ms] ease-out`}
                  style={{ width: `${m.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="h-px bg-zinc-100" />

        {/* output */}
        <div className={`rounded-xl border ${tone.border} ${tone.bg} p-3.5 flex items-center justify-between transition-colors duration-700`}>
          <div>
            <div className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
              ANFIS xulosasi
            </div>
            <div className={`text-sm font-bold ${tone.text} transition-colors duration-700`}>
              Daraja: {s.level}
            </div>
          </div>
          <div className={`text-2xl font-black font-mono ${tone.text} transition-colors duration-700`}>
            {s.score.toFixed(2)}
          </div>
        </div>

        <p className="text-[11px] leading-relaxed text-zinc-400">
          * Jonli namoyish — platforma har bir o'quvchi uchun aynan shu tarzda individual yo'nalish tuzadi.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

const features = [
  { icon: BrainCircuit, title: "Fuzzy AI diagnostika", text: "ANFIS mantiqiy tizimi bilim, xato va tezlik ko'rsatkichlaringizni tahlil qilib, darajangizni aniqlaydi." },
  { icon: BookOpen, title: "Individual modul yo'li", text: "Har bir modul avvalgisi yakunlanganda ochiladi — o'z sur'atingizda, chalg'imasdan ilgarilaysiz." },
  { icon: Flag, title: "CTF challenge arenasi", text: "Real amaliy topshiriqlar orqali kiberxavfsizlik ko'nikmalaringizni his qiling va sinab ko'ring." },
  { icon: ClipboardList, title: "Topshiriqlar", text: "O'qituvchi tayinlagan nazariy va amaliy topshiriqlarni bajarib, bilimingizni mustahkamlang." },
  { icon: Trophy, title: "Reyting jadvali", text: "Boshqa o'quvchilar orasida turingizni kuzating va motivatsiyangizni oshiring." },
  { icon: Award, title: "Rasmiy sertifikat", text: "Barcha modullarni yakunlagach, shaxsiy raqamli sertifikatingizni yuklab oling." },
  { icon: BarChart3, title: "O'qituvchi tahlil paneli", text: "O'qituvchilar sinf va har bir o'quvchining rivojlanish grafigini real vaqtda kuzatadi." },
  { icon: Newspaper, title: "Kiber yangiliklar", text: "Sohadagi so'nggi voqealar va tahdidlar haqida yangilanib turadigan lenta." },
];

const steps = [
  { n: "01", title: "Diagnostik testdan o'ting", text: "Bir necha daqiqalik boshlang'ich test orqali mavjud bilim darajangiz aniqlanadi." },
  { n: "02", title: "AI individual yo'l tuzadi", text: "Fuzzy-ANFIS mexanizmi tezlik, xato va bilim ko'rsatkichlaringiz asosida sizga mos dasturni shakllantiradi." },
  { n: "03", title: "O'rganing, sinovdan o'ting, sertifikat oling", text: "Modullar, darslar va CTF topshiriqlarini bosqichma-bosqich yakunlab, natijangizni reytingda ko'ring." },
];

const modules = [
  { id: 1, title: "Kiberxavfsizlik asoslari", text: "Asosiy tushunchalar, tahdid turlari va raqamli gigiyena." },
  { id: 2, title: "Tarmoq xavfsizligi", text: "Firewall, VPN va tarmoq hujumlaridan himoyalanish usullari." },
  { id: 3, title: "Kriptografiya", text: "Shifrlash algoritmlari va ma'lumotlarni himoya qilish tamoyillari." },
  { id: 4, title: "Tizim himoyasi", text: "Zaifliklarni aniqlash va operatsion tizimlarni mustahkamlash." },
];

export default function Landing({ onGetStarted }: LandingProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-[100dvh] w-full bg-background text-foreground overflow-x-hidden">
      {/* ============================= NAVBAR ============================= */}
      <header className="sticky top-0 z-30 border-b border-zinc-200/70 bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-indigo-50 border border-indigo-100/60">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <span className="font-bold tracking-tight text-[15px]">CyberAI Platform</span>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-500">
            <a href="#imkoniyatlar" className="hover:text-foreground transition-colors">Imkoniyatlar</a>
            <a href="#qanday-ishlaydi" className="hover:text-foreground transition-colors">Qanday ishlaydi</a>
            <a href="#modullar" className="hover:text-foreground transition-colors">Modullar</a>
          </nav>

          <div className="hidden md:flex items-center gap-2.5">
            <button
              onClick={() => onGetStarted("Teacher")}
              className="text-sm font-semibold text-zinc-500 hover:text-foreground px-3.5 py-2 transition-colors"
            >
              O'qituvchiman
            </button>
            <button
              onClick={() => onGetStarted("Student")}
              className="text-sm font-semibold text-white bg-primary hover:bg-primary/90 px-4 py-2 rounded-xl shadow-sm transition-colors"
            >
              Kirish
            </button>
          </div>

          <button className="md:hidden p-2 -mr-2" onClick={() => setMenuOpen((v) => !v)} aria-label="Menyu">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-zinc-200/70 bg-background px-5 py-4 space-y-3">
            <a href="#imkoniyatlar" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-zinc-600">Imkoniyatlar</a>
            <a href="#qanday-ishlaydi" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-zinc-600">Qanday ishlaydi</a>
            <a href="#modullar" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-zinc-600">Modullar</a>
            <div className="flex gap-2 pt-2">
              <button onClick={() => onGetStarted("Teacher")} className="flex-1 text-sm font-semibold text-zinc-600 border border-zinc-200 rounded-xl py-2.5">
                O'qituvchiman
              </button>
              <button onClick={() => onGetStarted("Student")} className="flex-1 text-sm font-semibold text-white bg-primary rounded-xl py-2.5">
                Kirish
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ============================= HERO ============================= */}
      <section className="relative">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "url(/landing/hero-grid.svg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative max-w-6xl mx-auto px-5 pt-16 pb-20 md:pt-24 md:pb-28 grid md:grid-cols-2 gap-14 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 text-[11px] font-bold tracking-wider text-primary bg-indigo-50 border border-indigo-100/60 rounded-full px-3 py-1.5 font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              FUZZY AI + ANFIS ASOSIDAGI TA'LIM
            </div>

            <h1 className="text-4xl md:text-[3.4rem] font-black tracking-tight leading-[1.05]">
              Har bir o'quvchi uchun{" "}
              <span className="text-primary">o'ziga mos</span>{" "}
              kiberxavfsizlik yo'li
            </h1>

            <p className="text-base md:text-lg text-zinc-500 leading-relaxed max-w-lg">
              CyberAI — diagnostik test natijalaringizni fuzzy mantiq (ANFIS) yordamida tahlil qilib,
              aynan sizga mos modul, dars va CTF topshiriqlarini tanlab beruvchi o'quv platformasi.
            </p>

            <div className="flex flex-wrap gap-3 pt-1">
              <button
                onClick={() => onGetStarted("Student")}
                className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-primary hover:bg-primary/90 px-5 py-3 rounded-xl shadow-md transition-colors"
              >
                Bepul boshlash <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="#qanday-ishlaydi"
                className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 px-5 py-3 rounded-xl shadow-xs transition-colors"
              >
                Qanday ishlashini ko'rish
              </a>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-xs font-medium text-zinc-400">
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> 100% bepul</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Ro'yxatdan o'tish 1 daqiqa</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Yakunida sertifikat</span>
            </div>
          </div>

          <div className="flex justify-center md:justify-end">
            <FuzzyDemoCard />
          </div>
        </div>
      </section>

      {/* ============================= STATS ============================= */}
      <section className="border-y border-zinc-200/70 bg-white/60">
        <div className="max-w-6xl mx-auto px-5 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: "4", label: "chuqur modul" },
            { value: "3", label: "AI aniqlagan daraja" },
            { value: "10+", label: "CTF challenge" },
            { value: "1", label: "shaxsiy sertifikat" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-2xl md:text-3xl font-black text-primary">{s.value}</div>
              <div className="text-xs font-medium text-zinc-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================= FEATURES ============================= */}
      <section id="imkoniyatlar" className="relative py-20 md:py-28">
        <div
          className="absolute inset-0 pointer-events-none opacity-70"
          style={{ backgroundImage: "url(/landing/dot-grid.svg)", backgroundRepeat: "repeat" }}
        />
        <div className="relative max-w-6xl mx-auto px-5">
          <div className="max-w-xl mx-auto text-center space-y-3 mb-14">
            <span className="text-[11px] font-bold tracking-wider text-primary uppercase font-mono">Imkoniyatlar</span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">Loyihaning to'liq funksionalligi</h2>
            <p className="text-zinc-500 text-sm md:text-base">
              O'quvchilar va o'qituvchilar uchun bitta platformada birlashtirilgan barcha vositalar.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-zinc-200 bg-white p-5 space-y-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-50 border border-indigo-100/60">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold text-sm">{f.title}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================= HOW IT WORKS ============================= */}
      <section id="qanday-ishlaydi" className="py-20 md:py-28 bg-zinc-50/60 border-y border-zinc-200/70">
        <div className="max-w-6xl mx-auto px-5">
          <div className="max-w-xl mx-auto text-center space-y-3 mb-14">
            <span className="text-[11px] font-bold tracking-wider text-primary uppercase font-mono">Jarayon</span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">Qanday ishlaydi</h2>
            <p className="text-zinc-500 text-sm md:text-base">Uchta aniq bosqich — testdan sertifikatgacha.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((s) => (
              <div key={s.n} className="relative rounded-2xl border border-zinc-200 bg-white p-6 space-y-3">
                <span className="text-4xl font-black text-indigo-100">{s.n}</span>
                <h3 className="font-bold text-base">{s.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================= MODULES ============================= */}
      <section id="modullar" className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-5">
          <div className="max-w-xl mx-auto text-center space-y-3 mb-14">
            <span className="text-[11px] font-bold tracking-wider text-primary uppercase font-mono">O'quv dasturi</span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">4 ta bosqichma-bosqich modul</h2>
            <p className="text-zinc-500 text-sm md:text-base">Har bir modul avvalgisi yakunlangach ochiladi.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {modules.map((m, idx) => (
              <div key={m.id} className="rounded-2xl border border-zinc-200 bg-white p-5 flex gap-4 items-start">
                <div className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center bg-indigo-50 border border-indigo-100/60 font-bold text-primary text-sm">
                  {idx === 0 ? <Lock className="w-4 h-4" /> : idx + 1}
                </div>
                <div>
                  <h3 className="font-bold text-sm">{m.title}</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed mt-1">{m.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================= DUAL AUDIENCE ============================= */}
      <section className="py-20 md:py-28 bg-zinc-50/60 border-y border-zinc-200/70">
        <div className="max-w-6xl mx-auto px-5 grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-zinc-200 bg-white p-7 space-y-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-indigo-50 border border-indigo-100/60">
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-bold">O'quvchilar uchun</h3>
            <ul className="space-y-2.5 text-sm text-zinc-500">
              {["Diagnostik test va shaxsiy AI tahlil", "Bosqichma-bosqich ochiladigan modullar", "CTF challenge va AI yordamchi", "Reyting va yakuniy sertifikat"].map((t) => (
                <li key={t} className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />{t}</li>
              ))}
            </ul>
            <button onClick={() => onGetStarted("Student")} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary pt-1">
              O'quvchi sifatida boshlash <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-7 space-y-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-violet-50 border border-violet-100/60">
              <UserCheck className="w-5 h-5 text-violet-600" />
            </div>
            <h3 className="text-lg font-bold">O'qituvchilar uchun</h3>
            <ul className="space-y-2.5 text-sm text-zinc-500">
              {["Sinf bo'yicha real vaqtli tahlil paneli", "Har bir o'quvchining rivojlanish grafigi", "Nazariy va amaliy topshiriqlar tayinlash", "Fuzzy AI vazn parametrlarini sozlash"].map((t) => (
                <li key={t} className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />{t}</li>
              ))}
            </ul>
            <button onClick={() => onGetStarted("Teacher")} className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-600 pt-1">
              O'qituvchi sifatida kirish <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ============================= FINAL CTA ============================= */}
      <section className="relative py-20 md:py-28">
        <div
          className="absolute inset-0"
          style={{ backgroundImage: "url(/landing/cta-mesh.svg)", backgroundSize: "cover", backgroundPosition: "center" }}
        />
        <div className="relative max-w-3xl mx-auto px-5 text-center space-y-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 border border-white/15">
            <Bot className="w-6 h-6 text-violet-300" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white">
            Bugun kiberxavfsizlik yo'lingizni boshlang
          </h2>
          <p className="text-zinc-300 text-sm md:text-base max-w-xl mx-auto">
            Diagnostik testdan o'ting, AI sizga mos dasturni tuzsin — modullar, CTF va sertifikat kutmoqda.
          </p>
          <button
            onClick={() => onGetStarted("Student")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-900 bg-white hover:bg-zinc-100 px-6 py-3.5 rounded-xl shadow-lg transition-colors"
          >
            Bepul boshlash <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ============================= FOOTER ============================= */}
      <footer className="py-10 border-t border-zinc-200/70">
        <div className="max-w-6xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-50 border border-indigo-100/60">
              <ShieldCheck className="w-4 h-4 text-primary" />
            </div>
            <span className="font-bold text-sm">CyberAI Platform</span>
          </div>
          <p className="text-[11px] text-zinc-400 font-semibold uppercase tracking-widest text-center">
            SECURED BY FUZZY-ANFIS NEURAL AUTHENTICATION PROTOCOL © 2024
          </p>
        </div>
      </footer>
    </div>
  );
}
