import { useEffect, useState } from "react";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip,
} from "recharts";
import type { ModuleProgress } from "@/store/useAppStore";

// Fixed-order categorical palette — one hue per module, never re-cycled per render.
export const MODULE_COLORS = [
  "#2a78d6", // blue
  "#1baf7a", // aqua
  "#eda100", // yellow
  "#008300", // green
  "#4a3aa7", // violet
  "#e34948", // red
  "#e87ba4", // magenta
  "#eb6834", // orange
];

export function ModuleRadarChart({ moduleProgress }: { moduleProgress: ModuleProgress[] }) {
  // Gentle wobble / breathing state
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setPhase(p => p + 1), 1800);
    return () => clearInterval(id);
  }, []);

  // Smooth score transition animation state
  const [animatedScores, setAnimatedScores] = useState<number[]>([]);

  useEffect(() => {
    const targetScores = moduleProgress.map(m => m.completed ? Math.round((m.score ?? 0) * 100) : 0);
    
    // If empty or length mismatch, initialize with 0
    let startScores = animatedScores;
    if (animatedScores.length !== targetScores.length) {
      startScores = targetScores.map(() => 0);
      setAnimatedScores(startScores);
    }

    const duration = 1200; // 1.2s transition
    const startTime = performance.now();

    let animationFrameId: number;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (easeOutCubic)
      const ease = 1 - Math.pow(1 - progress, 3);

      const nextScores = targetScores.map((target, idx) => {
        const start = startScores[idx] ?? 0;
        return start + (target - start) * ease;
      });

      setAnimatedScores(nextScores);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [moduleProgress]);

  const data = moduleProgress.map((m, i) => {
    const score = animatedScores[i] ?? 0;
    // Wobble amplitude scales with the result: strong scores look lively,
    // zero scores stay pinned to the center.
    const amp = score * 0.05;
    const wobble = amp * Math.sin(phase * 1.1 + i * 1.9);
    return {
      module: m.title,
      score: m.completed ? Math.round((m.score ?? 0) * 100) : 0,
      display: Math.min(100, Math.max(0, score + wobble)),
    };
  });

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={data} outerRadius="70%">
          <PolarGrid stroke="hsl(240 6% 90%)" />
          <PolarAngleAxis dataKey="module" tick={{ fontSize: 11, fill: "hsl(240 4% 46%)" }} />
          <PolarRadiusAxis domain={[0, 100]} tickCount={5} tick={{ fontSize: 9, fill: "hsl(240 4% 65%)" }} />
          <Radar
            name="Ball"
            dataKey="display"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fill="hsl(var(--primary))"
            fillOpacity={0.25}
            dot={(props: any) => {
              const { cx, cy, index, key } = props;
              return (
                <circle
                  key={key}
                  cx={cx}
                  cy={cy}
                  r={4}
                  fill={MODULE_COLORS[index % MODULE_COLORS.length]}
                  stroke="#fcfcfb"
                  strokeWidth={1.5}
                />
              );
            }}
            isAnimationActive
            animationDuration={1700}
            animationEasing="ease-in-out"
          />
          <Tooltip
            // Show the real score, not the wobbled display value.
            formatter={(_value: number, _name, item: any) => [`${item?.payload?.score ?? 0}%`, "Ball"]}
            contentStyle={{ borderRadius: 12, border: "1px solid #e4e4e7", fontSize: 11 }}
          />
        </RadarChart>
      </ResponsiveContainer>

      {/* Accessible text breakdown, mirrors the chart */}
      <div className="grid grid-cols-2 gap-2">
        {moduleProgress.map((m, i) => (
          <div
            key={m.id}
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-50/60 border border-zinc-100"
          >
            <span className="flex items-center gap-2 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: MODULE_COLORS[i % MODULE_COLORS.length] }}
              />
              <span className="text-[11px] font-medium text-zinc-600 truncate">{m.title}</span>
            </span>
            <span className="text-[11px] font-bold text-zinc-800 shrink-0 ml-2">
              {m.completed ? `${Math.round((m.score ?? 0) * 100)}%` : "—"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
