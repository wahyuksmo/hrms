import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import DataTable from '@/Components/DataTable';
import { useForm, router, Head } from '@inertiajs/react';
import { GitMerge, Plus, Trash2, Pencil, CheckCircle2 } from 'lucide-react';
import { showConfirm, showSuccess } from '@/Utils/swal';
import Select2 from '@/Components/Select2';

export default function ApprovalTemplates({ templates, employees = [], departments = [] }) {
  const [modalType, setModalType] = useState(null);
  
  const form = useForm({
    module: 'LeaveRequest',
    name: '',
    is_active: true,
    steps: [
      { step_number: 1, approver_type: 'atasan', approver_id: 1 }
    ]
  });

  const [editingId, setEditingId] = useState(null);

  const handleAddStep = () => {
    form.setData('steps', [
      ...form.data.steps,
      { step_number: form.data.steps.length + 1, approver_type: 'atasan', approver_id: '1' }
    ]);
  };

  const handleRemoveStep = (index) => {
    const newSteps = [...form.data.steps];
    newSteps.splice(index, 1);
    // re-number steps
    newSteps.forEach((s, i) => s.step_number = i + 1);
    form.setData('steps', newSteps);
  };

  const updateStep = (index, field, value) => {
    const newSteps = [...form.data.steps];
    newSteps[index][field] = value;
    form.setData('steps', newSteps);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modalType === 'edit') {
      showConfirm({
        title: 'Perbarui Template?',
        text: 'Apakah Anda yakin ingin memperbarui template persetujuan ini?',
        icon: 'question',
        confirmText: 'Ya, Perbarui',
        onConfirm: () => {
          form.put(route('master.approval-templates.update', editingId), {
            onSuccess: () => {
              setModalType(null);
              setEditingId(null);
              form.reset();
              showSuccess('Berhasil', 'Template approval berhasil diperbarui');
            }
          });
        }
      });
    } else {
      showConfirm({
        title: 'Simpan Template?',
        text: 'Apakah Anda yakin ingin menyimpan template persetujuan ini?',
        icon: 'question',
        confirmText: 'Ya, Simpan',
        onConfirm: () => {
          form.post(route('master.approval-templates.store'), {
            onSuccess: () => {
              setModalType(null);
              form.reset();
              showSuccess('Berhasil', 'Template approval berhasil ditambahkan');
            }
          });
        }
      });
    }
  };

  const editTemplate = (tpl) => {
    setEditingId(tpl.id);
    form.setData({
      module: tpl.module,
      name: tpl.name,
      is_active: tpl.is_active,
      steps: tpl.steps.map(s => ({
        step_number: s.step_number,
        approver_type: s.approver_type,
        approver_id: String(s.approver_id)
      }))
    });
    form.clearErrors();
    setModalType('edit');
  };

  const deleteTemplate = (id) => {
    showConfirm({
      title: 'Hapus Template?',
      text: 'Apakah Anda yakin ingin menghapus template ini?',
      icon: 'error',
      confirmText: 'Ya, Hapus',
      onConfirm: () => {
        router.delete(route('master.approval-templates.destroy', id), {
          onSuccess: () => showSuccess('Berhasil', 'Template approval berhasil dihapus')
        });
      }
    });
  };

  const getApproverLabel = (step) => {
    if (step.approver_type === 'atasan') return `Atasan Level ${step.approver_id}`;
    if (step.approver_type === 'employee') {
      const emp = employees.find(e => String(e.id) === String(step.approver_id));
      return emp ? emp.full_name : `ID: ${step.approver_id}`;
    }
    if (step.approver_type === 'department') {
      const dept = departments.find(d => String(d.id) === String(step.approver_id));
      return dept ? dept.name : `ID: ${step.approver_id}`;
    }
    return `ID: ${step.approver_id}`;
  };

  const columns = [
    {
      header: 'Modul',
      accessor: 'module',
      render: (row) => (
        <div>
          <span className="font-mono text-[11px] font-black text-brand-700 bg-brand-50 px-3 py-1.5 rounded-xl border border-brand-100">{row.module}</span>
          <div className="mt-2">
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${row.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
              {row.is_active ? 'AKTIF' : 'NON-AKTIF'}
            </span>
          </div>
        </div>
      )
    },
    {
      header: 'Nama Template',
      accessor: 'name',
      render: (row) => (
        <div className="font-black text-slate-900">{row.name}</div>
      )
    },
    {
      header: 'Jenjang Persetujuan',
      render: (row) => (
        <div className="flex flex-wrap gap-2">
          {row.steps.map(step => (
            <div key={step.id} className="inline-flex items-center p-1.5 pr-3 bg-white border border-slate-200 rounded-xl shadow-xs group/step hover:border-brand-200 hover:shadow-md transition-all">
              <div className="w-5 h-5 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-black text-[10px] mr-2 group-hover/step:bg-brand-50 group-hover/step:text-brand-700 transition-colors">
                {step.step_number}
              </div>
              <div className="text-[10px] font-bold text-slate-700 group-hover/step:text-brand-900">
                {getApproverLabel(step)}
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      header: 'Aksi',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => editTemplate(row)}
            className="group/btn px-3 py-1.5 bg-white hover:bg-slate-900 text-slate-700 hover:text-white rounded-xl text-xs font-bold transition-all duration-300 border border-slate-200 hover:border-slate-900 flex items-center gap-1.5 shadow-sm hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 active:translate-y-0"
            title="Edit Data"
          >
            <Pencil className="w-3.5 h-3.5 group-hover/btn:rotate-12 transition-transform" />
            <span>Kelola</span>
          </button>
          <button
            onClick={() => deleteTemplate(row.id)}
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
    <AuthenticatedLayout headerTitle="Pengaturan Template Persetujuan">
      <Head title="Template Persetujuan" />
      <div className="space-y-8">
        <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl p-8 rounded-3xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-500/20 transition-all duration-700"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 group-hover:bg-purple-500/20 transition-all duration-700"></div>
          
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-brand-50 border border-brand-100 rounded-full text-brand-700 text-[10px] font-black uppercase tracking-widest mb-3 shadow-sm">
                <GitMerge className="w-3 h-3" />
                <span>Data Induk</span>
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <span>Approval Templates</span>
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-2 max-w-xl leading-relaxed">
                Kelola jenjang persetujuan dinamis untuk setiap modul.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center">
                <GitMerge className="w-5 h-5" />
              </div>
              <h3 className="font-black text-slate-900 text-xl tracking-tight">Daftar Template</h3>
            </div>
            <button
              onClick={() => { setModalType('create'); form.reset(); form.clearErrors(); }}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-slate-900 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-[0_8px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_25px_rgba(var(--brand-600-rgb),0.3)] transition-all duration-300 hover:-translate-y-1 active:translate-y-0"
            >
              <Plus className="w-4 h-4" />
              <span>Template Baru</span>
            </button>
          </div>
          
          <DataTable columns={columns} data={templates} searchPlaceholder="Cari template..." />
        </div>
      </div>

      <Modal isOpen={modalType !== null} onClose={() => setModalType(null)} title={modalType === 'edit' ? 'Edit Template Approval' : 'Tambah Template Approval'}>
        <div className="p-2">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Pilih Modul *</label>
                <Select2
                  value={form.data.module}
                  onChange={e => form.setData('module', e.target.value)}
                  options={[
                    { value: 'LeaveRequest', label: 'Cuti (LeaveRequest)' },
                    { value: 'ReimbursementRequest', label: 'Reimbursement' },
                    { value: 'AttendanceCorrection', label: 'Koreksi Presensi' },
                    { value: 'Loan', label: 'Kasbon (Loan)' },
                    { value: 'PayrollPeriod', label: 'Payroll' },
                  ]}
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Nama Template *</label>
                <input
                  type="text"
                  value={form.data.name}
                  onChange={e => form.setData('name', e.target.value)}
                  placeholder="Misal: Default Cuti Approval"
                  required
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-xs font-extrabold text-slate-700 uppercase">Setup Jenjang Persetujuan (Steps) *</label>
                <button
                  type="button"
                  onClick={handleAddStep}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-600 font-bold text-[10px] uppercase tracking-wider rounded-lg transition-colors border border-brand-200"
                >
                  <Plus className="w-3 h-3" />
                  <span>Tambah Step</span>
                </button>
              </div>

              <div className="space-y-3">
                {form.data.steps.map((step, index) => (
                  <div key={index} className="flex gap-3 items-center p-3.5 border border-slate-200 rounded-2xl bg-slate-50/50 shadow-sm hover:border-brand-300 transition-colors">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 text-slate-700 flex items-center justify-center font-black text-xs shrink-0 shadow-inner border border-white">
                      {step.step_number}
                    </div>
                    
                    <div className="w-1/3">
                      <Select2
                        value={step.approver_type}
                        onChange={e => updateStep(index, 'approver_type', e.target.value)}
                        options={[
                          { value: 'atasan', label: 'Atasan (Hierarki)' },
                          { value: 'employee', label: 'Karyawan Spesifik' },
                          { value: 'department', label: 'Departemen Spesifik' },
                        ]}
                      />
                    </div>

                    <div className="flex-1">
                      {step.approver_type === 'atasan' && (
                        <Select2
                          value={step.approver_id ? String(step.approver_id) : ''}
                          onChange={e => updateStep(index, 'approver_id', e.target.value)}
                          options={[
                            { value: '1', label: 'Level 1 (Direct Atasan)' },
                            { value: '2', label: 'Level 2' },
                            { value: '3', label: 'Level 3' }
                          ]}
                        />
                      )}
                      {step.approver_type === 'employee' && (
                        <Select2
                          value={step.approver_id ? String(step.approver_id) : ''}
                          onChange={e => updateStep(index, 'approver_id', e.target.value)}
                          options={[
                            { value: '', label: '-- Pilih Karyawan --' },
                            ...employees.map(e => ({
                              value: String(e.id),
                              label: `${e.full_name} (${e.nik})`
                            }))
                          ]}
                        />
                      )}
                      {step.approver_type === 'department' && (
                        <Select2
                          value={step.approver_id ? String(step.approver_id) : ''}
                          onChange={e => updateStep(index, 'approver_id', e.target.value)}
                          options={[
                            { value: '', label: '-- Pilih Departemen --' },
                            ...departments.map(d => ({
                              value: String(d.id),
                              label: d.name
                            }))
                          ]}
                        />
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveStep(index)}
                      className="w-9 h-9 flex items-center justify-center text-rose-500 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-slate-200"
                      disabled={form.data.steps.length === 1}
                      title="Hapus Step"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalType(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={form.processing}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50"
              >
                {modalType === 'edit' ? 'Simpan Perubahan' : 'Simpan Template'}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </AuthenticatedLayout>
  );
}

