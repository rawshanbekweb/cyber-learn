import type { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { BookOpen, Shield, Cpu, BarChart3, GraduationCap, UserCheck, ShieldCheck, LogOut, User, ClipboardList } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { Badge } from "@/components/ui/badge";

export function Layout({ children }: { children: ReactNode }) {
  const { currentLevel, readinessScore, currentUser, logoutUser, userRole } = useAppStore();
  const [location] = useLocation();

  const handleLogout = () => {
    logoutUser();
  };

  return (
    <div className="min-h-[100dvh] flex bg-[#f9fafb] text-foreground font-sans">
      {/* Left Sidebar */}
      <aside className="w-64 border-r border-border/80 bg-white flex flex-col sticky top-0 h-[100vh] z-30 shrink-0">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-border/60">
          <Link href="/" className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-foreground shrink-0" />
            <span className="font-bold text-lg tracking-tight text-foreground font-mono">CyberAl Platform</span>
          </Link>
        </div>

        {/* User Info Container */}
        <div className="px-6 py-4 border-b border-border/40 bg-[#f8f9fa] flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white shrink-0">
            {currentUser?.role === "Teacher" ? <UserCheck className="w-4 h-4" /> : <User className="w-4 h-4" />}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-black truncate leading-tight">
              {currentUser?.name || "Mehmon"}
            </div>
            <div className="text-[10px] font-mono text-muted-foreground mt-0.5 uppercase tracking-wider">
              {currentUser?.role === "Teacher" ? "O'qituvchi" : "O'quvchi"}
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {/* Learning */}
          <Link
            href="/"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              location === "/"
                ? "bg-[#f1f3f5] text-black font-semibold"
                : "text-muted-foreground hover:bg-[#f8f9fa] hover:text-black"
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            Learning
          </Link>

          {/* Cybersecurity (Student only) */}
          {userRole === "Student" && (
            <Link
              href="/assessment"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                location === "/assessment"
                  ? "bg-[#f1f3f5] text-black font-semibold"
                  : "text-muted-foreground hover:bg-[#f8f9fa] hover:text-black"
              }`}
            >
              <Shield className="w-4 h-4 shrink-0" />
              Cybersecurity
            </Link>
          )}

          {/* AI Engine (Fuzzy/ANFIS) */}
          <Link
            href="/ai-engine"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              location === "/ai-engine"
                ? "bg-[#f1f3f5] text-black font-semibold"
                : "text-muted-foreground hover:bg-[#f8f9fa] hover:text-black"
            }`}
          >
            <Cpu className="w-4 h-4 shrink-0" />
            AI Engine (Fuzzy/ANFIS)
          </Link>

          {/* Analytics */}
          <Link
            href="/analytics"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              location === "/analytics"
                ? "bg-[#f1f3f5] text-black font-semibold"
                : "text-muted-foreground hover:bg-[#f8f9fa] hover:text-black"
            }`}
          >
            <BarChart3 className="w-4 h-4 shrink-0" />
            Analytics
          </Link>

          {/* Topshiriqlar (Teacher only) */}
          {userRole === "Teacher" && (
            <Link
              href="/assignments"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                location === "/assignments"
                  ? "bg-[#f1f3f5] text-black font-semibold"
                  : "text-muted-foreground hover:bg-[#f8f9fa] hover:text-black"
              }`}
            >
              <ClipboardList className="w-4 h-4 shrink-0" />
              Topshiriqlar
            </Link>
          )}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border/60 bg-white space-y-3">
          {userRole === "Student" ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-muted-foreground">Level</span>
                <Badge variant="outline" className="font-mono text-[10px] py-0 px-1.5 border-black/40 bg-black text-white">
                  {currentLevel}
                </Badge>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-muted-foreground">Readiness</span>
                <span className="text-xs font-mono font-bold">{(readinessScore * 100).toFixed(0)}%</span>
              </div>
            </div>
          ) : (
            <div className="text-[10px] font-mono text-muted-foreground text-center py-1">
              Fuzzy AI Management Mode
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold font-mono border border-border/60 hover:bg-[#f8f9fa] hover:text-red-600 transition-all text-muted-foreground"
          >
            <LogOut className="w-3.5 h-3.5" />
            Tizimdan chiqish
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-8 md:p-10 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
