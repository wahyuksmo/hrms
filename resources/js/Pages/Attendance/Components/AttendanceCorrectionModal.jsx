import React, { useEffect } from 'react';
import Modal from '@/Components/Modal';
import { useForm } from '@inertiajs/react';
import { Calendar, Clock, FileText, Upload, AlertCircle, Send } from 'lucide-react';
import { showSuccess, showError } from '@/Utils/swal';

export default function AttendanceCorrectionModal({ isOpen, onClose }) {
  const today = new Date().toISOString().split('T')[0];
  
  // Calculate date 7 days ago
  const minDateObj = new Date();
  minDateObj.setDate(minDateObj.getDate() - 7);
  const minDate = minDateObj.toISOString().split('T')[0];

  const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
    date: today,
    correction_type: 'missing_clock_in',
    requested_clock_in_time: '08:00',
    requested_clock_out_time: '17:00',
    reason: '',
    attachment: null,
  });

  useEffect(() => {
    if (isOpen) {
      reset();
      clearErrors();
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!data.attachment) {
      showError('Bukti Wajib', 'Silakan upload foto atau dokumen sebagai bukti pengajuan.');
      return;
    }

    post(route('attendance.corrections.store'), {
      preserveScroll: true,
      onSuccess: () => {
        showSuccess('Pengajuan Berhasil', 'Pengajuan koreksi presensi berhasil dikirim untuk diajukan ke atasan.');
        reset();
        onClose();
      },
      onError: (err) => {
        const msg = Object.values(err)[0] || 'Gagal mengirim pengajuan koreksi presensi.';
        showError('Gagal Pengajuan', msg);
      },
    });
  };

  const showClockIn = data.correction_type === 'missing_clock_in' || data.correction_type === 'missing_both' || data.correction_type === 'time_adjustment';
  const showClockOut = data.correction_type === 'missing_clock_out' || data.correction_type === 'missing_both' || data.correction_type === 'time_adjustment';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ajukan Koreksi & Lupa Presensi">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-amber-50 border border-amber-200/70 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 leading-relaxed font-medium">
            <span className="font-bold">Ketentuan Pengajuan:</span> Pengajuan maksimal <span className="font-bold">7 hari ke belakang</span> dan wajib melampirkan foto/dokumen pendukung. Pengajuan akan diproses oleh atasan langsung Anda.
          </div>
        </div>

        {/* Tanggal Presensi */}
        <div>
          <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
            Tanggal Presensi <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="date"
              min={minDate}
              max={today}
              value={data.date}
              onChange={(e) => setData('date', e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all"
              required
            />
          </div>
          {errors.date && <p className="mt-1 text-xs font-bold text-rose-500">{errors.date}</p>}
        </div>

        {/* Jenis Koreksi */}
        <div>
          <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
            Jenis Pengajuan Koreksi <span className="text-rose-500">*</span>
          </label>
          <select
            value={data.correction_type}
            onChange={(e) => setData('correction_type', e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all"
            required
          >
            <option value="missing_clock_in">Lupa Presensi Masuk (Clock In)</option>
            <option value="missing_clock_out">Lupa Presensi Pulang (Clock Out)</option>
            <option value="missing_both">Lupa Presensi Masuk & Pulang</option>
            <option value="time_adjustment">Koreksi Jam Kerja (Jam Salah)</option>
          </select>
          {errors.correction_type && <p className="mt-1 text-xs font-bold text-rose-500">{errors.correction_type}</p>}
        </div>

        {/* Form Jam Input */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {showClockIn && (
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                Usulan Jam Masuk (Clock In)
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="time"
                  value={data.requested_clock_in_time}
                  onChange={(e) => setData('requested_clock_in_time', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all"
                />
              </div>
              {errors.requested_clock_in_time && <p className="mt-1 text-xs font-bold text-rose-500">{errors.requested_clock_in_time}</p>}
            </div>
          )}

          {showClockOut && (
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                Usulan Jam Pulang (Clock Out)
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="time"
                  value={data.requested_clock_out_time}
                  onChange={(e) => setData('requested_clock_out_time', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all"
                />
              </div>
              {errors.requested_clock_out_time && <p className="mt-1 text-xs font-bold text-rose-500">{errors.requested_clock_out_time}</p>}
            </div>
          )}
        </div>

        {/* Alasan Koreksi */}
        <div>
          <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
            Alasan Koreksi <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            <textarea
              rows={3}
              value={data.reason}
              onChange={(e) => setData('reason', e.target.value)}
              placeholder="Jelaskan kendala/alasan pengajuan koreksi presensi..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all"
              required
            />
          </div>
          {errors.reason && <p className="mt-1 text-xs font-bold text-rose-500">{errors.reason}</p>}
        </div>

        {/* Upload Bukti */}
        <div>
          <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
            Lampiran Bukti (Foto/Dokumen) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="file"
              accept="image/jpeg,image/png,application/pdf"
              onChange={(e) => setData('attachment', e.target.files[0])}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 transition-all"
              required
            />
          </div>
          <p className="mt-1 text-[11px] text-slate-400 font-medium">Format: JPG, PNG, PDF (Maks. 2MB)</p>
          {errors.attachment && <p className="mt-1 text-xs font-bold text-rose-500">{errors.attachment}</p>}
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-extrabold text-xs hover:bg-slate-100 transition-all"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={processing}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 text-white font-extrabold text-xs shadow-md shadow-brand-500/20 hover:from-brand-700 hover:to-brand-800 active:scale-95 transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {processing ? 'Mengirim...' : 'Kirim Pengajuan'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
