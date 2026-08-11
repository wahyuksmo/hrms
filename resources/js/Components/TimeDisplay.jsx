import React from 'react';
import { Clock } from 'lucide-react';

export default function TimeDisplay({ time, label, theme = 'emerald', className = '' }) {
  if (!time) return (
    <div className={`inline-flex items-center justify-center px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 border-dashed text-slate-400 font-bold text-xs ${className}`}>
      -
    </div>
  );

  let dateObj;
  let timeString = '';
  let period = '';
  
  if (typeof time === 'string' && time.includes(':') && !time.includes('T') && time.length <= 8) {
    // Handling time-only string e.g. "08:00:00" or "08:00"
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours, 10);
    const m = parseInt(minutes, 10);
    dateObj = new Date();
    dateObj.setHours(h, m, 0);
    
    timeString = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    period = h >= 12 ? 'PM' : 'AM';
  } else {
    dateObj = new Date(time);
    timeString = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
    period = dateObj.getHours() >= 12 ? 'PM' : 'AM';
  }

  // Theme variants
  const themes = {
    emerald: {
      wrapper: 'bg-emerald-50/80 border-emerald-200/60 shadow-[0_2px_10px_rgba(16,185,129,0.08)]',
      icon: 'text-emerald-500 bg-emerald-100',
      text: 'text-emerald-700',
      period: 'text-emerald-600 bg-emerald-100/50 border-emerald-200/50',
    },
    rose: {
      wrapper: 'bg-rose-50/80 border-rose-200/60 shadow-[0_2px_10px_rgba(244,63,94,0.08)]',
      icon: 'text-rose-500 bg-rose-100',
      text: 'text-rose-700',
      period: 'text-rose-600 bg-rose-100/50 border-rose-200/50',
    },
    brand: {
      wrapper: 'bg-brand-50/80 border-brand-200/60 shadow-[0_2px_10px_rgba(37,99,235,0.08)]',
      icon: 'text-brand-500 bg-brand-100',
      text: 'text-brand-700',
      period: 'text-brand-600 bg-brand-100/50 border-brand-200/50',
    },
    slate: {
      wrapper: 'bg-slate-50/80 border-slate-200/60 shadow-[0_2px_10px_rgba(148,163,184,0.08)]',
      icon: 'text-slate-500 bg-slate-100',
      text: 'text-slate-700',
      period: 'text-slate-600 bg-slate-100/50 border-slate-200/50',
    },
  };

  const currentTheme = themes[theme] || themes.slate;

  return (
    <div className={`group inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl border backdrop-blur-sm transition-all hover:scale-105 hover:-translate-y-0.5 ${currentTheme.wrapper} ${className}`}>
      {/* Icon Area */}
      <div className={`p-1 rounded-lg transition-colors ${currentTheme.icon}`}>
        <Clock className="w-3.5 h-3.5" />
      </div>

      {/* Time Text */}
      <div className="flex items-baseline gap-1">
        <span className={`font-mono font-black text-sm tracking-tight ${currentTheme.text}`}>
          {timeString}
        </span>
        
        {/* AM/PM Indicator */}
        <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${currentTheme.period}`}>
          {period}
        </span>
      </div>

      {/* Optional Label (e.g. "Masuk", "Pulang") */}
      {label && (
        <>
          <div className="w-px h-3.5 bg-slate-200/80 ml-0.5"></div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pr-1">
            {label}
          </span>
        </>
      )}
    </div>
  );
}
