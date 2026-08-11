import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import DataTable from '@/Components/DataTable';
import { useForm, Head, router } from '@inertiajs/react';
import { Clock, Plus, Users, Moon, Sun, Pencil, Trash2 } from 'lucide-react';
import { showConfirm, showSuccess } from '@/Utils/swal';
import TimeDisplay from '@/Components/TimeDisplay';

export default function Shifts({ shifts }) {
  const [modalType, setModalType] = useState(null); // 'create' | 'edit'
  const [editingShift, setEditingShift] = useState(null);

  const shiftForm = useForm({
    name: '',
    clock_in_time: '08:00',
    clock_out_time: '17:00',
    late_grace_minutes: 15,
    is_night_shift: false,
  });

  const openCreateModal = () => {
    setEditingShift(null);
    shiftForm.setData({
      name: '',
      clock_in_time: '08:00',
      clock_out_time: '17:00',
      late_grace_minutes: 15,
      is_night_shift: false,
    });
    shiftForm.clearErrors();
    setModalType('create');
  };

  const openEditModal = (s) => {
    setEditingShift(s);
    shiftForm.setData({
      name: s.name,
      clock_in_time: s.clock_in_time ? s.clock_in_time.substring(0, 5) : '08:00',
      clock_out_time: s.clock_out_time ? s.clock_out_time.substring(0, 5) : '17:00',
      late_grace_minutes: s.late_grace_minutes || 15,
      is_night_shift: !!s.is_night_shift,
    });
    shiftForm.clearErrors();
    setModalType('edit');
  };

  const handleShiftSubmit = (e) => {
    e.preventDefault();
    if (modalType === 'create') {
      showConfirm({
        title: 'Tambah Shift Kerja?',
        text: `Apakah Anda yakin ingin menambahkan shift "${shiftForm.data.name}" (${shiftForm.data.clock_in_time} - ${shiftForm.data.clock_out_time})?`,
        icon: 'question',
        confirmText: 'Ya, Simpan',
        onConfirm: () => {
          shiftForm.post(route('master.shifts.store'), {
            onSuccess: () => {
              setModalType(null);
              shiftForm.reset();
              showSuccess('Berhasil!', 'Shift jam kerja baru berhasil ditambahkan.');
            }
          });
        }
      });
    } else if (modalType === 'edit' && editingShift) {
      showConfirm({
        title: 'Perbarui Shift Kerja?',
        text: `Apakah Anda yakin ingin memperbarui shift "${shiftForm.data.name}"?`,
        icon: 'question',
        confirmText: 'Ya, Perbarui',
        onConfirm: () => {
          shiftForm.put(route('master.shifts.update', editingShift.id), {
            onSuccess: () => {
              setModalType(null);
              setEditingShift(null);
              showSuccess('Berhasil!', 'Shift jam kerja berhasil diperbarui.');
            }
          });
        }
      });
    }
  };

  const handleDelete = (s) => {
    showConfirm({
      title: 'Hapus Shift Kerja?',
      text: `Apakah Anda yakin ingin menghapus shift "${s.name}"? Karyawan yang terikat akan diset tanpa shift.`,
      icon: 'error',
      confirmText: 'Ya, Hapus',
      onConfirm: () => {
        router.delete(route('master.shifts.destroy', s.id), {
          onSuccess: () => showSuccess('Berhasil!', 'Shift kerja berhasil dihapus.')
        });
      }
    });
  };

  const columns = [
    {
      header: 'Nama Shift',
      accessor: (row) => row.name,
      render: (row) => (
        <div className="flex items-center space-x-4 group/item cursor-pointer">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-700 text-white font-black text-sm flex items-center justify-center shadow-[0_4px_15px_rgba(0,0,0,0.1)] group-hover/item:from-brand-600 group-hover/item:to-brand-500 transition-all duration-300 group-hover/item:scale-105 group-hover/item:shadow-[0_8px_20px_rgba(var(--brand-500-rgb),0.3)] ring-2 ring-white">
              {row.is_night_shift ? <Moon className="w-5 h-5 text-indigo-300" /> : <Sun className="w-5 h-5 text-amber-300" />}
            </div>
            {row.is_night_shift ? (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-indigo-500 border-2 border-white rounded-full shadow-sm"></div>
            ) : (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-500 border-2 border-white rounded-full shadow-sm"></div>
            )}
          </div>
          <div>
            <div className="font-black text-slate-900 text-sm tracking-tight group-hover/item:text-brand-700 transition-colors">
              {row.name}
            </div>
            <div className="flex items-center gap-2 mt-1">
              {row.is_night_shift ? (
                <span className="inline-flex items-center text-[9px] font-black uppercase text-indigo-600 tracking-wider bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">Shift Malam</span>
              ) : (
                <span className="inline-flex items-center text-[9px] font-black uppercase text-amber-600 tracking-wider bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">Shift Normal</span>
              )}
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Jam Kerja',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <TimeDisplay time={row.clock_in_time} theme="emerald" />
          <span className="text-slate-300 font-black px-0.5">-</span>
          <TimeDisplay time={row.clock_out_time} theme="rose" />
        </div>
      )
    },
    {
      header: 'Ketentuan',
      render: (row) => (
        <div className="text-xs">
          <div className="font-bold text-slate-600 mb-1">
            Toleransi Telat: <span className="font-black text-slate-800">{row.late_grace_minutes} Menit</span>
          </div>
          <div className="font-bold text-slate-500 flex items-center gap-1.5 mt-2 text-[11px]">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>{row.employees_count || 0} Karyawan</span>
          </div>
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
    <AuthenticatedLayout headerTitle="Pengaturan Jadwal Kerja">
      <Head title="Jadwal Kerja" />
      <div className="space-y-8">
        <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl p-8 rounded-3xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-500/20 transition-all duration-700"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 group-hover:bg-purple-500/20 transition-all duration-700"></div>
          
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-brand-50 border border-brand-100 rounded-full text-brand-700 text-[10px] font-black uppercase tracking-widest mb-3 shadow-sm">
                <Clock className="w-3 h-3" />
                <span>Data Induk</span>
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <span>Shift & Jam Kerja</span>
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-2 max-w-xl leading-relaxed">
                Kelola jadwal shift kerja, toleransi keterlambatan, dan mapping karyawan.
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center space-x-2 px-6 py-3.5 bg-slate-900 hover:bg-brand-600 text-white font-bold text-sm rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_25px_rgba(var(--brand-600-rgb),0.3)] transition-all duration-300 hover:-translate-y-1 active:translate-y-0"
            >
              <Plus className="w-4.5 h-4.5" />
              <span>Tambah Shift</span>
            </button>
          </div>
        </div>

        <DataTable columns={columns} data={shifts} searchPlaceholder="Cari nama shift..." />
      </div>

      <Modal isOpen={!!modalType} onClose={() => setModalType(null)} title={modalType === 'create' ? "Tambah Shift Kerja Baru" : `Kelola Shift: ${editingShift?.name}`}>
        <form onSubmit={handleShiftSubmit} className="space-y-5 p-2">
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Nama Shift *</label>
            <input type="text" value={shiftForm.data.name} onChange={e => shiftForm.setData('name', e.target.value)} required placeholder="Shift Pagi / Shift Malam" className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Jam Masuk *</label>
              <input type="time" value={shiftForm.data.clock_in_time} onChange={e => shiftForm.setData('clock_in_time', e.target.value)} required className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Jam Keluar *</label>
              <input type="time" value={shiftForm.data.clock_out_time} onChange={e => shiftForm.setData('clock_out_time', e.target.value)} required className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Toleransi Telat (Menit) *</label>
            <input type="number" value={shiftForm.data.late_grace_minutes} onChange={e => shiftForm.setData('late_grace_minutes', e.target.value)} required className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" />
          </div>
          <div className="flex items-center space-x-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <input
              type="checkbox"
              id="is_night_shift"
              checked={shiftForm.data.is_night_shift}
              onChange={e => shiftForm.setData('is_night_shift', e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <label htmlFor="is_night_shift" className="text-xs font-extrabold text-slate-700 cursor-pointer">
              Shift Malam (Lintas Hari / Night Shift)
            </label>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setModalType(null)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors">
              Batal
            </button>
            <button type="submit" disabled={shiftForm.processing} className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50">
              {shiftForm.processing ? 'Menyimpan...' : (modalType === 'create' ? 'Simpan Data' : 'Simpan Perubahan')}
            </button>
          </div>
        </form>
      </Modal>
    </AuthenticatedLayout>
  );
}
