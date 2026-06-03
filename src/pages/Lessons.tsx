import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import type { Lesson } from "@/store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  BookOpen, Plus, Trash2, ChevronDown, ChevronUp,
  GraduationCap, PlayCircle, CheckCircle2, Clock,
  FileText, Tag, Shield, Wifi, Lock, Server, Globe,
  AlignLeft, Send, X, Eye, BookMarked, Layers
} from "lucide-react";

const categoryIcons: Record<string, React.ElementType> = {
  "Asoslar": Shield,
  "Tarmoq": Wifi,
  "Kriptografiya": Lock,
  "Tizim himoyasi": Server,
  "Umumiy": Globe,
};

const difficultyColors: Record<string, string> = {
  "Boshlang'ich": "border-green-500/40 text-green-400 bg-green-500/10",
  "O'rta": "border-yellow-500/40 text-yellow-400 bg-yellow-500/10",
  "Yuqori": "border-red-500/40 text-red-400 bg-red-500/10",
};

const pageVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

// ─────────────────────────────────────────────
// TEACHER: Dars qo'shish formasi
// ─────────────────────────────────────────────
function TeacherView() {
  const { lessons, addLesson, deleteLesson } = useAppStore();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Asoslar");
  const [difficulty, setDifficulty] = useState<"Boshlang'ich" | "O'rta" | "Yuqori">("Boshlang'ich");
  const [videoUrl, setVideoUrl] = useState("");
  const [tags, setTags] = useState("");
  const [expandedLesson, setExpandedLesson] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [previewLesson, setPreviewLesson] = useState<Lesson | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    addLesson({
      title: title.trim(),
      description: description.trim(),
      content: content.trim(),
      category,
      difficulty,
      videoUrl: videoUrl.trim(),
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
    });

    toast({
      title: "✅ Dars qo'shildi!",
      description: `"${title}" darsi muvaffaqiyatli yaratildi.`,
    });

    setTitle(""); setDescription(""); setContent("");
    setVideoUrl(""); setTags(""); setCategory("Asoslar");
    setDifficulty("Boshlang'ich");
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-3xl font-bold tracking-tight font-mono"
            style={{
              fontFamily: 'Orbitron, monospace',
              color: 'hsl(150 100% 65%)',
              textShadow: '0 0 20px hsl(150 100% 55% / 0.5)',
            }}
          >
            Darslar Boshqaruvi
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'hsl(150 30% 55%)' }}>
            Cybersecurity bo'yicha darslar yaratib, o'quvchilarga yuboring.
          </p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 px-4 py-2 rounded text-xs font-bold tracking-wider uppercase transition-all duration-200"
          style={{
            background: showForm ? 'hsl(0 85% 60% / 0.1)' : 'hsl(150 100% 50% / 0.1)',
            border: showForm ? '1px solid hsl(0 85% 60% / 0.5)' : '1px solid hsl(150 100% 50% / 0.4)',
            color: showForm ? 'hsl(0 70% 65%)' : 'hsl(150 100% 65%)',
            boxShadow: showForm ? '0 0 12px hsl(0 85% 60% / 0.2)' : '0 0 12px hsl(150 100% 50% / 0.2)',
            fontFamily: 'JetBrains Mono, monospace',
          }}
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Bekor qilish" : "Yangi Dars"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: BookOpen, label: "Jami Darslar", value: lessons.length, color: 'hsl(150 100% 55%)' },
          { icon: Layers, label: "Kategoriyalar", value: new Set(lessons.map(l => l.category)).size, color: 'hsl(180 100% 55%)' },
          { icon: PlayCircle, label: "Video Darslar", value: lessons.filter(l => l.videoUrl).length, color: 'hsl(270 100% 70%)' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div
            key={label}
            className="rounded-lg p-4 flex items-center gap-3"
            style={{
              background: 'hsl(220 15% 8%)',
              border: '1px solid hsl(150 60% 16%)',
              boxShadow: '0 0 12px hsl(150 100% 50% / 0.05)',
            }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: `${color}18`, border: `1px solid ${color}40` }}
            >
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <div>
              <div className="text-2xl font-bold font-mono" style={{ color: 'hsl(150 100% 80%)' }}>{value}</div>
              <div className="text-[10px] uppercase tracking-wider" style={{ color: 'hsl(150 30% 50%)' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div
              className="rounded-lg overflow-hidden"
              style={{
                background: 'hsl(220 15% 8%)',
                border: '1px solid hsl(150 100% 50% / 0.3)',
                borderLeft: '4px solid hsl(150 100% 50% / 0.8)',
                boxShadow: '0 0 20px hsl(150 100% 50% / 0.08)',
              }}
            >
              <div
                className="px-6 py-4 flex items-center gap-2"
                style={{ borderBottom: '1px solid hsl(150 60% 16%)' }}
              >
                <BookMarked className="w-4 h-4" style={{ color: 'hsl(150 100% 55%)' }} />
                <span
                  className="text-sm font-bold tracking-wider uppercase"
                  style={{ fontFamily: 'Orbitron, monospace', color: 'hsl(150 100% 70%)' }}
                >
                  Yangi Dars Yaratish
                </span>
              </div>
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Title */}
                    <div className="space-y-1.5">
                      <label
                        className="text-[10px] font-bold uppercase tracking-wider"
                        style={{ color: 'hsl(150 30% 55%)', fontFamily: 'JetBrains Mono, monospace' }}
                      >
                        Dars nomi *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Masalan: Parol xavfsizligi asoslari"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="w-full text-sm px-3 py-2.5 rounded-lg outline-none transition"
                      />
                    </div>

                    {/* Category */}
                    <div className="space-y-1.5">
                      <label
                        className="text-[10px] font-bold uppercase tracking-wider"
                        style={{ color: 'hsl(150 30% 55%)', fontFamily: 'JetBrains Mono, monospace' }}
                      >
                        Kategoriya *
                      </label>
                      <select
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        className="w-full text-sm px-3 py-2.5 rounded-lg outline-none transition"
                      >
                        {Object.keys(categoryIcons).map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <label
                      className="text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: 'hsl(150 30% 55%)', fontFamily: 'JetBrains Mono, monospace' }}
                    >
                      Qisqa tavsif
                    </label>
                    <input
                      type="text"
                      placeholder="Bu dars haqida qisqacha..."
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      className="w-full text-sm px-3 py-2.5 rounded-lg outline-none transition"
                    />
                  </div>

                  {/* Content */}
                  <div className="space-y-1.5">
                    <label
                      className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5"
                      style={{ color: 'hsl(150 30% 55%)', fontFamily: 'JetBrains Mono, monospace' }}
                    >
                      <AlignLeft className="w-3 h-3" /> Dars matni *
                    </label>
                    <textarea
                      rows={6}
                      required
                      placeholder="Bu yerga dars mazmunini yozing. O'quvchilar bu matnni o'qib o'rganadi..."
                      value={content}
                      onChange={e => setContent(e.target.value)}
                      className="w-full text-sm px-3 py-2 rounded-lg outline-none transition resize-none"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Difficulty */}
                    <div className="space-y-1.5">
                      <label
                        className="text-[10px] font-bold uppercase tracking-wider"
                        style={{ color: 'hsl(150 30% 55%)', fontFamily: 'JetBrains Mono, monospace' }}
                      >
                        Qiyinlik darajasi
                      </label>
                      <select
                        value={difficulty}
                        onChange={e => setDifficulty(e.target.value as any)}
                        className="w-full text-sm px-3 py-2.5 rounded-lg outline-none transition"
                      >
                        <option value="Boshlang'ich">Boshlang'ich</option>
                        <option value="O'rta">O'rta</option>
                        <option value="Yuqori">Yuqori</option>
                      </select>
                    </div>

                    {/* Video URL */}
                    <div className="space-y-1.5">
                      <label
                        className="text-[10px] font-bold uppercase tracking-wider"
                        style={{ color: 'hsl(150 30% 55%)', fontFamily: 'JetBrains Mono, monospace' }}
                      >
                        Video havolasi (ixtiyoriy)
                      </label>
                      <input
                        type="url"
                        placeholder="https://youtube.com/..."
                        value={videoUrl}
                        onChange={e => setVideoUrl(e.target.value)}
                        className="w-full text-sm px-3 py-2.5 rounded-lg outline-none transition"
                      />
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="space-y-1.5">
                    <label
                      className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5"
                      style={{ color: 'hsl(150 30% 55%)', fontFamily: 'JetBrains Mono, monospace' }}
                    >
                      <Tag className="w-3 h-3" /> Teglar (vergul bilan ajrating)
                    </label>
                    <input
                      type="text"
                      placeholder="Masalan: firewall, xavfsizlik, tarmoq"
                      value={tags}
                      onChange={e => setTags(e.target.value)}
                      className="w-full text-sm px-3 py-2.5 rounded-lg outline-none transition"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold tracking-wider uppercase transition-all duration-200"
                    style={{
                      background: 'hsl(150 100% 50% / 0.15)',
                      border: '1px solid hsl(150 100% 50% / 0.5)',
                      color: 'hsl(150 100% 70%)',
                      boxShadow: '0 0 20px hsl(150 100% 50% / 0.15)',
                      fontFamily: 'JetBrains Mono, monospace',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = 'hsl(150 100% 50% / 0.25)';
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 0 30px hsl(150 100% 50% / 0.3)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = 'hsl(150 100% 50% / 0.15)';
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px hsl(150 100% 50% / 0.15)';
                    }}
                  >
                    <Send className="w-4 h-4" /> Darsni Saqlash
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lessons List */}
      <div className="space-y-3">
        <h2
          className="text-sm font-bold uppercase tracking-wider"
          style={{ color: 'hsl(150 30% 50%)', fontFamily: 'JetBrains Mono, monospace' }}
        >
          Yaratilgan darslar ({lessons.length} ta)
        </h2>

        {lessons.length === 0 ? (
          <div
            className="rounded-lg py-16 flex flex-col items-center gap-3"
            style={{
              background: 'hsl(220 15% 8%)',
              border: '1px solid hsl(150 60% 16%)',
            }}
          >
            <BookOpen className="w-10 h-10 opacity-20" style={{ color: 'hsl(150 100% 55%)' }} />
            <p className="text-sm text-center" style={{ color: 'hsl(150 30% 50%)', fontFamily: 'JetBrains Mono, monospace' }}>
              Hali hech qanday dars yaratilmagan.<br />
              <span className="text-xs">"Yangi Dars" tugmasini bosib boshlang.</span>
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {lessons.map(lesson => {
              const Icon = categoryIcons[lesson.category] || Globe;
              const isExpanded = expandedLesson === lesson.id;
              return (
                <div
                  key={lesson.id}
                  className="rounded-lg overflow-hidden transition-all duration-200"
                  style={{
                    background: 'hsl(220 15% 8%)',
                    border: '1px solid hsl(150 60% 16%)',
                    boxShadow: isExpanded ? '0 0 20px hsl(150 100% 50% / 0.08)' : 'none',
                  }}
                >
                  <div
                    className="flex items-start justify-between gap-3 p-4 cursor-pointer transition-colors"
                    style={{ background: isExpanded ? 'hsl(150 100% 50% / 0.04)' : 'transparent' }}
                    onClick={() => setExpandedLesson(isExpanded ? null : lesson.id)}
                    onMouseEnter={e => { if (!isExpanded) (e.currentTarget as HTMLElement).style.background = 'hsl(150 100% 50% / 0.03)'; }}
                    onMouseLeave={e => { if (!isExpanded) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                        style={{
                          background: 'hsl(150 100% 50% / 0.08)',
                          border: '1px solid hsl(150 100% 50% / 0.25)',
                        }}
                      >
                        <Icon className="w-4 h-4" style={{ color: 'hsl(150 100% 55%)' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm" style={{ color: 'hsl(150 100% 80%)' }}>{lesson.title}</span>
                          <Badge
                            variant="outline"
                            className={`font-mono text-[9px] ${difficultyColors[lesson.difficulty]}`}
                          >
                            {lesson.difficulty}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="font-mono text-[9px]"
                            style={{ borderColor: 'hsl(150 50% 25%)', color: 'hsl(150 50% 60%)' }}
                          >
                            {lesson.category}
                          </Badge>
                          {lesson.videoUrl && (
                            <Badge
                              variant="outline"
                              className="font-mono text-[9px]"
                              style={{ borderColor: 'hsl(220 100% 60% / 0.4)', color: 'hsl(220 100% 70%)', background: 'hsl(220 100% 60% / 0.08)' }}
                            >
                              <PlayCircle className="w-2.5 h-2.5 mr-1" /> Video
                            </Badge>
                          )}
                        </div>
                        {lesson.description && (
                          <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'hsl(150 30% 50%)' }}>{lesson.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1 text-[10px]" style={{ color: 'hsl(150 30% 45%)', fontFamily: 'JetBrains Mono, monospace' }}>
                          <Clock className="w-3 h-3" /> {new Date(lesson.createdAt).toLocaleDateString("uz-UZ")}
                          {lesson.tags.length > 0 && (
                            <span>• {lesson.tags.slice(0, 3).join(", ")}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={e => { e.stopPropagation(); setPreviewLesson(lesson); }}
                        className="p-1 transition-colors rounded"
                        title="Ko'rish"
                        style={{ color: 'hsl(150 30% 50%)' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'hsl(150 100% 65%)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'hsl(150 30% 50%)'; }}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); deleteLesson(lesson.id); toast({ title: "Dars o'chirildi" }); }}
                        className="p-1 transition-colors rounded"
                        title="O'chirish"
                        style={{ color: 'hsl(150 30% 50%)' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'hsl(0 85% 60%)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'hsl(150 30% 50%)'; }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {isExpanded
                        ? <ChevronUp className="w-4 h-4" style={{ color: 'hsl(150 100% 55%)' }} />
                        : <ChevronDown className="w-4 h-4" style={{ color: 'hsl(150 30% 50%)' }} />
                      }
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div
                          className="px-4 pb-4 pt-3 space-y-3"
                          style={{ borderTop: '1px solid hsl(150 60% 14%)' }}
                        >
                          <div
                            className="rounded-lg p-4 text-sm leading-relaxed whitespace-pre-wrap"
                            style={{
                              background: 'hsl(220 18% 6%)',
                              border: '1px solid hsl(150 50% 14%)',
                              color: 'hsl(150 80% 75%)',
                              fontFamily: 'JetBrains Mono, monospace',
                            }}
                          >
                            {lesson.content}
                          </div>
                          {lesson.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {lesson.tags.map(tag => (
                                <span
                                  key={tag}
                                  className="text-[10px] px-2 py-0.5 rounded"
                                  style={{
                                    background: 'hsl(150 100% 50% / 0.08)',
                                    border: '1px solid hsl(150 100% 50% / 0.2)',
                                    color: 'hsl(150 80% 65%)',
                                    fontFamily: 'JetBrains Mono, monospace',
                                  }}
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewLesson && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' }}
            onClick={() => setPreviewLesson(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl"
              style={{
                background: 'hsl(220 15% 8%)',
                border: '1px solid hsl(150 100% 50% / 0.3)',
                boxShadow: '0 0 60px hsl(150 100% 50% / 0.15)',
              }}
              onClick={e => e.stopPropagation()}
            >
              <div
                className="sticky top-0 p-5 flex items-start justify-between"
                style={{
                  background: 'hsl(220 15% 8%)',
                  borderBottom: '1px solid hsl(150 60% 16%)',
                }}
              >
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className={`font-mono text-[9px] ${difficultyColors[previewLesson.difficulty]}`}>
                      {previewLesson.difficulty}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="font-mono text-[9px]"
                      style={{ borderColor: 'hsl(150 50% 25%)', color: 'hsl(150 50% 60%)' }}
                    >
                      {previewLesson.category}
                    </Badge>
                  </div>
                  <h2
                    className="text-xl font-bold mt-2"
                    style={{
                      fontFamily: 'Orbitron, monospace',
                      color: 'hsl(150 100% 70%)',
                      textShadow: '0 0 12px hsl(150 100% 55% / 0.4)',
                    }}
                  >
                    {previewLesson.title}
                  </h2>
                  {previewLesson.description && (
                    <p className="text-sm mt-1" style={{ color: 'hsl(150 30% 55%)' }}>{previewLesson.description}</p>
                  )}
                </div>
                <button
                  onClick={() => setPreviewLesson(null)}
                  className="p-1 rounded transition-colors ml-4"
                  style={{ color: 'hsl(150 30% 50%)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'hsl(150 100% 65%)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'hsl(150 30% 50%)'; }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div
                  className="text-sm leading-relaxed whitespace-pre-wrap rounded-lg p-4"
                  style={{
                    background: 'hsl(220 18% 6%)',
                    border: '1px solid hsl(150 50% 14%)',
                    color: 'hsl(150 80% 75%)',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                >
                  {previewLesson.content}
                </div>
                {previewLesson.videoUrl && (
                  <a
                    href={previewLesson.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-mono transition-all"
                    style={{ color: 'hsl(220 100% 70%)' }}
                  >
                    <PlayCircle className="w-4 h-4" /> Video darsni ko'rish
                  </a>
                )}
                {previewLesson.tags.length > 0 && (
                  <div
                    className="flex flex-wrap gap-1.5 pt-3"
                    style={{ borderTop: '1px solid hsl(150 60% 14%)' }}
                  >
                    {previewLesson.tags.map(tag => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded"
                        style={{
                          background: 'hsl(150 100% 50% / 0.08)',
                          border: '1px solid hsl(150 100% 50% / 0.2)',
                          color: 'hsl(150 80% 65%)',
                          fontFamily: 'JetBrains Mono, monospace',
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────
// STUDENT: Darslarni o'rganish
// ─────────────────────────────────────────────
function StudentView() {
  const { lessons, markLessonRead } = useAppStore();
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [filterCategory, setFilterCategory] = useState("Barchasi");
  const [filterDifficulty, setFilterDifficulty] = useState("Barchasi");
  const { toast } = useToast();

  const categories = ["Barchasi", ...Array.from(new Set(lessons.map(l => l.category)))];
  const difficulties = ["Barchasi", "Boshlang'ich", "O'rta", "Yuqori"];

  const filtered = lessons.filter(l => {
    const catMatch = filterCategory === "Barchasi" || l.category === filterCategory;
    const difMatch = filterDifficulty === "Barchasi" || l.difficulty === filterDifficulty;
    return catMatch && difMatch;
  });

  const handleMarkRead = (lessonId: number, title: string) => {
    markLessonRead(lessonId);
    toast({ title: "✅ O'qildi!", description: `"${title}" darsi o'qilgan deb belgilandi.` });
  };

  const readCount = lessons.filter(l =>
    l.readByStudents?.includes(useAppStore.getState().currentUser?.id ?? -1)
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1
          className="text-3xl font-bold tracking-tight"
          style={{
            fontFamily: 'Orbitron, monospace',
            color: 'hsl(150 100% 65%)',
            textShadow: '0 0 20px hsl(150 100% 55% / 0.5)',
          }}
        >
          Cybersecurity Darslar
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'hsl(150 30% 55%)' }}>
          O'qituvchi tomonidan tayyorlangan darslarni o'qib, cybersecurity bo'yicha bilim oling.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: BookOpen, label: "Jami Darslar", value: lessons.length, color: 'hsl(150 100% 55%)' },
          { icon: CheckCircle2, label: "O'qildi", value: readCount, color: 'hsl(120 80% 55%)' },
          { icon: PlayCircle, label: "Video", value: lessons.filter(l => l.videoUrl).length, color: 'hsl(220 100% 70%)' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div
            key={label}
            className="rounded-lg p-4 flex items-center gap-3"
            style={{
              background: 'hsl(220 15% 8%)',
              border: '1px solid hsl(150 60% 16%)',
              boxShadow: '0 0 12px hsl(150 100% 50% / 0.05)',
            }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: `${color}18`, border: `1px solid ${color}40` }}
            >
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <div>
              <div className="text-2xl font-bold font-mono" style={{ color: 'hsl(150 100% 80%)' }}>{value}</div>
              <div className="text-[10px] uppercase tracking-wider" style={{ color: 'hsl(150 30% 50%)' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      {lessons.length > 0 && (
        <div className="flex gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider" style={{ color: 'hsl(150 30% 45%)', fontFamily: 'JetBrains Mono, monospace' }}>
              Kategoriya:
            </span>
            <div className="flex gap-1.5 flex-wrap">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className="text-[11px] px-2.5 py-1 rounded-full border transition-all"
                  style={
                    filterCategory === cat
                      ? {
                          background: 'hsl(150 100% 50% / 0.15)',
                          borderColor: 'hsl(150 100% 50% / 0.5)',
                          color: 'hsl(150 100% 70%)',
                          boxShadow: '0 0 8px hsl(150 100% 50% / 0.2)',
                          fontFamily: 'JetBrains Mono, monospace',
                        }
                      : {
                          background: 'transparent',
                          borderColor: 'hsl(150 50% 20%)',
                          color: 'hsl(150 30% 50%)',
                          fontFamily: 'JetBrains Mono, monospace',
                        }
                  }
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider" style={{ color: 'hsl(150 30% 45%)', fontFamily: 'JetBrains Mono, monospace' }}>
              Daraja:
            </span>
            <div className="flex gap-1.5 flex-wrap">
              {difficulties.map(dif => (
                <button
                  key={dif}
                  onClick={() => setFilterDifficulty(dif)}
                  className="text-[11px] px-2.5 py-1 rounded-full border transition-all"
                  style={
                    filterDifficulty === dif
                      ? {
                          background: 'hsl(150 100% 50% / 0.15)',
                          borderColor: 'hsl(150 100% 50% / 0.5)',
                          color: 'hsl(150 100% 70%)',
                          boxShadow: '0 0 8px hsl(150 100% 50% / 0.2)',
                          fontFamily: 'JetBrains Mono, monospace',
                        }
                      : {
                          background: 'transparent',
                          borderColor: 'hsl(150 50% 20%)',
                          color: 'hsl(150 30% 50%)',
                          fontFamily: 'JetBrains Mono, monospace',
                        }
                  }
                >
                  {dif}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Lesson Cards */}
      {lessons.length === 0 ? (
        <div
          className="rounded-lg py-16 flex flex-col items-center gap-3"
          style={{
            background: 'hsl(220 15% 8%)',
            border: '1px solid hsl(150 60% 16%)',
          }}
        >
          <BookOpen className="w-10 h-10 opacity-20" style={{ color: 'hsl(150 100% 55%)' }} />
          <p className="text-sm text-center" style={{ color: 'hsl(150 30% 50%)', fontFamily: 'JetBrains Mono, monospace' }}>
            Hali hech qanday dars qo'shilmagan.<br />
            <span className="text-xs">O'qituvchi dars qo'shganda bu yerda ko'rinadi.</span>
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-sm py-8" style={{ color: 'hsl(150 30% 50%)', fontFamily: 'JetBrains Mono, monospace' }}>
          Ushbu filtr bo'yicha dars topilmadi.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map(lesson => {
            const Icon = categoryIcons[lesson.category] || Globe;
            const currentUserId = useAppStore.getState().currentUser?.id ?? -1;
            const isRead = lesson.readByStudents?.includes(currentUserId) ?? false;

            return (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div
                  className="rounded-lg h-full cursor-pointer transition-all duration-200 overflow-hidden"
                  style={{
                    background: 'hsl(220 15% 8%)',
                    border: isRead
                      ? '1px solid hsl(150 100% 50% / 0.4)'
                      : '1px solid hsl(150 60% 16%)',
                    borderLeft: isRead ? '4px solid hsl(150 100% 50% / 0.8)' : '1px solid hsl(150 60% 16%)',
                    boxShadow: isRead ? '0 0 15px hsl(150 100% 50% / 0.08)' : 'none',
                  }}
                  onClick={() => setSelectedLesson(lesson)}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px hsl(150 100% 50% / 0.12)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'hsl(150 100% 50% / 0.3)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.boxShadow = isRead ? '0 0 15px hsl(150 100% 50% / 0.08)' : 'none';
                    (e.currentTarget as HTMLElement).style.borderColor = isRead ? 'hsl(150 100% 50% / 0.4)' : 'hsl(150 60% 16%)';
                  }}
                >
                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{
                          background: 'hsl(150 100% 50% / 0.08)',
                          border: '1px solid hsl(150 100% 50% / 0.25)',
                        }}
                      >
                        <Icon className="w-5 h-5" style={{ color: 'hsl(150 100% 55%)' }} />
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge
                          variant="outline"
                          className={`font-mono text-[9px] ${difficultyColors[lesson.difficulty]}`}
                        >
                          {lesson.difficulty}
                        </Badge>
                        {isRead && (
                          <Badge
                            variant="outline"
                            className="font-mono text-[9px]"
                            style={{
                              borderColor: 'hsl(150 100% 50% / 0.4)',
                              color: 'hsl(150 100% 65%)',
                              background: 'hsl(150 100% 50% / 0.08)',
                            }}
                          >
                            <CheckCircle2 className="w-2.5 h-2.5 mr-1" /> O'qildi
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div>
                      <div
                        className="text-[10px] mb-1"
                        style={{ color: 'hsl(150 40% 50%)', fontFamily: 'JetBrains Mono, monospace' }}
                      >
                        {lesson.category}
                      </div>
                      <h3 className="font-bold text-sm line-clamp-2" style={{ color: 'hsl(150 100% 80%)' }}>
                        {lesson.title}
                      </h3>
                      {lesson.description && (
                        <p className="text-xs mt-1 line-clamp-2" style={{ color: 'hsl(150 30% 50%)' }}>
                          {lesson.description}
                        </p>
                      )}
                    </div>

                    <div
                      className="flex items-center justify-between text-[10px]"
                      style={{ color: 'hsl(150 30% 45%)', fontFamily: 'JetBrains Mono, monospace' }}
                    >
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(lesson.createdAt).toLocaleDateString("uz-UZ")}
                      </div>
                      {lesson.videoUrl && (
                        <div className="flex items-center gap-1" style={{ color: 'hsl(220 100% 70%)' }}>
                          <PlayCircle className="w-3 h-3" /> Video bor
                        </div>
                      )}
                    </div>

                    {lesson.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {lesson.tags.slice(0, 3).map(tag => (
                          <span
                            key={tag}
                            className="text-[10px] px-1.5 py-0.5 rounded"
                            style={{
                              background: 'hsl(150 100% 50% / 0.06)',
                              border: '1px solid hsl(150 100% 50% / 0.15)',
                              color: 'hsl(150 60% 55%)',
                              fontFamily: 'JetBrains Mono, monospace',
                            }}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Lesson Detail Modal */}
      <AnimatePresence>
        {selectedLesson && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' }}
            onClick={() => setSelectedLesson(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl"
              style={{
                background: 'hsl(220 15% 8%)',
                border: '1px solid hsl(150 100% 50% / 0.35)',
                boxShadow: '0 0 60px hsl(150 100% 50% / 0.15), 0 0 120px hsl(150 100% 50% / 0.05)',
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div
                className="sticky top-0 p-5"
                style={{
                  background: 'hsl(220 15% 8%)',
                  borderBottom: '1px solid hsl(150 60% 16%)',
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <Badge
                        variant="outline"
                        className={`font-mono text-[9px] ${difficultyColors[selectedLesson.difficulty]}`}
                      >
                        {selectedLesson.difficulty}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="font-mono text-[9px]"
                        style={{ borderColor: 'hsl(150 50% 25%)', color: 'hsl(150 50% 60%)' }}
                      >
                        {selectedLesson.category}
                      </Badge>
                    </div>
                    <h2
                      className="text-xl font-bold"
                      style={{
                        fontFamily: 'Orbitron, monospace',
                        color: 'hsl(150 100% 70%)',
                        textShadow: '0 0 12px hsl(150 100% 55% / 0.4)',
                      }}
                    >
                      {selectedLesson.title}
                    </h2>
                    {selectedLesson.description && (
                      <p className="text-sm mt-1" style={{ color: 'hsl(150 30% 55%)' }}>
                        {selectedLesson.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedLesson(null)}
                    className="p-1 rounded ml-4 shrink-0 transition-colors"
                    style={{ color: 'hsl(150 30% 50%)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'hsl(150 100% 65%)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'hsl(150 30% 50%)'; }}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-5 space-y-5">
                {/* Lesson Content */}
                <div
                  className="rounded-xl p-5"
                  style={{
                    background: 'hsl(220 18% 6%)',
                    border: '1px solid hsl(150 50% 14%)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4" style={{ color: 'hsl(150 100% 55%)' }} />
                    <span
                      className="text-xs font-bold uppercase tracking-wider"
                      style={{ color: 'hsl(150 30% 50%)', fontFamily: 'JetBrains Mono, monospace' }}
                    >
                      Dars matni
                    </span>
                  </div>
                  <p
                    className="text-sm leading-relaxed whitespace-pre-wrap"
                    style={{ color: 'hsl(150 80% 75%)', fontFamily: 'JetBrains Mono, monospace' }}
                  >
                    {selectedLesson.content}
                  </p>
                </div>

                {/* Video Link */}
                {selectedLesson.videoUrl && (
                  <div
                    className="rounded-xl p-4 flex items-center gap-3"
                    style={{
                      background: 'hsl(220 100% 60% / 0.06)',
                      border: '1px solid hsl(220 100% 60% / 0.25)',
                    }}
                  >
                    <PlayCircle className="w-5 h-5 shrink-0" style={{ color: 'hsl(220 100% 70%)' }} />
                    <div>
                      <div
                        className="text-xs font-bold"
                        style={{ color: 'hsl(220 100% 75%)', fontFamily: 'JetBrains Mono, monospace' }}
                      >
                        Video Dars
                      </div>
                      <a
                        href={selectedLesson.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm break-all hover:underline transition-all"
                        style={{ color: 'hsl(220 100% 65%)' }}
                      >
                        {selectedLesson.videoUrl}
                      </a>
                    </div>
                  </div>
                )}

                {/* Tags */}
                {selectedLesson.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedLesson.tags.map(tag => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded"
                        style={{
                          background: 'hsl(150 100% 50% / 0.08)',
                          border: '1px solid hsl(150 100% 50% / 0.2)',
                          color: 'hsl(150 80% 65%)',
                          fontFamily: 'JetBrains Mono, monospace',
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Mark as Read Button */}
                {(() => {
                  const currentUserId = useAppStore.getState().currentUser?.id ?? -1;
                  const isRead = selectedLesson.readByStudents?.includes(currentUserId) ?? false;
                  return isRead ? (
                    <div
                      className="flex items-center gap-2 rounded-xl p-3"
                      style={{
                        background: 'hsl(150 100% 50% / 0.08)',
                        border: '1px solid hsl(150 100% 50% / 0.3)',
                      }}
                    >
                      <CheckCircle2 className="w-5 h-5" style={{ color: 'hsl(150 100% 60%)' }} />
                      <span
                        className="text-sm font-bold"
                        style={{ color: 'hsl(150 100% 70%)', fontFamily: 'JetBrains Mono, monospace' }}
                      >
                        Siz bu darsni o'qidingiz!
                      </span>
                    </div>
                  ) : (
                    <button
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold tracking-wider uppercase transition-all duration-200"
                      style={{
                        background: 'hsl(150 100% 50% / 0.12)',
                        border: '1px solid hsl(150 100% 50% / 0.45)',
                        color: 'hsl(150 100% 70%)',
                        boxShadow: '0 0 20px hsl(150 100% 50% / 0.12)',
                        fontFamily: 'JetBrains Mono, monospace',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.background = 'hsl(150 100% 50% / 0.22)';
                        (e.currentTarget as HTMLElement).style.boxShadow = '0 0 30px hsl(150 100% 50% / 0.3)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.background = 'hsl(150 100% 50% / 0.12)';
                        (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px hsl(150 100% 50% / 0.12)';
                      }}
                      onClick={() => {
                        handleMarkRead(selectedLesson.id, selectedLesson.title);
                        setSelectedLesson(null);
                      }}
                    >
                      <CheckCircle2 className="w-4 h-4" /> Darsni O'qidim
                    </button>
                  );
                })()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────
export default function Lessons() {
  const { userRole } = useAppStore();

  return (
    <motion.div initial="hidden" animate="visible" variants={pageVariants}>
      {userRole === "Teacher" ? <TeacherView /> : <StudentView />}
    </motion.div>
  );
}
