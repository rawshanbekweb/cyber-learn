import { useState } from "react";
import { CheckCircle2, Lightbulb, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

export type CTFChallengeData = {
  id: number;
  moduleId: number;
  moduleTitle?: string;
  title: string;
  description: string;
  difficulty: "Oson" | "O'rta" | "Qiyin";
  points: number;
  hint: string;
  solved: boolean;
};

export const ctfDifficultyColors: Record<string, string> = {
  "Oson": "border-emerald-200 text-emerald-700 bg-emerald-50",
  "O'rta": "border-amber-200 text-amber-700 bg-amber-50",
  "Qiyin": "border-red-200 text-red-700 bg-red-50",
};

export function CTFChallengeCard({
  challenge,
  token,
  onSolved,
  showModuleBadge = false,
}: {
  challenge: CTFChallengeData;
  token: string | null;
  onSolved?: (id: number) => void;
  showModuleBadge?: boolean;
}) {
  const [flag, setFlag] = useState("");
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [hintRevealed, setHintRevealed] = useState(false);
  const [solved, setSolved] = useState(challenge.solved);
  const { toast } = useToast();

  const handleSubmit = async () => {
    const trimmed = flag.trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      const res = await api.post<{ correct: boolean; alreadySolved: boolean; message: string; pointsAwarded?: number }>(
        `/api/ctf/${challenge.id}/submit`, { flag: trimmed }, token
      );
      setFeedback({ correct: res.correct, message: res.message });
      if (res.correct) {
        setSolved(true);
        onSolved?.(challenge.id);
        if (!res.alreadySolved) {
          toast({ title: "🚩 Flag qabul qilindi!", description: `+${res.pointsAwarded ?? 0} XP qo'lga kiritdingiz.` });
        }
      }
    } catch (err) {
      setFeedback({ correct: false, message: err instanceof Error ? err.message : "Xatolik yuz berdi" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={`rounded-xl border p-4 space-y-3 ${solved ? "border-emerald-500/40 bg-emerald-500/5" : "border-border/50 bg-background/30"}`}
    >
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono font-bold text-sm">{challenge.title}</span>
          {showModuleBadge && challenge.moduleTitle && (
            <Badge variant="outline" className="font-mono text-[10px] border-primary/30 text-primary bg-primary/5">
              {challenge.moduleTitle}
            </Badge>
          )}
          <Badge variant="outline" className={`font-mono text-[10px] ${ctfDifficultyColors[challenge.difficulty]}`}>
            {challenge.difficulty}
          </Badge>
          <Badge variant="outline" className="font-mono text-[10px] border-primary/30 text-primary bg-primary/5">
            {challenge.points} XP
          </Badge>
        </div>
        {solved && (
          <Badge variant="outline" className="font-mono text-[10px] border-emerald-500 text-emerald-600 bg-emerald-500/10">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Yechildi
          </Badge>
        )}
      </div>
      <p className="text-xs font-mono text-muted-foreground leading-relaxed">
        {challenge.description}
      </p>

      {challenge.hint && !solved && (
        hintRevealed ? (
          <p className="text-xs font-mono text-amber-600 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 flex items-start gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 mt-0.5 shrink-0" /> {challenge.hint}
          </p>
        ) : (
          <button
            type="button"
            onClick={() => setHintRevealed(true)}
            className="text-[10px] font-mono text-amber-600 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Lightbulb className="w-3 h-3" /> Maslahatni ko'rsatish
          </button>
        )
      )}

      {!solved && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="cyberai{...}"
            value={flag}
            onChange={e => setFlag(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleSubmit(); }}
            className="flex-1 text-xs font-mono px-3 py-2 rounded-lg border border-border/50 bg-background/50 outline-none focus:border-primary transition"
          />
          <Button
            size="sm"
            className="font-mono shrink-0"
            onClick={handleSubmit}
            disabled={submitting || !flag.trim()}
          >
            {submitting ? "..." : <><Send className="w-3.5 h-3.5 mr-1" /> Yuborish</>}
          </Button>
        </div>
      )}

      {feedback && !solved && (
        <p className={`text-xs font-mono ${feedback.correct ? "text-emerald-600" : "text-destructive"}`}>
          {feedback.message}
        </p>
      )}
    </div>
  );
}
