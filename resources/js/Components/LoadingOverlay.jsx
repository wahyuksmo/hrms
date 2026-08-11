import React, { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { ShieldCheck, Loader2 } from 'lucide-react';

export default function LoadingOverlay() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Memuat Data...');

  useEffect(() => {
    let timer;
    const handleStart = (event) => {
      setIsLoading(true);
      const url = event?.detail?.visit?.url?.pathname || '';
      if (url.includes('employees')) setLoadingText('Memuat Data Karyawan...');
      else if (url.includes('recruitment')) setLoadingText('Memuat Modul Rekrutmen...');
      else if (url.includes('payroll')) setLoadingText('Memuat Data Payroll...');
      else if (url.includes('attendance')) setLoadingText('Memuat Data Presensi...');
      else if (url.includes('leaves')) setLoadingText('Memuat Data Cuti...');
      else if (url.includes('kpi')) setLoadingText('Memuat Key Performance Indicator...');
      else if (url.includes('master')) setLoadingText('Memuat Data Induk Perusahaan...');
      else setLoadingText('Memuat Modul HRMS PRO...');
    };

    const handleFinish = () => {
      // Gentle fade out
      timer = setTimeout(() => setIsLoading(false), 200);
    };

    const unbindStart = router.on('start', handleStart);
    const unbindFinish = router.on('finish', handleFinish);
    const unbindError = router.on('error', handleFinish);
    const unbindCancel = router.on('cancel', handleFinish);

    return () => {
      unbindStart();
      unbindFinish();
      unbindError();
      unbindCancel();
      if (timer) clearTimeout(timer);
    };
  }, []);

  if (!isLoading) return null;

  return (
    <>
      {/* Top Animated Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 z-[99999] overflow-hidden bg-slate-100">
        <div className="h-full bg-gradient-to-r from-brand-600 via-rose-500 to-amber-500 animate-[shimmer_1.5s_infinite] w-full origin-left"></div>
      </div>

      {/* Glassmorphic Project Loading Overlay */}
      <div className="fixed inset-0 z-[99998] flex items-center justify-center bg-slate-900/30 backdrop-blur-md transition-all duration-300 animate-in fade-in">
        <div className="relative bg-white/90 backdrop-blur-xl border border-white/80 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col items-center justify-center max-w-xs w-full text-center space-y-4 transform hover:scale-105 transition-transform">
          
          {/* Logo with Spin Effect */}
          <div className="relative flex items-center justify-center w-16 h-16">
            <div className="absolute inset-0 rounded-2xl bg-brand-500/20 blur-xl animate-pulse"></div>
            <div className="absolute inset-0 rounded-2xl border-2 border-brand-600 border-t-transparent animate-spin"></div>
            <div className="relative w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-600/30">
              <ShieldCheck className="w-7 h-7 text-white animate-bounce" />
            </div>
          </div>

          <div>
            <h4 className="text-base font-black text-slate-900 tracking-tight">HRMS <span className="text-brand-600">PRO</span></h4>
            <p className="text-xs font-bold text-slate-500 mt-1 flex items-center justify-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-600" />
              <span>{loadingText}</span>
            </p>
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center space-x-1.5 pt-1">
            <div className="w-2 h-2 rounded-full bg-brand-600 animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 rounded-full bg-brand-500 animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 rounded-full bg-brand-400 animate-bounce"></div>
          </div>
        </div>
      </div>
    </>
  );
}
