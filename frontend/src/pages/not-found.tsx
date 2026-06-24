import { useLocation } from "wouter";
import { AlertCircle, Home } from "lucide-react";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center"
      style={{ background: 'hsl(220 13% 4%)' }}
    >
      <div
        className="w-full max-w-md mx-4 rounded-2xl p-8 relative overflow-hidden text-center"
        style={{
          background: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          boxShadow: '0 0 60px hsl(var(--primary) / 0.08)',
        }}
      >
        {/* Top glow line */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(to right, transparent, hsl(var(--primary) / 0.7), transparent)' }}
        />

        <div className="flex items-center justify-center mb-6">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{
              background: 'hsl(var(--secondary) / 0.1)',
              border: '2px solid hsl(var(--secondary) / 0.4)',
              boxShadow: '0 0 20px hsl(var(--secondary) / 0.2)',
            }}
          >
            <AlertCircle
              className="w-8 h-8"
              style={{
                color: 'hsl(var(--primary))',
                filter: 'drop-shadow(0 0 6px hsl(var(--primary) / 0.6))',
              }}
            />
          </div>
        </div>

        <div
          className="text-[10px] tracking-widest uppercase mb-2"
          style={{ color: 'hsl(var(--muted-foreground))', fontFamily: 'var(--app-font-mono)' }}
        >
          &gt; XATO 404
        </div>

        <h1
          className="text-3xl font-bold tracking-widest uppercase mb-3"
          style={{
            fontFamily: 'var(--app-font-mono)',
            color: 'hsl(var(--primary))',
            textShadow: '0 0 20px hsl(var(--primary) / 0.4)',
          }}
        >
          404
        </h1>

        <p
          className="text-sm mb-2 font-bold"
          style={{ color: 'hsl(var(--muted-foreground))', fontFamily: 'var(--app-font-mono)' }}
        >
          Sahifa topilmadi
        </p>

        <p
          className="text-xs mb-8"
          style={{ color: 'hsl(var(--muted-foreground))' }}
        >
          Sahifa marshrutga qo'shilmagan bo'lishi mumkin.
        </p>

        <button
          onClick={() => setLocation("/")}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold tracking-widest uppercase transition-all duration-200"
          style={{
            background: 'hsl(var(--primary) / 0.12)',
            border: '1px solid hsl(var(--primary) / 0.4)',
            color: 'hsl(var(--primary-foreground))',
            fontFamily: 'var(--app-font-mono)',
            boxShadow: '0 0 15px hsl(var(--primary) / 0.1)',
          }}
            onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = 'hsl(var(--primary) / 0.22)';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 0 25px hsl(var(--primary) / 0.25)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'hsl(var(--primary) / 0.12)';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 0 15px hsl(var(--primary) / 0.1)';
          }}
        >
          <Home className="w-3.5 h-3.5" />
          Bosh sahifaga qaytish
        </button>
      </div>
    </div>
  );
}
