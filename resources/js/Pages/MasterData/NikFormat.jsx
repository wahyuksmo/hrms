import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm, Head } from '@inertiajs/react';
import Select2 from '@/Components/Select2';
import { Hash, Settings2, Sparkles } from 'lucide-react';
import { showConfirm, showSuccess } from '@/Utils/swal';

export default function NikFormat({ nik_format }) {
  const { data: nikData, setData: setNikData, post: postNik, processing: nikProcessing } = useForm({
    pattern: nik_format ? nik_format.pattern : '{YEAR}{MONTH}{DEPT_CODE}{SEQUENCE}',
    sequence_length: nik_format ? nik_format.sequence_length : 4,
    reset_period: nik_format ? nik_format.reset_period : 'yearly',
  });

  const handleSaveNik = (e) => {
    e.preventDefault();
    showConfirm({
      title: 'Simpan Konfigurasi NIK?',
      text: 'Format NIK yang baru akan diterapkan secara otomatis untuk pendaftaran karyawan selanjutnya.',
      icon: 'question',
      confirmText: 'Ya, Simpan Pattern',
      onConfirm: () => {
        postNik(route('master.nik-format.save'), {
          onSuccess: () => {
            showSuccess('Berhasil!', 'Format NIK otomatis berhasil diperbarui.');
          }
        });
      }
    });
  };

  return (
    <AuthenticatedLayout headerTitle="Pengaturan Format NIK">
      <Head title="Format NIK" />
      
      <div className="space-y-8">
        <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl p-8 rounded-3xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-500/20 transition-all duration-700"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 group-hover:bg-purple-500/20 transition-all duration-700"></div>
          
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-brand-50 border border-brand-100 rounded-full text-brand-700 text-[10px] font-black uppercase tracking-widest mb-3 shadow-sm">
                <Hash className="w-3 h-3" />
                <span>Data Induk</span>
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <span>Konfigurasi Format NIK</span>
              </h1>
              <p className="text-sm font-medium text-slate-500 mt-2 max-w-xl leading-relaxed">
                Variabel didukung: <code className="text-brand-600 font-extrabold bg-brand-50 px-1.5 py-0.5 rounded border border-brand-100 mx-1">{'{YEAR}'}</code> <code className="text-brand-600 font-extrabold bg-brand-50 px-1.5 py-0.5 rounded border border-brand-100 mx-1">{'{MONTH}'}</code> <code className="text-brand-600 font-extrabold bg-brand-50 px-1.5 py-0.5 rounded border border-brand-100 mx-1">{'{DEPT_CODE}'}</code> <code className="text-brand-600 font-extrabold bg-brand-50 px-1.5 py-0.5 rounded border border-brand-100 mx-1">{'{SEQUENCE}'}</code>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] max-w-3xl">
          <form onSubmit={handleSaveNik} className="space-y-6">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-2 flex items-center">
                <Settings2 className="w-4 h-4 mr-1.5 text-brand-600" /> Pattern Template NIK
              </label>
              <input
                type="text"
                value={nikData.pattern}
                onChange={(e) => setNikData('pattern', e.target.value)}
                required
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-base font-mono font-black text-slate-900 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all shadow-sm"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase mb-2">Panjang Sequence Digit</label>
                <input
                  type="number"
                  value={nikData.sequence_length}
                  onChange={(e) => setNikData('sequence_length', e.target.value)}
                  min="1" max="10"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black text-slate-900 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all shadow-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase mb-2">Reset Period Sequence</label>
                <Select2
                  value={nikData.reset_period}
                  onChange={(e) => setNikData('reset_period', e.target.value)}
                  options={[
                    { value: 'yearly', label: 'Tahunan (Yearly)' },
                    { value: 'monthly', label: 'Bulanan (Monthly)' },
                    { value: 'none', label: 'Tidak Pernah Reset' }
                  ]}
                />
              </div>
            </div>

            <div className="p-4 bg-brand-50/80 border border-brand-100 rounded-2xl text-xs text-brand-900 leading-relaxed flex items-center space-x-2.5">
              <Sparkles className="w-4 h-4 text-brand-600 shrink-0" />
              <span className="font-semibold">Contoh NIK yang akan dihasilkan: <strong className="font-mono text-brand-700 font-black">202608HRD0001</strong></span>
            </div>

            <div className="pt-6 flex justify-end border-t border-slate-200/60">
              <button
                type="submit"
                disabled={nikProcessing}
                className="px-8 py-3.5 bg-slate-900 hover:bg-brand-600 text-white font-bold text-sm rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_25px_rgba(var(--brand-600-rgb),0.3)] transition-all duration-300 hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:hover:-translate-y-0 disabled:hover:shadow-[0_8px_20px_rgba(0,0,0,0.1)]"
              >
                {nikProcessing ? 'Menyimpan...' : 'Simpan Pattern NIK'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
