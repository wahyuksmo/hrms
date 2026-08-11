import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import StatusBadge from '@/Components/StatusBadge';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Printer, FileText, Banknote, ShieldCheck, Lock, CheckCircle2, Download, RefreshCw, Edit3, Plus, Trash2, CalendarDays } from 'lucide-react';
import { showConfirm, showSuccess } from '@/Utils/swal';
import DateDisplay from '@/Components/DateDisplay';

export default function PeriodDetail({ period, payrolls }) {
  const [activeSlip, setActiveSlip] = useState(null);
  const [overrideTarget, setOverrideTarget] = useState(null);

  const { data: overrideData, setData: setOverrideData, post: postOverride, processing: overrideProcessing, reset: resetOverride } = useForm({
    employee_id: '',
    notes: '',
    adjustments: [],
  });

  const handleApprovePeriod = () => {
    showConfirm({
      title: 'Kunci & Setujui Periode Payroll?',
      text: 'Setelah disetujui, periode ini akan DIKUNCI PERMANEN dan tidak dapat dihitung ulang atau diubah lagi.',
      icon: 'warning',
      confirmText: 'Ya, Setujui & Kunci',
      confirmButtonColor: 'emerald',
      onConfirm: () => {
        router.post(route('payroll.approve', period.id), {}, {
          onSuccess: () => {
            showSuccess('Berhasil!', 'Periode penggajian telah disetujui & dikunci secara permanen.');
          }
        });
      }
    });
  };

  const handleMarkAsPaid = () => {
    showConfirm({
      title: 'Tandai Semua Pembayaran Lunas?',
      text: 'Seluruh slip gaji pada periode ini akan diubah statusnya menjadi PAID dan klaim reimbursement terkait akan ditandai Lunas.',
      icon: 'question',
      confirmText: 'Ya, Tandai Lunas',
      onConfirm: () => {
        router.post(route('payroll.mark-paid', period.id), {}, {
          onSuccess: () => {
            showSuccess('Berhasil!', 'Status pembayaran gaji telah berhasil diperbarui menjadi Paid.');
          }
        });
      }
    });
  };

  const openOverrideModal = (p) => {
    setOverrideTarget(p);
    setOverrideData({
      employee_id: p.employee_id,
      notes: p.override_notes || '',
      adjustments: [],
    });
  };

  const addAdjustment = () => {
    setOverrideData('adjustments', [
      ...overrideData.adjustments,
      { name: 'Bonus Kinerja', type: 'earning', amount: 500000 }
    ]);
  };

  const removeAdjustment = (index) => {
    const updated = [...overrideData.adjustments];
    updated.splice(index, 1);
    setOverrideData('adjustments', updated);
  };

  const handleOverrideSubmit = (e) => {
    e.preventDefault();
    postOverride(route('payroll.recalculate-employee', period.id), {
      onSuccess: () => {
        setOverrideTarget(null);
        resetOverride();
        showSuccess('Berhasil!', 'Payroll karyawan berhasil diperbarui.');
      }
    });
  };

  return (
    <AuthenticatedLayout headerTitle={`Rincian Slip Gaji: ${period.name}`}>
      <Head title={`Slip Gaji ${period.name}`} />

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center space-x-4">
          <Link
            href={route('payroll.index')}
            className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-extrabold text-slate-900">{period.name}</h1>
              {period.is_locked ? (
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[11px] font-extrabold">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  <span>LOCKED</span>
                </span>
              ) : (
                <StatusBadge status={period.status} />
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
            <div className="flex flex-wrap items-center gap-3 text-xs mt-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-bold">Cut-off:</span>
                <div className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-50 border border-slate-200/80 rounded-md text-[10px] font-bold text-slate-700 shadow-xs">
                  <CalendarDays className="w-3 h-3 text-slate-400" />
                  <DateDisplay date={period.start_date} format="short" />
                </div>
                <span className="text-slate-300 font-black">-</span>
                <div className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-50 border border-slate-200/80 rounded-md text-[10px] font-bold text-slate-700 shadow-xs">
                  <CalendarDays className="w-3 h-3 text-slate-400" />
                  <DateDisplay date={period.end_date} format="short" />
                </div>
              </div>
              <div className="w-px h-3.5 bg-slate-200/80"></div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-bold">Pay Date:</span>
                <div className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-brand-50 border border-brand-200/60 rounded-md text-[10px] font-bold text-brand-700 shadow-xs">
                  <CalendarDays className="w-3 h-3 text-brand-500" />
                  <DateDisplay date={period.pay_date} format="short" />
                </div>
              </div>
            </div>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Export Bank Transfer CSV */}
          <a
            href={route('payroll.export-bank', period.id)}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold rounded-xl transition-all flex items-center space-x-1.5 active:scale-95 border border-slate-200/60"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Export CSV Bank Transfer</span>
          </a>

          {!period.is_locked && (
            <button
              onClick={handleApprovePeriod}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl transition-all flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Setujui & Kunci Periode</span>
            </button>
          )}

          {period.is_locked && period.status !== 'paid' && (
            <button
              onClick={handleMarkAsPaid}
              className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-extrabold rounded-xl transition-all flex items-center space-x-1.5 shadow-md shadow-brand-600/30 active:scale-95"
            >
              <Banknote className="w-4 h-4" />
              <span>Tandai Lunas (PAID)</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid Payroll Slips */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {payrolls.map((p) => (
          <div key={p.id} className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
            {p.is_manual_override && (
              <div className="absolute top-0 right-0 bg-amber-500 text-white text-[9px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                Manual Override
              </div>
            )}
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <span className="font-mono text-xs font-bold text-brand-800">{p.slip_number}</span>
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${p.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
                  {p.payment_status}
                </span>
              </div>
              <div className="font-bold text-slate-900 text-base">{p.employee?.full_name}</div>
              <div className="text-xs text-slate-500 font-medium">NIK: {p.employee?.nik} • {p.employee?.position?.name || 'Karyawan'}</div>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Gaji Pokok:</span>
                  <span className="font-mono font-semibold">Rp {Number(p.base_salary).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Total Penerimaan (+):</span>
                  <span className="font-mono">Rp {Number(p.total_earnings).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-rose-600 font-semibold">
                  <span>Total Potongan (-):</span>
                  <span className="font-mono">Rp {Number(p.total_deductions).toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Gaji Bersih (THP)</div>
                <div className="text-base font-extrabold text-brand-900 font-mono">
                  Rp {Number(p.net_salary).toLocaleString('id-ID')}
                </div>
              </div>
              <div className="flex items-center space-x-1.5">
                {!period.is_locked && (
                  <button
                    onClick={() => openOverrideModal(p)}
                    title="Kalkulasi Ulang / Penyesuaian Manual"
                    className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setActiveSlip(p)}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-colors flex items-center space-x-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Slip Gaji</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Slip Gaji Printable Modal */}
      {activeSlip && (
        <Modal isOpen={true} onClose={() => setActiveSlip(null)} title="Cetak Slip Gaji Karyawan" maxWidth="max-w-xl">
          <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-6">
            {/* Header Slip */}
            <div className="text-center pb-4 border-b border-slate-200">
              <div className="inline-flex items-center space-x-2 text-brand-900 font-extrabold text-lg">
                <ShieldCheck className="w-5 h-5 text-brand-800" />
                <span>PT NUSANTARA DIGITAL INDONESIA</span>
              </div>
              <div className="text-xs font-bold text-slate-600 uppercase tracking-widest mt-1">SLIP GAJI KARYAWAN</div>
              <div className="text-xs font-mono text-slate-400">{activeSlip.slip_number}</div>
            </div>

            {/* Info Karyawan */}
            <div className="grid grid-cols-2 gap-4 text-xs font-medium text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                <div>Nama: <span className="font-bold text-slate-900">{activeSlip.employee?.full_name}</span></div>
                <div>NIK: <span className="font-mono font-bold text-brand-800">{activeSlip.employee?.nik}</span></div>
              </div>
              <div>
                <div>Jabatan: <span className="font-bold text-slate-900">{activeSlip.employee?.position?.name}</span></div>
                <div>Periode: <span className="font-bold text-slate-900">{period.name}</span></div>
              </div>
            </div>

            {/* Break Down Components */}
            <div className="space-y-3">
              <div className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Rincian Komponen Penggajian:</div>
              <div className="divide-y divide-slate-100 text-xs">
                {activeSlip.details && activeSlip.details.map((d) => (
                  <div key={d.id} className="py-2 flex justify-between">
                    <span className="text-slate-700 font-medium">{d.component_name}</span>
                    <span className={`font-mono font-bold ${d.component_type === 'earning' ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {d.component_type === 'earning' ? '+' : '-'} Rp {Number(d.amount).toLocaleString('id-ID')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Net Salary */}
            <div className="p-4 bg-brand-50 border border-brand-200 rounded-2xl flex justify-between items-center">
              <div>
                <div className="text-xs font-extrabold text-brand-900 uppercase">TAKE HOME PAY (THP)</div>
                <div className="text-xs text-brand-700 font-medium">Gaji Bersih Ditransfer</div>
              </div>
              <div className="text-xl font-extrabold text-brand-900 font-mono">
                Rp {Number(activeSlip.net_salary).toLocaleString('id-ID')}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
              <button onClick={() => window.print()} className="px-5 py-2.5 bg-slate-900 text-white font-extrabold text-xs rounded-xl flex items-center space-x-2 shadow-md">
                <Printer className="w-4 h-4" />
                <span>Print Document</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Single Employee Recalculate / Manual Override Modal */}
      {overrideTarget && (
        <Modal isOpen={true} onClose={() => setOverrideTarget(null)} title={`Penyesuaian Manual: ${overrideTarget.employee?.full_name}`}>
          <form onSubmit={handleOverrideSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Catatan Audit Penyesuaian</label>
              <input
                type="text"
                placeholder="misal: Bonus khusus proyek / Penyesuaian absensi manual"
                value={overrideData.notes}
                onChange={(e) => setOverrideData('notes', e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-extrabold text-slate-700 uppercase">Penyesuaian Komponen Tambahan</label>
                <button
                  type="button"
                  onClick={addAdjustment}
                  className="px-2.5 py-1 bg-brand-50 text-brand-700 font-bold text-xs rounded-lg flex items-center space-x-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Tambah Baris</span>
                </button>
              </div>

              <div className="space-y-2">
                {overrideData.adjustments.map((adj, index) => (
                  <div key={index} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <input
                      type="text"
                      placeholder="Nama Komponen"
                      value={adj.name}
                      onChange={(e) => {
                        const updated = [...overrideData.adjustments];
                        updated[index].name = e.target.value;
                        setOverrideData('adjustments', updated);
                      }}
                      className="w-1/2 px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                    />
                    <select
                      value={adj.type}
                      onChange={(e) => {
                        const updated = [...overrideData.adjustments];
                        updated[index].type = e.target.value;
                        setOverrideData('adjustments', updated);
                      }}
                      className="w-1/4 px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                    >
                      <option value="earning">Penerimaan (+)</option>
                      <option value="deduction">Potongan (-)</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Nominal"
                      value={adj.amount}
                      onChange={(e) => {
                        const updated = [...overrideData.adjustments];
                        updated[index].amount = e.target.value;
                        setOverrideData('adjustments', updated);
                      }}
                      className="w-1/4 px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => removeAdjustment(index)}
                      className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
              <button type="button" onClick={() => setOverrideTarget(null)} className="px-4 py-2 bg-slate-100 text-slate-700 font-extrabold text-xs rounded-xl">Batal</button>
              <button type="submit" disabled={overrideProcessing} className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-brand-600/30 flex items-center space-x-1.5">
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Simpan & Hitung Ulang</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </AuthenticatedLayout>
  );
}
