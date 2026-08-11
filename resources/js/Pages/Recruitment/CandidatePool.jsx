import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import StatusBadge from '@/Components/StatusBadge';
import Select2 from '@/Components/Select2';
import { 
  Users, UserCheck, RefreshCw, Search, Eye, Filter, ArrowLeft, 
  Building2, Briefcase, GraduationCap, XCircle, AlertCircle, Sparkles
} from 'lucide-react';
import { Head, Link, useForm } from '@inertiajs/react';
import { showConfirm, showSuccess } from '@/Utils/swal';

export default function CandidatePool({ candidates, active_vacancies }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);

  const restoreForm = useForm({
    job_vacancy_id: active_vacancies[0] ? active_vacancies[0].id : '',
  });

  const handleOpenRestore = (candidate) => {
    setSelectedCandidate(candidate);
    restoreForm.setData('job_vacancy_id', active_vacancies[0] ? active_vacancies[0].id : '');
    setRestoreModalOpen(true);
  };

  const handleOpenDetail = (candidate) => {
    setSelectedCandidate(candidate);
    setDetailModalOpen(true);
  };

  const submitRestore = (e) => {
    e.preventDefault();
    showConfirm({
      title: 'Aktifkan Kembali Kandidat?',
      text: `Memindahkan ${selectedCandidate.full_name} dari Candidate Pool ke lowongan kerja aktif?`,
      icon: 'question',
      confirmText: 'Ya, Aktifkan',
      onConfirm: () => {
        restoreForm.post(route('recruitment.candidate.restore', selectedCandidate.id), {
          onSuccess: () => {
            setRestoreModalOpen(false);
            showSuccess('Berhasil!', 'Kandidat berhasil diaktifkan kembali ke alur seleksi.');
          }
        });
      }
    });
  };

  const filteredCandidates = candidates ? candidates.filter(c => 
    c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.candidate_code.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <AuthenticatedLayout headerTitle="Kumpulan Kandidat">
      <Head title="Kumpulan Kandidat" />

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <Link href="/recruitment" className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-brand-600 transition-colors">
              <ArrowLeft className="w-4 h-4 text-brand-600" />
              <span>Kembali ke Pipeline Lowongan</span>
            </Link>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Candidate Pool & Database Talent Bank</h1>
          <p className="text-slate-500 font-medium text-xs mt-1">
            Kumpulan kandidat yang pernah melamar / ditolak. Anda dapat meninjau histori tahap gugur dan mengaktifkan kembali kandidat ke alur seleksi lowongan baru.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)] mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama, email, no HP, atau kode..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs"
          />
        </div>

        <div className="text-xs font-extrabold text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200/60">
          Total Pelamar di Pool: <span className="text-brand-600 font-black text-sm ml-1">{filteredCandidates.length}</span>
        </div>
      </div>

      {/* Candidates List Table / Card View for Large Datasets */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <th className="py-4 px-6">Pelamar</th>
                <th className="py-4 px-6">Kontak & Identitas</th>
                <th className="py-4 px-6">Pendidikan & Gaji</th>
                <th className="py-4 px-6">Tahap Gugur / Ditolak</th>
                <th className="py-4 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {filteredCandidates && filteredCandidates.length > 0 ? (
                filteredCandidates.map((c) => {
                  const lastHistory = c.stage_histories && c.stage_histories[0] ? c.stage_histories[0] : null;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center font-black text-rose-700 text-xs shrink-0 shadow-xs">
                            {c.full_name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900 text-sm tracking-tight">{c.full_name}</div>
                            <div className="font-mono text-[10px] text-brand-600 font-bold bg-brand-50 px-2 py-0.5 rounded-md inline-block mt-0.5">{c.candidate_code}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="font-extrabold text-slate-800">{c.email}</div>
                        <div className="text-slate-500 font-semibold">{c.phone}</div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="font-extrabold text-slate-800">{c.education} ({c.major || '-'})</div>
                        <div className="text-slate-500 font-semibold">{c.experience_years} • Expec: Rp {Number(c.expected_salary || 0).toLocaleString('id-ID')}</div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-extrabold">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Ditolak pada: {lastHistory?.stage?.name || c.current_stage?.name || 'Administrasi & Screening'}</span>
                        </div>
                        {lastHistory?.feedback && (
                          <div className="text-[10px] text-slate-500 italic mt-1 max-w-xs truncate">"{lastHistory.feedback}"</div>
                        )}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleOpenDetail(c)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all active:scale-95"
                            title="Lihat Detail Profil"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleOpenRestore(c)}
                            className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs shadow-md shadow-brand-600/30 flex items-center space-x-1.5 transition-all active:scale-95"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Re-activate</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400 font-bold">
                    Belum ada kandidat di Candidate Pool (Talent Bank).
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail Profil */}
      {selectedCandidate && (
        <Modal isOpen={detailModalOpen} onClose={() => setDetailModalOpen(false)} title={`Detail Profil Candidate Pool: ${selectedCandidate.full_name}`}>
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div><span className="text-slate-400 font-bold">Nama Lengkap:</span> <span className="font-bold text-slate-900">{selectedCandidate.full_name}</span></div>
              <div><span className="text-slate-400 font-bold">No KTP:</span> <span className="font-semibold text-slate-800">{selectedCandidate.nik_ktp || '-'}</span></div>
              <div><span className="text-slate-400 font-bold">Email / WA:</span> <span className="font-semibold text-slate-800">{selectedCandidate.email} / {selectedCandidate.phone}</span></div>
              <div><span className="text-slate-400 font-bold">Alamat:</span> <span className="font-semibold text-slate-800">{selectedCandidate.address}</span></div>
              <div><span className="text-slate-400 font-bold">Pendidikan:</span> <span className="font-semibold text-slate-800">{selectedCandidate.education} - {selectedCandidate.last_education_institution} ({selectedCandidate.major})</span></div>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Re-Activate Candidate */}
      {selectedCandidate && (
        <Modal isOpen={restoreModalOpen} onClose={() => setRestoreModalOpen(false)} title={`Pilih Kembali Kandidat: ${selectedCandidate.full_name}`}>
          <form onSubmit={submitRestore} className="space-y-4">
            
            <div className="p-4 bg-brand-50 border border-brand-200 rounded-2xl text-xs text-brand-900 space-y-1">
              <div className="font-bold flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-brand-600" />
                <span>Re-Activation Candidate Engine</span>
              </div>
              <p>Kandidat ini akan dipanggil kembali dari kumpulan kandidat untuk mengikuti tahapan seleksi pada lowongan yang Anda pilih.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Pilih Posisi Lowongan Aktif *</label>
              <Select2
                required
                value={restoreForm.data.job_vacancy_id}
                onChange={(e) => restoreForm.setData('job_vacancy_id', e.target.value)}
                options={active_vacancies.map((v) => ({
                  value: v.id,
                  label: `${v.title} (${v.department?.name || 'Umum'})`
                }))}
              />
            </div>

            <div className="pt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setRestoreModalOpen(false)}
                className="px-5 py-2.5 bg-slate-100 text-slate-700 font-extrabold text-xs rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={restoreForm.processing}
                className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-brand-600/30 flex items-center space-x-2 active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Aktifkan Kembali ke Seleksi</span>
              </button>
            </div>

          </form>
        </Modal>
      )}

    </AuthenticatedLayout>
  );
}
