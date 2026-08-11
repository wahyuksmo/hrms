import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DataTable from '@/Components/DataTable';
import StatusBadge from '@/Components/StatusBadge';
import Modal from '@/Components/Modal';
import Select2 from '@/Components/Select2';
import { useForm, Head, router } from '@inertiajs/react';
import { Plus, Receipt, DollarSign, Clock } from 'lucide-react';
import { showConfirm, showSuccess } from '@/Utils/swal';

export default function ReimbursementsIndex({ claims, reimbursement_types }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, setData, post, processing, reset, errors } = useForm({
    reimbursement_type_id: reimbursement_types[0] ? reimbursement_types[0].id : '',
    amount: 150000,
    claim_date: new Date().toISOString().split('T')[0],
    description: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    showConfirm({
      title: 'Kirim Klaim Reimbursement?',
      text: `Pengajuan klaim sebesar Rp ${Number(data.amount).toLocaleString('id-ID')} akan diverifikasi berdasarkan plafon dan disetujui oleh atasan.`,
      icon: 'question',
      confirmText: 'Ya, Kirim Klaim',
      onConfirm: () => {
        post(route('reimbursements.store'), {
          onSuccess: () => {
            setIsModalOpen(false);
            reset();
            showSuccess('Berhasil!', 'Klaim reimbursement berhasil dikirim.');
          },
        });
      }
    });
  };

  const handleApprove = (id, action) => {
    const isApprove = action === 'approve';
    showConfirm({
      title: isApprove ? 'Setujui Klaim Reimbursement?' : 'Tolak Klaim Reimbursement?',
      text: isApprove ? 'Apakah Anda yakin ingin menyetujui klaim pengeluaran ini?' : 'Apakah Anda yakin ingin menolak klaim pengeluaran ini?',
      icon: isApprove ? 'question' : 'warning',
      confirmText: isApprove ? 'Ya, Setujui' : 'Ya, Tolak',
      confirmButtonColor: isApprove ? 'emerald' : 'rose',
      onConfirm: () => {
        router.post(route('reimbursements.approve', id), { action }, {
          onSuccess: () => {
            showSuccess('Berhasil!', isApprove ? 'Klaim reimbursement telah disetujui.' : 'Klaim reimbursement telah ditolak.');
          }
        });
      }
    });
  };

  const columns = [
    {
      header: 'No Klaim & Karyawan',
      accessor: (row) => row.claim_number,
      render: (row) => (
        <div>
          <div className="font-extrabold text-brand-700 text-xs font-mono bg-brand-50 px-2.5 py-0.5 rounded-md inline-block">{row.claim_number}</div>
          <div className="font-extrabold text-slate-900 text-sm mt-1">{row.employee?.full_name || 'Karyawan'}</div>
        </div>
      ),
    },
    {
      header: 'Kategori Reimburse',
      render: (row) => (
        <div>
          <div className="font-extrabold text-slate-800 text-xs">{row.reimbursement_type?.name}</div>
          <div className="text-slate-500 text-xs font-semibold">{row.claim_date}</div>
        </div>
      ),
    },
    {
      header: 'Jumlah Klaim (IDR)',
      render: (row) => (
        <div className="font-mono font-black text-emerald-700 text-sm">
          Rp {Number(row.amount).toLocaleString('id-ID')}
        </div>
      ),
    },
    {
      header: 'Level Approval Saat Ini',
      render: (row) => (
        <span className="inline-flex items-center px-3 py-1 rounded-xl bg-amber-50 text-amber-800 font-extrabold text-[11px] uppercase border border-amber-200/80 shadow-xs">
          <Clock className="w-3.5 h-3.5 mr-1 text-amber-600" />
          {row.current_approval_level}
        </span>
      ),
    },
    {
      header: 'Status Klaim',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Aksi Approval Atasan',
      render: (row) => (
        row.status === 'pending' ? (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleApprove(row.id, 'approve')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold transition-all active:scale-95 shadow-xs"
            >
              Setujui
            </button>
            <button
              onClick={() => handleApprove(row.id, 'reject')}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-extrabold transition-all active:scale-95 shadow-xs"
            >
              Tolak
            </button>
          </div>
        ) : (
          <span className="text-xs text-slate-400 font-semibold italic">Selesai</span>
        )
      ),
    },
  ];

  return (
    <AuthenticatedLayout headerTitle="Pengajuan Klaim Dana">
      <Head title="Klaim Dana Karyawan" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Receipt className="w-5 h-5 text-brand-600" />
            <span>Manajemen Reimbursement Karyawan</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Cek batas pengajuan otomatis & persetujuan berjenjang dari atasan.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-2 px-5 py-3 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-brand-600/30 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Ajukan Klaim Baru</span>
        </button>
      </div>

      <DataTable columns={columns} data={claims} searchPlaceholder="Cari nomor klaim atau karyawan..." />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Form Pengajuan Reimbursement">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Kategori Pengeluaran</label>
            <Select2
              value={data.reimbursement_type_id}
              onChange={(e) => setData('reimbursement_type_id', e.target.value)}
              required
              options={reimbursement_types.map((rt) => ({
                value: rt.id,
                label: `${rt.name} (Limit Plafon: Rp ${Number(rt.max_limit_per_claim).toLocaleString('id-ID')})`
              }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Jumlah Biaya (Rp)</label>
              <input
                type="number"
                value={data.amount}
                onChange={(e) => setData('amount', e.target.value)}
                required
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono font-extrabold text-emerald-700"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Tanggal Struk / Nota</label>
              <input
                type="date"
                value={data.claim_date}
                onChange={(e) => setData('claim_date', e.target.value)}
                required
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Deskripsi Pengeluaran</label>
            <textarea
              value={data.description}
              onChange={(e) => setData('description', e.target.value)}
              required
              rows="3"
              placeholder="Contoh: Pembelian obat resep dokter & Vitamin..."
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold"
            ></textarea>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 bg-slate-100 text-slate-700 font-extrabold text-xs rounded-xl">Batal</button>
            <button type="submit" disabled={processing} className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-brand-600/30 active:scale-95">Kirim Klaim</button>
          </div>
        </form>
      </Modal>
    </AuthenticatedLayout>
  );
}
