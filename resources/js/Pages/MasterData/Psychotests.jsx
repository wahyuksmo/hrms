import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import Select2 from '@/Components/Select2';
import DataTable from '@/Components/DataTable';
import { BookOpen, Plus, FileText, Pencil, Trash2, Library, CheckCircle2 } from 'lucide-react';
import { Head, useForm, router } from '@inertiajs/react';
import { showConfirm, showSuccess } from '@/Utils/swal';

export default function MasterPsychotests({ categories }) {
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [qModalOpen, setQModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState(categories[0]?.id || '');

  // Form Kategori Modul Psikotes
  const catForm = useForm({
    code: '',
    name: '',
    description: '',
    duration_minutes: 30,
    passing_grade: 70,
  });

  // Form Bank Soal Psikotes
  const qForm = useForm({
    psychotest_category_id: '',
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'A',
    score_weight: 10,
  });

  const openCategoryCreate = () => {
    setEditingCategory(null);
    catForm.setData({
      code: '',
      name: '',
      description: '',
      duration_minutes: 30,
      passing_grade: 70,
    });
    catForm.clearErrors();
    setCatModalOpen(true);
  };

  const openCategoryEdit = (cat) => {
    setEditingCategory(cat);
    catForm.setData({
      code: cat.code,
      name: cat.name,
      description: cat.description || '',
      duration_minutes: cat.duration_minutes,
      passing_grade: cat.passing_grade,
    });
    catForm.clearErrors();
    setCatModalOpen(true);
  };

  const submitCategory = (e) => {
    e.preventDefault();
    if (editingCategory) {
      showConfirm({
        title: 'Perbarui Kategori?',
        text: `Apakah Anda yakin ingin memperbarui kategori "${catForm.data.name}"?`,
        icon: 'question',
        confirmText: 'Ya, Perbarui',
        onConfirm: () => {
          catForm.put(route('master.psychotest-categories.update', editingCategory.id), {
            onSuccess: () => {
              setCatModalOpen(false);
              setEditingCategory(null);
              showSuccess('Berhasil!', 'Kategori psikotes berhasil diperbarui.');
            }
          });
        }
      });
    } else {
      showConfirm({
        title: 'Tambah Kategori?',
        text: `Apakah Anda yakin ingin menambahkan kategori "${catForm.data.name}"?`,
        icon: 'question',
        confirmText: 'Ya, Simpan',
        onConfirm: () => {
          catForm.post(route('master.psychotest-categories.store'), {
            onSuccess: () => {
              setCatModalOpen(false);
              catForm.reset();
              showSuccess('Berhasil!', 'Kategori psikotes baru berhasil ditambahkan.');
            }
          });
        }
      });
    }
  };

  const deleteCategory = (cat) => {
    showConfirm({
      title: 'Hapus Kategori?',
      text: `Apakah Anda yakin ingin menghapus kategori "${cat.name}"?`,
      icon: 'error',
      confirmText: 'Ya, Hapus',
      onConfirm: () => {
        router.delete(route('master.psychotest-categories.destroy', cat.id), {
          onSuccess: () => showSuccess('Berhasil!', 'Kategori psikotes berhasil dihapus.')
        });
      }
    });
  };

  const openQuestionCreate = () => {
    setEditingQuestion(null);
    qForm.setData({
      psychotest_category_id: selectedCategoryFilter || (categories[0]?.id || ''),
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_answer: 'A',
      score_weight: 10,
    });
    qForm.clearErrors();
    setQModalOpen(true);
  };

  const openQuestionEdit = (q) => {
    setEditingQuestion(q);
    qForm.setData({
      psychotest_category_id: q.psychotest_category_id,
      question_text: q.question_text,
      option_a: q.options?.A || '',
      option_b: q.options?.B || '',
      option_c: q.options?.C || '',
      option_d: q.options?.D || '',
      correct_answer: q.correct_answer,
      score_weight: q.score_weight,
    });
    qForm.clearErrors();
    setQModalOpen(true);
  };

  const submitQuestion = (e) => {
    e.preventDefault();
    const payload = {
      psychotest_category_id: qForm.data.psychotest_category_id,
      question_text: qForm.data.question_text,
      options: {
        A: qForm.data.option_a,
        B: qForm.data.option_b,
        C: qForm.data.option_c,
        D: qForm.data.option_d,
      },
      correct_answer: qForm.data.correct_answer,
      score_weight: qForm.data.score_weight,
    };

    if (editingQuestion) {
      showConfirm({
        title: 'Perbarui Soal?',
        text: `Apakah Anda yakin ingin memperbarui soal ini?`,
        icon: 'question',
        confirmText: 'Ya, Perbarui',
        onConfirm: () => {
          router.put(route('master.psychotest-questions.update', editingQuestion.id), payload, {
            onSuccess: () => {
              setQModalOpen(false);
              setEditingQuestion(null);
              showSuccess('Berhasil!', 'Soal berhasil diperbarui.');
            }
          });
        }
      });
    } else {
      showConfirm({
        title: 'Tambah Soal?',
        text: `Apakah Anda yakin ingin menambahkan soal ini?`,
        icon: 'question',
        confirmText: 'Ya, Simpan',
        onConfirm: () => {
          router.post(route('master.psychotest-questions.store'), payload, {
            onSuccess: () => {
              setQModalOpen(false);
              qForm.reset();
              showSuccess('Berhasil!', 'Soal baru berhasil ditambahkan.');
            }
          });
        }
      });
    }
  };

  const deleteQuestion = (q) => {
    showConfirm({
      title: 'Hapus Soal?',
      text: `Apakah Anda yakin ingin menghapus soal ini?`,
      icon: 'error',
      confirmText: 'Ya, Hapus',
      onConfirm: () => {
        router.delete(route('master.psychotest-questions.destroy', q.id), {
          onSuccess: () => showSuccess('Berhasil!', 'Soal berhasil dihapus.')
        });
      }
    });
  };

  const filteredCategory = categories.find(c => String(c.id) === String(selectedCategoryFilter)) || categories[0];
  const filteredQuestions = filteredCategory ? filteredCategory.questions : [];

  const categoryColumns = [
    {
      header: 'Kode & Nama Kategori',
      accessor: (row) => `${row.code} ${row.name}`,
      render: (row) => (
        <div className="flex items-center space-x-4 group/item cursor-pointer">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-700 text-white font-black text-sm flex items-center justify-center shadow-[0_4px_15px_rgba(0,0,0,0.1)] group-hover/item:from-brand-600 group-hover/item:to-brand-500 transition-all duration-300 group-hover/item:scale-105 group-hover/item:shadow-[0_8px_20px_rgba(var(--brand-500-rgb),0.3)] ring-2 ring-white">
              <Library className="w-5 h-5 text-blue-300" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-sm"></div>
          </div>
          <div>
            <div className="font-black text-slate-900 text-sm tracking-tight group-hover/item:text-brand-700 transition-colors">
              {row.name}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-[9px] font-black uppercase text-brand-600 tracking-wider bg-brand-50 px-1.5 py-0.5 rounded border border-brand-200">
                {row.code}
              </span>
            </div>
            {row.description && <div className="text-xs text-slate-500 font-medium mt-1 line-clamp-1 max-w-sm">{row.description}</div>}
          </div>
        </div>
      )
    },
    {
      header: 'Ketentuan',
      render: (row) => (
        <div className="space-y-1">
          <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
            <span className="w-20 text-slate-500">Durasi</span>
            <span className="px-2 py-0.5 bg-slate-100 rounded border border-slate-200">{row.duration_minutes} Menit</span>
          </div>
          <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
            <span className="w-20 text-slate-500">Passing Grade</span>
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">{row.passing_grade} Poin</span>
          </div>
        </div>
      )
    },
    {
      header: 'Aksi',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => openCategoryEdit(row)}
            className="group/btn px-3 py-1.5 bg-white hover:bg-slate-900 text-slate-700 hover:text-white rounded-xl text-xs font-bold transition-all duration-300 border border-slate-200 hover:border-slate-900 flex items-center gap-1.5 shadow-sm hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 active:translate-y-0"
            title="Edit Data"
          >
            <Pencil className="w-3.5 h-3.5 group-hover/btn:rotate-12 transition-transform" />
            <span>Kelola</span>
          </button>
          
          <button
            onClick={() => deleteCategory(row)}
            className="group/btn px-3 py-1.5 bg-white hover:bg-rose-600 text-rose-600 hover:text-white rounded-xl text-xs font-bold transition-all duration-300 border border-rose-200 hover:border-rose-600 flex items-center gap-1.5 shadow-sm hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 active:translate-y-0"
            title="Hapus Data"
          >
            <Trash2 className="w-3.5 h-3.5 group-hover/btn:rotate-12 transition-transform" />
          </button>
        </div>
      )
    }
  ];

  const questionColumns = [
    {
      header: 'Pertanyaan & Pilihan',
      accessor: 'question_text',
      render: (row) => (
        <div className="space-y-3 py-2">
          <div className="font-bold text-slate-900 leading-relaxed text-sm">
            {row.question_text}
          </div>
          {row.options && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {Object.entries(row.options).map(([key, val]) => (
                <div key={key} className={`p-2.5 rounded-xl border flex items-center gap-2 ${key === row.correct_answer ? 'bg-emerald-50 border-emerald-200 text-emerald-800 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                  <div className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-black shrink-0 ${key === row.correct_answer ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                    {key}
                  </div>
                  <span className="flex-1 font-medium">{val}</span>
                  {key === row.correct_answer && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                </div>
              ))}
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Bobot Nilai',
      render: (row) => (
        <span className="text-[11px] font-black bg-slate-100 text-slate-600 px-3 py-1.5 rounded-xl border border-slate-200">
          {row.score_weight} Poin
        </span>
      )
    },
    {
      header: 'Aksi',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => openQuestionEdit(row)}
            className="group/btn px-3 py-1.5 bg-white hover:bg-slate-900 text-slate-700 hover:text-white rounded-xl text-xs font-bold transition-all duration-300 border border-slate-200 hover:border-slate-900 flex items-center gap-1.5 shadow-sm hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 active:translate-y-0"
            title="Edit Soal"
          >
            <Pencil className="w-3.5 h-3.5 group-hover/btn:rotate-12 transition-transform" />
          </button>
          
          <button
            onClick={() => deleteQuestion(row)}
            className="group/btn px-3 py-1.5 bg-white hover:bg-rose-600 text-rose-600 hover:text-white rounded-xl text-xs font-bold transition-all duration-300 border border-rose-200 hover:border-rose-600 flex items-center gap-1.5 shadow-sm hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 active:translate-y-0"
            title="Hapus Soal"
          >
            <Trash2 className="w-3.5 h-3.5 group-hover/btn:rotate-12 transition-transform" />
          </button>
        </div>
      )
    }
  ];

  return (
    <AuthenticatedLayout headerTitle="Pengaturan Bank Soal Psikotes">
      <Head title="Soal Psikotes" />
      <div className="space-y-8">
        <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl p-8 rounded-3xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-500/20 transition-all duration-700"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 group-hover:bg-purple-500/20 transition-all duration-700"></div>
          
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-brand-50 border border-brand-100 rounded-full text-brand-700 text-[10px] font-black uppercase tracking-widest mb-3 shadow-sm">
                <BookOpen className="w-3 h-3" />
                <span>Data Induk</span>
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <span>Master Bank Soal & Modul Psikotes</span>
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-2 max-w-xl leading-relaxed">
                Kelola modul kategori ujian psikotes online, durasi timer, passing grade, dan kunci jawaban MCQ.
              </p>
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div className="bg-white/60 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center">
                <Library className="w-5 h-5" />
              </div>
              <h3 className="font-black text-slate-900 text-xl tracking-tight">Modul Kategori</h3>
            </div>
            <button
              onClick={openCategoryCreate}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-slate-900 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-[0_8px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_25px_rgba(var(--brand-600-rgb),0.3)] transition-all duration-300 hover:-translate-y-1 active:translate-y-0"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Kategori</span>
            </button>
          </div>
          
          <DataTable columns={categoryColumns} data={categories} searchPlaceholder="Cari kategori modul..." />
        </div>

        {/* Questions Section */}
        <div className="bg-white/60 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-black text-slate-900 text-xl tracking-tight">Bank Soal Psikotes</h3>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <div className="w-full sm:w-64">
                <Select2
                  value={selectedCategoryFilter}
                  onChange={e => setSelectedCategoryFilter(e.target.value)}
                  options={categories.map(c => ({ value: String(c.id), label: c.name }))}
                />
              </div>
              <button
                onClick={openQuestionCreate}
                className="w-full sm:w-auto inline-flex justify-center items-center space-x-2 px-5 py-2.5 bg-slate-900 hover:bg-purple-600 text-white font-bold text-xs rounded-xl shadow-[0_8px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_25px_rgba(147,51,234,0.3)] transition-all duration-300 hover:-translate-y-1 active:translate-y-0"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Soal</span>
              </button>
            </div>
          </div>
          
          <DataTable columns={questionColumns} data={filteredQuestions} searchPlaceholder="Cari soal..." />
        </div>
      </div>

      {/* Modal 1: Modul Kategori */}
      <Modal isOpen={catModalOpen} onClose={() => setCatModalOpen(false)} title={editingCategory ? "Kelola Kategori Psikotes" : "Tambah Kategori Psikotes"}>
        <form onSubmit={submitCategory} className="space-y-5 p-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Kode Modul *</label>
              <input type="text" required value={catForm.data.code} onChange={(e) => catForm.setData('code', e.target.value)} placeholder="LOGIC-01" className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-black uppercase focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Nama Kategori Modul *</label>
              <input type="text" required value={catForm.data.name} onChange={(e) => catForm.setData('name', e.target.value)} placeholder="Tes Logika & Penalaran Analitis" className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Durasi Ujian (Menit) *</label>
              <input type="number" required min="1" value={catForm.data.duration_minutes} onChange={(e) => catForm.setData('duration_minutes', e.target.value)} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Passing Grade (Poin) *</label>
              <input type="number" required min="0" value={catForm.data.passing_grade} onChange={(e) => catForm.setData('passing_grade', e.target.value)} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Deskripsi Modul</label>
            <textarea rows={2} value={catForm.data.description} onChange={(e) => catForm.setData('description', e.target.value)} placeholder="Penjelasan tujuan modul dan instruksi pengerjaan..." className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setCatModalOpen(false)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors">Batal</button>
            <button type="submit" disabled={catForm.processing} className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50">{editingCategory ? 'Simpan Perubahan' : 'Simpan Kategori'}</button>
          </div>
        </form>
      </Modal>

      {/* Modal 2: Soal Psikotes */}
      <Modal isOpen={qModalOpen} onClose={() => setQModalOpen(false)} title={editingQuestion ? "Kelola Soal Psikotes" : "Tambah Soal Psikotes"}>
        <form onSubmit={submitQuestion} className="space-y-5 p-2">
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Kategori Modul *</label>
            <Select2
              value={qForm.data.psychotest_category_id}
              onChange={e => qForm.setData('psychotest_category_id', e.target.value)}
              options={categories.map(c => ({ value: String(c.id), label: c.name }))}
            />
          </div>
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Teks Pertanyaan / Soal MCQ *</label>
            <textarea rows={3} required value={qForm.data.question_text} onChange={(e) => qForm.setData('question_text', e.target.value)} placeholder="Tuliskan pertanyaan soal di sini..." className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1 flex items-center gap-1.5"><span className="w-4 h-4 bg-slate-100 rounded-full flex items-center justify-center">A</span> Pilihan A *</label>
              <input type="text" required value={qForm.data.option_a} onChange={(e) => qForm.setData('option_a', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" />
            </div>
            <div>
              <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1 flex items-center gap-1.5"><span className="w-4 h-4 bg-slate-100 rounded-full flex items-center justify-center">B</span> Pilihan B *</label>
              <input type="text" required value={qForm.data.option_b} onChange={(e) => qForm.setData('option_b', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" />
            </div>
            <div>
              <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1 flex items-center gap-1.5"><span className="w-4 h-4 bg-slate-100 rounded-full flex items-center justify-center">C</span> Pilihan C *</label>
              <input type="text" required value={qForm.data.option_c} onChange={(e) => qForm.setData('option_c', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" />
            </div>
            <div>
              <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1 flex items-center gap-1.5"><span className="w-4 h-4 bg-slate-100 rounded-full flex items-center justify-center">D</span> Pilihan D *</label>
              <input type="text" required value={qForm.data.option_d} onChange={(e) => qForm.setData('option_d', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Kunci Jawaban *</label>
              <Select2
                value={qForm.data.correct_answer}
                onChange={(e) => qForm.setData('correct_answer', e.target.value)}
                options={[
                  { value: 'A', label: 'Pilihan A' },
                  { value: 'B', label: 'Pilihan B' },
                  { value: 'C', label: 'Pilihan C' },
                  { value: 'D', label: 'Pilihan D' }
                ]}
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Bobot (Poin) *</label>
              <input type="number" required min="1" value={qForm.data.score_weight} onChange={(e) => qForm.setData('score_weight', e.target.value)} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setQModalOpen(false)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors">Batal</button>
            <button type="submit" disabled={qForm.processing} className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50">{editingQuestion ? 'Simpan Perubahan' : 'Simpan Soal'}</button>
          </div>
        </form>
      </Modal>
    </AuthenticatedLayout>
  );
}
