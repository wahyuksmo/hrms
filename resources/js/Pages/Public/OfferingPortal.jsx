import React, { useRef, useState, useEffect } from 'react';
import { useForm, Head, Link, usePage } from '@inertiajs/react';
import { CheckCircle2, XCircle, Printer, FileText, Calendar, Building2, Briefcase, DollarSign, Award, Eraser } from 'lucide-react';
import { showConfirm, showError } from '@/Utils/swal';

export default function OfferingPortal({ candidate }) {
  const { flash } = usePage().props;
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  const { data, setData, post, processing, errors } = useForm({
    decision: 'accepted',
    signature_data: '',
    bank_name: candidate.bank_name || '',
    bank_account_number: candidate.bank_account_number || '',
    bank_account_holder: candidate.bank_account_holder || candidate.full_name || '',
    npwp: candidate.npwp || '',
    bpjs_kesehatan: candidate.bpjs_kesehatan || '',
    bpjs_ketenagakerjaan: candidate.bpjs_ketenagakerjaan || '',
    tax_status: candidate.tax_status || 'TK/0',
  });

  // Setup signature canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f172a';
  }, []);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setData('signature_data', canvas.toDataURL('image/png'));
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    setData('signature_data', '');
  };

  const handleDecision = (decisionType) => {
    if (decisionType === 'accepted' && !hasSignature && !data.signature_data) {
      showError('Tanda Tangan Diperlukan', 'Silakan tuangkan tanda tangan digital Anda pada area kanvas sebelum menerima penawaran.');
      return;
    }

    showConfirm({
      title: decisionType === 'accepted' ? 'Terima Offering Letter?' : 'Tolak Offering Letter?',
      text: decisionType === 'accepted'
        ? 'Dengan menerima, Anda menyetujui seluruh syarat & ketentuan yang tercantum dalam Offering Letter ini.'
        : 'Apakah Anda yakin ingin menolak penawaran kerja ini?',
      icon: decisionType === 'accepted' ? 'question' : 'warning',
      confirmText: decisionType === 'accepted' ? 'Ya, Terima Penawaran' : 'Ya, Tolak Penawaran',
      cancelText: 'Kembali',
      confirmButtonColor: decisionType === 'accepted' ? 'emerald' : 'rose',
      onConfirm: () => {
        // Build the complete payload synchronously to avoid setData async race
        const payload = {
          decision: decisionType,
          signature_data: decisionType === 'accepted' ? data.signature_data : '',
          bank_name: data.bank_name,
          bank_account_number: data.bank_account_number,
          bank_account_holder: data.bank_account_holder,
          npwp: data.npwp,
          bpjs_kesehatan: data.bpjs_kesehatan,
          bpjs_ketenagakerjaan: data.bpjs_ketenagakerjaan,
          tax_status: data.tax_status,
        };
        post(route('offering.decision', candidate.access_token), {
          data: payload,
          onError: (err) => showError('Gagal Mengirim', Object.values(err)[0] || 'Terjadi kesalahan. Silakan coba kembali.'),
        });
      }
    });
  };

  const formatRupiah = (val) => {
    if (!val) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <>
      <Head title={`Offering Letter - ${candidate.full_name}`} />
      <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 py-10 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-700 text-white p-8 rounded-[32px] shadow-xl flex items-center justify-between print:hidden">
            <div>
              <div className="text-xs font-bold text-emerald-200 uppercase tracking-widest">Official Portal Offering Letter</div>
              <h1 className="text-2xl font-black">{candidate.full_name}</h1>
              <p className="text-xs text-emerald-100 font-mono mt-0.5">Kode Kandidat: {candidate.candidate_code} • {candidate.job_vacancy?.company?.name}</p>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 flex items-center space-x-2 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak PDF</span>
            </button>
          </div>

          {/* Offering Letter Document Box */}
          <div className="bg-white p-8 sm:p-12 rounded-[32px] border border-slate-200 shadow-lg space-y-8 print:shadow-none print:border-none print:p-0">
            {/* Header Document */}
            <div className="border-b border-slate-200 pb-6 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{candidate.job_vacancy?.company?.name || 'HRMS Company'}</h2>
                <p className="text-xs text-slate-500 font-medium">Department Human Capital & Talent Acquisition Management</p>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-mono font-bold rounded-full border border-emerald-200">
                  OFFERING LETTER RESMI
                </span>
                <p className="text-xs text-slate-400 mt-1 font-mono">{new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>

            {/* Content Greeting */}
            <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
              <p>Kepada Yth. <strong>{candidate.full_name}</strong>,</p>
              <p>
                Berdasarkan hasil rangkaian tahapan evaluasi dan seleksi rekrutmen yang telah Anda jalani, Manajemen <strong>{candidate.job_vacancy?.company?.name}</strong> dengan bangga memberikan Penawaran Kerja (Offering Letter) untuk bergabung bersama tim kami.
              </p>
            </div>

            {/* Offer Detail Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-400 uppercase flex items-center space-x-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Jabatan / Posisi</span>
                </div>
                <div className="font-extrabold text-slate-900 text-base">{candidate.offered_position?.name || candidate.job_vacancy?.title}</div>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-400 uppercase flex items-center space-x-1.5">
                  <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Departemen</span>
                </div>
                <div className="font-extrabold text-slate-900 text-base">{candidate.offered_department?.name || 'Operasional'}</div>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-400 uppercase flex items-center space-x-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Gaji Pokok & Penawaran</span>
                </div>
                <div className="font-black text-emerald-600 text-lg">{formatRupiah(candidate.offered_salary)} / bulan</div>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-400 uppercase flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Rencana Tanggal Bergabung</span>
                </div>
                <div className="font-extrabold text-slate-900 text-base">
                  {candidate.offered_join_date ? new Date(candidate.offered_join_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Diatur Kemudian'}
                </div>
              </div>
            </div>

            {/* Offering Notes */}
            {candidate.offering_letter_notes && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="font-bold flex items-center space-x-1.5">
                  <FileText className="w-4 h-4 text-amber-700" />
                  <span>Catatan Khusus Penawaran:</span>
                </div>
                <p className="leading-relaxed">{candidate.offering_letter_notes}</p>
              </div>
            )}

            {/* Signature & Decision Section */}
            {candidate.offering_status === 'accepted' ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-emerald-900">Penawaran Kerja Telah Diterima (Accepted)</h3>
                <p className="text-xs text-emerald-700">
                  Tanda tangan digital Anda telah tersimpan secara legal pada portal ini. Tim Human Capital kami akan menghubungi Anda untuk proses onboarding.
                </p>

                {candidate.signature_data && (
                  <div className="pt-4 border-t border-emerald-200/60 max-w-xs mx-auto">
                    <p className="text-[11px] font-bold text-slate-400 uppercase mb-2">Tanda Tangan Digital</p>
                    <img src={candidate.signature_data} alt="Digital Signature" className="h-20 mx-auto object-contain bg-white rounded-lg p-2 border border-slate-200" />
                  </div>
                )}
              </div>
            ) : candidate.offering_status === 'declined' ? (
              <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-3">
                <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                  <XCircle className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-rose-900">Penawaran Kerja Ditolak (Declined)</h3>
                <p className="text-xs text-rose-700">Terima kasih banyak atas partisipasi Anda dalam proses rekrutmen kami.</p>
              </div>
            ) : (
              <div className="pt-6 border-t border-slate-200 space-y-6 print:hidden">
                
                {/* Data Administratif & Rekening Payroll */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center space-x-2 pb-3 border-b border-slate-200">
                    <FileText className="w-5 h-5 text-emerald-600" />
                    <div>
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Data Administratif & Financial (Bank, Pajak & BPJS)</h3>
                      <p className="text-xs text-slate-500 font-medium">Lengkapi data perbankan dan identitas diri Anda untuk keperluan kepegawaian dan penggajian.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Nama Bank</label>
                      <input
                        type="text"
                        value={data.bank_name}
                        onChange={(e) => setData('bank_name', e.target.value)}
                        placeholder="Contoh: BCA / Mandiri"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Nomor Rekening</label>
                      <input
                        type="text"
                        value={data.bank_account_number}
                        onChange={(e) => setData('bank_account_number', e.target.value)}
                        placeholder="1234567890"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Atas Nama Rekening</label>
                      <input
                        type="text"
                        value={data.bank_account_holder}
                        onChange={(e) => setData('bank_account_holder', e.target.value)}
                        placeholder={candidate.full_name}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Nomor NPWP</label>
                      <input
                        type="text"
                        value={data.npwp}
                        onChange={(e) => setData('npwp', e.target.value)}
                        placeholder="12.345.678.9-012.000"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Status PTKP Pajak</label>
                      <select
                        value={data.tax_status}
                        onChange={(e) => setData('tax_status', e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                      >
                        <option value="TK/0">TK/0 (Tidak Kawin - 0 Tanggungan)</option>
                        <option value="TK/1">TK/1 (Tidak Kawin - 1 Tanggungan)</option>
                        <option value="K/0">K/0 (Kawin - 0 Tanggungan)</option>
                        <option value="K/1">K/1 (Kawin - 1 Tanggungan)</option>
                        <option value="K/2">K/2 (Kawin - 2 Tanggungan)</option>
                        <option value="K/3">K/3 (Kawin - 3 Tanggungan)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">BPJS Kesehatan</label>
                      <input
                        type="text"
                        value={data.bpjs_kesehatan}
                        onChange={(e) => setData('bpjs_kesehatan', e.target.value)}
                        placeholder="000123456789"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">BPJS Ketenagakerjaan</label>
                      <input
                        type="text"
                        value={data.bpjs_ketenagakerjaan}
                        onChange={(e) => setData('bpjs_ketenagakerjaan', e.target.value)}
                        placeholder="21012345678"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-semibold"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-2">Tanda Tangan Digital</h3>
                  <p className="text-xs text-slate-500 mb-3">Silakan gunakan mouse atau usap layar sentuh Anda untuk menandatangani di dalam area kotak di bawah ini:</p>

                  <div className="relative border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 p-2 text-center">
                    <canvas
                      ref={canvasRef}
                      width={600}
                      height={180}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="w-full h-44 bg-white rounded-xl cursor-crosshair touch-none border border-slate-200 shadow-inner"
                    />

                    <div className="absolute top-4 right-4 flex space-x-2">
                      <button
                        type="button"
                        onClick={clearCanvas}
                        className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg flex items-center space-x-1 transition-colors"
                      >
                        <Eraser className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                  <button
                    type="button"
                    onClick={() => handleDecision('declined')}
                    disabled={processing}
                    className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-bold text-sm rounded-xl border border-slate-200 transition-colors"
                  >
                    Tolak Penawaran
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDecision('accepted')}
                    disabled={processing}
                    className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center space-x-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Terima Offering & Tanda Tangani</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
