import type { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  BookOpen, Shield, Cpu, BarChart3,
  UserCheck, ShieldCheck, LogOut, User,
  ClipboardList, BookMarked, Terminal, Activity
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { translateLevel } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function Layout({ children }: { children: ReactNode }) {
  const { currentLevel, readinessScore, currentUser, logoutUser, userRole } = useAppStore();
  const [location] = useLocation();

  const handleLogout = () => {
    logoutUser();
  };

  const navItems = [
    { href: "/", icon: BookOpen, label: "Ta'lim", show: true },
    { href: "/lessons", icon: BookMarked, label: userRole === "Teacher" ? "Darslar (Boshqaruv)" : "Darslar", show: true },
    { href: "/assessment", icon: Shield, label: "Kiberxavfsizlik", show: userRole === "Student" },
    { href: "/ai-engine", icon: Cpu, label: "AI Dvigateli (ANFIS)", show: true },
    { href: "/analytics", icon: BarChart3, label: "Analitika", show: true },
    { href: "/assignments", icon: ClipboardList, label: "Topshiriqlar", show: userRole === "Teacher" },
  ];

  return (
    <div className="min-h-[100dvh] flex text-foreground font-mono" style={{ background: 'hsl(220 13% 4%)' }}>
      {/* ── Left Sidebar ─────────────────────────────────── */}
      <aside
        className="w-64 flex flex-col sticky top-0 h-[100vh] z-30 shrink-0"
        style={{
          background: 'hsl(220 18% 5%)',
          borderRight: '1px solid hsl(150 60% 16%)',
          boxShadow: '4px 0 30px hsl(150 100% 50% / 0.06)',
        }}
      >
        {/* ── Header ── */}
        <div className="p-5 flex flex-col gap-3" style={{ borderBottom: '1px solid hsl(150 60% 14%)' }}>
          <Link href="/" className="flex items-center gap-2.5 group">
            <div
              className="w-9 h-9 rounded flex items-center justify-center shrink-0 glow-pulse"
              style={{
                background: 'hsl(150 100% 50% / 0.1)',
                border: '1px solid hsl(150 100% 50% / 0.5)',
              }}
            >
              <ShieldCheck className="w-5 h-5" style={{ color: 'hsl(150 100% 55%)' }} />
            </div>
            <div>
              <div
                className="font-bold text-sm leading-tight tracking-widest uppercase"
                style={{
                  fontFamily: 'Orbitron, monospace',
                  color: 'hsl(150 100% 65%)',
                  textShadow: '0 0 12px hsl(150 100% 55% / 0.6)',
                }}
              >
                CyberAl
              </div>
              <div className="text-[9px] tracking-widest" style={{ color: 'hsl(150 40% 50%)' }}>
                PLATFORM v2.4.1
              </div>
            </div>
          </Link>

          {/* System status indicator */}
          <div
            className="flex items-center gap-2 px-2 py-1.5 rounded"
            style={{ background: 'hsl(150 100% 50% / 0.06)', border: '1px solid hsl(150 100% 50% / 0.15)' }}
          >
            <Activity className="w-3 h-3" style={{ color: 'hsl(150 100% 55%)' }} />
            <span className="text-[9px] tracking-widest uppercase" style={{ color: 'hsl(150 60% 60%)' }}>
              Tizim faol
            </span>
            <div
              className="ml-auto w-1.5 h-1.5 rounded-full"
              style={{
                background: 'hsl(150 100% 55%)',
                boxShadow: '0 0 6px hsl(150 100% 55%)',
                animation: 'pulse-glow 1.5s ease-in-out infinite',
              }}
            />
          </div>
        </div>

        {/* ── User Info ── */}
        <div
          className="px-4 py-3 flex items-center gap-3"
          style={{ borderBottom: '1px solid hsl(150 50% 12%)', background: 'hsl(150 100% 50% / 0.03)' }}
        >
          <div
            className="w-9 h-9 rounded flex items-center justify-center shrink-0"
            style={{
              background: 'hsl(150 100% 50% / 0.1)',
              border: '1px solid hsl(150 100% 50% / 0.4)',
            }}
          >
            {currentUser?.role === "Teacher"
              ? <UserCheck className="w-4 h-4" style={{ color: 'hsl(150 100% 55%)' }} />
              : <User className="w-4 h-4" style={{ color: 'hsl(150 100% 55%)' }} />
            }
          </div>
          <div className="min-w-0 flex-1">
            <div
              className="text-xs font-bold truncate leading-tight"
              style={{ color: 'hsl(150 90% 80%)' }}
            >
              {currentUser?.name || "Mehmon"}
            </div>
            <div className="text-[9px] tracking-widest uppercase mt-0.5" style={{ color: 'hsl(150 40% 50%)' }}>
              {currentUser?.role === "Teacher" ? "[ O'QITUVCHI ]" : "[ O'QUVCHI ]"}
            </div>
          </div>
          {/* Online dot */}
          <div
            className="w-2 h-2 rounded-full shrink-0"
            style={{
              background: 'hsl(150 100% 55%)',
              boxShadow: '0 0 8px hsl(150 100% 55%)',
            }}
          />
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {/* Section label */}
          <div
            className="px-3 mb-2 text-[8px] tracking-widest uppercase"
            style={{ color: 'hsl(150 30% 40%)' }}
          >
            &gt; Navigatsiya
          </div>

          {navItems.filter(item => item.show).map(({ href, icon: Icon, label }) => {
            const isActive = location === href;
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded text-xs font-medium transition-all duration-200 group relative"
                style={{
                  background: isActive
                    ? 'hsl(150 100% 50% / 0.12)'
                    : 'transparent',
                  border: isActive
                    ? '1px solid hsl(150 100% 50% / 0.35)'
                    : '1px solid transparent',
                  color: isActive
                    ? 'hsl(150 100% 65%)'
                    : 'hsl(150 30% 55%)',
                  boxShadow: isActive
                    ? '0 0 15px hsl(150 100% 50% / 0.1), inset 0 0 10px hsl(150 100% 50% / 0.05)'
                    : 'none',
                  textShadow: isActive ? '0 0 8px hsl(150 100% 55% / 0.5)' : 'none',
                }}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r"
                    style={{
                      background: 'hsl(150 100% 55%)',
                      boxShadow: '0 0 8px hsl(150 100% 55%)',
                    }}
                  />
                )}
                <Icon
                  className="w-3.5 h-3.5 shrink-0 transition-all"
                  style={{
                    color: isActive ? 'hsl(150 100% 55%)' : 'hsl(150 40% 50%)',
                    filter: isActive ? 'drop-shadow(0 0 4px hsl(150 100% 55% / 0.7))' : 'none',
                  }}
                />
                <span className="tracking-wider uppercase text-[10px]">{label}</span>
                {isActive && (
                  <Terminal
                    className="w-2.5 h-2.5 ml-auto shrink-0"
                    style={{ color: 'hsl(150 100% 55% / 0.5)' }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Footer ── */}
        <div
          className="p-4 space-y-3"
          style={{ borderTop: '1px solid hsl(150 50% 12%)' }}
        >
          {userRole === "Student" ? (
            <div
              className="rounded p-3 space-y-2"
              style={{
                background: 'hsl(150 100% 50% / 0.06)',
                border: '1px solid hsl(150 100% 50% / 0.2)',
              }}
            >
              <div className="text-[8px] tracking-widest uppercase mb-2" style={{ color: 'hsl(150 40% 50%)' }}>
                &gt; Holat Ma'lumotlari
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[9px] tracking-wider uppercase" style={{ color: 'hsl(150 40% 55%)' }}>
                  Daraja
                </span>
                <Badge
                  variant="outline"
                  className="font-mono text-[9px] py-0 px-1.5 tracking-wider"
                  style={{
                    borderColor: 'hsl(150 100% 50% / 0.5)',
                    color: 'hsl(150 100% 60%)',
                    background: 'hsl(150 100% 50% / 0.1)',
                    textShadow: '0 0 6px hsl(150 100% 55% / 0.6)',
                  }}
                >
                  {translateLevel(currentLevel)}
                </Badge>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-[9px] tracking-wider uppercase" style={{ color: 'hsl(150 40% 55%)' }}>
                  Tayyorlik
                </span>
                <span
                  className="text-[10px] font-bold"
                  style={{
                    color: 'hsl(150 100% 60%)',
                    textShadow: '0 0 6px hsl(150 100% 55% / 0.5)',
                  }}
                >
                  {(readinessScore * 100).toFixed(0)}%
                </span>
              </div>

              {/* Mini progress bar */}
              <div
                className="h-1 rounded-full overflow-hidden"
                style={{ background: 'hsl(150 100% 50% / 0.1)', border: '1px solid hsl(150 100% 50% / 0.2)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${(readinessScore * 100).toFixed(0)}%`,
                    background: 'linear-gradient(to right, hsl(150 100% 35%), hsl(150 100% 60%))',
                    boxShadow: '0 0 6px hsl(150 100% 50%)',
                  }}
                />
              </div>
            </div>
          ) : (
            <div
              className="rounded p-2.5"
              style={{
                background: 'hsl(150 100% 50% / 0.05)',
                border: '1px solid hsl(150 100% 50% / 0.15)',
              }}
            >
              <div className="text-[9px] tracking-widest text-center" style={{ color: 'hsl(150 40% 55%)' }}>
                FUZZY AI BOSHQARUV REJIMI
              </div>
            </div>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded text-[10px] font-bold tracking-wider uppercase transition-all duration-200 group"
            style={{
              background: 'transparent',
              border: '1px solid hsl(0 85% 60% / 0.3)',
              color: 'hsl(0 70% 60%)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'hsl(0 85% 60% / 0.1)';
              (e.currentTarget as HTMLElement).style.borderColor = 'hsl(0 85% 60% / 0.6)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 0 12px hsl(0 85% 60% / 0.2)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
              (e.currentTarget as HTMLElement).style.borderColor = 'hsl(0 85% 60% / 0.3)';
              (e.currentTarget as HTMLElement).style.boxShadow = 'none';
            }}
          >
            <LogOut className="w-3 h-3" />
            Tizimdan chiqish
          </button>

          {/* Version tag */}
          <div className="text-center text-[8px] tracking-widest" style={{ color: 'hsl(150 30% 30%)' }}>
            CYBERAI © 2024 — FUZZY/ANFIS
          </div>
        </div>
      </aside>

      {/* ── Main Content Area ──────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-8 md:p-10 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
