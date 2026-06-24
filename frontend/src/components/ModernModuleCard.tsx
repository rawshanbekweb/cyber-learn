import React from 'react';
import { ShieldCheck, BookOpen, ChevronRight } from 'lucide-react';

export const ModernModuleCard = ({ title, description, level, lessonsCount }: any) => {
  return (
    <div className="cyber-card rounded-2xl p-6 hover:shadow-md transition-all group">
      <div className="w-12 h-12 bg-primary/10 text-primary border border-primary/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
        <BookOpen className="w-6 h-6" />
      </div>
      
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[9px] font-bold font-mono uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
          {level}
        </span>
        <span className="text-[10px] text-zinc-500 font-medium font-mono">
          {lessonsCount} ta dars
        </span>
      </div>

      <h3 className="text-lg font-bold text-zinc-100 mb-2 font-mono">{title}</h3>
      <p className="text-zinc-400 text-sm leading-relaxed mb-6">
        {description}
      </p>

      <button className="flex items-center text-primary font-bold text-sm hover:text-primary/80 transition-colors">
        O'rganishni boshlash <ChevronRight className="w-4 h-4 ml-1 animate-pulse" />
      </button>
    </div>
  );
};