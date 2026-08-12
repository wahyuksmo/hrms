import React, { useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Network, ArrowLeft, User, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

// Recursive OrgNode component
const OrgNode = ({ node }) => {
  return (
    <div className="flex flex-col items-center">
      {/* Current Node Card */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm min-w-[200px] flex flex-col items-center gap-2 relative z-10 hover:shadow-md transition-shadow"
      >
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold shadow-inner">
          {node.full_name ? node.full_name.charAt(0) : <User className="w-6 h-6" />}
        </div>
        <div className="text-center">
          <h4 className="font-bold text-slate-800 text-sm">{node.full_name}</h4>
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide block mt-0.5">
            {node.position?.name || 'No Position'}
          </span>
          <span className="text-[9px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full inline-block mt-1">
            {node.department?.name || 'No Dept'}
          </span>
        </div>
      </motion.div>

      {/* Children */ }
      {node.children && node.children.length > 0 && (
        <div className="flex flex-col items-center mt-4">
          {/* Vertical line from parent */}
          <div className="w-px h-6 bg-slate-300"></div>
          
          <div className="flex justify-center relative">
            {/* Horizontal line connecting children */}
            {node.children.length > 1 && (
              <div className="absolute top-0 h-px bg-slate-300" style={{ 
                left: `calc(50% / ${node.children.length})`, 
                right: `calc(50% / ${node.children.length})` 
              }}></div>
            )}
            
            <div className="flex flex-row justify-center space-x-6">
              {node.children.map(child => (
                <div key={child.id} className="flex flex-col items-center pt-6 relative">
                  {/* Vertical line to child */}
                  <div className="absolute top-0 w-px h-6 bg-slate-300"></div>
                  <OrgNode node={child} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function OrgChart({ employees }) {
  // Build tree from flat list
  const tree = useMemo(() => {
    if (!employees || employees.length === 0) return null;

    const map = {};
    const roots = [];

    // Initialize map
    employees.forEach(emp => {
      map[emp.id] = { ...emp, children: [] };
    });

    // Populate children
    employees.forEach(emp => {
      // Find direct manager (level_1)
      const directManager = emp.superiors?.find(s => s.approval_level === 'level_1');
      if (directManager && directManager.superior_employee_id && map[directManager.superior_employee_id]) {
        map[directManager.superior_employee_id].children.push(map[emp.id]);
      } else {
        roots.push(map[emp.id]);
      }
    });

    return roots;
  }, [employees]);

  return (
    <AuthenticatedLayout headerTitle="Struktur Organisasi (Org Chart)">
      <Head title="Struktur Organisasi" />

      {/* Action Bar */}
      <div className="mb-8 bg-white/70 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-700 text-[10px] font-black uppercase tracking-widest mb-3">
              <Network className="w-3 h-3" />
              <span>Visualisasi Hirarki</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Struktur Organisasi</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Bagan hierarki karyawan berdasarkan konfigurasi atasan langsung (Level 1).
            </p>
          </div>
          <Link
            href={route('employees.index')}
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-sm rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Data</span>
          </Link>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="bg-white border border-slate-200 shadow-soft rounded-3xl p-8 overflow-auto min-h-[600px] flex justify-center cursor-grab active:cursor-grabbing">
        {tree && tree.length > 0 ? (
          <div className="flex flex-row space-x-16 items-start py-8">
            {tree.map(root => (
              <OrgNode key={root.id} node={root} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400 mt-20">
            <ShieldCheck className="w-16 h-16 text-slate-200 mb-4" />
            <p className="font-semibold text-sm">Tidak ada data struktur organisasi.</p>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
