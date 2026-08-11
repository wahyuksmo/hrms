import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import StatusBadge from '@/Components/StatusBadge';
import { Users, Clock, CalendarDays, Receipt, ChevronRight, Sparkles, Activity, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { Head, Link } from '@inertiajs/react';
import TimeDisplay from '@/Components/TimeDisplay';

export default function Dashboard({ metrics, recent_attendances, recent_claims }) {
  return (
    <AuthenticatedLayout headerTitle="Beranda Utama">
      <Head title="Beranda Utama" />

      {/* Top Metrics Cards - Premium SaaS Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Metric 1 */}
        <div className="bg-white p-6 rounded-3xl shadow-soft relative overflow-hidden group hover:shadow-soft-hover hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 text-brand-700 flex items-center justify-center border border-brand-200/60 shadow-xs">
              <Users className="w-6 h-6" />
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Total Karyawan</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-slate-900 tracking-tight">{metrics.total_employees}</div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-6 rounded-3xl shadow-soft relative overflow-hidden group hover:shadow-soft-hover hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200/60 shadow-xs">
              <Clock className="w-6 h-6" />
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Hadir Hari Ini</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-slate-900 tracking-tight">{metrics.today_attendances}</div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-6 rounded-3xl shadow-soft relative overflow-hidden group hover:shadow-soft-hover hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 text-amber-700 flex items-center justify-center border border-amber-200/60 shadow-xs">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Cuti Pending</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-slate-900 tracking-tight">{metrics.pending_leaves}</div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-6 rounded-3xl shadow-soft relative overflow-hidden group hover:shadow-soft-hover hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 text-purple-700 flex items-center justify-center border border-purple-200/60 shadow-xs">
              <Receipt className="w-6 h-6" />
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Reimburse Pending</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-slate-900 tracking-tight">{metrics.pending_reimbursements}</div>
          </div>
        </div>
      </div>

      {/* Feature Banner - Clean Light Mode SaaS Banner */}
      <div className="mb-8 p-8 rounded-3xl bg-white shadow-soft relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[50%] h-[150%] bg-gradient-to-l from-brand-50 to-transparent opacity-70"></div>
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-2 bg-brand-50 px-4 py-1.5 rounded-full text-xs font-bold text-brand-700 mb-4 border border-brand-100">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span className="tracking-widest uppercase">Bebas Ubah Architecture</span>
            </div>
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Sistem Multi-Tenant Dinamis HRMS PRO</h3>
            <p className="text-slate-600 text-sm font-medium leading-relaxed">
              Seluruh struktur organisasi, format NIK, hierarki persetujuan, limit klaim, hingga rumus payroll dikendalikan secara dinamis melalui Data Induk tanpa merubah kode program.
            </p>
          </div>
          <Link href="/master-data/organization" className="shrink-0 inline-flex items-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-3.5 rounded-2xl font-semibold text-xs shadow-lg shadow-brand-600/30 transition-all active:scale-95">
            <span>Kelola Data Induk</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Main Grid Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Presensi Log */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-50 flex items-center justify-center border border-brand-100 text-brand-600 shadow-xs">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Aktivitas Presensi</h3>
            </div>
            <Link href="/attendance" className="text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3.5 py-1.5 rounded-xl transition-all">
              View All
            </Link>
          </div>
          
          <div className="space-y-3">
            {recent_attendances && recent_attendances.length > 0 ? (
              recent_attendances.map((att) => (
                <div key={att.id} className="group p-4 rounded-2xl bg-slate-50/50 hover:bg-white hover:shadow-soft hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-600 to-brand-800 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      {att.employee?.full_name ? att.employee.full_name.charAt(0) : 'E'}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors tracking-tight">{att.employee?.full_name || 'Karyawan'}</div>
                      <div className="text-xs font-medium text-slate-500 mt-0.5">{att.date} • {att.work_mode}</div>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <StatusBadge status={att.status} />
                    <div className="mt-2">
                      <TimeDisplay time={att.clock_in_at} theme="slate" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                <Clock className="w-10 h-10 mb-3 opacity-20" />
                <span className="text-xs font-bold">Belum ada aktivitas presensi hari ini.</span>
              </div>
            )}
          </div>
        </div>

        {/* Reimbursement Log */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center border border-purple-100 text-purple-600 shadow-xs">
                <Receipt className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Klaim Reimbursement</h3>
            </div>
            <Link href="/reimbursements" className="text-xs font-bold text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-3.5 py-1.5 rounded-xl transition-all">
              View All
            </Link>
          </div>
          
          <div className="space-y-3">
            {recent_claims && recent_claims.length > 0 ? (
              recent_claims.map((claim) => (
                <div key={claim.id} className="group p-4 rounded-2xl bg-slate-50/50 hover:bg-white hover:shadow-soft hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs shadow-xs">
                      {claim.employee?.full_name ? claim.employee.full_name.charAt(0) : 'E'}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 group-hover:text-purple-600 transition-colors tracking-tight">{claim.employee?.full_name || 'Karyawan'}</div>
                      <div className="text-xs font-medium text-slate-500 mt-0.5">{claim.reimbursement_type?.name} • <span className="font-mono font-semibold text-slate-600">{claim.claim_number}</span></div>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <div className="text-xs font-mono font-bold text-emerald-700 mb-1">
                      Rp {Number(claim.amount).toLocaleString('id-ID')}
                    </div>
                    <StatusBadge status={claim.status} />
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                <Receipt className="w-10 h-10 mb-3 opacity-20" />
                <span className="text-xs font-bold">Belum ada pengajuan reimbursement.</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </AuthenticatedLayout>
  );
}
