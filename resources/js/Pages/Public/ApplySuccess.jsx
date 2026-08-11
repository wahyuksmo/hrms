import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function ApplySuccess({ candidate }) {
  // Trigger confetti on load
  React.useEffect(() => {
    const end = Date.now() + 3 * 1000;
    const colors = ['#10b981', '#059669', '#3b82f6'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  }, []);

  return (
    <>
      <Head title="Lamaran Berhasil Dikirim" />
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 font-sans relative overflow-hidden">
        
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-400/10 rounded-full blur-3xl" />

        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
          className="max-w-xl w-full bg-white/90 backdrop-blur-xl rounded-[32px] p-10 border border-white/50 shadow-2xl shadow-emerald-500/10 text-center relative z-10"
        >
          
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-400 to-emerald-600 text-white flex items-center justify-center mx-auto mb-8 shadow-lg shadow-emerald-500/40"
          >
            <CheckCircle2 className="w-12 h-12" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <span className="inline-block text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700 bg-emerald-50 px-4 py-2 rounded-full mb-4 border border-emerald-100">
              Lamaran Berhasil Diterima
            </span>

            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">Terima Kasih, {candidate.full_name}!</h1>
            <p className="text-slate-500 font-medium text-sm sm:text-base leading-relaxed mb-8">
              Berkas lamaran Anda untuk posisi <span className="font-bold text-slate-800 border-b-2 border-brand-200 pb-0.5">{candidate.job_vacancy?.title}</span> telah tersimpan di sistem kami.
            </p>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200 text-left space-y-3 mb-8 shadow-inner">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px]">Kode Kandidat</span>
                <span className="font-mono font-black text-brand-700 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm">{candidate.candidate_code}</span>
              </div>
              <div className="h-px w-full bg-slate-200/60" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px]">Email Terdaftar</span>
                <span className="font-bold text-slate-700">{candidate.email}</span>
              </div>
            </div>

            <Link
              href="/careers"
              className="w-full inline-flex items-center justify-center space-x-2 px-8 py-4 bg-slate-900 hover:bg-brand-600 text-white font-bold text-sm rounded-2xl shadow-xl shadow-slate-900/20 hover:shadow-brand-600/30 transition-all transform hover:-translate-y-1"
            >
              <Home className="w-4 h-4" />
              <span>Kembali ke Halaman Karir</span>
            </Link>
          </motion.div>

        </motion.div>
      </div>
    </>
  );
}
