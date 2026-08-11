import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import DataTable from '@/Components/DataTable';
import { useForm, Head, router } from '@inertiajs/react';
import { Receipt, Plus, Pencil, Trash2, ShieldCheck } from 'lucide-react';
import { showConfirm, showSuccess } from '@/Utils/swal';

export default function Reimbursements({ reimbursement_types }) {
  const [modalType, setModalType] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  
  const reimForm = useForm({ code: '', name: '', max_limit_per_claim: 1000000 });

  const openCreate = () => {
    setEditingItem(null);
    reimForm.setData({ code: '', name: '', max_limit_per_claim: 1000000 });
    reimForm.clearErrors();
    setModalType('reim');
  };

  const openEdit = (rt) => {
    setEditingItem(rt);
    reimForm.setData({ code: rt.code, name: rt.name, max_limit_per_claim: rt.max_limit_per_claim });
    reimForm.clearErrors();
    setModalType('reim');
  };

  const handleReimSubmit = (e) => {
    e.preventDefault();
    if (editingItem) {
      showConfirm({
        title: 'Perbarui Tipe Reimbursement?',
        text: `Apakah Anda yakin ingin memperbarui tipe reimbursement "${reimForm.data.name}"?`,
        icon: 'question',
        confirmText: 'Ya, Perbarui',
        onConfirm: () => {
          reimForm.put(route('master.reimbursement-types.update', editingItem.id), {
            onSuccess: () => {
              setModalType(null);
              setEditingItem(null);
              showSuccess('Berhasil!', 'Tipe reimbursement berhasil diperbarui.');
            }
          });
        }
      });
    } else {
      showConfirm({
        title: 'Tambah Tipe Reimbursement?',
        text: `Apakah Anda yakin ingin menambahkan tipe reimbursement "${reimForm.data.name}"?`,
        icon: 'question',
        confirmText: 'Ya, Simpan',
        onConfirm: () => {
          reimForm.post(route('master.reimbursement-types.store'), {
            onSuccess: () => {
              setModalType(null);
              reimForm.reset();
              showSuccess('Berhasil!', 'Tipe reimbursement baru berhasil ditambahkan.');
            }
          });
        }
      });
    }
  };

  const handleDelete = (rt) => {
    showConfirm({
      title: 'Hapus Tipe Reimbursement?',
      text: `Apakah Anda yakin ingin menghapus tipe reimbursement "${rt.name}"?`,
      icon: 'error',
      confirmText: 'Ya, Hapus',
      onConfirm: () => {
        router.delete(route('master.reimbursement-types.destroy', rt.id), {
          onSuccess: () => showSuccess('Berhasil!', 'Tipe reimbursement berhasil dihapus.')
        });
      }
    });
  };

  const columns = [
    {
      header: 'Kode & Nama Tipe',
      accessor: (row) => `${row.code} ${row.name}`,
      render: (row) => (
        <div className="flex items-center space-x-4 group/item cursor-pointer">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-700 text-white font-black text-sm flex items-center justify-center shadow-[0_4px_15px_rgba(0,0,0,0.1)] group-hover/item:from-brand-600 group-hover/item:to-brand-500 transition-all duration-300 group-hover/item:scale-105 group-hover/item:shadow-[0_8px_20px_rgba(var(--brand-500-rgb),0.3)] ring-2 ring-white">
              <ShieldCheck className="w-5 h-5 text-indigo-300" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-indigo-500 border-2 border-white rounded-full shadow-sm"></div>
          </div>
          <div>
            <div className="font-black text-slate-900 text-sm tracking-tight group-hover/item:text-brand-700 transition-colors">
              {row.name}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-[9px] font-black uppercase text-brand-600 tracking-wider bg-brand-50 px-1.5 py-0.5 rounded border border-brand-200">
                {row.code}
              </span>
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Plafon / Max Limit per Klaim',
      render: (row) => (
        <div className="text-sm font-mono font-black text-emerald-700 bg-emerald-50 inline-block px-4 py-2 rounded-xl border border-emerald-100 shadow-sm">
          Rp {Number(row.max_limit_per_claim).toLocaleString('id-ID')}
        </div>
      )
    },
    {
      header: 'Aksi',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => openEdit(row)}
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
    <AuthenticatedLayout headerTitle="Pengaturan Jenis Klaim Dana">
      <Head title="Jenis Klaim Dana" />
      <div className="space-y-8">
        <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl p-8 rounded-3xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-500/20 transition-all duration-700"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 group-hover:bg-purple-500/20 transition-all duration-700"></div>
          
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-brand-50 border border-brand-100 rounded-full text-brand-700 text-[10px] font-black uppercase tracking-widest mb-3 shadow-sm">
                <Receipt className="w-3 h-3" />
                <span>Data Induk</span>
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <span>Tipe Reimbursement & Plafon</span>
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-2 max-w-xl leading-relaxed">
                Kelola jenis klaim biaya dan batas maksimal plafon per pengajuan.
              </p>
            </div>
            <button
              onClick={openCreate}
              className="inline-flex items-center space-x-2 px-6 py-3.5 bg-slate-900 hover:bg-brand-600 text-white font-bold text-sm rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_25px_rgba(var(--brand-600-rgb),0.3)] transition-all duration-300 hover:-translate-y-1 active:translate-y-0"
            >
              <Plus className="w-4.5 h-4.5" />
              <span>Tambah Tipe Baru</span>
            </button>
          </div>
        </div>

        <DataTable columns={columns} data={reimbursement_types} searchPlaceholder="Cari tipe reimbursement..." />
      </div>

      <Modal isOpen={modalType === 'reim'} onClose={() => setModalType(null)} title={editingItem ? "Kelola Tipe Reimbursement" : "Tambah Tipe Reimbursement"}>
        <form onSubmit={handleReimSubmit} className="space-y-5 p-2">
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Kode Tipe *</label>
            <input type="text" value={reimForm.data.code} onChange={e => reimForm.setData('code', e.target.value.toUpperCase())} required placeholder="REIM_MED / REIM_TRV" className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-black uppercase focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Nama Tipe Reimbursement *</label>
            <input type="text" value={reimForm.data.name} onChange={e => reimForm.setData('name', e.target.value)} required placeholder="Kesehatan / Perjalanan Dinas" className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Max Limit per Klaim (Rp) *</label>
            <input type="number" value={reimForm.data.max_limit_per_claim} onChange={e => reimForm.setData('max_limit_per_claim', e.target.value)} required className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setModalType(null)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors">
              Batal
            </button>
            <button type="submit" disabled={reimForm.processing} className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50">
              {reimForm.processing ? 'Menyimpan...' : (editingItem ? 'Simpan Perubahan' : 'Simpan Data')}
            </button>
          </div>
        </form>
      </Modal>
    </AuthenticatedLayout>
  );
}
