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
  const data = moduleProgress.map(m => ({
    module: m.title,
    score: m.completed ? Math.round((m.score ?? 0) * 100) : 0,
  }));

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={data} outerRadius="70%">
          <PolarGrid stroke="hsl(240 6% 90%)" />
          <PolarAngleAxis dataKey="module" tick={{ fontSize: 11, fill: "hsl(240 4% 46%)" }} />
          <PolarRadiusAxis domain={[0, 100]} tickCount={5} tick={{ fontSize: 9, fill: "hsl(240 4% 65%)" }} />
          <Radar
            name="Ball"
            dataKey="score"
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
            animationDuration={900}
            animationEasing="ease-out"
          />
          <Tooltip
            formatter={(value: number) => [`${value}%`, "Ball"]}
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
