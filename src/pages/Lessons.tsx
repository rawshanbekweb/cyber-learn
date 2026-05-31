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
  "Boshlang'ich": "border-green-400 text-green-700 bg-green-50",
  "O'rta": "border-yellow-400 text-yellow-700 bg-yellow-50",
  "Yuqori": "border-red-400 text-red-700 bg-red-50",
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
          <h1 className="text-3xl font-bold tracking-tight text-black font-mono">Darslar Boshqaruvi</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Cybersecurity bo'yicha darslar yaratib, o'quvchilarga yuboring.
          </p>
        </div>
        <Button
          onClick={() => setShowForm(v => !v)}
          className="bg-black text-white hover:bg-black/90 font-mono text-xs gap-2"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Bekor qilish" : "Yangi Dars"}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-border/60 bg-white shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-black/5 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-black" />
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-black">{lessons.length}</div>
              <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Jami Darslar</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-white shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-black/5 flex items-center justify-center">
              <Layers className="w-4 h-4 text-black" />
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-black">
                {new Set(lessons.map(l => l.category)).size}
              </div>
              <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Kategoriyalar</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-white shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-black/5 flex items-center justify-center">
              <PlayCircle className="w-4 h-4 text-black" />
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-black">
                {lessons.filter(l => l.videoUrl).length}
              </div>
              <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Video Darslar</div>
            </div>
          </CardContent>
        </Card>
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
            <Card className="border-border/60 bg-white shadow-sm border-l-4 border-l-black">
              <CardHeader className="border-b border-border/40">
                <CardTitle className="text-base font-bold font-mono flex items-center gap-2">
                  <BookMarked className="w-4 h-4" /> Yangi Dars Yaratish
                </CardTitle>
                <CardDescription>O'quvchilar uchun cybersecurity darsi qo'shing</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Title */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold font-mono text-muted-foreground uppercase tracking-wider">
                        Dars nomi *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Masalan: Parol xavfsizligi asoslari"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="w-full text-sm border border-border/80 px-3 py-2.5 rounded-lg bg-[#f8f9fa] text-black outline-none focus:border-black transition font-sans"
                      />
                    </div>

                    {/* Category */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold font-mono text-muted-foreground uppercase tracking-wider">
                        Kategoriya *
                      </label>
                      <select
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        className="w-full text-sm border border-border/80 px-3 py-2.5 rounded-lg bg-[#f8f9fa] text-black outline-none focus:border-black transition font-mono"
                      >
                        {Object.keys(categoryIcons).map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold font-mono text-muted-foreground uppercase tracking-wider">
                      Qisqa tavsif
                    </label>
                    <input
                      type="text"
                      placeholder="Bu dars haqida qisqacha..."
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      className="w-full text-sm border border-border/80 px-3 py-2.5 rounded-lg bg-[#f8f9fa] text-black outline-none focus:border-black transition font-sans"
                    />
                  </div>

                  {/* Content */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <AlignLeft className="w-3 h-3" /> Dars matni *
                    </label>
                    <textarea
                      rows={6}
                      required
                      placeholder="Bu yerga dars mazmunini yozing. O'quvchilar bu matnni o'qib o'rganadi..."
                      value={content}
                      onChange={e => setContent(e.target.value)}
                      className="w-full text-sm border border-border/80 px-3 py-2 rounded-lg bg-[#f8f9fa] text-black outline-none focus:border-black transition font-sans resize-none"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Difficulty */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold font-mono text-muted-foreground uppercase tracking-wider">
                        Qiyinlik darajasi
                      </label>
                      <select
                        value={difficulty}
                        onChange={e => setDifficulty(e.target.value as any)}
                        className="w-full text-sm border border-border/80 px-3 py-2.5 rounded-lg bg-[#f8f9fa] text-black outline-none focus:border-black transition font-mono"
                      >
                        <option value="Boshlang'ich">Boshlang'ich</option>
                        <option value="O'rta">O'rta</option>
                        <option value="Yuqori">Yuqori</option>
                      </select>
                    </div>

                    {/* Video URL */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold font-mono text-muted-foreground uppercase tracking-wider">
                        Video havolasi (ixtiyoriy)
                      </label>
                      <input
                        type="url"
                        placeholder="https://youtube.com/..."
                        value={videoUrl}
                        onChange={e => setVideoUrl(e.target.value)}
                        className="w-full text-sm border border-border/80 px-3 py-2.5 rounded-lg bg-[#f8f9fa] text-black outline-none focus:border-black transition font-sans"
                      />
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Tag className="w-3 h-3" /> Teglar (vergul bilan ajrating)
                    </label>
                    <input
                      type="text"
                      placeholder="Masalan: firewall, xavfsizlik, tarmoq"
                      value={tags}
                      onChange={e => setTags(e.target.value)}
                      className="w-full text-sm border border-border/80 px-3 py-2.5 rounded-lg bg-[#f8f9fa] text-black outline-none focus:border-black transition font-sans"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-black text-white hover:bg-black/90 font-mono font-bold text-sm py-5"
                  >
                    <Send className="w-4 h-4 mr-2" /> Darsni Saqlash
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lessons List */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold font-mono text-muted-foreground uppercase tracking-wider">
          Yaratilgan darslar ({lessons.length} ta)
        </h2>

        {lessons.length === 0 ? (
          <Card className="border-border/60 bg-white shadow-sm">
            <CardContent className="py-16 flex flex-col items-center gap-3 text-muted-foreground">
              <BookOpen className="w-10 h-10 opacity-30" />
              <p className="text-sm font-mono text-center">
                Hali hech qanday dars yaratilmagan.<br />
                <span className="text-xs">"Yangi Dars" tugmasini bosib boshlang.</span>
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {lessons.map(lesson => {
              const Icon = categoryIcons[lesson.category] || Globe;
              const isExpanded = expandedLesson === lesson.id;
              return (
                <Card key={lesson.id} className="border-border/60 bg-white shadow-sm overflow-hidden">
                  <div
                    className="flex items-start justify-between gap-3 p-4 cursor-pointer hover:bg-[#f8f9fa] transition-colors"
                    onClick={() => setExpandedLesson(isExpanded ? null : lesson.id)}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-black/5 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="w-4 h-4 text-black" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-black">{lesson.title}</span>
                          <Badge variant="outline" className={`font-mono text-[9px] ${difficultyColors[lesson.difficulty]}`}>
                            {lesson.difficulty}
                          </Badge>
                          <Badge variant="outline" className="font-mono text-[9px] border-black/20 text-black/60">
                            {lesson.category}
                          </Badge>
                          {lesson.videoUrl && (
                            <Badge variant="outline" className="font-mono text-[9px] border-blue-400 text-blue-700 bg-blue-50">
                              <PlayCircle className="w-2.5 h-2.5 mr-1" /> Video
                            </Badge>
                          )}
                        </div>
                        {lesson.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{lesson.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground font-mono">
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
                        className="text-muted-foreground hover:text-black transition-colors p-1"
                        title="Ko'rish"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); deleteLesson(lesson.id); toast({ title: "Dars o'chirildi" }); }}
                        className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                        title="O'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
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
                        <div className="px-4 pb-4 pt-2 border-t border-border/30 space-y-3">
                          <div className="bg-[#f8f9fa] rounded-lg p-4 text-sm text-black/80 leading-relaxed whitespace-pre-wrap font-sans">
                            {lesson.content}
                          </div>
                          {lesson.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {lesson.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="font-mono text-[10px]">
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
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
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setPreviewLesson(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-border/40 p-5 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className={`font-mono text-[9px] ${difficultyColors[previewLesson.difficulty]}`}>
                      {previewLesson.difficulty}
                    </Badge>
                    <Badge variant="outline" className="font-mono text-[9px] border-black/20 text-black/60">
                      {previewLesson.category}
                    </Badge>
                  </div>
                  <h2 className="text-xl font-bold text-black mt-1 font-mono">{previewLesson.title}</h2>
                  {previewLesson.description && (
                    <p className="text-sm text-muted-foreground mt-1">{previewLesson.description}</p>
                  )}
                </div>
                <button onClick={() => setPreviewLesson(null)} className="text-muted-foreground hover:text-black p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div className="text-sm text-black/80 leading-relaxed whitespace-pre-wrap font-sans">
                  {previewLesson.content}
                </div>
                {previewLesson.videoUrl && (
                  <a
                    href={previewLesson.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-mono text-blue-600 hover:underline"
                  >
                    <PlayCircle className="w-4 h-4" /> Video darsni ko'rish
                  </a>
                )}
                {previewLesson.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/30">
                    {previewLesson.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="font-mono text-[10px]">#{tag}</Badge>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-black font-mono">Cybersecurity Darslar</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          O'qituvchi tomonidan tayyorlangan darslarni o'qib, cybersecurity bo'yicha bilim oling.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-border/60 bg-white shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-black/5 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-black" />
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-black">{lessons.length}</div>
              <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Jami Darslar</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-white shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-green-700">
                {lessons.filter(l => l.readByStudents?.includes(useAppStore.getState().currentUser?.id ?? -1)).length}
              </div>
              <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">O'qildi</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-white shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-black/5 flex items-center justify-center">
              <PlayCircle className="w-4 h-4 text-black" />
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-black">
                {lessons.filter(l => l.videoUrl).length}
              </div>
              <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Video</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      {lessons.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Kategoriya:</span>
            <div className="flex gap-1.5">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`text-[11px] font-mono px-2.5 py-1 rounded-full border transition-all ${
                    filterCategory === cat
                      ? "border-black bg-black text-white"
                      : "border-border/60 text-muted-foreground hover:border-black/40 hover:text-black"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Daraja:</span>
            <div className="flex gap-1.5">
              {difficulties.map(dif => (
                <button
                  key={dif}
                  onClick={() => setFilterDifficulty(dif)}
                  className={`text-[11px] font-mono px-2.5 py-1 rounded-full border transition-all ${
                    filterDifficulty === dif
                      ? "border-black bg-black text-white"
                      : "border-border/60 text-muted-foreground hover:border-black/40 hover:text-black"
                  }`}
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
        <Card className="border-border/60 bg-white shadow-sm">
          <CardContent className="py-16 flex flex-col items-center gap-3 text-muted-foreground">
            <BookOpen className="w-10 h-10 opacity-30" />
            <p className="text-sm font-mono text-center">
              Hali hech qanday dars qo'shilmagan.<br />
              <span className="text-xs">O'qituvchi dars qo'shganda bu yerda ko'rinadi.</span>
            </p>
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground font-mono py-8">
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
                <Card
                  className={`border-border/60 bg-white shadow-sm h-full cursor-pointer hover:shadow-md hover:border-black/30 transition-all ${
                    isRead ? "border-l-4 border-l-green-400" : ""
                  }`}
                  onClick={() => setSelectedLesson(lesson)}
                >
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-10 h-10 rounded-lg bg-black/5 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-black" />
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="outline" className={`font-mono text-[9px] ${difficultyColors[lesson.difficulty]}`}>
                          {lesson.difficulty}
                        </Badge>
                        {isRead && (
                          <Badge variant="outline" className="font-mono text-[9px] border-green-400 text-green-700 bg-green-50">
                            <CheckCircle2 className="w-2.5 h-2.5 mr-1" /> O'qildi
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-mono text-muted-foreground mb-1">{lesson.category}</div>
                      <h3 className="font-bold text-sm text-black line-clamp-2">{lesson.title}</h3>
                      {lesson.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{lesson.description}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(lesson.createdAt).toLocaleDateString("uz-UZ")}
                      </div>
                      {lesson.videoUrl && (
                        <div className="flex items-center gap-1 text-blue-600">
                          <PlayCircle className="w-3 h-3" /> Video bor
                        </div>
                      )}
                    </div>

                    {lesson.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {lesson.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-[10px] font-mono bg-[#f1f3f5] text-muted-foreground px-1.5 py-0.5 rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
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
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setSelectedLesson(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-border/40 p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Badge variant="outline" className={`font-mono text-[9px] ${difficultyColors[selectedLesson.difficulty]}`}>
                        {selectedLesson.difficulty}
                      </Badge>
                      <Badge variant="outline" className="font-mono text-[9px] border-black/20 text-black/60">
                        {selectedLesson.category}
                      </Badge>
                    </div>
                    <h2 className="text-xl font-bold text-black font-mono">{selectedLesson.title}</h2>
                    {selectedLesson.description && (
                      <p className="text-sm text-muted-foreground mt-1">{selectedLesson.description}</p>
                    )}
                  </div>
                  <button onClick={() => setSelectedLesson(null)} className="text-muted-foreground hover:text-black p-1 ml-4 shrink-0">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-5 space-y-5">
                {/* Lesson Content */}
                <div className="bg-[#f8f9fa] rounded-xl p-5 border border-border/30">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-black" />
                    <span className="text-xs font-bold font-mono text-muted-foreground uppercase tracking-wider">Dars matni</span>
                  </div>
                  <p className="text-sm text-black/80 leading-relaxed whitespace-pre-wrap font-sans">
                    {selectedLesson.content}
                  </p>
                </div>

                {/* Video Link */}
                {selectedLesson.videoUrl && (
                  <div className="border border-blue-200 bg-blue-50 rounded-xl p-4 flex items-center gap-3">
                    <PlayCircle className="w-5 h-5 text-blue-600 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-blue-700 font-mono">Video Dars</div>
                      <a
                        href={selectedLesson.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline break-all"
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
                      <Badge key={tag} variant="secondary" className="font-mono text-[10px]">#{tag}</Badge>
                    ))}
                  </div>
                )}

                {/* Mark as Read Button */}
                {(() => {
                  const currentUserId = useAppStore.getState().currentUser?.id ?? -1;
                  const isRead = selectedLesson.readByStudents?.includes(currentUserId) ?? false;
                  return isRead ? (
                    <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-xl p-3">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="text-sm font-mono font-bold">Siz bu darsni o'qidingiz!</span>
                    </div>
                  ) : (
                    <Button
                      className="w-full bg-black text-white hover:bg-black/90 font-mono font-bold text-sm py-5"
                      onClick={() => {
                        handleMarkRead(selectedLesson.id, selectedLesson.title);
                        setSelectedLesson(null);
                      }}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Darsni O'qidim
                    </Button>
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
