import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] overflow-y-auto flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md transition-all animate-in fade-in duration-200">
      <div className={`relative w-full ${maxWidth} bg-white rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.18)] border border-slate-200/80 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50/80 backdrop-blur">
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Body */}
        <div className="p-6 md:p-7 max-h-[85vh] overflow-y-auto">{children}</div>
      </div>
    </div>,
    document.body
  );
}
