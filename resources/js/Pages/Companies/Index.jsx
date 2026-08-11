import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DataTable from '@/Components/DataTable';
import StatusBadge from '@/Components/StatusBadge';
import Modal from '@/Components/Modal';
import { useForm, Head } from '@inertiajs/react';
import { Plus, Building2, Globe, Mail, Phone } from 'lucide-react';
import { showConfirm, showSuccess } from '@/Utils/swal';

export default function CompaniesIndex({ companies }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, setData, post, processing, reset, errors } = useForm({
    code: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    tax_id: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    showConfirm({
      title: 'Tambah Perusahaan Baru?',
      text: `Apakah Anda yakin ingin menambahkan perusahaan "${data.name}" (${data.code})?`,
      icon: 'question',
      confirmText: 'Ya, Simpan Perusahaan',
      onConfirm: () => {
        post(route('companies.store'), {
          onSuccess: () => {
            setIsModalOpen(false);
            reset();
            showSuccess('Berhasil!', 'Perusahaan baru telah berhasil ditambahkan.');
          },
        });
      }
    });
  };

  const columns = [
    {
      header: 'Kode & Nama Perusahaan',
      accessor: (row) => row.name,
      render: (row) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 text-white flex items-center justify-center font-black text-xs border border-brand-400 shadow-xs">
            {row.code}
          </div>
          <div>
            <div className="font-extrabold text-slate-900 text-sm tracking-tight">{row.name}</div>
            <div className="text-xs text-slate-500 font-mono">NPWP: {row.tax_id || '-'}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Kontak & Email',
      render: (row) => (
        <div className="text-xs space-y-0.5 font-semibold">
          <div className="flex items-center space-x-1.5 text-slate-700">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            <span>{row.email || '-'}</span>
          </div>
          <div className="flex items-center space-x-1.5 text-slate-500">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            <span>{row.phone || '-'}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Jumlah Karyawan',
      render: (row) => (
        <span className="inline-flex items-center px-3 py-1 rounded-xl bg-slate-100 text-slate-800 font-black text-xs border border-slate-200/60">
          {row.employees_count || 0} Karyawan
        </span>
      ),
    },
    {
      header: 'Status',
      render: (row) => <StatusBadge status={row.is_active ? 'active' : 'inactive'} />,
    },
  ];

  return (
    <AuthenticatedLayout headerTitle="Data Perusahaan">
      <Head title="Data Perusahaan" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-brand-600" />
            <span>Manajemen Perusahaan (Tenant)</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Kelola pendaftaran perusahaan dan isolasi data per company ID.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-2 px-5 py-3 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-brand-600/30 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Perusahaan Baru</span>
        </button>
      </div>

      <DataTable columns={columns} data={companies} searchPlaceholder="Cari perusahaan..." />

      {/* Add Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Perusahaan Baru">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Kode Perusahaan (Unik)</label>
              <input
                type="text"
                value={data.code}
                onChange={(e) => setData('code', e.target.value.toUpperCase())}
                required
                placeholder="CONTOH: NDI"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-black uppercase"
              />
              {errors.code && <span className="text-xs text-rose-600">{errors.code}</span>}
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Nama Perusahaan</label>
              <input
                type="text"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                required
                placeholder="PT Nusantara Digital Indonesia"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Email Perusahaan</label>
              <input
                type="email"
                value={data.email}
                onChange={(e) => setData('email', e.target.value)}
                placeholder="corporate@company.com"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Telepon</label>
              <input
                type="text"
                value={data.phone}
                onChange={(e) => setData('phone', e.target.value)}
                placeholder="021-5551234"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Alamat Lengkap</label>
            <textarea
              value={data.address}
              onChange={(e) => setData('address', e.target.value)}
              rows="2"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold"
            ></textarea>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={processing}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-brand-600/30 active:scale-95"
            >
              Simpan Perusahaan
            </button>
          </div>
        </form>
      </Modal>
    </AuthenticatedLayout>
  );
}
