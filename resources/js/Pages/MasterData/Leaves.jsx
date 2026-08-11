import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import DataTable from '@/Components/DataTable';
import { useForm, Head, router } from '@inertiajs/react';
import { CalendarDays, Plus, Pencil, Trash2 } from 'lucide-react';
import { showConfirm, showSuccess } from '@/Utils/swal';

export default function Leaves({ leave_types }) {
  const [modalType, setModalType] = useState(null);
  const [editingLeave, setEditingLeave] = useState(null);
  const leaveForm = useForm({ code: '', name: '', quota_days: 12, is_deduct_salary: false });

  const openCreateModal = () => {
    setEditingLeave(null);
    leaveForm.setData({ code: '', name: '', quota_days: 12, is_deduct_salary: false });
    leaveForm.clearErrors();
    setModalType('leave');
  };

  const openEditModal = (lt) => {
    setEditingLeave(lt);
    leaveForm.setData({
      code: lt.code,
      name: lt.name,
      quota_days: lt.quota_days,
      is_deduct_salary: !!lt.is_deduct_salary
    });
    leaveForm.clearErrors();
    setModalType('leave');
  };

  const handleLeaveSubmit = (e) => {
    e.preventDefault();
    if (editingLeave) {
      showConfirm({
        title: 'Perbarui Tipe Cuti?',
        text: `Apakah Anda yakin ingin memperbarui tipe cuti "${leaveForm.data.name}"?`,
        icon: 'question',
        confirmText: 'Ya, Perbarui',
        onConfirm: () => {
          leaveForm.put(route('master.leave-types.update', editingLeave.id), {
            onSuccess: () => {
              setModalType(null);
              setEditingLeave(null);
              showSuccess('Berhasil!', 'Tipe cuti berhasil diperbarui.');
            }
          });
        }
      });
    } else {
      showConfirm({
        title: 'Tambah Tipe Cuti / Izin?',
        text: `Apakah Anda yakin ingin menambahkan tipe cuti "${leaveForm.data.name}" (${leaveForm.data.quota_days} Hari)?`,
        icon: 'question',
        confirmText: 'Ya, Simpan',
        onConfirm: () => {
          leaveForm.post(route('master.leave-types.store'), {
            onSuccess: () => {
              setModalType(null);
              leaveForm.reset();
              showSuccess('Berhasil!', 'Tipe cuti/izin baru berhasil ditambahkan.');
            }
          });
        }
      });
    }
  };

  const handleDelete = (lt) => {
    showConfirm({
      title: 'Hapus Tipe Cuti?',
      text: `Apakah Anda yakin ingin menghapus tipe cuti "${lt.name}"?`,
      icon: 'error',
      confirmText: 'Ya, Hapus',
      onConfirm: () => {
        router.delete(route('master.leave-types.destroy', lt.id), {
          onSuccess: () => showSuccess('Berhasil!', 'Tipe cuti berhasil dihapus.')
        });
      }
    });
  };

  const columns = [
    {
      header: 'Kode & Nama',
      accessor: (row) => `${row.code} ${row.name}`,
      render: (row) => (
        <div className="flex items-center space-x-4 group/item cursor-pointer">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-700 text-white font-black text-sm flex items-center justify-center shadow-[0_4px_15px_rgba(0,0,0,0.1)] group-hover/item:from-brand-600 group-hover/item:to-brand-500 transition-all duration-300 group-hover/item:scale-105 group-hover/item:shadow-[0_8px_20px_rgba(var(--brand-500-rgb),0.3)] ring-2 ring-white">
            {row.code.substring(0, 2)}
          </div>
          <div>
            <div className="font-black text-slate-900 text-sm tracking-tight group-hover/item:text-brand-700 transition-colors">
              {row.name}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-[9px] font-black uppercase text-brand-600 tracking-wider bg-brand-50 px-1.5 py-0.5 rounded border border-brand-200">
                {row.code}
              </span>
              {row.is_deduct_salary && (
                <span className="inline-flex items-center text-[9px] font-black uppercase text-rose-600 tracking-wider bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                  Unpaid
                </span>
              )}
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Kuota (Hari)',
      render: (row) => (
        <div className="text-xs font-black text-slate-900 bg-slate-50 inline-block px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
          {row.quota_days} Hari
        </div>
      )
    },
    {
      header: 'Status Gaji',
      render: (row) => (
        <div className="text-xs">
          {row.is_deduct_salary ? (
            <div className="flex items-center gap-1.5 text-rose-600 font-bold">
              <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"></div>
              Potong Gaji
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              Tetap Digaji
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Aksi',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => openEditModal(row)}
            className="group/btn px-3 py-1.5 bg-white hover:bg-slate-900 text-slate-700 hover:text-white rounded-xl text-xs font-bold transition-all duration-300 border border-slate-200 hover:border-slate-900 flex items-center gap-1.5 shadow-sm hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 active:translate-y-0"
            title="Edit Data"
          >
            <Pencil className="w-3.5 h-3.5 group-hover/btn:rotate-12 transition-transform" />
            <span>Kelola</span>
          </button>
          
          <button
            onClick={() => handleDelete(row)}
            className="group/btn px-3 py-1.5 bg-white hover:bg-rose-600 text-rose-600 hover:text-white rounded-xl text-xs font-bold transition-all duration-300 border border-rose-200 hover:border-rose-600 flex items-center gap-1.5 shadow-sm hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 active:translate-y-0"
            title="Hapus Data"
          >
            <Trash2 className="w-3.5 h-3.5 group-hover/btn:rotate-12 transition-transform" />
          </button>
        </div>
      )
    }
  ];

  return (
    <AuthenticatedLayout headerTitle="Pengaturan Jenis Cuti">
      <Head title="Jenis Cuti & Izin" />
      <div className="space-y-8">
        <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl p-8 rounded-3xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-500/20 transition-all duration-700"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 group-hover:bg-purple-500/20 transition-all duration-700"></div>
          
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-brand-50 border border-brand-100 rounded-full text-brand-700 text-[10px] font-black uppercase tracking-widest mb-3 shadow-sm">
                <CalendarDays className="w-3 h-3" />
                <span>Data Induk</span>
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <span>Tipe Cuti & Izin</span>
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-2 max-w-xl leading-relaxed">
                Kelola jenis cuti, izin karyawan, dan alokasi kuota tahunan.
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center space-x-2 px-6 py-3.5 bg-slate-900 hover:bg-brand-600 text-white font-bold text-sm rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_25px_rgba(var(--brand-600-rgb),0.3)] transition-all duration-300 hover:-translate-y-1 active:translate-y-0"
            >
              <Plus className="w-4.5 h-4.5" />
              <span>Tambah Tipe Baru</span>
            </button>
          </div>
        </div>

        <DataTable columns={columns} data={leave_types} searchPlaceholder="Cari kode atau nama cuti..." />
      </div>

      <Modal isOpen={modalType === 'leave'} onClose={() => setModalType(null)} title={editingLeave ? "Kelola Tipe Cuti / Izin" : "Tambah Tipe Cuti / Izin"}>
        <form onSubmit={handleLeaveSubmit} className="space-y-5 p-2">
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Kode Cuti *</label>
            <input type="text" value={leaveForm.data.code} onChange={e => leaveForm.setData('code', e.target.value.toUpperCase())} required placeholder="CUTI_THN / IZIN_SAKIT" className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-black uppercase focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Nama Tipe Cuti / Izin *</label>
            <input type="text" value={leaveForm.data.name} onChange={e => leaveForm.setData('name', e.target.value)} required placeholder="Cuti Tahunan / Izin Sakit" className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Kuota (Hari / Tahun) *</label>
            <input type="number" value={leaveForm.data.quota_days} onChange={e => leaveForm.setData('quota_days', e.target.value)} required className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" />
          </div>
          <div className="flex items-center space-x-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <input type="checkbox" id="is_deduct_salary" checked={leaveForm.data.is_deduct_salary} onChange={e => leaveForm.setData('is_deduct_salary', e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
            <label htmlFor="is_deduct_salary" className="text-xs text-slate-800 font-extrabold cursor-pointer">Potong Gaji (Unpaid Leave)</label>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setModalType(null)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors">
              Batal
            </button>
            <button type="submit" disabled={leaveForm.processing} className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50">
              {leaveForm.processing ? 'Menyimpan...' : (editingLeave ? 'Simpan Perubahan' : 'Simpan Data')}
            </button>
          </div>
        </form>
      </Modal>
    </AuthenticatedLayout>
  );
}

