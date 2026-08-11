import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DataTable from '@/Components/DataTable';
import StatusBadge from '@/Components/StatusBadge';
import { Head, router } from '@inertiajs/react';
import { Banknote, CheckCircle, XCircle } from 'lucide-react';
import { showConfirm, showSuccess } from '@/Utils/swal';

export default function LoansApprovals({ loans }) {
  const handleApprove = (id, action) => {
    const isApprove = action === 'approve';
    showConfirm({
      title: isApprove ? 'Setujui Kasbon?' : 'Tolak Kasbon?',
      text: isApprove ? 'Apakah Anda yakin ingin menyetujui pengajuan kasbon ini?' : 'Apakah Anda yakin ingin menolak pengajuan kasbon ini?',
      icon: isApprove ? 'question' : 'warning',
      confirmText: isApprove ? 'Ya, Setujui' : 'Ya, Tolak',
      confirmButtonColor: isApprove ? 'emerald' : 'rose',
      onConfirm: () => {
        router.post(route(`loans.${action}`, id), {}, {
          onSuccess: () => {
            showSuccess('Berhasil!', isApprove ? 'Pengajuan kasbon telah disetujui.' : 'Pengajuan kasbon telah ditolak.');
          }
        });
      }
    });
  };

  const columns = [
    {
      header: 'Karyawan',
      accessor: (row) => row.employee?.full_name,
      render: (row) => (
        <div>
          <div className="font-extrabold text-slate-900 text-sm mt-1">{row.employee?.full_name || 'Karyawan'}</div>
          <div className="text-slate-500 text-xs font-semibold">{new Date(row.created_at).toLocaleDateString('id-ID')}</div>
        </div>
      ),
    },
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
      header: 'Aksi Approval',
      render: (row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleApprove(row.id, 'approve')}
            className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold transition-all active:scale-95 shadow-xs"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Setujui</span>
          </button>
          <button
            onClick={() => handleApprove(row.id, 'reject')}
            className="flex items-center space-x-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-extrabold transition-all active:scale-95 shadow-xs"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Tolak</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <AuthenticatedLayout headerTitle="Persetujuan Kasbon">
      <Head title="Persetujuan Kasbon" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Banknote className="w-5 h-5 text-brand-600" />
            <span>Approval Kasbon / Pinjaman</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Daftar pengajuan kasbon karyawan yang menunggu persetujuan Anda.</p>
        </div>
      </div>

      <DataTable columns={columns} data={loans} searchPlaceholder="Cari nama karyawan..." />
    </AuthenticatedLayout>
  );
}
