import { useEffect, useRef, useState } from "react";
import type { ModuleProgress } from "@/store/useAppStore";

// ─── Per-module gradient palette ──────────────────────────────────────────────
// Each entry: inner (bright) → outer (deep) colour for the radial fill.
const PALETTE = [
  { inner: "#a5b4fc", outer: "#4f46e5", dot: "#6366f1", label: "#6366f1", name: "indigo"  }, // Module 1
  { inner: "#6ee7b7", outer: "#059669", dot: "#10b981", label: "#059669", name: "emerald" }, // Module 2
  { inner: "#fde68a", outer: "#d97706", dot: "#f59e0b", label: "#b45309", name: "amber"   }, // Module 3
  { inner: "#fda4af", outer: "#be123c", dot: "#ef4444", label: "#dc2626", name: "rose"    }, // Module 4
  // fallback for >4 modules
  { inner: "#c4b5fd", outer: "#7c3aed", dot: "#8b5cf6", label: "#7c3aed", name: "violet"  },
  { inner: "#7dd3fc", outer: "#0369a1", dot: "#0ea5e9", label: "#0369a1", name: "sky"     },
  { inner: "#bbf7d0", outer: "#15803d", dot: "#22c55e", label: "#15803d", name: "green"   },
  { inner: "#fed7aa", outer: "#c2410c", dot: "#f97316", label: "#c2410c", name: "orange"  },
];

export const MODULE_COLORS = PALETTE.map(p => p.dot);

// ─── Heat scale (score → colour) ──────────────────────────────────────────────
// Continuous red → orange → amber → lime → green scale, matching the
// 0-29 / 30-49 / 50-69 / 70-89 / 90-100 competency bands.
const HEAT_STOPS: [number, [number, number, number]][] = [
  [0,   [220, 38, 38]],  // red-600
  [25,  [249, 115, 22]], // orange-500
  [50,  [245, 158, 11]], // amber-500
  [75,  [132, 204, 22]], // lime-500
  [100, [34, 197, 94]],  // green-500
];

function heatRgb(pct: number): [number, number, number] {
  const p = Math.max(0, Math.min(100, pct));
  for (let i = 0; i < HEAT_STOPS.length - 1; i++) {
    const [p0, c0] = HEAT_STOPS[i];
    const [p1, c1] = HEAT_STOPS[i + 1];
    if (p >= p0 && p <= p1) {
      const t = (p - p0) / (p1 - p0);
      return [
        Math.round(c0[0] + (c1[0] - c0[0]) * t),
        Math.round(c0[1] + (c1[1] - c0[1]) * t),
        Math.round(c0[2] + (c1[2] - c0[2]) * t),
      ];
    }
  }
  return HEAT_STOPS[HEAT_STOPS.length - 1][1];
}
function rgbToHex([r, g, b]: [number, number, number]) {
  return "#" + [r, g, b].map(v => v.toString(16).padStart(2, "0")).join("");
}
function heatColor(pct: number): string {
  return rgbToHex(heatRgb(pct));
}
function heatColorLight(pct: number, mix = 0.55): string {
  const [r, g, b] = heatRgb(pct);
  return rgbToHex([
    Math.round(r + (255 - r) * mix),
    Math.round(g + (255 - g) * mix),
    Math.round(b + (255 - b) * mix),
  ]);
}
function heatColorDark(pct: number, mix = 0.25): string {
  const [r, g, b] = heatRgb(pct);
  return rgbToHex([Math.round(r * (1 - mix)), Math.round(g * (1 - mix)), Math.round(b * (1 - mix))]);
}
// Gradient stops for the shared radial heat-fill: centre (0%) is always red,
// mid-radius is amber/yellow, the outer edge (100%) is always green —
// independent of which axis a point sits on, so the fill reads as one
// continuous heat-map disc rather than per-module wedges.
const RADIAL_STOPS = HEAT_STOPS.map(([pct, rgb]) => ({ pct, hex: rgbToHex(rgb) }));

// ─── SVG layout constants ─────────────────────────────────────────────────────
const SIZE    = 200;
const CX      = SIZE / 2;
const CY      = SIZE / 2;
const MAX_R   = SIZE * 0.34;   // radius that maps to 100%
const LABEL_R = MAX_R + 22;   // label ring
const GRID    = [25, 50, 75, 100];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function angles(n: number): number[] {
  return Array.from({ length: n }, (_, i) => -Math.PI / 2 + (2 * Math.PI * i) / n);
}
function polarPt(r: number, angle: number) {
  return { x: CX + r * Math.cos(angle), y: CY + r * Math.sin(angle) };
}
function fmt(n: number, d = 2) { return n.toFixed(d); }

// Wrap long module names onto two lines (at a word boundary) instead of truncating them.
function wrapLabel(title: string): string[] {
  if (title.length <= 14) return [title];
  const words = title.split(" ");
  if (words.length === 1) return [title];
  const half = Math.ceil(title.length / 2);
  let line1 = "";
  for (const w of words) {
    if (line1 === "" || (line1 + " " + w).length <= half + 2) {
      line1 = line1 === "" ? w : `${line1} ${w}`;
    } else break;
  }
  const line2 = title.slice(line1.length).trim();
  return line2 ? [line1, line2] : [line1];
}

// ─── Component ────────────────────────────────────────────────────────────────
export function ModuleRadarChart({ moduleProgress }: { moduleProgress: ModuleProgress[] }) {
  const N = moduleProgress.length;
  const axisAngles = angles(N);

  // Target scores 0-100
  const targets = moduleProgress.map(m =>
    m.completed ? Math.round((m.score ?? 0) * 100) : 0
  );

  // Animated scores (initialise to 0 on first mount, then transition to target)
  const [anim, setAnim] = useState<number[]>(() => targets.map(() => 0));
  const animRef = useRef(anim);
  animRef.current = anim;

  useEffect(() => {
    if (N === 0) return;

    const starts = animRef.current.length === N ? [...animRef.current] : targets.map(() => 0);
    const t0 = performance.now();
    const DUR = 1400;
    let raf: number;

    const tick = (now: number) => {
      const p = Math.min((now - t0) / DUR, 1);
      const e = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setAnim(targets.map((tgt, i) => starts[i] + (tgt - starts[i]) * e));
      if (p < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleProgress]);

  if (N === 0) return null;

  // Normalised scores 0-1 (animated)
  const scores = (anim.length === N ? anim : targets).map(s => s / 100);
  // Points on each axis at current score radius
  const axisPts = scores.map((s, i) => polarPt(MAX_R * s, axisAngles[i]));

  // Full polygon outline
  const outline = axisPts
    .map((p, i) => `${i === 0 ? "M" : "L"}${fmt(p.x)},${fmt(p.y)}`)
    .join(" ") + " Z";

  const hasScore = targets.some(s => s > 0);

  // ─── Hover state for tooltip ─────────────────────────────────────────────
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      {/* ── SVG Radar ── */}
      <div className="relative max-w-[360px] mx-auto">
        <svg
          width="100%"
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          style={{ overflow: "visible" }}
          aria-label="Modullar bo'yicha ball radari"
        >
          <defs>
            {/* Shared radial heat-fill — centre is always red, mid-radius amber/yellow,
                outer edge always green, regardless of which axis a point falls on. */}
            <radialGradient id="mcg-heat" cx={CX} cy={CY} r={MAX_R} gradientUnits="userSpaceOnUse">
              {RADIAL_STOPS.map(({ pct, hex }) => (
                <stop key={pct} offset={`${pct}%`} stopColor={hex} stopOpacity={0.92} />
              ))}
            </radialGradient>

            {/* Soft blur so the heat-fill blends smoothly like a painterly heat-map */}
            <filter id="mcg-blur" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.2" />
            </filter>

            {/* Soft glow for dots */}
            <filter id="mcg-glow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Drop-shadow for the whole chart */}
            <filter id="mcg-shadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.08" />
            </filter>
          </defs>

          <g filter="url(#mcg-shadow)">
            {/* ── Grid polygons ── */}
            {GRID.map(pct => {
              const r = MAX_R * pct / 100;
              const pts = axisAngles
                .map(a => `${fmt(CX + r * Math.cos(a))},${fmt(CY + r * Math.sin(a))}`)
                .join(" ");
              return (
                <polygon
                  key={pct}
                  points={pts}
                  fill="none"
                  stroke={pct === 100 ? "hsl(240 6% 78%)" : "hsl(240 6% 90%)"}
                  strokeWidth={pct === 100 ? 1.5 : 0.7}
                  strokeDasharray={pct < 100 ? "4 4" : undefined}
                />
              );
            })}

            {/* ── Axis spokes ── */}
            {axisAngles.map((angle, i) => {
              const ep = polarPt(MAX_R, angle);
              return (
                <line
                  key={i}
                  x1={fmt(CX)} y1={fmt(CY)}
                  x2={fmt(ep.x)} y2={fmt(ep.y)}
                  stroke="hsl(240 6% 75%)"
                  strokeWidth={1.2}
                  strokeOpacity={0.5}
                />
              );
            })}

            {/* ── Heat-map fill, clipped to the score polygon ── */}
            {hasScore && (
              <path
                d={outline}
                fill="url(#mcg-heat)"
                stroke="none"
                filter="url(#mcg-blur)"
              />
            )}

            {/* ── Polygon outline (crisp, drawn over the blurred fill) ── */}
            {hasScore && (
              <path
                d={outline}
                fill="none"
                stroke="url(#mcg-heat)"
                strokeWidth={1.8}
                strokeLinejoin="round"
              />
            )}

            {/* ── Score dots on each axis ── */}
            {axisPts.map((p, i) => {
              if (scores[i] < 0.01) return null;
              const pct = scores[i] * 100;
              return (
                <g
                  key={i}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ cursor: "default" }}
                >
                  {/* Outer glow ring */}
                  <circle
                    cx={fmt(p.x)} cy={fmt(p.y)}
                    r={5}
                    fill={heatColorLight(pct)}
                    opacity={hovered === i ? 0.45 : 0.2}
                  />
                  {/* Main dot */}
                  <circle
                    cx={fmt(p.x)} cy={fmt(p.y)}
                    r={3}
                    fill={heatColor(pct)}
                    stroke="#fff"
                    strokeWidth={1.3}
                    filter="url(#mcg-glow)"
                  />
                  <title>{moduleProgress[i]?.title}: {targets[i]}%</title>
                </g>
              );
            })}
          </g>

          {/* ── Grid % labels (along top axis) ── */}
          {GRID.filter(p => p < 100).map(pct => (
            <text
              key={pct}
              x={CX + 5}
              y={fmt(CY - MAX_R * pct / 100 - 3)}
              fontSize={8}
              fill="hsl(240 4% 60%)"
              fontFamily="ui-sans-serif,system-ui,sans-serif"
            >
              {pct}%
            </text>
          ))}

          {/* ── Axis labels ── */}
          {moduleProgress.map((m, i) => {
            const angle = axisAngles[i];
            const { x: lx, y: ly } = polarPt(LABEL_R, angle);
            const anchor = lx < CX - 8 ? "end" : lx > CX + 8 ? "start" : "middle";
            const lines = wrapLabel(m.title);
            const startDy = lines.length > 1 ? -(lines.length - 1) * 5.5 : 0;
            return (
              <text
                key={i}
                x={fmt(lx)} y={fmt(ly)}
                textAnchor={anchor}
                dominantBaseline="middle"
                fontSize={10}
                fontWeight={700}
                fill="hsl(240 10% 30%)"
                fontFamily="ui-sans-serif,system-ui,sans-serif"
              >
                {lines.map((line, li) => (
                  <tspan key={li} x={fmt(lx)} dy={li === 0 ? startDy : 11}>
                    {line}
                  </tspan>
                ))}
              </text>
            );
          })}

          {/* ── Hover tooltip ── */}
          {hovered !== null && scores[hovered] > 0 && (() => {
            const p = axisPts[hovered];
            const label = moduleProgress[hovered]?.title ?? "";
            const score = targets[hovered];
            const text = `${score}% · ${label}`;
            const w = Math.max(76, text.length * 5.6 + 20);
            // Position tooltip above/below the dot
            const tipY = p.y < CY ? p.y + 18 : p.y - 38;
            const tipX = Math.max(w / 2 + 2, Math.min(SIZE - w / 2 - 2, p.x));
            return (
              <g>
                <rect
                  x={tipX - w / 2} y={tipY - 10}
                  width={w} height={22}
                  rx={6} ry={6}
                  fill={heatColorDark(score)}
                  opacity={0.92}
                />
                <text
                  x={tipX} y={tipY + 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={10}
                  fontWeight={700}
                  fill="#fff"
                  fontFamily="ui-sans-serif,system-ui,sans-serif"
                >
                  {text}
                </text>
              </g>
            );
          })()}
        </svg>
      </div>

      {/* ── Empty state ── */}
      {!hasScore && (
        <div className="flex flex-col items-center justify-center py-5 text-center">
          <div className="text-2xl mb-1.5">📊</div>
          <p className="text-xs font-medium text-zinc-500">Hali hech qanday modul tugatilmagan.</p>
          <p className="text-[10px] text-zinc-400 mt-0.5">
            Modul testini topshirib 70%+ ball olsangiz, chart bu yerda ko'rinadi.
          </p>
        </div>
      )}

      {/* ── Legend / breakdown ── */}
      <div className="grid grid-cols-2 gap-2">
        {moduleProgress.map((m, i) => {
          const pal = PALETTE[i % PALETTE.length];
          const scoreVal = m.completed ? Math.round((m.score ?? 0) * 100) : 0;
          return (
            <div
              key={m.id}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl border transition-colors"
              style={{
                borderColor: m.completed ? `${pal.outer}40` : "hsl(240 6% 92%)",
                background: m.completed ? `${pal.inner}18` : "hsl(240 6% 98%)",
              }}
            >
              <span className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: m.completed ? pal.dot : "hsl(240 5% 75%)",
                    outline: m.completed ? `2px solid ${pal.outer}55` : "none",
                    outlineOffset: "1px",
                    opacity: m.completed ? 1 : 0.4,
                  }}
                />
                <span
                  className="text-[11px] font-semibold truncate"
                  style={{ color: m.completed ? pal.label : "hsl(240 4% 55%)" }}
                >
                  {m.title}
                </span>
              </span>
              <span
                className="text-[11px] font-bold shrink-0 ml-2 tabular-nums"
                style={{ color: m.completed ? pal.dot : "hsl(240 4% 65%)" }}
              >
                {m.completed
                  ? `${scoreVal}%`
                  : m.unlocked
                  ? "—"
                  : "🔒"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
