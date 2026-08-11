import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import DataTable from '@/Components/DataTable';
import Select2 from '@/Components/Select2';
import { useForm, Head, router } from '@inertiajs/react';
import { Banknote, Plus, Calculator, PlusCircle, MinusCircle, Pencil, Trash2 } from 'lucide-react';
import { showConfirm, showSuccess } from '@/Utils/swal';

export default function Payroll({ payroll_components }) {
  const [modalType, setModalType] = useState(null);
  const [editingPayroll, setEditingPayroll] = useState(null);
  const payrollForm = useForm({ code: '', name: '', type: 'earning', calculation_type: 'fixed', default_amount: 0, formula_expression: '' });

  const openCreateModal = () => {
    setEditingPayroll(null);
    payrollForm.setData({ code: '', name: '', type: 'earning', calculation_type: 'fixed', default_amount: 0, formula_expression: '' });
    payrollForm.clearErrors();
    setModalType('payroll');
  };

  const openEditModal = (pc) => {
    setEditingPayroll(pc);
    payrollForm.setData({
      code: pc.code,
      name: pc.name,
      type: pc.type || 'earning',
      calculation_type: pc.calculation_type || 'fixed',
      default_amount: pc.default_amount || 0,
      formula_expression: pc.formula_expression || ''
    });
    payrollForm.clearErrors();
    setModalType('payroll');
  };

  const handlePayrollSubmit = (e) => {
    e.preventDefault();
    if (editingPayroll) {
      showConfirm({
        title: 'Perbarui Komponen Payroll?',
        text: `Apakah Anda yakin ingin memperbarui komponen payroll "${payrollForm.data.name}"?`,
        icon: 'question',
        confirmText: 'Ya, Perbarui',
        onConfirm: () => {
          payrollForm.put(route('master.payroll-components.update', editingPayroll.id), {
            onSuccess: () => {
              setModalType(null);
              setEditingPayroll(null);
              showSuccess('Berhasil!', 'Komponen payroll berhasil diperbarui.');
            }
          });
        }
      });
    } else {
      showConfirm({
        title: 'Tambah Komponen Payroll?',
        text: `Apakah Anda yakin ingin menambahkan komponen payroll "${payrollForm.data.name}"?`,
        icon: 'question',
        confirmText: 'Ya, Simpan',
        onConfirm: () => {
          payrollForm.post(route('master.payroll-components.store'), {
            onSuccess: () => {
              setModalType(null);
              payrollForm.reset();
              showSuccess('Berhasil!', 'Komponen payroll baru berhasil ditambahkan.');
            }
          });
        }
      });
    }
  };

  const handleDelete = (pc) => {
    showConfirm({
      title: 'Hapus Komponen Payroll?',
      text: `Apakah Anda yakin ingin menghapus komponen "${pc.name}"?`,
      icon: 'error',
      confirmText: 'Ya, Hapus',
      onConfirm: () => {
        router.delete(route('master.payroll-components.destroy', pc.id), {
          onSuccess: () => showSuccess('Berhasil!', 'Komponen payroll berhasil dihapus.')
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
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-700 text-white font-black text-sm flex items-center justify-center shadow-[0_4px_15px_rgba(0,0,0,0.1)] group-hover/item:from-brand-600 group-hover/item:to-brand-500 transition-all duration-300 group-hover/item:scale-105 group-hover/item:shadow-[0_8px_20px_rgba(var(--brand-500-rgb),0.3)] ring-2 ring-white">
              {row.type === 'earning' ? <PlusCircle className="w-5 h-5 text-emerald-300" /> : <MinusCircle className="w-5 h-5 text-rose-300" />}
            </div>
            {row.type === 'earning' ? (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm"></div>
            ) : (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-rose-500 border-2 border-white rounded-full shadow-sm"></div>
            )}
          </div>
          <div>
            <div className="font-black text-slate-900 text-sm tracking-tight group-hover/item:text-brand-700 transition-colors">
              {row.name}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-[9px] font-black text-slate-600 tracking-wider bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 uppercase">
                {row.code}
              </span>
              {row.type === 'earning' ? (
                <span className="inline-flex items-center text-[9px] font-black uppercase text-emerald-600 tracking-wider bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  Pendapatan
                </span>
              ) : (
                <span className="inline-flex items-center text-[9px] font-black uppercase text-rose-600 tracking-wider bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                  Potongan
                </span>
              )}
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Kalkulasi & Nilai',
      render: (row) => (
        <div className="text-xs">
          <div className="font-mono font-extrabold text-slate-900 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 inline-block shadow-sm">
            {row.calculation_type === 'formula' ? (
              <span className="text-blue-700">{row.formula_expression}</span>
            ) : (
              <span className={row.type === 'earning' ? 'text-emerald-700' : 'text-rose-700'}>
                Rp {Number(row.default_amount).toLocaleString('id-ID')}
              </span>
            )}
          </div>
          <div className="mt-1.5 flex items-center gap-1.5">
            <Calculator className="w-3.5 h-3.5 text-slate-400" />
            {row.calculation_type === 'formula' ? (
              <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Formula Dinamis</span>
            ) : (
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Nilai Tetap (Fixed)</span>
            )}
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
    <AuthenticatedLayout headerTitle="Pengaturan Komponen Gaji">
      <Head title="Komponen Gaji" />
      <div className="space-y-8">
        <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl p-8 rounded-3xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-500/20 transition-all duration-700"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 group-hover:bg-purple-500/20 transition-all duration-700"></div>
          
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-brand-50 border border-brand-100 rounded-full text-brand-700 text-[10px] font-black uppercase tracking-widest mb-3 shadow-sm">
                <Banknote className="w-3 h-3" />
                <span>Data Induk</span>
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <span>Komponen & Formula Payroll</span>
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-2 max-w-xl leading-relaxed">
                Kelola komponen pendapatan (earnings) dan potongan (deductions).
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center space-x-2 px-6 py-3.5 bg-slate-900 hover:bg-brand-600 text-white font-bold text-sm rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_25px_rgba(var(--brand-600-rgb),0.3)] transition-all duration-300 hover:-translate-y-1 active:translate-y-0"
            >
              <Plus className="w-4.5 h-4.5" />
              <span>Tambah Komponen</span>
            </button>
          </div>
        </div>

        <DataTable columns={columns} data={payroll_components} searchPlaceholder="Cari kode atau nama komponen..." />
      </div>

      <Modal isOpen={modalType === 'payroll'} onClose={() => setModalType(null)} title={editingPayroll ? "Kelola Komponen Payroll" : "Tambah Komponen Payroll"}>
        <form onSubmit={handlePayrollSubmit} className="space-y-5 p-2">
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Kode Komponen *</label>
            <input type="text" value={payrollForm.data.code} onChange={e => payrollForm.setData('code', e.target.value.toUpperCase())} required placeholder="TUNJ_MAKAN / POT_BPJS" className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-black uppercase focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Nama Komponen *</label>
            <input type="text" value={payrollForm.data.name} onChange={e => payrollForm.setData('name', e.target.value)} required placeholder="Tunjangan Makan / BPJS Ketenagakerjaan" className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Tipe *</label>
              <Select2
                value={payrollForm.data.type}
                onChange={e => payrollForm.setData('type', e.target.value)}
                options={[
                  { value: 'earning', label: 'Earning (Pendapatan)' },
                  { value: 'deduction', label: 'Deduction (Potongan)' }
                ]}
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Metode Kalkulasi *</label>
              <Select2
                value={payrollForm.data.calculation_type}
                onChange={e => payrollForm.setData('calculation_type', e.target.value)}
                options={[
                  { value: 'fixed', label: 'Fixed Amount' },
                  { value: 'formula', label: 'Dynamic Formula' }
                ]}
              />
            </div>
          </div>
          {payrollForm.data.calculation_type === 'fixed' ? (
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Nilai Rupiah (Default Amount) *</label>
              <input type="number" value={payrollForm.data.default_amount} onChange={e => payrollForm.setData('default_amount', e.target.value)} required className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Ekspresi Formula *</label>
              <input type="text" value={payrollForm.data.formula_expression} onChange={e => payrollForm.setData('formula_expression', e.target.value)} required placeholder="e.g. BASIC_SALARY * 0.1" className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono font-bold text-blue-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
            </div>
          )}
          
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setModalType(null)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors">
              Batal
            </button>
            <button type="submit" disabled={payrollForm.processing} className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50">
              {payrollForm.processing ? 'Menyimpan...' : (editingPayroll ? 'Simpan Perubahan' : 'Simpan Data')}
            </button>
          </div>
        </form>
      </Modal>
    </AuthenticatedLayout>
  );
}
