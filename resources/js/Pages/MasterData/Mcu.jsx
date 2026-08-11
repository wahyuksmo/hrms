import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import DataTable from '@/Components/DataTable';
import { useForm, Head, router } from '@inertiajs/react';
import { Stethoscope, Plus, Pencil, Trash2, HeartPulse, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { showConfirm, showSuccess } from '@/Utils/swal';

export default function Mcu({ mcu_checklists }) {
  const [modalType, setModalType] = useState(null);
  const [editingMcu, setEditingMcu] = useState(null);
  const mcuForm = useForm({ item_name: '', is_mandatory: true });

  const openCreateModal = () => {
    setEditingMcu(null);
    mcuForm.setData({ item_name: '', is_mandatory: true });
    mcuForm.clearErrors();
    setModalType('mcu');
  };

  const openEditModal = (mcu) => {
    setEditingMcu(mcu);
    mcuForm.setData({
      item_name: mcu.item_name,
      is_mandatory: !!mcu.is_mandatory
    });
    mcuForm.clearErrors();
    setModalType('mcu');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingMcu) {
      showConfirm({
        title: 'Perbarui Item MCU?',
        text: `Apakah Anda yakin ingin memperbarui item "${mcuForm.data.item_name}"?`,
        icon: 'question',
        confirmText: 'Ya, Perbarui',
        onConfirm: () => {
          mcuForm.put(route('master.mcu-checklists.update', editingMcu.id), {
            onSuccess: () => {
              setModalType(null);
              setEditingMcu(null);
              showSuccess('Berhasil!', 'Item MCU berhasil diperbarui.');
            }
          });
        }
      });
    } else {
      showConfirm({
        title: 'Tambah Item MCU?',
        text: `Apakah Anda yakin ingin menambahkan item "${mcuForm.data.item_name}"?`,
        icon: 'question',
        confirmText: 'Ya, Simpan',
        onConfirm: () => {
          mcuForm.post(route('master.mcu-checklists.store'), {
            onSuccess: () => {
              setModalType(null);
              mcuForm.reset();
              showSuccess('Berhasil!', 'Item MCU baru berhasil ditambahkan.');
            }
          });
        }
      });
    }
  };

  const handleDelete = (mcu) => {
    showConfirm({
      title: 'Hapus Item MCU?',
      text: `Apakah Anda yakin ingin menghapus item "${mcu.item_name}"?`,
      icon: 'error',
      confirmText: 'Ya, Hapus',
      onConfirm: () => {
        router.delete(route('master.mcu-checklists.destroy', mcu.id), {
          onSuccess: () => showSuccess('Berhasil!', 'Item MCU berhasil dihapus.')
        });
      }
    });
  };

  const columns = [
    {
      header: 'Nama Pemeriksaan',
      accessor: 'item_name',
      render: (row) => (
        <div className="flex items-center space-x-4 group/item cursor-pointer">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-700 text-white font-black text-sm flex items-center justify-center shadow-[0_4px_15px_rgba(0,0,0,0.1)] group-hover/item:from-brand-600 group-hover/item:to-brand-500 transition-all duration-300 group-hover/item:scale-105 group-hover/item:shadow-[0_8px_20px_rgba(var(--brand-500-rgb),0.3)] ring-2 ring-white">
              <HeartPulse className="w-5 h-5 text-rose-300" />
            </div>
            {row.is_mandatory && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-rose-500 border-2 border-white rounded-full shadow-sm"></div>
            )}
          </div>
          <div>
            <div className="font-black text-slate-900 text-sm tracking-tight group-hover/item:text-brand-700 transition-colors">
              {row.item_name}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-[9px] font-black uppercase text-slate-500 tracking-wider">
                Medical Check-up Item
              </span>
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Status Wajib',
      render: (row) => (
        <div>
          {row.is_mandatory ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Wajib (Mandatory)</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-slate-50 text-slate-600 border border-slate-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Opsional</span>
            </span>
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
    <AuthenticatedLayout headerTitle="Pengaturan Daftar MCU">
      <Head title="Daftar MCU" />
      <div className="space-y-8">
        <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl p-8 rounded-3xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-500/20 transition-all duration-700"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 group-hover:bg-purple-500/20 transition-all duration-700"></div>
          
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-brand-50 border border-brand-100 rounded-full text-brand-700 text-[10px] font-black uppercase tracking-widest mb-3 shadow-sm">
                <Stethoscope className="w-3 h-3" />
                <span>Data Induk</span>
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <span>Item MCU Checklist</span>
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-2 max-w-xl leading-relaxed">
                Kelola item medical check-up untuk kandidat rekrutmen.
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center space-x-2 px-6 py-3.5 bg-slate-900 hover:bg-brand-600 text-white font-bold text-sm rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_25px_rgba(var(--brand-600-rgb),0.3)] transition-all duration-300 hover:-translate-y-1 active:translate-y-0"
            >
              <Plus className="w-4.5 h-4.5" />
              <span>Tambah Item</span>
            </button>
          </div>
        </div>

        <DataTable columns={columns} data={mcu_checklists} searchPlaceholder="Cari nama pemeriksaan MCU..." />
      </div>

      <Modal isOpen={modalType === 'mcu'} onClose={() => setModalType(null)} title={editingMcu ? "Kelola Item MCU" : "Tambah Item MCU"}>
        <form onSubmit={handleSubmit} className="space-y-5 p-2">
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Nama Pemeriksaan (Item Name) *</label>
            <input type="text" value={mcuForm.data.item_name} onChange={e => mcuForm.setData('item_name', e.target.value)} required placeholder="Mis: Tes Darah Lengkap, Rontgen Paru" className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" />
          </div>
          <div className="pt-2">
            <label className="relative flex items-start gap-3 cursor-pointer group p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="flex items-center h-5">
                <input type="checkbox" id="is_mandatory" checked={mcuForm.data.is_mandatory} onChange={e => mcuForm.setData('is_mandatory', e.target.checked)} className="w-4 h-4 text-brand-600 bg-slate-100 border-slate-300 rounded focus:ring-brand-500 focus:ring-2" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-800 group-hover:text-brand-700 transition-colors">Wajib dilakukan (Mandatory)</span>
                <span className="text-xs text-slate-500 font-medium mt-0.5">Item pemeriksaan ini wajib dipenuhi oleh kandidat</span>
              </div>
            </label>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setModalType(null)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors">
              Batal
            </button>
            <button type="submit" disabled={mcuForm.processing} className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50">
              {mcuForm.processing ? 'Menyimpan...' : (editingMcu ? 'Simpan Perubahan' : 'Simpan Data')}
            </button>
          </div>
        </form>
      </Modal>
    </AuthenticatedLayout>
  );
}
