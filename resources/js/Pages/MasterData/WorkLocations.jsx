import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import DataTable from '@/Components/DataTable';
import Select2 from '@/Components/Select2';
import LocationPickerMap from '@/Components/LocationPickerMap';
import { useForm, Head, router } from '@inertiajs/react';
import { MapPin, Plus, Users, Building, Briefcase, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { showConfirm, showSuccess } from '@/Utils/swal';

export default function WorkLocations({ locations }) {
  const [modalType, setModalType] = useState(null); // 'create' | 'edit'
  const [editingLoc, setEditingLoc] = useState(null);

  const locForm = useForm({
    code: '',
    name: '',
    type: 'office',
    address: '',
    latitude: -6.2088,
    longitude: 106.8456,
    radius_meters: 100,
    is_active: true,
  });

  const openCreateModal = () => {
    setEditingLoc(null);
    locForm.setData({
      code: `LOC-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      type: 'office',
      address: '',
      latitude: -6.2088,
      longitude: 106.8456,
      radius_meters: 100,
      is_active: true,
    });
    locForm.clearErrors();
    setModalType('create');
  };

  const openEditModal = (loc) => {
    setEditingLoc(loc);
    locForm.setData({
      code: loc.code || '',
      name: loc.name || '',
      type: loc.type || 'office',
      address: loc.address || '',
      latitude: loc.latitude || -6.2088,
      longitude: loc.longitude || 106.8456,
      radius_meters: loc.radius_meters || 100,
      is_active: loc.is_active !== undefined ? !!loc.is_active : true,
    });
    locForm.clearErrors();
    setModalType('edit');
  };

  const handleLocSubmit = (e) => {
    e.preventDefault();
    if (modalType === 'create') {
      showConfirm({
        title: 'Tambah Master Lokasi?',
        text: `Apakah Anda yakin ingin menambahkan lokasi presensi "${locForm.data.name}"?`,
        icon: 'question',
        confirmText: 'Ya, Simpan',
        onConfirm: () => {
          locForm.post(route('master.locations.store'), {
            onSuccess: () => {
              setModalType(null);
              locForm.reset();
              showSuccess('Berhasil!', 'Master lokasi kerja baru berhasil ditambahkan.');
            }
          });
        }
      });
    } else if (modalType === 'edit' && editingLoc) {
      showConfirm({
        title: 'Perbarui Master Lokasi?',
        text: `Apakah Anda yakin ingin memperbarui data lokasi "${locForm.data.name}"?`,
        icon: 'question',
        confirmText: 'Ya, Perbarui',
        onConfirm: () => {
          locForm.put(route('master.locations.update', editingLoc.id), {
            onSuccess: () => {
              setModalType(null);
              setEditingLoc(null);
              showSuccess('Berhasil!', 'Master lokasi kerja berhasil diperbarui.');
            }
          });
        }
      });
    }
  };

  const handleDelete = (loc) => {
    showConfirm({
      title: 'Hapus Lokasi Kerja?',
      text: `Apakah Anda yakin ingin menghapus lokasi "${loc.name}"?`,
      icon: 'error',
      confirmText: 'Ya, Hapus',
      onConfirm: () => {
        router.delete(route('master.locations.destroy', loc.id), {
          onSuccess: () => showSuccess('Berhasil!', 'Lokasi kerja berhasil dihapus.')
        });
      }
    });
  };

  const columns = [
    {
      header: 'Nama & Info Lokasi',
      accessor: (row) => `${row.code} ${row.name}`,
      render: (row) => (
        <div className="flex items-center space-x-4 group/item cursor-pointer">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-700 text-white font-black text-sm flex items-center justify-center shadow-[0_4px_15px_rgba(0,0,0,0.1)] group-hover/item:from-brand-600 group-hover/item:to-brand-500 transition-all duration-300 group-hover/item:scale-105 group-hover/item:shadow-[0_8px_20px_rgba(var(--brand-500-rgb),0.3)] ring-2 ring-white">
              {row.type === 'customer_site' ? <Briefcase className="w-5 h-5 text-amber-300" /> : <Building className="w-5 h-5 text-blue-300" />}
            </div>
          </div>
          <div>
            <div className="font-black text-slate-900 text-sm tracking-tight group-hover/item:text-brand-700 transition-colors">
              {row.name}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-[9px] font-black text-slate-600 tracking-wider bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                {row.code || `LOC-${row.id}`}
              </span>
              {row.type === 'customer_site' ? (
                <span className="inline-flex items-center text-[9px] font-black uppercase text-amber-600 tracking-wider bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                  Customer Site
                </span>
              ) : (
                <span className="inline-flex items-center text-[9px] font-black uppercase text-blue-600 tracking-wider bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                  Kantor Internal
                </span>
              )}
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Alamat',
      render: (row) => (
        <p className="text-xs text-slate-500 line-clamp-2 max-w-xs">{row.address || 'Alamat belum diisi'}</p>
      )
    },
    {
      header: 'Geofence & Status',
      render: (row) => (
        <div className="text-xs">
          <div className="flex items-center space-x-3 mb-2">
            <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100 text-[10px]">
              Radius: {row.radius_meters}m
            </span>
            <a
              href={`https://maps.google.com/?q=${row.latitude},${row.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-600 hover:text-brand-800 flex items-center gap-1 font-bold text-[10px] bg-brand-50 px-2 py-0.5 rounded-lg border border-brand-100 transition-colors"
              title="Buka di Maps"
            >
              <ExternalLink className="w-3 h-3" /> Maps
            </a>
          </div>
          <div className="flex items-center space-x-2">
            {row.is_active ? (
              <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Aktif
              </span>
            ) : (
              <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div> Non-Aktif
              </span>
            )}
            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 ml-2">
              <Users className="w-3 h-3" /> {row.employees_count || 0} Karyawan
            </span>
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
    <AuthenticatedLayout headerTitle="Pengaturan Lokasi Kerja">
      <Head title="Lokasi Kerja" />
      <div className="space-y-8">
        <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl p-8 rounded-3xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-500/20 transition-all duration-700"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 group-hover:bg-purple-500/20 transition-all duration-700"></div>
          
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-brand-50 border border-brand-100 rounded-full text-brand-700 text-[10px] font-black uppercase tracking-widest mb-3 shadow-sm">
                <MapPin className="w-3 h-3" />
                <span>Data Induk</span>
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <span>Master Lokasi Kerja</span>
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-2 max-w-xl leading-relaxed">
                Kelola daftar lokasi kantor internal dan lokasi penugasan pelanggan untuk presensi.
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center space-x-2 px-6 py-3.5 bg-slate-900 hover:bg-brand-600 text-white font-bold text-sm rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_25px_rgba(var(--brand-600-rgb),0.3)] transition-all duration-300 hover:-translate-y-1 active:translate-y-0"
            >
              <Plus className="w-4.5 h-4.5" />
              <span>Tambah Lokasi Baru</span>
            </button>
          </div>
        </div>

        <DataTable columns={columns} data={locations} searchPlaceholder="Cari kode atau nama lokasi..." />
      </div>

      <Modal isOpen={!!modalType} onClose={() => setModalType(null)} title={modalType === 'create' ? "Tambah Master Lokasi Kerja Baru" : `Kelola Lokasi: ${editingLoc?.name}`}>
        <form onSubmit={handleLocSubmit} className="space-y-5 p-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Kode Lokasi *</label>
              <input type="text" value={locForm.data.code} onChange={e => locForm.setData('code', e.target.value)} required placeholder="LOC-HQ" className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Tipe Lokasi *</label>
              <Select2
                value={locForm.data.type}
                onChange={e => locForm.setData('type', e.target.value)}
                options={[
                  { value: 'office', label: 'Kantor Internal / HQ' },
                  { value: 'customer_site', label: 'Customer / Client Site' }
                ]}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Nama Lokasi / Customer *</label>
            <input type="text" value={locForm.data.name} onChange={e => locForm.setData('name', e.target.value)} required placeholder="Contoh: Kantor Pusat Slipi / PT Acme Customer Site" className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Alamat Lengkap</label>
            <textarea value={locForm.data.address} onChange={e => locForm.setData('address', e.target.value)} rows={2} placeholder="Jl. Sudirman No. 123..." className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" />
          </div>

          <div className="rounded-xl overflow-hidden border border-slate-200">
            <LocationPickerMap
              latitude={locForm.data.latitude}
              longitude={locForm.data.longitude}
              radiusMeters={locForm.data.radius_meters}
              onChange={({ latitude, longitude }) => {
                locForm.setData((prev) => ({ ...prev, latitude, longitude }));
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Latitude GPS *</label>
              <input type="number" step="any" value={locForm.data.latitude} onChange={e => locForm.setData('latitude', parseFloat(e.target.value) || 0)} required className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Longitude GPS *</label>
              <input type="number" step="any" value={locForm.data.longitude} onChange={e => locForm.setData('longitude', parseFloat(e.target.value) || 0)} required className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Radius Toleransi Presensi (Meter) *</label>
            <input type="number" value={locForm.data.radius_meters} onChange={e => locForm.setData('radius_meters', parseInt(e.target.value))} required min={10} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" />
          </div>

          <div className="flex items-center space-x-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <input
              type="checkbox"
              id="is_active_loc"
              checked={locForm.data.is_active}
              onChange={e => locForm.setData('is_active', e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <label htmlFor="is_active_loc" className="text-xs font-extrabold text-slate-700 cursor-pointer">
              Aktifkan Lokasi Ini Untuk Presensi
            </label>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setModalType(null)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors">
              Batal
            </button>
            <button type="submit" disabled={locForm.processing} className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50">
              {locForm.processing ? 'Menyimpan...' : (modalType === 'create' ? 'Simpan Data' : 'Simpan Perubahan')}
            </button>
          </div>
        </form>
      </Modal>
    </AuthenticatedLayout>
  );
}
