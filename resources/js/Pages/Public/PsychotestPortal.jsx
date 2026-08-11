import React, { useState, useEffect } from 'react';
import { useForm, Head, Link, usePage } from '@inertiajs/react';
import { Clock, ShieldCheck, CheckCircle2, Lock, ArrowLeft, Send, Trophy, AlertTriangle } from 'lucide-react';
import { showConfirm, showSuccess, showError } from '@/Utils/swal';

export default function PsychotestPortal({ candidate, categories, is_unlocked }) {
  const { flash } = usePage().props;
  const [selectedCategory, setSelectedCategory] = useState(categories[0] || null);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  const { data, setData, post, processing, reset } = useForm({
    category_id: selectedCategory ? selectedCategory.id : '',
    answers: {},
  });

  // Countdown timer state in seconds
  const [timeLeft, setTimeLeft] = useState((selectedCategory?.duration_minutes || 30) * 60);
  const [isAutoSubmitted, setIsAutoSubmitted] = useState(false);

  // Reset timer when selectedCategory changes
  useEffect(() => {
    setTimeLeft((selectedCategory?.duration_minutes || 30) * 60);
    setIsAutoSubmitted(false);
    setData('answers', {});
    setData('category_id', selectedCategory ? selectedCategory.id : '');
  }, [selectedCategory]);

  React.useEffect(() => {
    if (!is_unlocked || !selectedCategory || examSubmitted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!isAutoSubmitted) {
            setIsAutoSubmitted(true);
            post(route('psychotest.submit', candidate.access_token), {
              onSuccess: () => {
                setExamSubmitted(true);
              }
            });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [is_unlocked, selectedCategory, examSubmitted]);

  // Listen for flash success from back-end after submit
  useEffect(() => {
    if (flash?.success) {
      setExamSubmitted(true);
      setSubmissionResult(flash.success);
    }
  }, [flash]);

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (questionId, optionKey) => {
    setData('answers', {
      ...data.answers,
      [questionId]: optionKey,
    });
  };

  const handleSubmitExam = (e) => {
    e?.preventDefault();
    const totalQuestions = selectedCategory?.questions?.length || 0;
    const answeredCount = Object.keys(data.answers).length;
    const unanswered = totalQuestions - answeredCount;

    if (unanswered > 0) {
      showConfirm({
        title: 'Masih Ada Soal Belum Dijawab',
        text: `${unanswered} soal belum dijawab. Apakah Anda tetap ingin mengirimkan jawaban?`,
        icon: 'warning',
        confirmText: 'Ya, Kirim Sekarang',
        cancelText: 'Kembali Isi Jawaban',
        confirmButtonColor: 'rose',
        onConfirm: () => {
          post(route('psychotest.submit', candidate.access_token), {
            onSuccess: () => setExamSubmitted(true),
            onError: () => showError('Gagal Mengirim', 'Terjadi kesalahan saat mengirim jawaban psikotes.'),
          });
        }
      });
    } else {
      showConfirm({
        title: 'Konfirmasi Kirim Jawaban?',
        text: 'Setelah dikirim, jawaban tidak bisa diubah. Pastikan semua jawaban sudah benar.',
        icon: 'question',
        confirmText: 'Kirim & Selesaikan Tes',
        cancelText: 'Periksa Kembali',
        confirmButtonColor: 'emerald',
        onConfirm: () => {
          post(route('psychotest.submit', candidate.access_token), {
            onSuccess: () => setExamSubmitted(true),
            onError: () => showError('Gagal Mengirim', 'Terjadi kesalahan saat mengirim jawaban psikotes.'),
          });
        }
      });
    }
  };

  const isDiscTest = selectedCategory?.category_type === 'disc' || selectedCategory?.title?.toLowerCase().includes('disc');

  return (
    <>
      <Head title="Portal Ujian Psikotes" />
      <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 py-10 px-6">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Header Portal */}
          <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-brand-700 text-white p-8 rounded-[32px] shadow-xl flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-brand-200 uppercase tracking-widest">Portal Psikotes Online</div>
              <h1 className="text-2xl font-black">{candidate.full_name}</h1>
              <p className="text-xs text-brand-100 font-mono mt-0.5">Kode Kandidat: {candidate.candidate_code} • {candidate.job_vacancy?.title}</p>
            </div>
            {is_unlocked && selectedCategory && (
              <div className={`px-5 py-2.5 rounded-2xl flex items-center space-x-2 text-sm font-bold border transition-all ${
                timeLeft < 300 ? 'bg-rose-500/20 text-rose-200 border-rose-400/30 animate-pulse' : 'bg-white/10 backdrop-blur-md text-white border-white/20'
              }`}>
                <Clock className="w-5 h-5 text-amber-300" />
                <span>Timer Sisa: {formatTimer(timeLeft)}</span>
              </div>
            )}
          </div>

          {/* Locked State if Candidate has NOT passed Screening */}
          {!is_unlocked ? (
            <div className="bg-white p-10 rounded-[32px] border border-slate-200 shadow-md text-center max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full border border-amber-100 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8" />
              </div>

              <span className="inline-block text-xs font-extrabold uppercase tracking-widest text-amber-700 bg-amber-50 px-3 py-1 rounded-full mb-3 border border-amber-100">
                Akses Ujian Belum Terbuka
              </span>

              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Tahap Seleksi Administrasi Dalam Proses</h2>
              <p className="text-slate-500 font-medium text-sm mt-2 leading-relaxed">
                Seleksi berkas & administrasi Anda saat ini masih dalam tahap peninjauan oleh Tim HR. Access link Psikotes Online ini akan **otomatis terbuka** setelah Anda dinyatakan **LOLOS** pada tahap seleksi administrasi.
              </p>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <Link href="/careers" className="inline-flex items-center space-x-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Kembali ke Karir</span>
                </Link>
              </div>
            </div>
          ) : examSubmitted ? (
            /* Exam Submitted Berhasil State */
            <div className="bg-white p-10 rounded-[32px] border border-slate-200 shadow-md text-center max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full border border-emerald-100 flex items-center justify-center mx-auto mb-5 shadow-sm">
                <Trophy className="w-10 h-10" />
              </div>
              <span className="inline-block text-xs font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full mb-3 border border-emerald-100">
                Psikotes Berhasil Diselesaikan
              </span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Jawaban Anda Telah Dikirim!</h2>
              <p className="text-slate-500 font-medium text-sm mt-3 leading-relaxed">
                {submissionResult || 'Jawaban psikotes Anda telah berhasil dikirim dan sedang diproses oleh Tim HR. Anda akan dihubungi lebih lanjut mengenai hasil seleksi.'}
              </p>
              <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/careers" className="inline-flex items-center space-x-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Kembali ke Karir</span>
                </Link>
              </div>
            </div>
          ) : (
            /* Unlocked Exam Container */
            selectedCategory && (
              <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-md">
                <div className="border-b border-slate-100 pb-4 mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-slate-900">{selectedCategory.title || selectedCategory.name}</h2>
                    <p className="text-xs text-slate-500 mt-1">
                      {isDiscTest 
                        ? 'Pilihlah salah satu gambaran kepribadian yang paling mendeskripsikan diri Anda.' 
                        : 'Pilihlah salah satu jawaban yang menurut Anda paling tepat.'}
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                    {isDiscTest ? 'Evaluasi Profil DISC' : `Passing Grade: ${selectedCategory.passing_grade} Poin`}
                  </span>
                </div>

                <form onSubmit={handleSubmitExam} className="space-y-8">
                  {selectedCategory.questions && selectedCategory.questions.map((q, idx) => (
                    <div key={q.id} className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                      <div className="flex items-start space-x-3">
                        <span className="w-7 h-7 rounded-lg bg-brand-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div className="font-bold text-slate-900 text-sm leading-relaxed">{q.question_text}</div>
                      </div>

                      {/* DISC Matrix or MCQ Options */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-10">
                        {isDiscTest ? (
                          [
                            { key: 'D', label: 'D - Dominan, Penggerak, Berani & Orientasi Hasil' },
                            { key: 'I', label: 'I - Komunikatif, Antusias, Sosial & Persuasif' },
                            { key: 'S', label: 'S - Sabar, Setia, Suportif & Menjaga Keseimbangan' },
                            { key: 'C', label: 'C - Analitis, Teliti, Akurat & Terstruktur' },
                          ].map((discOpt) => {
                            const isSelected = data.answers[q.id] === discOpt.key;
                            return (
                              <button
                                key={discOpt.key}
                                type="button"
                                onClick={() => handleSelectOption(q.id, discOpt.key)}
                                className={`p-3.5 rounded-xl border text-left text-xs font-semibold transition-all flex items-center space-x-3 ${
                                  isSelected
                                    ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                                }`}
                              >
                                <span className={`w-6 h-6 rounded-full border font-bold flex items-center justify-center text-[10px] ${
                                  isSelected ? 'bg-white text-brand-600 border-white' : 'bg-slate-100 text-slate-600 border-slate-200'
                                }`}>
                                  {discOpt.key}
                                </span>
                                <span>{discOpt.label}</span>
                              </button>
                            );
                          })
                        ) : (
                          q.options && Object.entries(q.options).map(([optKey, optValue]) => {
                            const isSelected = data.answers[q.id] === optKey;
                            return (
                              <button
                                key={optKey}
                                type="button"
                                onClick={() => handleSelectOption(q.id, optKey)}
                                className={`p-3.5 rounded-xl border text-left text-xs font-semibold transition-all flex items-center space-x-3 ${
                                  isSelected
                                    ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                                }`}
                              >
                                <span className={`w-6 h-6 rounded-full border font-bold flex items-center justify-center text-[10px] ${
                                  isSelected ? 'bg-white text-brand-600 border-white' : 'bg-slate-100 text-slate-600 border-slate-200'
                                }`}>
                                  {optKey}
                                </span>
                                <span>{optValue}</span>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button
                      type="submit"
                      disabled={processing}
                      className="px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-brand-600/30 transition-all"
                    >
                      Kirim Jawaban & Selesaikan Tes
                    </button>
                  </div>
                </form>
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
}
