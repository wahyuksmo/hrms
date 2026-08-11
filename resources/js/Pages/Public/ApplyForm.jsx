import React, { useState } from 'react';
import { useForm, Head, Link } from '@inertiajs/react';
import Select2 from '@/Components/Select2';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, MapPin, Briefcase, GraduationCap, PhoneCall, ArrowLeft, Send, 
  Plus, Trash2, Award, CheckCircle2, ChevronRight, ChevronLeft 
} from 'lucide-react';

export default function ApplyForm({ vacancy }) {
  const { data, setData, post, processing, errors } = useForm({
    full_name: '', email: '', phone: '', gender: 'L', nik_ktp: '',
    birth_place: '', birth_date: '', marital_status: 'Single', religion: 'Islam', address: '',
    
    education: 'S1', last_education_institution: '', major: '', gpa: '',
    non_formal_education: '', experience_years: '1-3 Tahun', work_experience_detail: '', expected_salary: '',

    education_history: [{ level: 'S1', institution: '', major: '', gpa: '', start_year: '', end_year: '' }],
    non_formal_education_history: [{ name: '', organizer: '', year: '', certificate_no: '' }],
    work_experience_history: [{ company: '', position: '', period: '', description: '', salary: '' }],

    emergency_contact_name: '', emergency_contact_phone: '', emergency_contact_relation: 'Orang Tua / Pasangan',
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  // Handlers for dynamic fields
  const addEducationRow = () => setData('education_history', [...data.education_history, { level: 'S1', institution: '', major: '', gpa: '', start_year: '', end_year: '' }]);
  const removeEducationRow = (index) => setData('education_history', data.education_history.filter((_, i) => i !== index));
  const updateEducationRow = (index, field, value) => {
    const updated = [...data.education_history];
    updated[index][field] = value;
    setData('education_history', updated);
    if (index === 0) {
      if (field === 'level') setData('education', value);
      if (field === 'institution') setData('last_education_institution', value);
      if (field === 'major') setData('major', value);
      if (field === 'gpa') setData('gpa', value);
    }
  };

  const addNonFormalRow = () => setData('non_formal_education_history', [...data.non_formal_education_history, { name: '', organizer: '', year: '', certificate_no: '' }]);
  const removeNonFormalRow = (index) => setData('non_formal_education_history', data.non_formal_education_history.filter((_, i) => i !== index));
  const updateNonFormalRow = (index, field, value) => {
    const updated = [...data.non_formal_education_history];
    updated[index][field] = value;
    setData('non_formal_education_history', updated);
  };

  const addWorkRow = () => setData('work_experience_history', [...data.work_experience_history, { company: '', position: '', period: '', description: '', salary: '' }]);
  const removeWorkRow = (index) => setData('work_experience_history', data.work_experience_history.filter((_, i) => i !== index));
  const updateWorkRow = (index, field, value) => {
    const updated = [...data.work_experience_history];
    updated[index][field] = value;
    setData('work_experience_history', updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('careers.submit', vacancy.slug));
  };

  const slideVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
  };

  return (
    <>
      <Head title={`Lamaran: ${vacancy.title}`} />
      <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8 font-sans">
        
        <div className="max-w-4xl mx-auto">
          <Link href="/careers" className="inline-flex items-center space-x-2 text-sm font-bold text-slate-500 hover:text-brand-600 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Lowongan</span>
          </Link>

          {/* Header Card */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-50 rounded-full blur-3xl -mr-20 -mt-20 z-0"></div>
            <div className="relative z-10">
              <span className="inline-block text-xs font-black uppercase tracking-widest text-brand-600 bg-brand-50 px-3 py-1 rounded-full mb-3 border border-brand-100">
                {vacancy.department?.name || 'Department'} • {vacancy.employment_type}
              </span>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">{vacancy.title}</h1>
              <p className="text-slate-500 font-medium mt-1">{vacancy.company?.name}</p>
            </div>
          </motion.div>

          {/* Stepper Wizard Progress */}
          <div className="mb-8 relative">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -translate-y-1/2 rounded-full z-0"></div>
            <div className="absolute top-1/2 left-0 h-1 bg-brand-500 -translate-y-1/2 rounded-full z-0 transition-all duration-500" style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}></div>
            
            <div className="relative z-10 flex justify-between">
              {[
                { step: 1, icon: User, label: "Data Pribadi" },
                { step: 2, icon: GraduationCap, label: "Pendidikan" },
                { step: 3, icon: Briefcase, label: "Pengalaman" },
                { step: 4, icon: PhoneCall, label: "Finalisasi" }
              ].map((s) => (
                <div key={s.step} className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm border-4 transition-colors duration-300 ${currentStep >= s.step ? 'bg-brand-600 border-brand-100 text-white shadow-lg shadow-brand-500/40' : 'bg-white border-slate-100 text-slate-400'}`}>
                    {currentStep > s.step ? <CheckCircle2 className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                  </div>
                  <span className={`mt-2 text-[10px] font-bold uppercase tracking-wider ${currentStep >= s.step ? 'text-brand-700' : 'text-slate-400'}`}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-200/40">
            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                
                {/* STEP 1: Data Pribadi */}
                {currentStep === 1 && (
                  <motion.div key="step1" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
                    <div className="border-b border-slate-100 pb-4 mb-6">
                      <h3 className="text-xl font-black text-slate-900">Data Pribadi</h3>
                      <p className="text-sm text-slate-500">Informasi dasar tentang diri Anda.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="md:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-2">Nama Lengkap *</label>
                        <input type="text" required value={data.full_name} onChange={(e) => setData('full_name', e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-brand-500 focus:border-brand-500" placeholder="Sesuai KTP" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-2">Email *</label>
                        <input type="email" required value={data.email} onChange={(e) => setData('email', e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" placeholder="email@contoh.com" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-2">No. Handphone *</label>
                        <input type="text" required value={data.phone} onChange={(e) => setData('phone', e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" placeholder="0812xxxx" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-2">NIK KTP</label>
                        <input type="text" value={data.nik_ktp} onChange={(e) => setData('nik_ktp', e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-2">Jenis Kelamin</label>
                        <Select2 value={data.gender} onChange={(e) => setData('gender', e.target.value)} options={[{ value: 'L', label: 'Laki-Laki' }, { value: 'P', label: 'Perempuan' }]} />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-2">Alamat Lengkap *</label>
                        <textarea required rows={3} value={data.address} onChange={(e) => setData('address', e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: Pendidikan */}
                {currentStep === 2 && (
                  <motion.div key="step2" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
                      <div>
                        <h3 className="text-xl font-black text-slate-900">Riwayat Pendidikan</h3>
                        <p className="text-sm text-slate-500">Pendidikan formal terakhir Anda.</p>
                      </div>
                      <button type="button" onClick={addEducationRow} className="px-4 py-2 bg-purple-50 text-purple-700 rounded-xl font-bold text-xs flex items-center space-x-2">
                        <Plus className="w-4 h-4"/> <span>Tambah</span>
                      </button>
                    </div>

                    <div className="space-y-4">
                      {data.education_history.map((edu, idx) => (
                        <div key={idx} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 relative">
                          <div className="absolute top-4 right-4">
                            {data.education_history.length > 1 && (
                              <button type="button" onClick={() => removeEducationRow(idx)} className="text-rose-500 p-1 bg-rose-50 rounded-md">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Tingkat</label>
                              <Select2 value={edu.level} onChange={(e) => updateEducationRow(idx, 'level', e.target.value)} options={[{ value: 'SMA/SMK', label: 'SMA / SMK' }, { value: 'D3', label: 'Diploma (D3)' }, { value: 'S1', label: 'Sarjana (S1)' }]} />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Instansi</label>
                              <input type="text" value={edu.institution} onChange={(e) => updateEducationRow(idx, 'institution', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm" />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Jurusan</label>
                              <input type="text" value={edu.major} onChange={(e) => updateEducationRow(idx, 'major', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm" />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">IPK / Nilai</label>
                              <input type="text" value={edu.gpa} onChange={(e) => updateEducationRow(idx, 'gpa', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: Pengalaman */}
                {currentStep === 3 && (
                  <motion.div key="step3" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
                      <div>
                        <h3 className="text-xl font-black text-slate-900">Pengalaman Kerja</h3>
                        <p className="text-sm text-slate-500">Riwayat karir Anda.</p>
                      </div>
                      <button type="button" onClick={addWorkRow} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-bold text-xs flex items-center space-x-2">
                        <Plus className="w-4 h-4"/> <span>Tambah</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Total Pengalaman</label>
                        <Select2 value={data.experience_years} onChange={(e) => setData('experience_years', e.target.value)} options={[{ value: 'Fresh Graduate', label: 'Fresh Graduate' }, { value: '1-3 Tahun', label: '1 - 3 Tahun' }, { value: '> 5 Tahun', label: 'Lebih dari 5 Tahun' }]} />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Ekspektasi Gaji</label>
                        <input type="number" value={data.expected_salary} onChange={(e) => setData('expected_salary', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      {data.work_experience_history.map((work, idx) => (
                        <div key={idx} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 relative">
                          <div className="absolute top-4 right-4">
                            {data.work_experience_history.length > 1 && (
                              <button type="button" onClick={() => removeWorkRow(idx)} className="text-rose-500 p-1 bg-rose-50 rounded-md">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Perusahaan</label>
                              <input type="text" value={work.company} onChange={(e) => updateWorkRow(idx, 'company', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm" />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Posisi</label>
                              <input type="text" value={work.position} onChange={(e) => updateWorkRow(idx, 'position', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Deskripsi & Pencapaian</label>
                            <textarea rows={2} value={work.description} onChange={(e) => updateWorkRow(idx, 'description', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* STEP 4: Kontak Darurat & Submit */}
                {currentStep === 4 && (
                  <motion.div key="step4" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
                    <div className="border-b border-slate-100 pb-4 mb-6">
                      <h3 className="text-xl font-black text-slate-900">Kontak Darurat</h3>
                      <p className="text-sm text-slate-500">Keluarga atau kerabat yang bisa dihubungi saat darurat.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-2">Nama Kontak</label>
                        <input type="text" value={data.emergency_contact_name} onChange={(e) => setData('emergency_contact_name', e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-2">No. HP</label>
                        <input type="text" value={data.emergency_contact_phone} onChange={(e) => setData('emergency_contact_phone', e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-2">Hubungan</label>
                        <input type="text" value={data.emergency_contact_relation} onChange={(e) => setData('emergency_contact_relation', e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                      </div>
                    </div>

                    <div className="bg-brand-50 p-6 rounded-2xl mt-8 border border-brand-100">
                      <h4 className="font-bold text-brand-900 mb-2">Siap untuk Mengirim Lamaran?</h4>
                      <p className="text-sm text-brand-700">Pastikan semua data yang diisi valid dan dapat dipertanggungjawabkan.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="mt-10 flex items-center justify-between pt-6 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={prevStep}
                  className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center space-x-2 transition-all ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  <ChevronLeft className="w-4 h-4" /> <span>Kembali</span>
                </button>

                {currentStep < totalSteps ? (
                  <button 
                    type="button" 
                    onClick={nextStep}
                    className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm flex items-center space-x-2 transition-all"
                  >
                    <span>Selanjutnya</span> <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button 
                    type="submit" 
                    disabled={processing}
                    className="px-10 py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-black text-sm flex items-center space-x-2 transition-all shadow-lg shadow-brand-500/30"
                  >
                    <Send className="w-4 h-4" /> <span>Kirim Lamaran</span>
                  </button>
                )}
              </div>

            </form>
          </div>
        </div>
      </div>
    </>
  );
}
