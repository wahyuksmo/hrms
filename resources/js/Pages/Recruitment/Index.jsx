import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import Select2 from '@/Components/Select2';
import { UserPlus, Briefcase, Plus, ExternalLink, Users, Calendar, Sparkles, Copy, Check } from 'lucide-react';
import { Head, Link, useForm } from '@inertiajs/react';
import { showConfirm, showSuccess } from '@/Utils/swal';

export default function RecruitmentIndex({ vacancies, departments, positions }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const { data, setData, post, processing, errors, reset } = useForm({
    title: '',
    department_id: '',
    position_id: '',
    employment_type: 'Full-Time',
    job_description: '',
    requirements: '',
    require_mcu: true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    showConfirm({
      title: 'Buat Lowongan Pekerjaan?',
      text: `Apakah Anda yakin ingin publikasikan lowongan "${data.title}"?`,
      icon: 'question',
      confirmText: 'Ya, Publikasikan',
      onConfirm: () => {
        post(route('recruitment.vacancies.store'), {
          onSuccess: () => {
            setModalOpen(false);
            reset();
            showSuccess('Berhasil!', 'Lowongan pekerjaan baru telah dipublikasikan.');
          }
        });
      }
    });
  };

  const handleCopyLink = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    showSuccess('Berhasil!', 'Link Portal Publik Disalin ke Clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <AuthenticatedLayout headerTitle="Rekrutmen & Lowongan">
      <Head title="Rekrutmen & Lowongan" />

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Briefcase className="w-6 h-6 text-brand-600" />
            <span>Recruitment Pipeline Manager</span>
          </h1>
          <p className="text-slate-500 font-medium text-xs mt-1">
            Kelola lowongan pekerjaan, salin link publik loker, evaluasi kandidat, hingga 1-Click Hire dengan Auto-Generate NIK.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/recruitment/candidate-pool"
            className="inline-flex items-center space-x-2 px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs rounded-2xl transition-all active:scale-95"
          >
            <Users className="w-4 h-4 text-brand-600" />
            <span>Candidate Pool (Talent Bank)</span>
          </Link>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center space-x-2 px-5 py-3 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-brand-600/30 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Lowongan Pekerjaan Baru</span>
          </button>
        </div>
      </div>

      {/* Vacancies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vacancies && vacancies.length > 0 ? (
          vacancies.map((vacancy) => (
            <div key={vacancy.id} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col justify-between hover:shadow-lg transition-all group">
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <span className="inline-block text-[10px] font-black uppercase tracking-wider text-brand-700 bg-brand-50 px-3 py-1 rounded-xl border border-brand-100">
                    {vacancy.department?.name || 'Dept'}
                  </span>
                  <span className="text-xs font-black text-slate-500 font-mono bg-slate-100 px-2.5 py-0.5 rounded-lg">
                    {vacancy.candidates?.length || 0} Pelamar
                  </span>
                </div>

                <h3 className="text-xl font-black text-slate-900 tracking-tight mb-1 group-hover:text-brand-600 transition-colors">{vacancy.title}</h3>
                <p className="text-xs font-bold text-slate-500 mb-4">{vacancy.position?.name} • {vacancy.employment_type}</p>

                {/* Shareable Link Box */}
                <div className="p-3 bg-slate-50/80 border border-slate-200/80 rounded-2xl mb-4 text-xs font-mono flex items-center justify-between shadow-xs">
                  <span className="truncate text-slate-600 font-semibold mr-2">{vacancy.shareable_public_url}</span>
                  <button
                    onClick={() => handleCopyLink(vacancy.shareable_public_url, vacancy.id)}
                    className="shrink-0 p-2 bg-white border border-slate-200/80 rounded-xl hover:bg-brand-50 hover:text-brand-600 text-slate-700 transition-all active:scale-95"
                    title="Copy Link Loker Publik"
                  >
                    {copiedId === vacancy.id ? <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <a
                  href={vacancy.shareable_public_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1.5 text-xs font-extrabold text-slate-600 hover:text-brand-600 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Preview Portal</span>
                </a>

                <Link
                  href={route('recruitment.candidates', vacancy.id)}
                  className="inline-flex items-center space-x-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-brand-600/30 transition-all active:scale-95"
                >
                  <Users className="w-4 h-4" />
                  <span>Pipeline Pelamar</span>
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
            <UserPlus className="w-12 h-12 text-slate-300 mx-auto mb-3 stroke-[1.5]" />
            <h3 className="text-base font-extrabold text-slate-800">Belum ada Lowongan Pekerjaan aktif</h3>
            <p className="text-xs text-slate-400 font-semibold mt-1">Klik tombol di atas untuk membuka lowongan baru.</p>
          </div>
        )}
      </div>

      {/* Modal Add Vacancy */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Buat Lowongan Pekerjaan Baru">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">Judul Posisi Lowongan Pekerjaan *</label>
            <input
              type="text"
              required
              value={data.title}
              onChange={(e) => setData('title', e.target.value)}
              placeholder="Contoh: Senior Fullstack Developer"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">Departemen *</label>
              <Select2
                required
                value={data.department_id}
                onChange={(e) => setData('department_id', e.target.value)}
                placeholder="-- Pilih Departemen --"
                options={[
                  { value: '', label: '-- Pilih Departemen --' },
                  ...departments.map((d) => ({ value: d.id, label: d.name }))
                ]}
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">Jabatan / Posisi *</label>
              <Select2
                required
                value={data.position_id}
                onChange={(e) => setData('position_id', e.target.value)}
                placeholder="-- Pilih Posisi --"
                options={[
                  { value: '', label: '-- Pilih Posisi --' },
                  ...positions.map((p) => ({ value: p.id, label: p.name }))
                ]}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">Tipe Pekerjaan *</label>
            <Select2
              value={data.employment_type}
              onChange={(e) => setData('employment_type', e.target.value)}
              options={[
                { value: 'Full-Time', label: 'Full-Time' },
                { value: 'Contract', label: 'Contract' },
                { value: 'Internship', label: 'Internship' }
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">Deskripsi Pekerjaan</label>
            <textarea
              rows={3}
              value={data.job_description}
              onChange={(e) => setData('job_description', e.target.value)}
              placeholder="Tugas & Tanggung jawab pekerjaan..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">Kualifikasi & Persyaratan</label>
            <textarea
              rows={3}
              value={data.requirements}
              onChange={(e) => setData('requirements', e.target.value)}
              placeholder="Persyaratan pendidikan, pengalaman, dan skill..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
            />
          </div>

          <div className="pt-4 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={processing}
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-brand-600/30 transition-all active:scale-95"
            >
              Simpan Lowongan
            </button>
          </div>
        </form>
      </Modal>
    </AuthenticatedLayout>
  );
}
