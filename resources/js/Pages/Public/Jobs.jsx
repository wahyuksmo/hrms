import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Briefcase, ChevronRight, Search, Sparkles, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PublicJobs({ vacancies }) {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <>
      <Head title="Career Portal - Rekrutmen HRMS" />
      <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 selection:bg-brand-500 selection:text-white">
        {/* Modern Navbar */}
        <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center space-x-3"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-brand-500/30">
                HR
              </div>
              <div>
                <h1 className="font-extrabold text-xl tracking-tight text-slate-900">CAREERS</h1>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">PT Nusantara Digital</p>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="hidden md:flex space-x-8 text-sm font-semibold text-slate-600"
            >
              <a href="#" className="text-brand-600">Lowongan</a>
              <a href="#" className="hover:text-brand-600 transition-colors">Tentang Kami</a>
              <a href="#" className="hover:text-brand-600 transition-colors">Budaya Kerja</a>
            </motion.div>
          </div>
        </nav>

        {/* Hero Section with Glassmorphism / Gradient */}
        <div className="relative pt-32 pb-20 overflow-hidden">
          {/* Abstract background blobs */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-brand-400/20 rounded-full blur-3xl" />
          <div className="absolute top-40 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl" />
          
          <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-bold text-slate-600 mb-6">
                <Sparkles className="w-4 h-4 text-brand-500" />
                <span>Masa Depan Karir Anda Dimulai di Sini</span>
              </span>
              
              <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-tight mb-6">
                Wujudkan Potensi <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-blue-600">
                  Terbaik Anda
                </span>
              </h2>
              
              <p className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
                Kami mencari individu berbakat, bersemangat, dan inovatif untuk berkembang bersama. 
                Temukan posisi yang tepat dan jadilah bagian dari transformasi digital kami.
              </p>

              {/* Search Bar (Visual Only for now) */}
              <div className="max-w-2xl mx-auto bg-white p-2 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center">
                <div className="pl-4 pr-2 text-slate-400">
                  <Search className="w-5 h-5" />
                </div>
                <input 
                  type="text" 
                  placeholder="Cari lowongan pekerjaan, posisi, atau departemen..." 
                  className="flex-1 bg-transparent border-none focus:ring-0 outline-none text-slate-700 font-medium placeholder-slate-400 w-full"
                />
                <button className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95 shadow-md shadow-brand-500/30">
                  Cari
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Vacancies List Grid */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black text-slate-900">Lowongan Terbuka</h3>
            <span className="text-sm font-bold text-slate-500 bg-slate-200/50 px-3 py-1 rounded-lg">
              {vacancies.length} Posisi
            </span>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {vacancies.map((v) => (
              <motion.div 
                key={v.id} 
                variants={itemVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="group bg-white rounded-3xl p-7 border border-slate-200 hover:border-brand-300 shadow-sm hover:shadow-xl hover:shadow-brand-100/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-brand-50 text-brand-700 border border-brand-100/50">
                      {v.employment_type}
                    </span>
                    <div className="flex space-x-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    </div>
                  </div>
                  
                  <h3 className="font-black text-slate-900 text-xl mb-3 group-hover:text-brand-700 transition-colors">{v.title}</h3>
                  
                  <div className="space-y-2 mb-6">
                    <div className="text-sm text-slate-500 flex items-center space-x-2.5 font-medium">
                      <Briefcase className="w-4 h-4 text-slate-400" />
                      <span>{v.position?.name || 'Posisi HR'}</span>
                    </div>
                    <div className="text-sm text-slate-500 flex items-center space-x-2.5 font-medium">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <span>{v.department?.name || 'Semua Departemen'}</span>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed mb-6">
                    {v.job_description || 'Membangun dan mengembangkan solusi sistem aplikasi enterprise modern dengan standar terbaik di industri.'}
                  </p>
                </div>

                <div className="pt-5 border-t border-slate-100">
                  <Link
                    href={route('careers.apply', v.slug)}
                    className="w-full flex items-center justify-center space-x-2 py-3.5 bg-slate-50 group-hover:bg-brand-600 text-slate-700 group-hover:text-white font-bold text-sm rounded-xl transition-all duration-300"
                  >
                    <span>Lamar Sekarang</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
          
          {vacancies.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Belum Ada Lowongan</h3>
              <p className="text-slate-500 mt-2">Saat ini kami belum membuka lowongan baru. Silakan cek kembali nanti.</p>
            </div>
          )}
        </div>
        
        {/* Simple Footer */}
        <footer className="bg-white border-t border-slate-200 mt-20 py-12">
          <div className="max-w-7xl mx-auto px-6 text-center text-slate-500 text-sm font-medium">
            &copy; {new Date().getFullYear()} PT Nusantara Digital. All rights reserved.
          </div>
        </footer>
      </div>
    </>
  );
}
