import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DataTable from '@/Components/DataTable';
import StatusBadge from '@/Components/StatusBadge';
import Modal from '@/Components/Modal';
import { useForm, Head } from '@inertiajs/react';
import { Plus, Banknote, Calendar, Clock } from 'lucide-react';
import { showConfirm, showSuccess } from '@/Utils/swal';

export default function LoansIndex({ loans }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, setData, post, processing, reset, errors } = useForm({
    amount: '',
    total_months: 1,
    reason: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    showConfirm({
      title: 'Ajukan Kasbon?',
      text: `Anda akan mengajukan kasbon sebesar Rp ${Number(data.amount).toLocaleString('id-ID')} dicicil selama ${data.total_months} bulan.`,
      icon: 'question',
      confirmText: 'Ya, Ajukan',
      onConfirm: () => {
        post(route('loans.store'), {
          onSuccess: () => {
            setIsModalOpen(false);
            reset();
            showSuccess('Berhasil!', 'Pengajuan kasbon berhasil dikirim.');
          },
        });
      }
    });
  };

  const columns = [
    {
      header: 'Jumlah Pinjaman (IDR)',
      render: (row) => (
        <div className="font-mono font-black text-emerald-700 text-sm">
          Rp {Number(row.amount).toLocaleString('id-ID')}
        </div>
      ),
    },
    {
      header: 'Cicilan / Tenor',
      render: (row) => (
        <div className="text-slate-700 text-xs font-semibold">
          {row.total_months} Bulan
        </div>
      ),
    },
    {
      header: 'Tujuan Pinjaman',
      render: (row) => (
        <div className="text-slate-600 text-xs truncate max-w-[200px]" title={row.reason}>
          {row.reason}
        </div>
      ),
    },
    {
      header: 'Status Pengajuan',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Tanggal Pengajuan',
      render: (row) => (
        <div className="text-slate-500 text-xs font-semibold">
          {new Date(row.created_at).toLocaleDateString('id-ID')}
        </div>
      ),
    }
  ];

  return (
    <AuthenticatedLayout headerTitle="Pengajuan Kasbon">
      <Head title="Kasbon & Pinjaman" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Banknote className="w-5 h-5 text-brand-600" />
            <span>Kasbon / Pinjaman Karyawan</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Kelola pinjaman Anda dengan sistem potongan payroll otomatis.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-2 px-5 py-3 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-brand-600/30 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Ajukan Pinjaman</span>
        </button>
      </div>

      <DataTable columns={columns} data={loans} searchPlaceholder="Cari pinjaman..." />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Form Pengajuan Kasbon">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Total Pinjaman (Rp)</label>
              <input
                type="number"
                value={data.amount}
                onChange={(e) => setData('amount', e.target.value)}
                required
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono font-extrabold text-emerald-700"
                placeholder="Misal: 1000000"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Tenor (Bulan)</label>
              <input
                type="number"
                min="1"
                max="12"
                value={data.total_months}
                onChange={(e) => setData('total_months', e.target.value)}
                required
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Alasan Pinjaman</label>
            <textarea
              value={data.reason}
              onChange={(e) => setData('reason', e.target.value)}
              required
              rows="3"
              placeholder="Jelaskan kebutuhan pengajuan kasbon ini..."
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold"
            ></textarea>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 bg-slate-100 text-slate-700 font-extrabold text-xs rounded-xl">Batal</button>
            <button type="submit" disabled={processing} className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-brand-600/30 active:scale-95">Ajukan Kasbon</button>
          </div>
        </form>
      </Modal>
    </AuthenticatedLayout>
  );
}
