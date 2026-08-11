import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import StatusBadge from '@/Components/StatusBadge';
import Select2 from '@/Components/Select2';
import { 
  Users, UserCheck, Star, Sparkles, CheckCircle2, XCircle, Clock, 
  FileText, ExternalLink, User, Copy, Check, Award, DollarSign, 
  Stethoscope, Send, UserPlus, Heart, PhoneCall, GraduationCap, Building2,
  ArrowRight, ShieldAlert, CheckSquare, Eye, AlertCircle, Trash2,
  Search, Filter, LayoutGrid, List, ArrowUpDown, ChevronRight, Briefcase, Calendar, X
} from 'lucide-react';
import { Head, useForm, router } from '@inertiajs/react';
import { showConfirm, showSuccess, showError } from '@/Utils/swal';

export default function CandidatePipeline({ vacancy, shareable_public_url, departments, positions, levels }) {
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [evalModalOpen, setEvalModalOpen] = useState(false);
  const [offeringModalOpen, setOfferingModalOpen] = useState(false);
  const [hireModalOpen, setHireModalOpen] = useState(false);
  const [mcuModalOpen, setMcuModalOpen] = useState(false);
  const [copiedToken, setCopiedToken] = useState(null);
  const [copiedPublic, setCopiedPublic] = useState(false);

  // UX & Scalability states for handling many candidates
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'table'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'hired' | 'rejected'
  const [stageFilter, setStageFilter] = useState('all'); // 'all' | stage_id
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'salary_desc' | 'salary_asc' | 'experience' | 'rating'

  // Calculate total stages and max order_no
  const totalStages = vacancy.stages ? vacancy.stages.length : 1;
  const maxStageOrder = vacancy.stages && vacancy.stages.length > 0 
    ? Math.max(...vacancy.stages.map(s => s.order_no)) 
    : 1;

  const allCandidates = vacancy.candidates || [];

  // Summary Metrics calculations
  const totalCandidatesCount = allCandidates.length;
  const activeCandidatesCount = allCandidates.filter(c => c.status !== 'rejected' && c.status !== 'hired').length;
  const hiredCandidatesCount = allCandidates.filter(c => c.status === 'hired').length;
  const rejectedCandidatesCount = allCandidates.filter(c => c.status === 'rejected').length;
  const evaluatedCandidatesCount = allCandidates.filter(c => c.stage_histories && c.stage_histories.length > 0).length;

  // Filtered and Sorted Candidates
  const filteredCandidates = useMemo(() => {
    return allCandidates.filter((candidate) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = candidate.full_name?.toLowerCase().includes(q);
        const matchesCode = candidate.candidate_code?.toLowerCase().includes(q);
        const matchesEmail = candidate.email?.toLowerCase().includes(q);
        const matchesPhone = candidate.phone?.toLowerCase().includes(q);
        const matchesMajor = candidate.major?.toLowerCase().includes(q);
        const matchesEducation = candidate.education?.toLowerCase().includes(q);

        if (!matchesName && !matchesCode && !matchesEmail && !matchesPhone && !matchesMajor && !matchesEducation) {
          return false;
        }
      }

      // 2. Status Filter
      if (statusFilter === 'active' && (candidate.status === 'rejected' || candidate.status === 'hired')) {
        return false;
      }
      if (statusFilter === 'hired' && candidate.status !== 'hired') {
        return false;
      }
      if (statusFilter === 'rejected' && candidate.status !== 'rejected') {
        return false;
      }

      // 3. Stage Filter
      if (stageFilter !== 'all' && String(candidate.current_stage_id) !== String(stageFilter)) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'salary_desc') {
        return (b.expected_salary || 0) - (a.expected_salary || 0);
      }
      if (sortBy === 'salary_asc') {
        return (a.expected_salary || 0) - (b.expected_salary || 0);
      }
      if (sortBy === 'experience') {
        const expA = parseInt(a.experience_years) || 0;
        const expB = parseInt(b.experience_years) || 0;
        return expB - expA;
      }
      if (sortBy === 'rating') {
        const ratingA = a.stage_histories?.[0]?.rating || 0;
        const ratingB = b.stage_histories?.[0]?.rating || 0;
        return ratingB - ratingA;
      }
      // default: newest (by id)
      return b.id - a.id;
    });
  }, [allCandidates, searchQuery, statusFilter, stageFilter, sortBy]);

  // Form Evaluasi & Skor Interview
  const evalForm = useForm({
    stage_id: '',
    result: 'passed',
    rating: 5,
    stage_type: 'hr_interview',
    hr_interview_score: 85,
    user_interview_score: 85,
    technical_score: 80,
    attitude_score: 90,
    interviewer_notes: '',
  });

  // Form MCU
  const mcuForm = useForm({
    mcu_date: new Date().toISOString().split('T')[0],
    clinic_hospital_name: 'RS Siloam / Klinik Prodia',
    result_status: 'Fit',
    notes: '',
  });

  // Form Offering Letter
  const offeringForm = useForm({
    offered_salary: '',
    offered_department_id: vacancy.department_id || '',
    offered_position_id: vacancy.position_id || '',
    offered_join_date: '',
    offering_letter_notes: '',
  });

  // Form Auto Hire & Convert Employee
  const hireForm = useForm({
    department_id: vacancy.department_id || '',
    position_id: vacancy.position_id || '',
    level_id: '',
    base_salary: '',
    employment_status: 'Probation',
    join_date: '',
  });

  const handleAdvanceCandidate = (candidate) => {
    const currentStageName = candidate.current_stage?.name || 'tahap saat ini';
    showConfirm({
      title: 'Loloskan Kandidat?',
      text: `${candidate.full_name} akan diloloskan dari "${currentStageName}" ke tahap berikutnya. Notifikasi email otomatis akan terkirim.`,
      icon: 'question',
      confirmText: 'Ya, Loloskan',
      cancelText: 'Batal',
      confirmButtonColor: 'emerald',
      onConfirm: () => {
        router.post(route('recruitment.candidate.advance', candidate.id), {}, {
          onError: (err) => showError('Gagal', Object.values(err)[0] || 'Terjadi kesalahan.')
        });
      }
    });
  };

  const handleRejectCandidate = (candidate) => {
    showConfirm({
      title: 'Gugurkan Kandidat?',
      text: `${candidate.full_name} akan ditandai sebagai TIDAK LULUS dan dipindahkan ke Candidate Pool. Tindakan ini tidak dapat dibatalkan.`,
      icon: 'warning',
      confirmText: 'Ya, Gugurkan',
      cancelText: 'Batal',
      confirmButtonColor: 'rose',
      onConfirm: () => {
        router.post(route('recruitment.candidate.reject', candidate.id));
      }
    });
  };

  const handleOpenDetail = (candidate) => {
    setSelectedCandidate(candidate);
    setDetailModalOpen(true);
  };

  const handleOpenEval = (candidate) => {
    setSelectedCandidate(candidate);
    evalForm.setData({
      stage_id: candidate.current_stage_id || (vacancy.stages[0] ? vacancy.stages[0].id : ''),
      result: 'passed',
      rating: 5,
      stage_type: candidate.current_stage?.name?.toLowerCase()?.includes('user') ? 'user_interview' : 'hr_interview',
      hr_interview_score: 85,
      user_interview_score: 85,
      technical_score: 80,
      attitude_score: 90,
      interviewer_notes: '',
    });
    setEvalModalOpen(true);
  };

  const handleOpenMcu = (candidate) => {
    setSelectedCandidate(candidate);
    mcuForm.setData({
      mcu_date: new Date().toISOString().split('T')[0],
      clinic_hospital_name: 'Klinik Prodia / RS Siloam',
      result_status: 'Fit',
      notes: '',
    });
    setMcuModalOpen(true);
  };

  const handleOpenOffering = (candidate) => {
    setSelectedCandidate(candidate);
    offeringForm.setData({
      offered_salary: candidate.expected_salary || 8000000,
      offered_department_id: vacancy.department_id || '',
      offered_position_id: vacancy.position_id || '',
      offered_join_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      offering_letter_notes: 'Selamat, Anda dinyatakan LULUS seleksi penerimaan karyawan!',
    });
    setOfferingModalOpen(true);
  };

  const handleOpenHire = (candidate) => {
    setSelectedCandidate(candidate);
    hireForm.setData({
      department_id: candidate.offered_department_id || vacancy.department_id || '',
      position_id: candidate.offered_position_id || vacancy.position_id || '',
      level_id: levels[0] ? levels[0].id : '',
      base_salary: candidate.offered_salary || candidate.expected_salary || 8000000,
      employment_status: 'Probation',
      join_date: candidate.offered_join_date || new Date().toISOString().split('T')[0],
    });
    setHireModalOpen(true);
  };

  const submitEval = (e) => {
    e.preventDefault();
    evalForm.post(route('recruitment.candidate.stage', selectedCandidate.id), {
      onSuccess: () => setEvalModalOpen(false)
    });
  };

  const submitMcu = (e) => {
    e.preventDefault();
    mcuForm.post(route('recruitment.candidate.mcu', selectedCandidate.id), {
      onSuccess: () => setMcuModalOpen(false)
    });
  };

  const submitOffering = (e) => {
    e.preventDefault();
    offeringForm.post(route('recruitment.candidate.offering', selectedCandidate.id), {
      onSuccess: () => setOfferingModalOpen(false)
    });
  };

  const submitHire = (e) => {
    e.preventDefault();
    hireForm.post(route('recruitment.candidate.convert', selectedCandidate.id), {
      onSuccess: () => setHireModalOpen(false)
    });
  };

  const handleCopyText = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'public') {
      setCopiedPublic(true);
      setTimeout(() => setCopiedPublic(false), 2000);
    } else {
      setCopiedToken(type);
      setTimeout(() => setCopiedToken(null), 2000);
    }
  };

  // Helper text for next stage button
  const getNextStageLabel = (currentStageOrder) => {
    const next = vacancy.stages ? vacancy.stages.find(s => s.order_no === currentStageOrder + 1) : null;
    return next ? `Loloskan -> ${next.name}` : 'Loloskan ke Tahap Berikutnya';
  };

  return (
    <AuthenticatedLayout headerTitle={`Pipeline Seleksi: ${vacancy.title}`}>
      <Head title={`Pipeline - ${vacancy.title}`} />

      {/* KPI Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Pelamar</div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">{totalCandidatesCount}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 font-black shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Aktif Dalam Proses</div>
            <div className="text-2xl font-black text-amber-600 tracking-tight">{activeCandidatesCount}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-black shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sudah Dievaluasi</div>
            <div className="text-2xl font-black text-blue-600 tracking-tight">{evaluatedCandidatesCount}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-black shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Terkonversi / Hired</div>
            <div className="text-2xl font-black text-emerald-600 tracking-tight">{hiredCandidatesCount}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4 col-span-2 sm:col-span-1">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 font-black shrink-0">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ditolak / Gugur</div>
            <div className="text-2xl font-black text-rose-600 tracking-tight">{rejectedCandidatesCount}</div>
          </div>
        </div>
      </div>

      {/* Interactive Control & Search Toolbar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Left: Search Input & Filters */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          
          {/* Live Search */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, email, kode, atau jurusan..."
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-brand-500 transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Status */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:inline-block" />
            <Select2
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              size="sm"
              options={[
                { value: 'all', label: 'Semua Status' },
                { value: 'active', label: `Aktif Dalam Proses (${activeCandidatesCount})` },
                { value: 'hired', label: `Karyawan (Hired) (${hiredCandidatesCount})` },
                { value: 'rejected', label: `Ditolak (${rejectedCandidatesCount})` }
              ]}
            />
          </div>

          {/* Filter Stage */}
          <div>
            <Select2
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              size="sm"
              options={[
                { value: 'all', label: 'Semua Tahap Seleksi' },
                ...(vacancy.stages ? vacancy.stages.map((s) => ({
                  value: s.id,
                  label: `Tahap ${s.order_no}: ${s.name}`
                })) : [])
              ]}
            />
          </div>

          {/* Sort By */}
          <div className="flex items-center space-x-1.5 min-w-[180px]">
            <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0 hidden sm:inline-block" />
            <Select2
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              size="sm"
              options={[
                { value: 'newest', label: 'Urutkan: Terbaru' },
                { value: 'salary_desc', label: 'Gaji Ekspektasi: High to Low' },
                { value: 'salary_asc', label: 'Gaji Ekspektasi: Low to High' },
                { value: 'experience', label: 'Pengalaman Terbanyak' },
                { value: 'rating', label: 'Rating Evaluasi Tertinggi' }
              ]}
            />
          </div>

        </div>

        {/* Right: View Toggle (Kanban vs Table) */}
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
          <span className="text-xs font-extrabold text-slate-500 font-mono">
            {filteredCandidates.length} {filteredCandidates.length === totalCandidatesCount ? 'Kandidat' : `dari ${totalCandidatesCount} Hasil Filter`}
          </span>

          <div className="bg-slate-100 p-1 rounded-2xl flex items-center space-x-1 border border-slate-200">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center space-x-1.5 transition-all ${
                viewMode === 'kanban'
                  ? 'bg-white text-brand-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center space-x-1.5 transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-brand-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Tabel / List</span>
            </button>
          </div>
        </div>

      </div>

      {/* Main Content View: Kanban Board vs Table List */}
      {viewMode === 'kanban' ? (
        
        /* ---------------- KANBAN VIEW ---------------- */
        <div className="flex space-x-6 overflow-x-auto pb-8 scrollbar-thin items-start">
          {vacancy.stages && vacancy.stages.map((stage) => {
            // Stage candidates filtered by live filters
            const stageCandidates = filteredCandidates.filter(c => c.current_stage_id === stage.id);
            const rawStageCandidatesCount = allCandidates.filter(c => c.current_stage_id === stage.id).length;
            
            const isFinalStage = stage.order_no === maxStageOrder;
            const stageNameLower = stage.name.toLowerCase();

            const isPsychotestStage = stageNameLower.includes('psikotes');
            const isInterviewStage = stageNameLower.includes('interview') || stageNameLower.includes('technical');
            const isMcuStage = stageNameLower.includes('mcu') || stageNameLower.includes('medical');

            return (
              <div key={stage.id} className="w-96 shrink-0 bg-slate-50/90 p-5 rounded-[32px] border border-slate-200/90 flex flex-col max-h-[calc(100vh-230px)] shadow-xs">
                
                {/* Stage Header */}
                <div className="pb-4 mb-4 border-b border-slate-200">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Tahap {stage.order_no} dari {totalStages}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white border border-slate-200 font-black text-xs text-brand-600 shadow-xs">
                      {stageCandidates.length} Pelamar
                    </span>
                  </div>
                  <h3 className="font-black text-slate-900 text-base tracking-tight">{stage.name}</h3>

                  {/* Stage Progress indicator */}
                  {totalCandidatesCount > 0 && (
                    <div className="mt-2.5 w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-brand-500 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${Math.round((rawStageCandidatesCount / totalCandidatesCount) * 100)}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Candidates Cards Vertical Scroll Feed */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-1.5 scrollbar-thin">
                  {stageCandidates.map((candidate) => {
                    const isRejected = candidate.status === 'rejected';
                    const isHired = candidate.status === 'hired';

                    return (
                      <div key={candidate.id} className={`bg-white p-5 rounded-2xl border shadow-xs transition-all space-y-4 relative ${
                        isRejected ? 'border-rose-200 bg-rose-50/20' : 
                        isHired ? 'border-emerald-200 bg-emerald-50/20' : 
                        'border-slate-200/90 hover:border-brand-300 hover:shadow-md'
                      }`}>
                        
                        {/* Top Code & Status */}
                        <div className="flex items-start justify-between">
                          <span className="font-mono text-[11px] font-black text-brand-600 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-100">
                            {candidate.candidate_code}
                          </span>
                          <StatusBadge status={candidate.status} />
                        </div>

                        {/* Candidate Avatar & Info */}
                        <div className="flex items-center space-x-3">
                          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 border border-brand-200 flex items-center justify-center font-black text-white text-base shadow-sm shrink-0">
                            {candidate.full_name.charAt(0)}
                          </div>
                          <div className="overflow-hidden">
                            <h4 className="font-black text-slate-900 text-base leading-tight truncate">{candidate.full_name}</h4>
                            <p className="text-xs text-slate-500 font-semibold mt-0.5 truncate">{candidate.phone} • {candidate.email}</p>
                          </div>
                        </div>

                        {/* Info Summary Box */}
                        <div className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-100 space-y-2 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400 font-bold flex items-center space-x-1">
                              <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                              <span>Pendidikan:</span>
                            </span>
                            <span className="font-bold text-slate-800 text-right truncate max-w-[170px]">{candidate.education} ({candidate.major || '-'})</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400 font-bold flex items-center space-x-1">
                              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                              <span>Pengalaman:</span>
                            </span>
                            <span className="font-bold text-slate-800">{candidate.experience_years}</span>
                          </div>
                          {candidate.expected_salary > 0 && (
                            <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                              <span className="text-slate-400 font-bold flex items-center space-x-1">
                                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Ekspektasi:</span>
                              </span>
                              <span className="font-black text-emerald-700">Rp {Number(candidate.expected_salary).toLocaleString('id-ID')}</span>
                            </div>
                          )}
                        </div>

                        {/* Unique Psychotest Link Box */}
                        {isPsychotestStage && candidate.psychotest_unique_url && (
                          <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl flex items-center justify-between text-xs">
                            <div className="overflow-hidden mr-2">
                              <div className="text-[10px] font-extrabold uppercase tracking-widest text-purple-700">Link Psikotes Online</div>
                              <div className="text-slate-500 text-[11px] font-mono truncate">{candidate.psychotest_unique_url}</div>
                            </div>
                            <button
                              onClick={() => handleCopyText(candidate.psychotest_unique_url, candidate.id)}
                              className="px-3 py-1.5 bg-white border border-purple-200 rounded-lg text-purple-800 font-bold text-xs hover:bg-purple-100 transition-colors shrink-0 shadow-xs"
                            >
                              {copiedToken === candidate.id ? 'Copied' : 'Copy'}
                            </button>
                          </div>
                        )}

                        {/* Evaluator Score & Rating */}
                        {candidate.stage_histories && candidate.stage_histories.length > 0 && (
                          <div className="p-3 bg-amber-50/90 border border-amber-200/80 rounded-xl text-xs space-y-1">
                            <div className="font-bold text-amber-900 flex items-center justify-between">
                              <span>Hasil Evaluasi Terakhir:</span>
                              <span className="font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                                {candidate.stage_histories[0].rating} ★
                              </span>
                            </div>
                            {candidate.stage_histories[0].interviewer_notes && (
                              <p className="text-amber-800 italic line-clamp-2 text-[11px]">"{candidate.stage_histories[0].interviewer_notes}"</p>
                            )}
                          </div>
                        )}

                        {/* Primary Action Button: Advancement */}
                        {!isFinalStage && !isRejected && !isHired && (
                          <button
                            onClick={() => handleAdvanceCandidate(candidate)}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                          >
                            <span>{getNextStageLabel(stage.order_no)}</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        )}

                        {/* Final Stage Action */}
                        {isFinalStage && !isRejected && (
                          isHired || candidate.converted_employee_id ? (
                            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs font-bold text-emerald-800 flex items-center justify-center space-x-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>Karyawan Aktif Perusahaan</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleOpenHire(candidate)}
                              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs rounded-xl shadow-md shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5"
                            >
                              <UserCheck className="w-4 h-4" />
                              <span>Terima Penawaran & Auto NIK</span>
                            </button>
                          )
                        )}

                        {/* Stage-Contextual Action Buttons Row */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                          <button
                            onClick={() => handleOpenDetail(candidate)}
                            className="flex-1 py-2 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-center space-x-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Rincian</span>
                          </button>

                          {isInterviewStage && (
                            <button
                              onClick={() => handleOpenEval(candidate)}
                              className="flex-1 py-2 px-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center space-x-1"
                            >
                              <Star className="w-3.5 h-3.5" />
                              <span>Skor</span>
                            </button>
                          )}

                          {isMcuStage && (
                            <button
                              onClick={() => handleOpenMcu(candidate)}
                              className="flex-1 py-2 px-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center space-x-1"
                            >
                              <Stethoscope className="w-3.5 h-3.5" />
                              <span>MCU</span>
                            </button>
                          )}

                          {isFinalStage && (
                            <button
                              onClick={() => handleOpenOffering(candidate)}
                              className="flex-1 py-2 px-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center space-x-1"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Offering</span>
                            </button>
                          )}

                          {!isRejected && !isHired && (
                            <button
                              onClick={() => handleRejectCandidate(candidate)}
                              className="py-2 px-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs rounded-xl transition-colors shrink-0"
                              title="Tolak Kandidat"
                            >
                              Tolak
                            </button>
                          )}
                        </div>

                      </div>
                    );
                  })}

                  {stageCandidates.length === 0 && (
                    <div className="py-16 text-center text-xs text-slate-400 font-bold border-2 border-dashed border-slate-200/80 rounded-2xl bg-white/50">
                      {searchQuery || statusFilter !== 'all' ? 'Tidak ada kandidat cocok dengan filter.' : 'Belum ada kandidat di tahap ini.'}
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      ) : (

        /* ---------------- TABLE / LIST VIEW MODE ---------------- */
        <div className="bg-white rounded-[32px] border border-slate-200 shadow-xs overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Kandidat</th>
                  <th className="py-4 px-6">Pendidikan & Pengalaman</th>
                  <th className="py-4 px-6">Ekspektasi Gaji</th>
                  <th className="py-4 px-6">Tahap Seleksi Saat Ini</th>
                  <th className="py-4 px-6">Hasil Evaluasi</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Aksi Pintar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {filteredCandidates.map((candidate) => {
                  const currentStage = vacancy.stages?.find(s => s.id === candidate.current_stage_id);
                  const isFinalStage = currentStage?.order_no === maxStageOrder;
                  const isRejected = candidate.status === 'rejected';
                  const isHired = candidate.status === 'hired';

                  return (
                    <tr key={candidate.id} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* Candidate Name & Code */}
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-black flex items-center justify-center shrink-0 shadow-xs">
                            {candidate.full_name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-black text-slate-900 text-sm flex items-center space-x-2">
                              <span>{candidate.full_name}</span>
                              <span className="font-mono text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-100">
                                {candidate.candidate_code}
                              </span>
                            </div>
                            <div className="text-slate-400 text-xs mt-0.5">{candidate.phone} • {candidate.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Education & Exp */}
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-800">{candidate.education} ({candidate.major || '-'})</div>
                        <div className="text-slate-400 text-xs">{candidate.experience_years} pengalaman</div>
                      </td>

                      {/* Expected Salary */}
                      <td className="py-4 px-6 font-bold text-emerald-700">
                        {candidate.expected_salary > 0 
                          ? `Rp ${Number(candidate.expected_salary).toLocaleString('id-ID')}`
                          : '-'}
                      </td>

                      {/* Current Stage */}
                      <td className="py-4 px-6">
                        {currentStage ? (
                          <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-slate-100 rounded-full font-bold text-slate-800 text-xs">
                            <span className="w-2 h-2 rounded-full bg-brand-500"></span>
                            <span>Tahap {currentStage.order_no}: {currentStage.name}</span>
                          </span>
                        ) : '-'}
                      </td>

                      {/* Evaluation Rating */}
                      <td className="py-4 px-6">
                        {candidate.stage_histories && candidate.stage_histories.length > 0 ? (
                          <div className="inline-flex items-center space-x-1 px-2.5 py-1 bg-amber-50 text-amber-800 rounded-lg border border-amber-200 font-black text-xs">
                            <span>{candidate.stage_histories[0].rating} ★</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Belum dievaluasi</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <StatusBadge status={candidate.status} />
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleOpenDetail(candidate)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                          >
                            Detail
                          </button>

                          {!isFinalStage && !isRejected && !isHired && (
                            <button
                              onClick={() => handleAdvanceCandidate(candidate)}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1"
                            >
                              <span>Loloskan</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {isFinalStage && !isRejected && !isHired && (
                            <button
                              onClick={() => handleOpenHire(candidate)}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Hire & NIK</span>
                            </button>
                          )}

                          {!isRejected && !isHired && (
                            <button
                              onClick={() => handleRejectCandidate(candidate)}
                              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl border border-rose-200 transition-colors"
                            >
                              Tolak
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })}

                {filteredCandidates.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-slate-400 font-bold">
                      Tidak ditemukan kandidat pelamar yang sesuai filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      )}

      {/* Modal 1: Detail Data Pribadi Kandidat */}
      {selectedCandidate && (
        <Modal isOpen={detailModalOpen} onClose={() => setDetailModalOpen(false)} title={`Detail Data Pribadi: ${selectedCandidate.full_name}`}>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <div><span className="text-slate-400 font-bold">Kode Kandidat:</span> <span className="font-mono font-extrabold text-brand-600">{selectedCandidate.candidate_code}</span></div>
              <div><span className="text-slate-400 font-bold">Status:</span> <StatusBadge status={selectedCandidate.status} /></div>
              <div><span className="text-slate-400 font-bold">No. KTP Identitas:</span> <span className="font-semibold text-slate-800">{selectedCandidate.nik_ktp || '-'}</span></div>
              <div><span className="text-slate-400 font-bold">Jenis Kelamin:</span> <span className="font-semibold text-slate-800">{selectedCandidate.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span></div>
              <div><span className="text-slate-400 font-bold">Tempat, Tgl Lahir:</span> <span className="font-semibold text-slate-800">{selectedCandidate.birth_place || '-'}, {selectedCandidate.birth_date || '-'}</span></div>
              <div><span className="text-slate-400 font-bold">Agama / Status:</span> <span className="font-semibold text-slate-800">{selectedCandidate.religion || '-'} / {selectedCandidate.marital_status || '-'}</span></div>
              <div><span className="text-slate-400 font-bold">Email:</span> <span className="font-semibold text-slate-800">{selectedCandidate.email}</span></div>
              <div><span className="text-slate-400 font-bold">No. WhatsApp / HP:</span> <span className="font-semibold text-slate-800">{selectedCandidate.phone}</span></div>
              <div className="col-span-2"><span className="text-slate-400 font-bold">Alamat Lengkap:</span> <span className="font-semibold text-slate-800">{selectedCandidate.address}</span></div>
            </div>

            {/* Riwayat Pendidikan Formal (Multi-Entry Timeline) */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-3">
              <h4 className="font-extrabold text-purple-900 uppercase tracking-wider flex items-center space-x-1.5">
                <GraduationCap className="w-4 h-4 text-purple-600" />
                <span>Riwayat Pendidikan Formal</span>
              </h4>

              {Array.isArray(selectedCandidate.education_history) && selectedCandidate.education_history.length > 0 ? (
                <div className="space-y-2">
                  {selectedCandidate.education_history.map((edu, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 flex items-start justify-between">
                      <div>
                        <div className="font-extrabold text-slate-900">{edu.institution || selectedCandidate.last_education_institution || 'Sekolah/Universitas'}</div>
                        <div className="text-slate-500">{edu.major ? `${edu.major} • ` : ''}IPK: {edu.gpa || '-'}</div>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-800 font-extrabold rounded text-[10px]">{edu.level || selectedCandidate.education}</span>
                        {edu.start_year && <div className="text-[10px] text-slate-400 font-mono mt-0.5">{edu.start_year}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 text-slate-800">
                  <div><span className="text-slate-400 font-bold">Pendidikan:</span> <span className="font-semibold">{selectedCandidate.education}</span></div>
                  <div><span className="text-slate-400 font-bold">Universitas/Sekolah:</span> <span className="font-semibold">{selectedCandidate.last_education_institution || '-'}</span></div>
                  <div><span className="text-slate-400 font-bold">Jurusan / IPK:</span> <span className="font-semibold">{selectedCandidate.major || '-'} ({selectedCandidate.gpa || '-'})</span></div>
                </div>
              )}
            </div>

            {/* Riwayat Sertifikasi / Non-Formal */}
            {Array.isArray(selectedCandidate.non_formal_education_history) && selectedCandidate.non_formal_education_history.length > 0 && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-3">
                <h4 className="font-extrabold text-teal-900 uppercase tracking-wider flex items-center space-x-1.5">
                  <Award className="w-4 h-4 text-teal-600" />
                  <span>Sertifikasi & Pendidikan Non-Formal</span>
                </h4>
                <div className="space-y-2">
                  {selectedCandidate.non_formal_education_history.map((item, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 flex items-start justify-between">
                      <div>
                        <div className="font-extrabold text-slate-900">{item.name}</div>
                        <div className="text-slate-500">{item.organizer} {item.certificate_no ? `• No: ${item.certificate_no}` : ''}</div>
                      </div>
                      {item.year && <span className="px-2 py-0.5 bg-teal-100 text-teal-800 font-mono font-bold rounded text-[10px]">{item.year}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Riwayat Pengalaman Kerja */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-3">
              <h4 className="font-extrabold text-blue-900 uppercase tracking-wider flex items-center space-x-1.5">
                <Briefcase className="w-4 h-4 text-blue-600" />
                <span>Riwayat Pengalaman Kerja ({selectedCandidate.experience_years})</span>
              </h4>

              {Array.isArray(selectedCandidate.work_experience_history) && selectedCandidate.work_experience_history.length > 0 ? (
                <div className="space-y-2">
                  {selectedCandidate.work_experience_history.map((work, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="font-extrabold text-slate-900">{work.position} — <span className="text-blue-700">{work.company}</span></div>
                        {work.period && <span className="px-2 py-0.5 bg-blue-50 text-blue-800 font-mono font-bold rounded text-[10px]">{work.period}</span>}
                      </div>
                      {work.description && <p className="text-slate-600 leading-relaxed text-[11px]">{work.description}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-700 font-medium">
                  {selectedCandidate.work_experience_detail || selectedCandidate.experience_years}
                </div>
              )}

              {selectedCandidate.expected_salary > 0 && (
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-slate-500 font-bold">Ekspektasi Gaji:</span>
                  <span className="font-black text-emerald-700 text-sm">Rp {Number(selectedCandidate.expected_salary).toLocaleString('id-ID')} / bulan</span>
                </div>
              )}
            </div>

            {selectedCandidate.emergency_contact_name && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-amber-600" />
                  <span>Kontak Darurat</span>
                </h4>
                <p><span className="text-slate-400 font-bold">Nama:</span> {selectedCandidate.emergency_contact_name} ({selectedCandidate.emergency_contact_relation})</p>
                <p><span className="text-slate-400 font-bold">No HP Darurat:</span> {selectedCandidate.emergency_contact_phone}</p>
              </div>
            )}

            {/* DISC Personality Assessment Result */}
            {selectedCandidate.disc_profile && (
              <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-200 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-indigo-900 uppercase tracking-wider flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>Profil Kepribadian DISC</span>
                  </h4>
                  <span className="px-2.5 py-0.5 bg-indigo-600 text-white font-extrabold rounded-full text-[11px]">
                    {selectedCandidate.disc_profile.primary || 'Dominance'}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-white p-2 rounded-xl border border-indigo-100 shadow-2xs">
                    <div className="text-[10px] font-bold text-indigo-400">D (Dominance)</div>
                    <div className="text-sm font-black text-indigo-900">{selectedCandidate.disc_profile.percentages?.D || 0}%</div>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-indigo-100 shadow-2xs">
                    <div className="text-[10px] font-bold text-indigo-400">I (Influence)</div>
                    <div className="text-sm font-black text-indigo-900">{selectedCandidate.disc_profile.percentages?.I || 0}%</div>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-indigo-100 shadow-2xs">
                    <div className="text-[10px] font-bold text-indigo-400">S (Steadiness)</div>
                    <div className="text-sm font-black text-indigo-900">{selectedCandidate.disc_profile.percentages?.S || 0}%</div>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-indigo-100 shadow-2xs">
                    <div className="text-[10px] font-bold text-indigo-400">C (Compliance)</div>
                    <div className="text-sm font-black text-indigo-900">{selectedCandidate.disc_profile.percentages?.C || 0}%</div>
                  </div>
                </div>
              </div>
            )}

            {/* Offering Letter & Digital Signature Status */}
            {selectedCandidate.offering_status && (
              <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-emerald-900 uppercase tracking-wider flex items-center space-x-1.5">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span>Offering Letter & Tanda Tangan</span>
                  </h4>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] uppercase ${
                    selectedCandidate.offering_status === 'accepted' ? 'bg-emerald-600 text-white' :
                    selectedCandidate.offering_status === 'declined' ? 'bg-rose-600 text-white' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedCandidate.offering_status}
                  </span>
                </div>

                <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-emerald-100">
                  <div>
                    <div className="font-bold text-slate-800">Link Offering Letter Candidate:</div>
                    <div className="text-[11px] text-slate-400 font-mono">{route('offering.portal', selectedCandidate.access_token)}</div>
                  </div>
                  <a
                    href={route('offering.portal', selectedCandidate.access_token)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center space-x-1 shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Buka Portal</span>
                  </a>
                </div>

                {selectedCandidate.signature_data && (
                  <div className="pt-2 border-t border-emerald-200">
                    <div className="text-[11px] font-bold text-slate-500 mb-1">Tanda Tangan Digital Terverifikasi:</div>
                    <img src={selectedCandidate.signature_data} alt="Signature" className="h-16 bg-white p-1.5 rounded-lg border border-slate-200" />
                  </div>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Modal 2: Evaluasi & Poin Interview */}
      {selectedCandidate && (
        <Modal isOpen={evalModalOpen} onClose={() => setEvalModalOpen(false)} title={`Form Evaluasi & Skor Interview: ${selectedCandidate.full_name}`}>
          <form onSubmit={submitEval} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Pilih Tahap Seleksi *</label>
              <Select2
                value={evalForm.data.stage_id}
                onChange={(e) => evalForm.setData('stage_id', e.target.value)}
                options={vacancy.stages ? vacancy.stages.map((s) => ({ value: s.id, label: s.name })) : []}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Skor Interview HR (1-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={evalForm.data.hr_interview_score}
                  onChange={(e) => evalForm.setData('hr_interview_score', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Skor Interview User (1-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={evalForm.data.user_interview_score}
                  onChange={(e) => evalForm.setData('user_interview_score', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Skor Technical Test (1-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={evalForm.data.technical_score}
                  onChange={(e) => evalForm.setData('technical_score', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Skor Sikap & Komunikasi (1-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={evalForm.data.attitude_score}
                  onChange={(e) => evalForm.setData('attitude_score', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Rating Keseluruhan (1 - 5 Bintang)</label>
              <Select2
                value={evalForm.data.rating}
                onChange={(e) => evalForm.setData('rating', e.target.value)}
                options={[
                  { value: '5', label: '5 Bintang (Sangat Direkomendasikan)' },
                  { value: '4', label: '4 Bintang (Direkomendasikan)' },
                  { value: '3', label: '3 Bintang (Cukup)' },
                  { value: '2', label: '2 Bintang (Kurang)' },
                  { value: '1', label: '1 Bintang (Tidak Lulus)' }
                ]}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Catatan Evaluator / Notes Interviewer</label>
              <textarea
                rows={3}
                value={evalForm.data.interviewer_notes}
                onChange={(e) => evalForm.setData('interviewer_notes', e.target.value)}
                placeholder="Catatan kelebihan, kekurangan, dan poin hasil interview..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
              />
            </div>

            <div className="pt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setEvalModalOpen(false)}
                className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold text-sm rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={evalForm.processing}
                className="px-6 py-2.5 bg-amber-600 text-white font-bold text-sm rounded-xl shadow-md"
              >
                Simpan Evaluasi
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal MCU */}
      {selectedCandidate && (
        <Modal isOpen={mcuModalOpen} onClose={() => setMcuModalOpen(false)} title={`Catat Hasil MCU: ${selectedCandidate.full_name}`}>
          <form onSubmit={submitMcu} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Tanggal Pemeriksaan MCU *</label>
              <input
                type="date"
                required
                value={mcuForm.data.mcu_date}
                onChange={(e) => mcuForm.setData('mcu_date', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Nama Klinik / Rumah Sakit *</label>
              <input
                type="text"
                required
                value={mcuForm.data.clinic_hospital_name}
                onChange={(e) => mcuForm.setData('clinic_hospital_name', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Status Hasil MCU *</label>
              <Select2
                value={mcuForm.data.result_status}
                onChange={(e) => mcuForm.setData('result_status', e.target.value)}
                options={[
                  { value: 'Fit', label: 'Fit to Work (Lolos)' },
                  { value: 'FollowUp', label: 'Perlu Follow Up Medis' },
                  { value: 'Unfit', label: 'Unfit (Tidak Lolos MCU)' }
                ]}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Catatan Hasil MCU</label>
              <textarea
                rows={3}
                value={mcuForm.data.notes}
                onChange={(e) => mcuForm.setData('notes', e.target.value)}
                placeholder="Catatan hasil tes darah, Rontgen, dll..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
              />
            </div>

            <div className="pt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setMcuModalOpen(false)}
                className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold text-sm rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={mcuForm.processing}
                className="px-6 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl shadow-md"
              >
                Simpan Hasil MCU
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal 3: Offering Letter Form */}
      {selectedCandidate && (
        <Modal isOpen={offeringModalOpen} onClose={() => setOfferingModalOpen(false)} title={`Buat Offering Letter: ${selectedCandidate.full_name}`}>
          <form onSubmit={submitOffering} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Nominal Gaji Penawaran (Rp/Bulan) *</label>
              <input
                type="number"
                required
                value={offeringForm.data.offered_salary}
                onChange={(e) => offeringForm.setData('offered_salary', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Departemen Dituju *</label>
                <Select2
                  value={offeringForm.data.offered_department_id}
                  onChange={(e) => offeringForm.setData('offered_department_id', e.target.value)}
                  options={departments.map((d) => ({ value: d.id, label: d.name }))}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Jabatan Dituju *</label>
                <Select2
                  value={offeringForm.data.offered_position_id}
                  onChange={(e) => offeringForm.setData('offered_position_id', e.target.value)}
                  options={positions.map((p) => ({ value: p.id, label: p.name }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Rencana Tanggal Mulai Kerja (Join Date) *</label>
              <input
                type="date"
                required
                value={offeringForm.data.offered_join_date}
                onChange={(e) => offeringForm.setData('offered_join_date', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Catatan Penawaran Kerja / Benefits</label>
              <textarea
                rows={3}
                value={offeringForm.data.offering_letter_notes}
                onChange={(e) => offeringForm.setData('offering_letter_notes', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
              />
            </div>

            <div className="pt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setOfferingModalOpen(false)}
                className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold text-sm rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={offeringForm.processing}
                className="px-6 py-2.5 bg-purple-600 text-white font-bold text-sm rounded-xl shadow-md"
              >
                Simpan Offering Letter
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal 4: 1-Click Hire & Auto NIK Conversion */}
      {selectedCandidate && (
        <Modal isOpen={hireModalOpen} onClose={() => setHireModalOpen(false)} title={`Konfirmasi Hire & Auto NIK: ${selectedCandidate.full_name}`}>
          <form onSubmit={submitHire} className="space-y-4">
            
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 space-y-1">
              <div className="font-bold flex items-center space-x-1">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Tahap Akhir (Offering Accepted): Auto-Generate NIK Engine Active</span>
              </div>
              <p>Kandidat ini sudah lulus semua tahapan. Jika Anda menekan tombol di bawah, kandidat ini akan resmi menjadi karyawan aktif dan sistem akan **membuatkan NIK secara otomatis**.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Departemen *</label>
                <Select2
                  value={hireForm.data.department_id}
                  onChange={(e) => hireForm.setData('department_id', e.target.value)}
                  options={departments.map((d) => ({ value: d.id, label: d.name }))}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Jabatan *</label>
                <Select2
                  value={hireForm.data.position_id}
                  onChange={(e) => hireForm.setData('position_id', e.target.value)}
                  options={positions.map((p) => ({ value: p.id, label: p.name }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Status Ketenagakerjaan *</label>
                <Select2
                  value={hireForm.data.employment_status}
                  onChange={(e) => hireForm.setData('employment_status', e.target.value)}
                  options={[
                    { value: 'Probation', label: 'Probation (Percobaan)' },
                    { value: 'Contract', label: 'PKWT (Kontrak)' },
                    { value: 'Permanent', label: 'PKWTT (Tetap)' }
                  ]}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Gaji Pokok (Rp/Bulan) *</label>
                <input
                  type="number"
                  required
                  value={hireForm.data.base_salary}
                  onChange={(e) => hireForm.setData('base_salary', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Tanggal Mulai Bekerja (Join Date) *</label>
              <input
                type="date"
                required
                value={hireForm.data.join_date}
                onChange={(e) => hireForm.setData('join_date', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
              />
            </div>

            <div className="pt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setHireModalOpen(false)}
                className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold text-sm rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={hireForm.processing}
                className="px-6 py-2.5 bg-emerald-600 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/30 flex items-center space-x-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>Terima Karyawan & Generate NIK</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

    </AuthenticatedLayout>
  );
}
