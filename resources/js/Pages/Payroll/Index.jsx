import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DataTable from '@/Components/DataTable';
import StatusBadge from '@/Components/StatusBadge';
import Modal from '@/Components/Modal';
import { useForm, Head, Link, router } from '@inertiajs/react';
import { Plus, Banknote, Play, Eye, FileText, CalendarDays } from 'lucide-react';
import { showConfirm, showSuccess } from '@/Utils/swal';
import DateDisplay from '@/Components/DateDisplay';

export default function PayrollIndex({ periods }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, setData, post, processing, reset, errors } = useForm({
    name: 'Payroll Periode Agustus 2026',
    start_date: '2026-08-01',
    end_date: '2026-08-31',
    pay_date: '2026-08-31',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    showConfirm({
      title: 'Buat Periode Payroll?',
      text: `Apakah Anda yakin ingin membuat periode penggajian "${data.name}"?`,
      icon: 'question',
      confirmText: 'Ya, Buat Periode',
      onConfirm: () => {
        post(route('payroll.periods.store'), {
          onSuccess: () => {
            setIsModalOpen(false);
            reset();
            showSuccess('Berhasil!', 'Periode penggajian baru telah dibuat.');
          },
        });
      }
    });
  };

  const handleProcessPayroll = (periodId) => {
    showConfirm({
      title: 'Jalankan Kalkulasi Payroll Otomatis?',
      text: 'Sistem akan menghitung gaji pokok, tunjangan, BPJS, PPh21, dan potongan presensi untuk seluruh karyawan.',
      icon: 'info',
      confirmText: 'Ya, Hitung Sekarang',
      confirmButtonColor: 'emerald',
      onConfirm: () => {
        router.post(route('payroll.process', periodId), {}, {
          onSuccess: () => {
            showSuccess('Berhasil!', 'Kalkulasi payroll & slip gaji otomatis berhasil diproses!');
          }
        });
      }
    });
  };

  const columns = [
    {
      header: 'Nama Periode Penggajian',
      accessor: (row) => row.name,
      render: (row) => (
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-brand-50 text-brand-700 border border-brand-100 shadow-xs">
            <Banknote className="w-5 h-5" />
          </div>
          <div>
            <div className="font-extrabold text-slate-900 text-sm tracking-tight">{row.name}</div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pay Date</span>
              <div className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-brand-50 border border-brand-200/60 rounded-md text-[10px] font-bold text-brand-700 shadow-xs">
                <CalendarDays className="w-3 h-3 text-brand-500" />
                <DateDisplay date={row.pay_date} format="short" />
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Rentang Tanggal Cut-Off',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-200/80 rounded-lg text-[11px] font-bold text-slate-700 shadow-xs">
            <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
            <DateDisplay date={row.start_date} format="short" />
          </div>
          <span className="text-slate-300 font-black text-xs">-</span>
          <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-200/80 rounded-lg text-[11px] font-bold text-slate-700 shadow-xs">
            <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
            <DateDisplay date={row.end_date} format="short" />
          </div>
        </div>
      ),
    },
    {
      header: 'Total Slip Gaji',
      render: (row) => (
        <span className="inline-flex px-3 py-1 rounded-xl bg-slate-100 font-black text-slate-800 text-xs border border-slate-200/60">
          {row.payrolls_count || 0} Slip Generated
        </span>
      ),
    },
    {
      header: 'Status Process',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Aksi Process & Slip',
      render: (row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleProcessPayroll(row.id)}
            className="px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-extrabold transition-all flex items-center space-x-1.5 shadow-md shadow-brand-600/30 active:scale-95"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Hitung Payroll Otomatis</span>
          </button>
          {row.payrolls_count > 0 && (
            <Link
              href={route('payroll.period-detail', row.id)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-1.5 active:scale-95"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Lihat Slip Gaji</span>
            </Link>
          )}
        </div>
      ),
    },
  ];

  return (
    <AuthenticatedLayout headerTitle="Sistem Penggajian">
      <Head title="Sistem Penggajian" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Banknote className="w-5 h-5 text-brand-600" />
            <span>Kalkulasi Payroll & Slip Gaji Karyawan</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Kalkulasi otomatis berdasarkan gaji pokok, tunjangan, BPJS, PPh21, dan potongan.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-2 px-5 py-3 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-brand-600/30 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Periode Payroll Baru</span>
        </button>
      </div>

      <DataTable columns={columns} data={periods} searchPlaceholder="Cari nama periode penggajian..." />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Buat Periode Penggajian Baru">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Nama Periode</label>
            <input
              type="text"
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
              required
              className={`w-full px-3.5 py-2.5 border rounded-xl text-xs font-semibold ${errors.name ? 'border-red-500' : 'border-slate-200'}`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Tanggal Mulai</label>
              <input
                type="date"
                value={data.start_date}
                onChange={(e) => setData('start_date', e.target.value)}
                required
                className={`w-full px-3.5 py-2.5 border rounded-xl text-xs font-semibold ${errors.start_date ? 'border-red-500' : 'border-slate-200'}`}
              />
              {errors.start_date && <p className="text-red-500 text-xs mt-1">{errors.start_date}</p>}
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Tanggal Cut-Off</label>
              <input
                type="date"
                value={data.end_date}
                onChange={(e) => setData('end_date', e.target.value)}
                required
                className={`w-full px-3.5 py-2.5 border rounded-xl text-xs font-semibold ${errors.end_date ? 'border-red-500' : 'border-slate-200'}`}
              />
              {errors.end_date && <p className="text-red-500 text-xs mt-1">{errors.end_date}</p>}
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Tanggal Transfer</label>
              <input
                type="date"
                value={data.pay_date}
                onChange={(e) => setData('pay_date', e.target.value)}
                required
                className={`w-full px-3.5 py-2.5 border rounded-xl text-xs font-extrabold text-brand-700 ${errors.pay_date ? 'border-red-500' : 'border-slate-200'}`}
              />
              {errors.pay_date && <p className="text-red-500 text-xs mt-1">{errors.pay_date}</p>}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 bg-slate-100 text-slate-700 font-extrabold text-xs rounded-xl">Batal</button>
            <button type="submit" disabled={processing} className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-brand-600/30 active:scale-95">Simpan Periode</button>
          </div>
        </form>
      </Modal>
    </AuthenticatedLayout>
  );
}
