import type { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  BookOpen, Shield, Cpu, BarChart3,
  UserCheck, ShieldCheck, LogOut, User,
  ClipboardList, BookMarked, Terminal, Activity, Trophy, Award, Newspaper, Flag
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
    { href: "/ctf", icon: Flag, label: userRole === "Teacher" ? "CTF (Boshqaruv)" : "CTF Challenge'lar", show: true },
    { href: "/ai-engine", icon: Cpu, label: "AI Dvigateli (ANFIS)", show: true },
    { href: "/analytics", icon: BarChart3, label: "Analitika", show: true },
    { href: "/rankings", icon: Trophy, label: "Reyting", show: true },
    { href: "/news", icon: Newspaper, label: "Yangiliklar", show: true },
    { href: "/certificate", icon: Award, label: "Sertifikatlar", show: userRole === "Student" },
    { href: "/assignments", icon: ClipboardList, label: "Topshiriqlar", show: userRole === "Teacher" },
  ];

  return (
    <div className="min-h-[100dvh] flex text-zinc-800 bg-background">
      {/* ── Left Sidebar ─────────────────────────────────── */}
      <aside className="w-64 flex flex-col sticky top-0 h-[100vh] z-30 shrink-0 bg-sidebar border-r border-sidebar-border">
        {/* ── Header ── */}
        <div className="p-6 flex flex-col gap-4 border-b border-sidebar-border">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-primary shadow-sm text-white"
            >
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div
                className="font-bold text-base leading-tight tracking-tight text-black"
              >
                CyberAI
              </div>
              <div className="text-[10px] font-medium text-zinc-500">
                O'quv Platformasi
              </div>
            </div>
          </Link>

          {/* System status indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-sidebar-border shadow-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
              Onlayn
            </span>
          </div>
        </div>

        {/* ── User Info ── */}
        <div className="px-4 py-4 flex items-center gap-3 bg-white/50 border-b border-sidebar-border">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-sidebar-border flex items-center justify-center shrink-0">
            {currentUser?.role === "Teacher"
              ? <UserCheck className="w-5 h-5 text-zinc-700" />
              : <User className="w-5 h-5 text-zinc-700" />
            }
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold text-black truncate leading-tight">
              {currentUser?.name || "Mehmon"}
            </div>
            <div className="text-[10px] font-semibold text-zinc-500 uppercase mt-0.5 tracking-wider">
              {currentUser?.role === "Teacher" ? "O'qituvchi" : "O'quvchi"}
            </div>
          </div>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {/* Section label */}
          <div className="px-3 mb-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            Asosiy Menyu
          </div>

          {navItems.filter(item => item.show).map(({ href, icon: Icon, label }) => {
            const isActive = location === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group relative border ${
                  isActive 
                    ? "bg-white text-primary border-sidebar-border shadow-xs" 
                    : "text-zinc-600 border-transparent hover:bg-white/60 hover:text-primary"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-primary" : "text-zinc-400 group-hover:text-primary"}`} />
                <span className="tracking-tight">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* ── Footer ── */}
        <div className="p-4 space-y-4 border-t border-sidebar-border">
          {userRole === "Student" ? (
            <div className="rounded-xl p-4 space-y-3 bg-white border border-sidebar-border shadow-xs relative overflow-hidden">
              <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
                Natijalar tahlili
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-zinc-500">
                  Daraja:
                </span>
                <Badge
                  variant="outline"
                  className="text-[10px] py-0.5 px-2 bg-zinc-50 text-zinc-700 border-zinc-200 rounded-lg font-semibold shadow-none"
                >
                  {translateLevel(currentLevel)}
                </Badge>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-zinc-500">
                  Tayyorgarlik:
                </span>
                <span className="text-sm font-bold text-primary">
                  {(readinessScore * 100).toFixed(0)}%
                </span>
              </div>

              {/* Mini progress bar */}
              <div
                className="h-2 rounded-full overflow-hidden bg-zinc-100 border border-zinc-200/60 shadow-none"
              >
                <div
                  className="h-full rounded-full transition-all duration-700 bg-primary"
                  style={{
                    width: `${(readinessScore * 100).toFixed(0)}%`,
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="rounded-xl p-2.5 bg-white border border-sidebar-border shadow-xs">
              <div className="text-[10px] font-bold text-zinc-700 text-center tracking-widest uppercase">
                Boshqaruv rejimi
              </div>
            </div>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold text-white bg-red-500 hover:bg-red-600 shadow-sm transition-all duration-150"
          >
            <LogOut className="w-3.5 h-3.5" />
            Tizimdan chiqish
          </button>

          {/* Version tag */}
          <div className="text-center text-[8px] tracking-widest text-zinc-400">
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
