import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import DataTable from '@/Components/DataTable';
import { useForm, Head, router } from '@inertiajs/react';
import { Layers, Plus, Building2, Pencil, Trash2 } from 'lucide-react';
import { showConfirm, showSuccess } from '@/Utils/swal';

export default function Organization({ departments, divisions, positions, levels }) {
  const [modalType, setModalType] = useState(null);
  const [editingDept, setEditingDept] = useState(null);
  const [editingLevel, setEditingLevel] = useState(null);

  const deptForm = useForm({ code: '', name: '', description: '' });
  const levelForm = useForm({ name: '', level_grade: 1 });

  const openDeptCreateModal = () => {
    setEditingDept(null);
    deptForm.setData({ code: '', name: '', description: '' });
    deptForm.clearErrors();
    setModalType('dept');
  };

  const openDeptEditModal = (d) => {
    setEditingDept(d);
    deptForm.setData({
      code: d.code,
      name: d.name,
      description: d.description || ''
    });
    deptForm.clearErrors();
    setModalType('dept');
  };

  const handleDeptSubmit = (e) => {
    e.preventDefault();
    if (editingDept) {
      showConfirm({
        title: 'Perbarui Departemen?',
        text: `Apakah Anda yakin ingin memperbarui departemen "${deptForm.data.name}"?`,
        icon: 'question',
        confirmText: 'Ya, Perbarui',
        onConfirm: () => {
          deptForm.put(route('master.departments.update', editingDept.id), {
            onSuccess: () => {
              setModalType(null);
              setEditingDept(null);
              showSuccess('Berhasil!', 'Departemen berhasil diperbarui.');
            }
          });
        }
      });
    } else {
      showConfirm({
        title: 'Tambah Departemen?',
        text: `Apakah Anda yakin ingin menambahkan departemen "${deptForm.data.name}"?`,
        icon: 'question',
        confirmText: 'Ya, Simpan',
        onConfirm: () => {
          deptForm.post(route('master.departments.store'), {
            onSuccess: () => {
              setModalType(null);
              deptForm.reset();
              showSuccess('Berhasil!', 'Departemen baru berhasil ditambahkan.');
            }
          });
        }
      });
    }
  };

  const handleDeptDelete = (d) => {
    showConfirm({
      title: 'Hapus Departemen?',
      text: `Apakah Anda yakin ingin menghapus departemen "${d.name}"?`,
      icon: 'error',
      confirmText: 'Ya, Hapus',
      onConfirm: () => {
        router.delete(route('master.departments.destroy', d.id), {
          onSuccess: () => showSuccess('Berhasil!', 'Departemen berhasil dihapus.')
        });
      }
    });
  };

  const openLevelCreateModal = () => {
    setEditingLevel(null);
    levelForm.setData({ name: '', level_grade: 1 });
    levelForm.clearErrors();
    setModalType('level');
  };

  const openLevelEditModal = (l) => {
    setEditingLevel(l);
    levelForm.setData({
      name: l.name,
      level_grade: l.level_grade
    });
    levelForm.clearErrors();
    setModalType('level');
  };

  const handleLevelSubmit = (e) => {
    e.preventDefault();
    if (editingLevel) {
      showConfirm({
        title: 'Perbarui Level Karyawan?',
        text: `Apakah Anda yakin ingin memperbarui level "${levelForm.data.name}"?`,
        icon: 'question',
        confirmText: 'Ya, Perbarui',
        onConfirm: () => {
          levelForm.put(route('master.levels.update', editingLevel.id), {
            onSuccess: () => {
              setModalType(null);
              setEditingLevel(null);
              showSuccess('Berhasil!', 'Level karyawan berhasil diperbarui.');
            }
          });
        }
      });
    } else {
      showConfirm({
        title: 'Tambah Level Karyawan?',
        text: `Apakah Anda yakin ingin menambahkan level "${levelForm.data.name}" (Grade ${levelForm.data.level_grade})?`,
        icon: 'question',
        confirmText: 'Ya, Simpan',
        onConfirm: () => {
          levelForm.post(route('master.levels.store'), {
            onSuccess: () => {
              setModalType(null);
              levelForm.reset();
              showSuccess('Berhasil!', 'Level karyawan baru berhasil ditambahkan.');
            }
          });
        }
      });
    }
  };

  const handleLevelDelete = (l) => {
    showConfirm({
      title: 'Hapus Level?',
      text: `Apakah Anda yakin ingin menghapus level "${l.name}"?`,
      icon: 'error',
      confirmText: 'Ya, Hapus',
      onConfirm: () => {
        router.delete(route('master.levels.destroy', l.id), {
          onSuccess: () => showSuccess('Berhasil!', 'Level karyawan berhasil dihapus.')
        });
      }
    });
  };

  const deptColumns = [
    {
      header: 'Kode & Departemen',
      accessor: (row) => row.name,
      render: (row) => (
        <div className="flex items-center space-x-4 group/item cursor-pointer">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-700 text-white font-black text-sm flex items-center justify-center shadow-[0_4px_15px_rgba(0,0,0,0.1)] group-hover/item:from-brand-600 group-hover/item:to-brand-500 transition-all duration-300 group-hover/item:scale-105 group-hover/item:shadow-[0_8px_20px_rgba(var(--brand-500-rgb),0.3)] ring-2 ring-white">
              {row.name.charAt(0).toUpperCase()}
            </div>
          </div>
          <div>
            <div className="font-black text-slate-900 text-sm tracking-tight group-hover/item:text-brand-700 transition-colors">
              {row.name}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="text-[10px] font-mono text-slate-600 font-bold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                {row.code}
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Deskripsi',
      render: (row) => (
        <div className="text-xs text-slate-500 font-medium line-clamp-2 max-w-xs">
          {row.description || '-'}
        </div>
      )
    },
    {
      header: 'Aksi',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => openDeptEditModal(row)}
            className="group/btn px-3 py-1.5 bg-white hover:bg-slate-900 text-slate-700 hover:text-white rounded-xl text-xs font-bold transition-all duration-300 border border-slate-200 hover:border-slate-900 flex items-center gap-1.5 shadow-sm hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 active:translate-y-0"
            title="Edit Data"
          >
            <Pencil className="w-3.5 h-3.5 group-hover/btn:rotate-12 transition-transform" />
            <span>Kelola</span>
          </button>
          
          <button
            onClick={() => handleDeptDelete(row)}
            className="group/btn px-3 py-1.5 bg-white hover:bg-rose-600 text-rose-600 hover:text-white rounded-xl text-xs font-bold transition-all duration-300 border border-rose-200 hover:border-rose-600 flex items-center gap-1.5 shadow-sm hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 active:translate-y-0"
            title="Hapus Data"
          >
            <Trash2 className="w-3.5 h-3.5 group-hover/btn:rotate-12 transition-transform" />
          </button>
        </div>
      )
    }
  ];

  const levelColumns = [
    {
      header: 'Level / Golongan',
      accessor: (row) => row.name,
      render: (row) => (
        <div className="flex items-center space-x-4 group/item cursor-pointer">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-700 text-white font-black text-sm flex items-center justify-center shadow-[0_4px_15px_rgba(0,0,0,0.1)] group-hover/item:from-purple-600 group-hover/item:to-purple-500 transition-all duration-300 group-hover/item:scale-105 group-hover/item:shadow-[0_8px_20px_rgba(147,51,234,0.3)] ring-2 ring-white">
              {row.level_grade}
            </div>
          </div>
          <div>
            <div className="font-black text-slate-900 text-sm tracking-tight group-hover/item:text-purple-700 transition-colors">
              {row.name}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="text-[10px] font-mono text-slate-600 font-bold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                Grade: {row.level_grade}
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Aksi',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => openLevelEditModal(row)}
            className="group/btn px-3 py-1.5 bg-white hover:bg-slate-900 text-slate-700 hover:text-white rounded-xl text-xs font-bold transition-all duration-300 border border-slate-200 hover:border-slate-900 flex items-center gap-1.5 shadow-sm hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 active:translate-y-0"
            title="Edit Data"
          >
            <Pencil className="w-3.5 h-3.5 group-hover/btn:rotate-12 transition-transform" />
            <span>Kelola</span>
          </button>
          
          <button
            onClick={() => handleLevelDelete(row)}
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
    <AuthenticatedLayout headerTitle="Struktur Organisasi">
      <Head title="Struktur Organisasi" />
      <div className="space-y-8">
        {/* Header Section */}
        <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl p-8 rounded-3xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-500/20 transition-all duration-700"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 group-hover:bg-purple-500/20 transition-all duration-700"></div>
          
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-brand-50 border border-brand-100 rounded-full text-brand-700 text-[10px] font-black uppercase tracking-widest mb-3 shadow-sm">
                <Layers className="w-3 h-3" />
                <span>Data Induk</span>
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <span>Struktur Organisasi & Level</span>
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-2 max-w-xl leading-relaxed">
                Kelola departemen, divisi, jabatan, dan golongan level karyawan dalam satu tempat.
              </p>
            </div>
          </div>
        </div>

        {/* Departments */}
        <div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-50 text-brand-600 rounded-xl">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="font-black text-slate-900 text-xl tracking-tight">Master Departemen</h3>
            </div>
            <button onClick={openDeptCreateModal} className="inline-flex items-center space-x-2 px-5 py-3 bg-slate-900 hover:bg-brand-600 text-white font-bold text-sm rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_25px_rgba(var(--brand-600-rgb),0.3)] transition-all duration-300 hover:-translate-y-1 active:translate-y-0">
              <Plus className="w-4 h-4" /> <span>Tambah Dept</span>
            </button>
          </div>
          <DataTable columns={deptColumns} data={departments} searchPlaceholder="Cari departemen atau kode..." />
        </div>

        {/* Employee Levels */}
        <div className="mt-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-black text-slate-900 text-xl tracking-tight">Master Level Karyawan</h3>
            </div>
            <button onClick={openLevelCreateModal} className="inline-flex items-center space-x-2 px-5 py-3 bg-slate-900 hover:bg-purple-600 text-white font-bold text-sm rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_25px_rgba(147,51,234,0.3)] transition-all duration-300 hover:-translate-y-1 active:translate-y-0">
              <Plus className="w-4 h-4" /> <span>Tambah Level</span>
            </button>
          </div>
          <DataTable columns={levelColumns} data={levels} searchPlaceholder="Cari nama level atau grade..." />
        </div>
      </div>

      {/* Department Modal */}
      <Modal isOpen={modalType === 'dept'} onClose={() => setModalType(null)} title={editingDept ? "Kelola Departemen" : "Tambah Departemen Baru"}>
        <form onSubmit={handleDeptSubmit} className="space-y-5 p-2">
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Kode Dept *</label>
            <input type="text" value={deptForm.data.code} onChange={e => deptForm.setData('code', e.target.value.toUpperCase())} required placeholder="EX: HRD, FIN, ENG" className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-black uppercase focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Nama Departemen *</label>
            <input type="text" value={deptForm.data.name} onChange={e => deptForm.setData('name', e.target.value)} required placeholder="Human Resources" className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Deskripsi</label>
            <textarea value={deptForm.data.description} onChange={e => deptForm.setData('description', e.target.value)} placeholder="Deskripsi singkat..." className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" rows={3}></textarea>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setModalType(null)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors">
              Batal
            </button>
            <button type="submit" disabled={deptForm.processing} className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50">
              {deptForm.processing ? 'Menyimpan...' : (editingDept ? 'Simpan Perubahan' : 'Simpan Data')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Level Modal */}
      <Modal isOpen={modalType === 'level'} onClose={() => setModalType(null)} title={editingLevel ? "Kelola Level / Golongan" : "Tambah Level / Golongan"}>
        <form onSubmit={handleLevelSubmit} className="space-y-5 p-2">
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Nama Level * (ex: Staff, Manager)</label>
            <input type="text" value={levelForm.data.name} onChange={e => levelForm.setData('name', e.target.value)} required className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Grade * (ex: 1, 2, 3)</label>
            <input type="number" value={levelForm.data.level_grade} onChange={e => levelForm.setData('level_grade', e.target.value)} required className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setModalType(null)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors">
              Batal
            </button>
            <button type="submit" disabled={levelForm.processing} className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50">
              {levelForm.processing ? 'Menyimpan...' : (editingLevel ? 'Simpan Perubahan' : 'Simpan Data')}
            </button>
          </div>
        </form>
      </Modal>
    </AuthenticatedLayout>
  );
}
