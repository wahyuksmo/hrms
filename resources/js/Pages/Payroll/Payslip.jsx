import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { ShieldCheck, Printer, ArrowLeft, Building2 } from 'lucide-react';

export default function Payslip({ payroll, terbilang }) {
  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8 flex justify-center items-start">
      <Head title={`Slip Gaji - ${payroll.employee?.full_name}`} />

      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl border border-slate-200 p-8 space-y-8 print:shadow-none print:border-none print:p-0">
        {/* Navigation / Action bar for web view */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-6 print:hidden">
          <Link
            href={route('payroll.period-detail', payroll.payroll_period_id)}
            className="inline-flex items-center space-x-2 text-xs font-extrabold text-slate-600 hover:text-slate-900 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Detail Periode</span>
          </Link>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-md transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Cetak PDF</span>
          </button>
        </div>

        {/* Company Header */}
        <div className="flex items-start justify-between border-b-2 border-slate-900 pb-6">
          <div>
            <div className="flex items-center space-x-3 text-slate-900">
              <div className="p-3 bg-brand-600 text-white rounded-2xl">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                  {payroll.employee?.company?.name || 'PT NUSANTARA DIGITAL INDONESIA'}
                </h1>
                <p className="text-xs text-slate-500 font-medium">Enterprise HRMS & Payroll System</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-brand-50 text-brand-900 font-black text-xs rounded-full uppercase border border-brand-200">
              SLIP GAJI KARYAWAN
            </span>
            <p className="font-mono text-xs text-slate-500 font-bold mt-1.5">{payroll.slip_number}</p>
          </div>
        </div>

        {/* Employee Info Grid */}
        <div className="grid grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-200/80 text-xs">
          <div className="space-y-2">
            <div className="flex">
              <span className="w-28 text-slate-500 font-semibold">Nama Karyawan</span>
              <span className="font-extrabold text-slate-900">{payroll.employee?.full_name}</span>
            </div>
            <div className="flex">
              <span className="w-28 text-slate-500 font-semibold">No NIK</span>
              <span className="font-mono font-bold text-brand-800">{payroll.employee?.nik}</span>
            </div>
            <div className="flex">
              <span className="w-28 text-slate-500 font-semibold">Departemen</span>
              <span className="font-bold text-slate-800">{payroll.employee?.department?.name || '-'}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex">
              <span className="w-28 text-slate-500 font-semibold">Jabatan</span>
              <span className="font-bold text-slate-800">{payroll.employee?.position?.name || '-'}</span>
            </div>
            <div className="flex">
              <span className="w-28 text-slate-500 font-semibold">Periode</span>
              <span className="font-bold text-slate-900">{payroll.period?.name}</span>
            </div>
            <div className="flex">
              <span className="w-28 text-slate-500 font-semibold">Status Bayar</span>
              <span className="font-bold uppercase text-emerald-700">{payroll.payment_status}</span>
            </div>
          </div>
        </div>

        {/* Components Table */}
        <div className="space-y-4">
          <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-2">
            RINCIAN PENERIMAAN & POTONGAN
          </h2>

          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-extrabold text-left uppercase">
                <th className="py-2.5">Komponen</th>
                <th className="py-2.5">Tipe</th>
                <th className="py-2.5 text-right">Nominal (IDR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {payroll.details && payroll.details.length > 0 ? payroll.details.map((d) => (
                <tr key={d.id}>
                  <td className="py-2.5 font-bold">{d.component_name}</td>
                  <td className="py-2.5 uppercase text-[10px] font-extrabold text-slate-400">
                    {d.component_type}
                  </td>
                  <td className={`py-2.5 text-right font-mono font-bold ${d.component_type === 'earning' ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {d.component_type === 'earning' ? '+' : '-'} Rp {Number(d.amount).toLocaleString('id-ID')}
                  </td>
                </tr>
              )) : (
                <>
                  <tr>
                    <td className="py-2.5 font-bold">Gaji Pokok (Base Salary)</td>
                    <td className="py-2.5 uppercase text-[10px] font-extrabold text-slate-400">EARNING</td>
                    <td className="py-2.5 text-right font-mono font-bold text-emerald-700">+ Rp {Number(payroll.base_salary).toLocaleString('id-ID')}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold">Total Tunjangan (Earnings)</td>
                    <td className="py-2.5 uppercase text-[10px] font-extrabold text-slate-400">EARNING</td>
                    <td className="py-2.5 text-right font-mono font-bold text-emerald-700">+ Rp {Number(payroll.total_earnings).toLocaleString('id-ID')}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold">Total Potongan (Deductions)</td>
                    <td className="py-2.5 uppercase text-[10px] font-extrabold text-slate-400">DEDUCTION</td>
                    <td className="py-2.5 text-right font-mono font-bold text-rose-600">- Rp {Number(payroll.total_deductions).toLocaleString('id-ID')}</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Box */}
        <div className="bg-brand-50 border-2 border-brand-200 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-xs font-black text-brand-900 uppercase">TAKE HOME PAY (GAJI BERSIH)</div>
            <div className="text-xs text-brand-700 font-medium italic mt-1">
              Terbilang: <span className="font-bold">{terbilang}</span>
            </div>
          </div>
          <div className="text-2xl font-black text-brand-900 font-mono tracking-tight">
            Rp {Number(payroll.net_salary).toLocaleString('id-ID')}
          </div>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200 text-center text-xs font-semibold text-slate-700">
          <div>
            <p>Penerima Gaji,</p>
            <div className="h-16"></div>
            <p className="font-bold underline text-slate-900">{payroll.employee?.full_name}</p>
          </div>
          <div>
            <p>Finance / HRD Manager,</p>
            <div className="h-16"></div>
            <p className="font-bold underline text-slate-900">Manager HRMS</p>
          </div>
        </div>
      </div>
    </div>
  );
}
