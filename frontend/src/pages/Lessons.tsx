import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import type { Lesson } from "@/store/useAppStore";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  BookOpen, Plus, Trash2, ChevronDown, ChevronUp,
  PlayCircle, CheckCircle2, Clock,
  FileText, Shield, Wifi, Lock, Server, Globe,
  X, Eye, BookMarked, Layers, Send, UploadCloud, Paperclip, Download,
  FlaskConical, BookText
} from "lucide-react";

const categoryIcons: Record<string, React.ElementType> = {
  "Asoslar": Shield,
  "Tarmoq": Wifi,
  "Kriptografiya": Lock,
  "Tizim himoyasi": Server,
  "Umumiy": Globe,
};

const difficultyColors: Record<string, string> = {
  "Boshlang'ich": "border-emerald-200 text-emerald-700 bg-emerald-50",
  "O'rta": "border-amber-200 text-amber-700 bg-amber-50",
  "Yuqori": "border-red-200 text-red-700 bg-red-50",
};

const pageVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
  const [lessonType, setLessonType] = useState<"Nazariy" | "Amaliy">("Nazariy");
  const [videoUrl, setVideoUrl] = useState("");
  const [tags, setTags] = useState("");
  const [expandedLesson, setExpandedLesson] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [previewLesson, setPreviewLesson] = useState<Lesson | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"Barchasi" | "Nazariy" | "Amaliy">("Barchasi");

  const tabLessons = activeTab === "Barchasi"
    ? lessons
    : lessons.filter(l => (l.lessonType ?? "Nazariy") === activeTab);

  const uploadFile = (file: File): Promise<{ url: string; name: string; size: number }> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append("file", file);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setUploadProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch {
            reject(new Error("Serverdan noto'g'ri javob keldi"));
          }
        } else {
          try {
            const err = JSON.parse(xhr.responseText);
            reject(new Error(err.error || `HTTP ${xhr.status}`));
          } catch {
            reject(new Error(`HTTP ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => reject(new Error("Tarmoq xatosi. Backend ishlab turganini tekshiring."));
      xhr.open("POST", `${API_URL}/api/upload`);
      xhr.send(formData);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    let fileData: { url: string; name: string; size: number } | undefined;
    if (selectedFile) {
      setIsUploading(true);
      setUploadProgress(0);
      try {
        fileData = await uploadFile(selectedFile);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Noma'lum xato";
        toast({ title: "❌ Fayl yuklanmadi", description: msg });
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    const res = await addLesson({
      title: title.trim(),
      description: description.trim(),
      content: content.trim(),
      category,
      difficulty,
      lessonType,
      videoUrl: videoUrl.trim(),
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      fileUrl: fileData?.url,
      fileName: fileData?.name,
      fileSize: fileData?.size,
    });

    if (!res.success) {
      toast({ variant: "destructive", title: "❌ Dars saqlanmadi", description: res.message });
      return;
    }

    toast({
      title: "✅ Dars qo'shildi!",
      description: `"${title}" darsi muvaffaqiyatli yaratildi.`,
    });

    setTitle(""); setDescription(""); setContent("");
    setVideoUrl(""); setTags(""); setCategory("Asoslar");
    setDifficulty("Boshlang'ich");
    setLessonType("Nazariy");
    setSelectedFile(null);
    setUploadProgress(0);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-[10px] font-bold tracking-widest text-primary uppercase">&gt; TEACHER / DARSLAR BOSHQARUVI</div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Darslar Boshqaruvi
          </h1>
          <p className="text-xs text-zinc-500">
            Cybersecurity bo'yicha darslar yaratib, o'quvchilarga yuboring.
          </p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all duration-150 shadow-sm border cursor-pointer ${
            showForm
              ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100/50'
              : 'bg-primary text-white border-primary hover:bg-primary/95'
          }`}
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Bekor qilish" : "Yangi Dars"}
        </button>
      </div>

      {/* Barchasi / Nazariy / Amaliy Tabs */}
      <div className="flex rounded-2xl border border-zinc-200 bg-zinc-50 p-1 gap-1">
        {(["Barchasi", "Nazariy", "Amaliy"] as const).map(tab => {
          const isActive = activeTab === tab;
          const Icon = tab === "Barchasi" ? Layers : tab === "Nazariy" ? BookText : FlaskConical;
          const tabCount = tab === "Barchasi" ? lessons.length : lessons.filter(l => (l.lessonType ?? "Nazariy") === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                isActive
                  ? tab === "Nazariy"
                    ? "bg-white border border-primary/20 text-primary shadow-sm"
                    : tab === "Amaliy"
                      ? "bg-white border border-emerald-200 text-emerald-700 shadow-sm"
                      : "bg-white border border-zinc-300 text-zinc-800 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-600"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab}
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                isActive
                  ? tab === "Nazariy" ? "bg-primary/10 text-primary" : tab === "Amaliy" ? "bg-emerald-100 text-emerald-700" : "bg-zinc-200 text-zinc-700"
                  : "bg-zinc-200 text-zinc-500"
              }`}>{tabCount}</span>
            </button>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: BookOpen, label: "Jami Darslar", value: tabLessons.length, color: 'hsl(var(--primary))' },
          { icon: Layers, label: "Kategoriyalar", value: new Set(tabLessons.map(l => l.category)).size, color: 'hsl(250 84% 54%)' },
          { icon: PlayCircle, label: "Video Darslar", value: tabLessons.filter(l => l.videoUrl).length, color: 'hsl(270 80% 50%)' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div
            key={label}
            className="rounded-2xl p-4 flex items-center gap-3 bg-white border border-zinc-200 shadow-xs"
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: `${color}10`, border: `1px solid ${color}20` }}
            >
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <div>
              <div className="text-2xl font-bold text-zinc-950">{value}</div>
              <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white border border-zinc-200 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
            <div className="sticky top-0 px-6 py-4 flex items-center justify-between bg-white/95 backdrop-blur-md border-b border-zinc-100 z-10">
              <div className="flex items-center gap-2">
                <BookMarked className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold tracking-wider uppercase text-zinc-800">
                  Yangi Dars Yaratish
                </span>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="p-1.5 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Lesson Type Toggle */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Dars turi *
                  </label>
                  <div className="flex gap-2">
                    {(["Nazariy", "Amaliy"] as const).map(type => {
                      const isActive = lessonType === type;
                      const Icon = type === "Nazariy" ? BookText : FlaskConical;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setLessonType(type)}
                          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                            isActive
                              ? type === "Nazariy"
                                ? "bg-indigo-50 border-primary text-primary shadow-sm"
                                : "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm"
                              : "bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {type}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Title */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Dars nomi *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Masalan: Phishing hujumlari va ulardan himoyalanish"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  {/* Category & Difficulty */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Kategoriya
                      </label>
                      <select
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        className="w-full"
                      >
                        {Object.keys(categoryIcons).map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Qiyinchilik
                      </label>
                      <select
                        value={difficulty}
                        onChange={e => setDifficulty(e.target.value as any)}
                        className="w-full"
                      >
                        {["Boshlang'ich", "O'rta", "Yuqori"].map(diff => (
                          <option key={diff} value={diff}>{diff}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Qisqacha tavsif (ixtiyoriy)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Dars haqida qisqacha izoh..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg outline-none transition resize-none border border-zinc-200 focus:border-primary"
                  />
                </div>

                {/* Content */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Dars matni (Asosiy kontent) *
                  </label>
                  <textarea
                    rows={8}
                    required
                    placeholder="Darsning batafsil matnini bu yerga yozing..."
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg outline-none transition border border-zinc-200 focus:border-primary"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Video URL */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Video Havola (ixtiyoriy)
                    </label>
                    <input
                      type="url"
                      placeholder="https://youtube.com/..."
                      value={videoUrl}
                      onChange={e => setVideoUrl(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  {/* Tags */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Teglar (vergul bilan ajrating)
                    </label>
                    <input
                      type="text"
                      placeholder="phishing, social-engineering, xavfsizlik"
                      value={tags}
                      onChange={e => setTags(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* File Upload */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Darslik fayli (ixtiyoriy)
                  </label>
                  {!selectedFile ? (
                    <label className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 hover:bg-zinc-100/50 cursor-pointer transition-colors group">
                      <UploadCloud className="w-5 h-5 text-zinc-400 group-hover:text-primary transition-colors shrink-0" />
                      <span className="text-xs text-zinc-400 group-hover:text-zinc-600 transition-colors">
                        Fayl tanlash — PDF, PPTX, MP4, ZIP va boshqalar (maks. 64MB)
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.ppt,.pptx,.doc,.docx,.xlsx,.xls,.jpg,.jpeg,.png,.gif,.webp,.mp4,.webm,.mov,.avi,.zip,.rar,.txt,.md"
                        onChange={e => { setSelectedFile(e.target.files?.[0] || null); e.target.value = ""; }}
                      />
                    </label>
                  ) : (
                    <div className="rounded-xl border border-zinc-200 bg-white p-3">
                      {isUploading ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Paperclip className="w-4 h-4 text-primary shrink-0" />
                            <span className="text-xs font-medium text-zinc-600 truncate flex-1">{selectedFile.name}</span>
                            <span className="text-[10px] text-zinc-400">{uploadProgress}%</span>
                          </div>
                          <div className="w-full bg-zinc-100 rounded-full h-1.5">
                            <div
                              className="bg-primary h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-zinc-400">Yuklanmoqda, iltimos kutib turing...</p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Paperclip className="w-4 h-4 text-primary shrink-0" />
                          <span className="text-xs font-medium text-zinc-700 truncate flex-1">{selectedFile.name}</span>
                          <span className="text-[10px] text-zinc-400 shrink-0">{formatFileSize(selectedFile.size)}</span>
                          <button
                            type="button"
                            onClick={() => setSelectedFile(null)}
                            className="p-1 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isUploading}
                  className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-bold tracking-wider uppercase border shadow-sm transition-all ${
                    isUploading
                      ? "bg-zinc-100 text-zinc-400 border-zinc-200 cursor-not-allowed"
                      : "bg-primary text-white border-primary hover:bg-primary/95 cursor-pointer"
                  }`}
                >
                  {isUploading
                    ? `Yuklanmoqda... ${uploadProgress}%`
                    : <><Send className="w-4 h-4" /> Darsni Saqlash</>
                  }
                </button>
              </form>
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lessons List */}
      <div className="space-y-3">
        <h2 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
          Yaratilgan darslar ({tabLessons.length} ta)
        </h2>

        {tabLessons.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-12 flex flex-col items-center gap-3 shadow-2xs">
            {activeTab === "Barchasi" ? <BookOpen className="w-10 h-10 text-zinc-300" /> : activeTab === "Nazariy" ? <BookText className="w-10 h-10 text-zinc-300" /> : <FlaskConical className="w-10 h-10 text-zinc-300" />}
            <p className="text-sm text-center text-zinc-500 font-medium">
              {activeTab === "Barchasi"
                ? <>Hali hech qanday dars yaratilmagan.<br /><span className="text-xs">"Yangi Dars" tugmasini bosib boshlang.</span></>
                : <>Hali hech qanday {activeTab.toLowerCase()} dars yaratilmagan.<br /><span className="text-xs">"Yangi Dars" tugmasini bosib boshlang.</span></>
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tabLessons.map(lesson => {
              const Icon = categoryIcons[lesson.category] || Globe;
              const isExpanded = expandedLesson === lesson.id;
              return (
                <div
                  key={lesson.id}
                  className="rounded-xl border border-zinc-200 bg-white shadow-2xs overflow-hidden transition-all duration-200"
                >
                  <div
                    className="flex items-start justify-between gap-3 p-4 cursor-pointer transition-colors bg-white hover:bg-zinc-50/50"
                    onClick={() => setExpandedLesson(isExpanded ? null : lesson.id)}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 bg-indigo-50 border border-indigo-100/50 text-primary">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-zinc-800">{lesson.title}</span>
                          <Badge
                            variant="outline"
                            className={`font-semibold text-[9px] rounded-lg ${
                              (lesson.lessonType ?? "Nazariy") === "Nazariy"
                                ? "border-indigo-200 text-primary bg-indigo-50"
                                : "border-emerald-200 text-emerald-700 bg-emerald-50"
                            }`}
                          >
                            {(lesson.lessonType ?? "Nazariy") === "Nazariy"
                              ? <><BookText className="w-2.5 h-2.5 mr-1 inline" />Nazariy</>
                              : <><FlaskConical className="w-2.5 h-2.5 mr-1 inline" />Amaliy</>
                            }
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`font-semibold text-[9px] rounded-lg ${difficultyColors[lesson.difficulty]}`}
                          >
                            {lesson.difficulty}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="font-semibold text-[9px] border-zinc-200 text-zinc-500 bg-zinc-50 rounded-lg"
                          >
                            {lesson.category}
                          </Badge>
                          {lesson.videoUrl && (
                            <Badge
                              variant="outline"
                              className="font-semibold text-[9px] border-indigo-200 text-primary bg-indigo-50 rounded-lg"
                            >
                              <PlayCircle className="w-2.5 h-2.5 mr-1" /> Video
                            </Badge>
                          )}
                          {lesson.fileUrl && (
                            <Badge
                              variant="outline"
                              className="font-semibold text-[9px] border-blue-200 text-blue-600 bg-blue-50 rounded-lg"
                            >
                              <Paperclip className="w-2.5 h-2.5 mr-1" /> Fayl
                            </Badge>
                          )}
                        </div>
                        {lesson.description && (
                          <p className="text-xs mt-0.5 text-zinc-500 line-clamp-1">{lesson.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-400">
                          <Clock className="w-3.5 h-3.5 text-zinc-300" /> {new Date(lesson.createdAt).toLocaleDateString("uz-UZ")}
                          {lesson.tags.length > 0 && (
                            <span>• {lesson.tags.slice(0, 3).join(", ")}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={e => { e.stopPropagation(); setPreviewLesson(lesson); }}
                        className="p-1.5 border border-zinc-200 hover:bg-zinc-50 rounded-lg text-zinc-400 hover:text-primary transition-colors cursor-pointer"
                        title="Ko'rish"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={async e => {
                          e.stopPropagation();
                          const res = await deleteLesson(lesson.id);
                          if (res.success) {
                            toast({ title: "Dars o'chirildi" });
                          } else {
                            toast({ variant: "destructive", title: "Xatolik", description: res.message });
                          }
                        }}
                        className="p-1.5 border border-zinc-200 hover:bg-red-50 rounded-lg text-zinc-400 hover:text-red-600 transition-colors cursor-pointer"
                        title="O'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="text-zinc-400 p-1">
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-primary" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
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
                        <div className="px-4 pb-4 pt-3 space-y-3 border-t border-zinc-100 bg-zinc-50/20">
                          <div className="rounded-xl p-4 bg-white border border-zinc-200 text-sm leading-relaxed text-zinc-700 whitespace-pre-wrap font-medium">
                            {lesson.content}
                          </div>
                          {lesson.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {lesson.tags.map(tag => (
                                <span
                                  key={tag}
                                  className="text-[9px] px-2 py-0.5 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-600 font-medium"
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm"
            onClick={() => setPreviewLesson(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white border border-zinc-200 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="sticky top-0 p-5 flex items-start justify-between bg-white/95 backdrop-blur-md border-b border-zinc-100 z-10">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className={`font-semibold text-[9px] rounded-lg ${difficultyColors[previewLesson.difficulty]}`}>
                      {previewLesson.difficulty}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="font-semibold text-[9px] border-zinc-200 text-zinc-500 bg-zinc-50 rounded-lg"
                    >
                      {previewLesson.category}
                    </Badge>
                  </div>
                  <h2 className="text-lg font-bold text-zinc-900 mt-2">
                    {previewLesson.title}
                  </h2>
                  {previewLesson.description && (
                    <p className="text-xs text-zinc-500 mt-1">{previewLesson.description}</p>
                  )}
                </div>
                <button
                  onClick={() => setPreviewLesson(null)}
                  className="p-1.5 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-400 hover:text-zinc-750 transition-colors ml-4 shrink-0 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div className="rounded-xl p-4 bg-zinc-50 border border-zinc-200 text-sm leading-relaxed text-zinc-700 whitespace-pre-wrap font-medium">
                  {previewLesson.content}
                </div>
                {previewLesson.videoUrl && (
                  <div className="rounded-xl p-4 flex items-center gap-3 bg-indigo-50/40 border border-indigo-100/50">
                    <PlayCircle className="w-5 h-5 text-primary shrink-0" />
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-primary">
                        Video Dars
                      </div>
                      <a
                        href={previewLesson.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline font-semibold break-all"
                      >
                        {previewLesson.videoUrl}
                      </a>
                    </div>
                  </div>
                )}
                {previewLesson.fileUrl && (
                  previewLesson.fileName?.toLowerCase().endsWith(".pdf") ? (
                    <div className="rounded-xl overflow-hidden border border-zinc-200">
                      <div className="flex items-center gap-2 px-4 py-2.5 bg-zinc-50 border-b border-zinc-200">
                        <FileText className="w-4 h-4 text-red-500 shrink-0" />
                        <span className="text-xs font-semibold text-zinc-700 truncate flex-1">{previewLesson.fileName}</span>
                        <a
                          href={`${API_URL}${previewLesson.fileUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-bold text-primary hover:underline shrink-0"
                        >
                          Yangi tabda ↗
                        </a>
                      </div>
                      <iframe
                        src={`${API_URL}${previewLesson.fileUrl}`}
                        className="w-full"
                        style={{ height: "520px" }}
                        title={previewLesson.fileName}
                      />
                    </div>
                  ) : (
                    <div className="rounded-xl p-4 flex items-center gap-3 bg-blue-50/40 border border-blue-100/50">
                      <Download className="w-5 h-5 text-blue-600 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                          Darslik Fayli
                        </div>
                        <a
                          href={`${API_URL}${previewLesson.fileUrl}`}
                          download={previewLesson.fileName}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline font-semibold break-all"
                        >
                          {previewLesson.fileName}
                          {previewLesson.fileSize && (
                            <span className="ml-1 text-zinc-400 font-normal">({formatFileSize(previewLesson.fileSize)})</span>
                          )}
                        </a>
                      </div>
                    </div>
                  )
                )}
                {previewLesson.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-3 border-t border-zinc-100">
                    {previewLesson.tags.map(tag => (
                      <span
                        key={tag}
                        className="text-[9px] px-2.5 py-1 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-600 font-medium"
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
  const [activeTab, setActiveTab] = useState<"Barchasi" | "Nazariy" | "Amaliy">("Barchasi");
  const [filterCategory, setFilterCategory] = useState("Barchasi");
  const [filterDifficulty, setFilterDifficulty] = useState("Barchasi");
  const { toast } = useToast();

  const tabLessons = activeTab === "Barchasi"
    ? lessons
    : lessons.filter(l => (l.lessonType ?? "Nazariy") === activeTab);
  const categories = ["Barchasi", ...Array.from(new Set(tabLessons.map(l => l.category)))];
  const difficulties = ["Barchasi", "Boshlang'ich", "O'rta", "Yuqori"];

  const filtered = tabLessons.filter(l => {
    const catMatch = filterCategory === "Barchasi" || l.category === filterCategory;
    const difMatch = filterDifficulty === "Barchasi" || l.difficulty === filterDifficulty;
    return catMatch && difMatch;
  });

  const handleMarkRead = async (lessonId: number, title: string) => {
    const res = await markLessonRead(lessonId);
    if (res.success) {
      toast({ title: "✅ O'qildi!", description: `"${title}" darsi o'qilgan deb belgilandi.` });
    } else {
      toast({ variant: "destructive", title: "Xatolik", description: res.message });
    }
  };

  const readCount = tabLessons.filter(l =>
    l.readByStudents?.includes(useAppStore.getState().currentUser?.id ?? -1)
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="text-[10px] font-bold tracking-widest text-primary uppercase">&gt; STUDENT / O'QUV DARSLARI</div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Cybersecurity Darslar
        </h1>
        <p className="text-xs text-zinc-500">
          O'qituvchi tomonidan tayyorlangan darslarni o'qib, cybersecurity bo'yicha bilim oling.
        </p>
      </div>

      {/* Barchasi / Nazariy / Amaliy Tabs */}
      <div className="flex rounded-2xl border border-zinc-200 bg-zinc-50 p-1 gap-1">
        {(["Barchasi", "Nazariy", "Amaliy"] as const).map(tab => {
          const isActive = activeTab === tab;
          const Icon = tab === "Barchasi" ? Layers : tab === "Nazariy" ? BookText : FlaskConical;
          const tabCount = tab === "Barchasi" ? lessons.length : lessons.filter(l => (l.lessonType ?? "Nazariy") === tab).length;
          return (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setFilterCategory("Barchasi"); setFilterDifficulty("Barchasi"); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                isActive
                  ? tab === "Nazariy"
                    ? "bg-white border border-primary/20 text-primary shadow-sm"
                    : tab === "Amaliy"
                      ? "bg-white border border-emerald-200 text-emerald-700 shadow-sm"
                      : "bg-white border border-zinc-300 text-zinc-800 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-600"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab}
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                isActive
                  ? tab === "Nazariy" ? "bg-primary/10 text-primary" : tab === "Amaliy" ? "bg-emerald-100 text-emerald-700" : "bg-zinc-200 text-zinc-700"
                  : "bg-zinc-200 text-zinc-500"
              }`}>{tabCount}</span>
            </button>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: BookOpen, label: "Jami Darslar", value: tabLessons.length, color: 'hsl(var(--primary))' },
          { icon: CheckCircle2, label: "O'qildi", value: readCount, color: 'hsl(142 76% 36%)' },
          { icon: PlayCircle, label: "Video", value: tabLessons.filter(l => l.videoUrl).length, color: 'hsl(280 84% 60%)' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div
            key={label}
            className="rounded-2xl border border-zinc-200 bg-white p-4 flex items-center gap-3 shadow-2xs"
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: `${color}10`, border: `1px solid ${color}20` }}
            >
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <div>
              <div className="text-2xl font-bold text-zinc-900">{value}</div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      {tabLessons.length > 0 && (
        <div className="flex gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">
              Kategoriya:
            </span>
            <div className="flex gap-1.5 flex-wrap">
              {categories.map(cat => {
                const isActive = filterCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`text-[11px] px-3 py-1 rounded-full font-semibold border transition-all cursor-pointer ${
                      isActive
                        ? "bg-indigo-50 border-primary text-primary shadow-2xs"
                        : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">
              Daraja:
            </span>
            <div className="flex gap-1.5 flex-wrap">
              {difficulties.map(dif => {
                const isActive = filterDifficulty === dif;
                return (
                  <button
                    key={dif}
                    onClick={() => setFilterDifficulty(dif)}
                    className={`text-[11px] px-3 py-1 rounded-full font-semibold border transition-all cursor-pointer ${
                      isActive
                        ? "bg-indigo-50 border-primary text-primary shadow-2xs"
                        : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300"
                    }`}
                  >
                    {dif}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Lesson Cards */}
      {tabLessons.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-12 flex flex-col items-center gap-3 shadow-2xs">
          {activeTab === "Barchasi" ? <BookOpen className="w-10 h-10 text-zinc-300" /> : activeTab === "Nazariy" ? <BookText className="w-10 h-10 text-zinc-300" /> : <FlaskConical className="w-10 h-10 text-zinc-300" />}
          <p className="text-sm text-center text-zinc-500 font-medium">
            Hali hech qanday {activeTab === "Barchasi" ? "" : activeTab.toLowerCase() + " "}dars qo'shilmagan.<br />
            <span className="text-xs">O'qituvchi {activeTab === "Barchasi" ? "" : activeTab.toLowerCase() + " "}dars qo'shganda bu yerda ko'rinadi.</span>
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-sm py-8 text-zinc-400 font-medium">
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
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden cursor-pointer hover:-translate-y-0.5 ${
                    isRead
                      ? "border-zinc-200 bg-zinc-50/30 hover:bg-zinc-50/60 shadow-2xs hover:shadow-xs border-l-4 border-l-primary"
                      : "border-zinc-200 bg-white hover:bg-zinc-50/30 shadow-2xs hover:shadow-xs"
                  }`}
                  onClick={() => setSelectedLesson(lesson)}
                >
                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100/50 flex items-center justify-center shrink-0 mt-0.5 text-primary">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge
                          variant="outline"
                          className={`font-semibold text-[9px] rounded-lg ${difficultyColors[lesson.difficulty]}`}
                        >
                          {lesson.difficulty}
                        </Badge>
                        {isRead && (
                          <Badge
                            variant="outline"
                            className="font-semibold text-[9px] border-emerald-200 text-emerald-700 bg-emerald-50 rounded-lg"
                          >
                            <CheckCircle2 className="w-2.5 h-2.5 mr-1" /> O'qildi
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="text-[9px] uppercase font-bold tracking-wider text-zinc-400 mb-1">
                        {lesson.category}
                      </div>
                      <h3 className="font-bold text-sm text-zinc-800 line-clamp-2">
                        {lesson.title}
                      </h3>
                      {lesson.description && (
                        <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                          {lesson.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-zinc-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-zinc-300" />
                        {new Date(lesson.createdAt).toLocaleDateString("uz-UZ")}
                      </div>
                      {lesson.videoUrl && (
                        <div className="flex items-center gap-1 text-primary font-bold">
                          <PlayCircle className="w-3.5 h-3.5" /> Video bor
                        </div>
                      )}
                      {lesson.fileUrl && (
                        <div className="flex items-center gap-1 text-blue-600 font-bold">
                          <Paperclip className="w-3.5 h-3.5" /> Fayl bor
                        </div>
                      )}
                    </div>

                    {lesson.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {lesson.tags.slice(0, 3).map(tag => (
                          <span
                            key={tag}
                            className="text-[9px] px-2 py-0.5 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-600 font-medium"
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm"
            onClick={() => setSelectedLesson(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white border border-zinc-200 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 p-5 bg-white/95 backdrop-blur-md border-b border-zinc-100 z-10">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <Badge
                        variant="outline"
                        className={`font-semibold text-[9px] rounded-lg ${
                          (selectedLesson.lessonType ?? "Nazariy") === "Nazariy"
                            ? "border-indigo-200 text-primary bg-indigo-50"
                            : "border-emerald-200 text-emerald-700 bg-emerald-50"
                        }`}
                      >
                        {(selectedLesson.lessonType ?? "Nazariy") === "Nazariy"
                          ? <><BookText className="w-2.5 h-2.5 mr-1 inline" />Nazariy</>
                          : <><FlaskConical className="w-2.5 h-2.5 mr-1 inline" />Amaliy</>
                        }
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`font-semibold text-[9px] rounded-lg ${difficultyColors[selectedLesson.difficulty]}`}
                      >
                        {selectedLesson.difficulty}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="font-semibold text-[9px] border-zinc-200 text-zinc-500 bg-zinc-50 rounded-lg"
                      >
                        {selectedLesson.category}
                      </Badge>
                    </div>
                    <h2 className="text-lg font-bold text-zinc-900 mt-2">
                      {selectedLesson.title}
                    </h2>
                    {selectedLesson.description && (
                      <p className="text-xs text-zinc-500 mt-1">
                        {selectedLesson.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedLesson(null)}
                    className="p-1.5 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-400 hover:text-zinc-700 transition-colors ml-4 shrink-0 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-5 space-y-5">
                {/* Lesson Content */}
                <div className="rounded-2xl p-5 bg-zinc-50 border border-zinc-200">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Dars matni
                    </span>
                  </div>
                  <p className="text-xs md:text-sm leading-relaxed text-zinc-750 whitespace-pre-wrap font-medium">
                    {selectedLesson.content}
                  </p>
                </div>

                {/* Video Link */}
                {selectedLesson.videoUrl && (
                  <div className="rounded-2xl p-4 flex items-center gap-3 bg-indigo-50/40 border border-indigo-100/50">
                    <PlayCircle className="w-5 h-5 text-primary shrink-0" />
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-primary">
                        Video Dars
                      </div>
                      <a
                        href={selectedLesson.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline font-semibold break-all"
                      >
                        {selectedLesson.videoUrl}
                      </a>
                    </div>
                  </div>
                )}

                {/* File Viewer / Download */}
                {selectedLesson.fileUrl && (
                  selectedLesson.fileName?.toLowerCase().endsWith(".pdf") ? (
                    <div className="rounded-2xl overflow-hidden border border-zinc-200">
                      <div className="flex items-center gap-2 px-4 py-2.5 bg-zinc-50 border-b border-zinc-200">
                        <FileText className="w-4 h-4 text-red-500 shrink-0" />
                        <span className="text-xs font-semibold text-zinc-700 truncate flex-1">{selectedLesson.fileName}</span>
                        {selectedLesson.fileSize && (
                          <span className="text-[10px] text-zinc-400 shrink-0">{formatFileSize(selectedLesson.fileSize)}</span>
                        )}
                        <a
                          href={`${API_URL}${selectedLesson.fileUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-bold text-primary hover:underline shrink-0"
                        >
                          Yangi tabda ↗
                        </a>
                      </div>
                      <iframe
                        src={`${API_URL}${selectedLesson.fileUrl}`}
                        className="w-full"
                        style={{ height: "560px" }}
                        title={selectedLesson.fileName}
                      />
                    </div>
                  ) : (
                  <div className="rounded-2xl p-4 flex items-center gap-3 bg-blue-50/40 border border-blue-100/50">
                    <Download className="w-5 h-5 text-blue-600 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                        Darslik Fayli
                      </div>
                      <a
                        href={`${API_URL}${selectedLesson.fileUrl}`}
                        download={selectedLesson.fileName}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline font-semibold break-all"
                      >
                        {selectedLesson.fileName}
                        {selectedLesson.fileSize && (
                          <span className="ml-1 text-zinc-400 font-normal">({formatFileSize(selectedLesson.fileSize)})</span>
                        )}
                      </a>
                    </div>
                  </div>
                  )
                )}

                {/* Tags */}
                {selectedLesson.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-3 border-t border-zinc-100">
                    {selectedLesson.tags.map(tag => (
                      <span
                        key={tag}
                        className="text-[9px] px-2.5 py-1 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-600 font-medium"
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
                    <div className="flex items-center gap-2 rounded-2xl p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 font-semibold justify-center">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span className="text-sm">
                        Siz bu darsni o'qidingiz!
                      </span>
                    </div>
                  ) : (
                    <button
                      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-bold tracking-wider uppercase bg-primary text-white border border-primary hover:bg-primary/95 cursor-pointer shadow-sm active:translate-y-0.5 transition-all"
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
  const { userRole, fetchLessons } = useAppStore();

  useEffect(() => {
    fetchLessons();
  }, []);

  return (
    <motion.div initial="hidden" animate="visible" variants={pageVariants}>
      {userRole === "Teacher" ? <TeacherView /> : <StudentView />}
    </motion.div>
  );
}
