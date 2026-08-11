import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DataTable from '@/Components/DataTable';
import StatusBadge from '@/Components/StatusBadge';
import Modal from '@/Components/Modal';
import Select2 from '@/Components/Select2';
import { useForm, Head, router } from '@inertiajs/react';
import { Plus, CalendarDays, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { showConfirm, showSuccess } from '@/Utils/swal';
import DateDisplay from '@/Components/DateDisplay';

export default function LeavesIndex({ leave_requests = [], leave_types = [] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, setData, post, processing, reset, errors } = useForm({
    leave_type_id: leave_types[0] ? leave_types[0].id : '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    reason: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    showConfirm({
      title: 'Kirim Pengajuan Cuti?',
      text: 'Permohonan cuti Anda akan diteruskan ke atasan berjenjang untuk proses approval.',
      icon: 'question',
      confirmText: 'Ya, Kirim Pengajuan',
      onConfirm: () => {
        post(route('leaves.store'), {
          onSuccess: () => {
            setIsModalOpen(false);
            reset();
            showSuccess('Berhasil!', 'Pengajuan cuti Anda telah berhasil dikirim.');
          },
        });
      }
    });
  };

  const handleApprove = (id, action) => {
    const isApprove = action === 'approve';
    showConfirm({
      title: isApprove ? 'Setujui Pengajuan Cuti?' : 'Tolak Pengajuan Cuti?',
      text: isApprove ? 'Apakah Anda yakin ingin menyetujui pengajuan cuti ini?' : 'Apakah Anda yakin ingin menolak pengajuan cuti ini?',
      icon: isApprove ? 'question' : 'warning',
      confirmText: isApprove ? 'Ya, Setujui' : 'Ya, Tolak',
      confirmButtonColor: isApprove ? 'emerald' : 'rose',
      onConfirm: () => {
        router.post(route('leaves.approve', id), { action }, {
          onSuccess: () => {
            showSuccess('Berhasil!', isApprove ? 'Pengajuan cuti telah disetujui.' : 'Pengajuan cuti telah ditolak.');
          }
        });
      }
    });
  };

  const columns = [
    {
      header: 'Karyawan Pemohon',
      accessor: (row) => row.employee?.full_name,
      render: (row) => (
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 text-white font-bold text-xs flex items-center justify-center shadow-xs">
            {row.employee?.full_name ? row.employee.full_name.charAt(0) : 'K'}
          </div>
          <div>
            <div className="font-bold text-slate-900 text-sm tracking-tight">{row.employee?.full_name || 'Karyawan'}</div>
            <div className="text-xs text-brand-700 font-mono font-medium">NIK: {row.employee?.nik}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Jenis Cuti / Izin',
      render: (row) => (
        <div>
          <div className="font-bold text-brand-700 text-xs">{row.leave_type?.name}</div>
          <div className="text-slate-500 text-xs font-semibold">{row.total_days} Hari Kerja</div>
        </div>
      ),
    },
    {
      header: 'Tanggal & Alasan',
      render: (row) => (
        <div className="text-xs">
          <div className="flex items-center gap-1.5 mt-1">
            <div className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-50 border border-slate-200/80 rounded-md text-[10px] font-bold text-slate-700 shadow-xs">
              <CalendarDays className="w-3 h-3 text-slate-400" />
              <DateDisplay date={row.start_date} format="short" />
            </div>
            <span className="text-slate-300 font-black">-</span>
            <div className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-50 border border-slate-200/80 rounded-md text-[10px] font-bold text-slate-700 shadow-xs">
              <CalendarDays className="w-3 h-3 text-slate-400" />
              <DateDisplay date={row.end_date} format="short" />
            </div>
          </div>
          <div className="text-slate-500 italic mt-0.5 truncate max-w-xs">{row.reason}</div>
        </div>
      ),
    },
    {
      header: 'Approval Level Saat Ini',
      render: (row) => (
        <span className="inline-flex items-center px-3 py-1 rounded-xl bg-amber-50 text-amber-800 font-bold text-[11px] uppercase border border-amber-200/80 shadow-xs">
          <Clock className="w-3.5 h-3.5 mr-1 text-amber-600" />
          {row.current_approval_level}
        </span>
      ),
    },
    {
      header: 'Status Request',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Aksi Approval Atasan',
      render: (row) => (
        row.status === 'pending' ? (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleApprove(row.id, 'approve')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-xs"
            >
              Setujui
            </button>
            <button
              onClick={() => handleApprove(row.id, 'reject')}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-xs"
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
    <AuthenticatedLayout headerTitle="Pengajuan Cuti & Izin">
      <Head title="Cuti & Izin" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <CalendarDays className="w-5 h-5 text-brand-600" />
            <span>Daftar Pengajuan Cuti & Izin</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Sistem menyalurkan approval otomatis ke atasan berjenjang (level_1, level_2, dst).</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-2 px-5 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-brand-600/30 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Ajukan Cuti Baru</span>
        </button>
      </div>

      <DataTable columns={columns} data={leave_requests} searchPlaceholder="Cari nama karyawan..." />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Form Pengajuan Cuti / Izin">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tipe Cuti / Izin</label>
            <Select2
              value={data.leave_type_id}
              onChange={(e) => setData('leave_type_id', e.target.value)}
              required
              error={errors.leave_type_id}
              options={leave_types.map((lt) => ({
                value: lt.id,
                label: `${lt.name} (Kuota: ${lt.quota_days} Hari)`
              }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tanggal Mulai</label>
              <input
                type="date"
                value={data.start_date}
                onChange={(e) => setData('start_date', e.target.value)}
                required
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tanggal Selesai</label>
              <input
                type="date"
                value={data.end_date}
                onChange={(e) => setData('end_date', e.target.value)}
                required
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Alasan Pengajuan</label>
            <textarea
              value={data.reason}
              onChange={(e) => setData('reason', e.target.value)}
              required
              rows="3"
              placeholder="Jelaskan alasan pengajuan cuti..."
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold"
            ></textarea>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 transition-colors">Batal</button>
            <button type="submit" disabled={processing} className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-600/30 active:scale-95">Kirim Pengajuan</button>
          </div>
        </form>
      </Modal>
    </AuthenticatedLayout>
  );
}
