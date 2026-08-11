import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import Select2 from '@/Components/Select2';
import { useForm, Head, router } from '@inertiajs/react';
import { Plus, CheckCircle2, Clock, XCircle, BarChart3, ArrowRight, Check, X, FileText, Activity, ChevronRight, Info, Shield } from 'lucide-react';
import { showConfirm, showSuccess } from '@/Utils/swal';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

const STATUS_CFG = {
    draft:                { label: 'Draft',            cls: 'bg-slate-100 text-slate-600 border-slate-300',   Icon: Clock },
    submitted_to_manager: { label: 'Menunggu Manager', cls: 'bg-amber-50 text-amber-700 border-amber-300',    Icon: Clock },
    submitted:            { label: 'Menunggu Manager', cls: 'bg-amber-50 text-amber-700 border-amber-300',    Icon: Clock },
    submitted_to_hr:      { label: 'Menunggu HR',      cls: 'bg-blue-50 text-blue-700 border-blue-300',       Icon: Clock },
    approved:             { label: 'Disetujui',        cls: 'bg-emerald-50 text-emerald-700 border-emerald-300', Icon: CheckCircle2 },
    rejected:             { label: 'Ditolak',          cls: 'bg-rose-50 text-rose-700 border-rose-300',       Icon: XCircle },
};
const GRADE_CFG = {
    A: { cls: 'bg-emerald-100 text-emerald-800 border-emerald-400', label: 'Sangat Baik' },
    B: { cls: 'bg-blue-100 text-blue-800 border-blue-400',          label: 'Baik' },
    C: { cls: 'bg-amber-100 text-amber-800 border-amber-400',       label: 'Cukup' },
    D: { cls: 'bg-rose-100 text-rose-800 border-rose-400',          label: 'Perlu Perbaikan' },
};

const StatusPill = ({ status }) => {
    const cfg = STATUS_CFG[status] ?? STATUS_CFG.draft;
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${cfg.cls}`}>
            <cfg.Icon className="w-2.5 h-2.5" />{cfg.label}
        </span>
    );
};
const GradeChip = ({ grade }) => {
    const cfg = GRADE_CFG[grade] ?? GRADE_CFG.D;
    return (
        <span className={`inline-flex flex-col items-center justify-center w-9 h-9 rounded-xl font-black text-sm border-2 ${cfg.cls}`}>
            {grade}
        </span>
    );
};
const SectionLabel = ({ children }) => (
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{children}</p>
);

const getRadarData = (appraisal) => {
    if (!appraisal?.details?.length) return [];
    const map = {};
    appraisal.details.forEach((d) => {
        const cat = d.template_indicator?.category ?? d.indicator?.category;
        if (!cat) return;
        const k = cat.id ?? cat.name;
        if (!map[k]) map[k] = { category: cat.name, total: 0, count: 0 };
        map[k].total += parseFloat(d.score); map[k].count++;
    });
    return Object.values(map).map((c) => ({ category: c.category, score: Math.round(c.total / c.count), fullMark: 100 }));
};

const FormField = ({ label, hint, children }) => (
    <div>
        <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1">{label}</label>
        {children}
        {hint && <p className="text-[10px] text-slate-400 mt-1">{hint}</p>}
    </div>
);

const inputCls = "w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400";

export default function KpiIndex({ appraisals, employees, templates, stats }) {
    const [selectedAppraisal, setSelectedAppraisal] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isApprovalOpen, setIsApprovalOpen] = useState(false);
    const [approvalAction, setApprovalAction] = useState(null);

    const appraisalForm = useForm({ employee_id: employees[0]?.id ?? '', kpi_template_id: '', period_name: '', start_date: '', end_date: '', overall_feedback: '', scores: [] });
    const approvalForm = useForm({ notes: '' });

    const activeTpl = templates.find((t) => t.id == appraisalForm.data.kpi_template_id);
    const previewScore = useMemo(() => {
        if (!activeTpl) return 0;
        let f = 0;
        activeTpl.categories?.forEach((cat) => {
            let cs = 0;
            cat.indicators?.forEach((ind) => {
                const e = appraisalForm.data.scores.find((s) => s.template_indicator_id === ind.id);
                cs += ((e?.score ?? 0) * (parseFloat(ind.weight_percentage) || 0)) / 100;
            });
            f += (cs * (parseFloat(cat.weight_percentage) || 0)) / 100;
        });
        return Math.round(f * 100) / 100;
    }, [appraisalForm.data.scores, activeTpl]);
    const previewGrade = previewScore >= 90 ? 'A' : previewScore >= 80 ? 'B' : previewScore >= 70 ? 'C' : 'D';

    const handleTemplateSelect = (id) => {
        appraisalForm.setData('kpi_template_id', id);
        const tpl = templates.find((t) => t.id == id);
        if (!tpl) { appraisalForm.setData('scores', []); return; }
        const scores = [];
        tpl.categories?.forEach((cat) => cat.indicators?.forEach((ind) => scores.push({ template_indicator_id: ind.id, score: 0, actual: 0, target: parseFloat(ind.target_value) })));
        appraisalForm.setData('scores', scores);
    };

    const handleScoreChange = (indId, field, val) =>
        appraisalForm.setData('scores', appraisalForm.data.scores.map((s) => s.template_indicator_id === indId ? { ...s, [field]: Number(val) } : s));

    const handleSubmitAppraisal = (e) => {
        e.preventDefault();
        if (!appraisalForm.data.kpi_template_id) return;
        showConfirm({ title: 'Simpan Penilaian KPI?', text: 'Skor akan dihitung otomatis berdasarkan bobot template.', icon: 'question', confirmText: 'Ya, Simpan',
            onConfirm: () => appraisalForm.post(route('kpi.appraisals.store'), { onSuccess: () => { setIsCreateOpen(false); appraisalForm.reset(); showSuccess('Berhasil!', 'Draft penilaian KPI disimpan.'); } }) });
    };

    const openApproval = (row, action) => { setSelectedAppraisal(row); setApprovalAction(action); approvalForm.reset(); setIsApprovalOpen(true); };
    const handleApprovalSubmit = (e) => {
        e.preventDefault();
        const map = { manager_approve: 'kpi.appraisals.manager-approve', hr_approve: 'kpi.appraisals.hr-approve', reject: 'kpi.appraisals.reject' };
        approvalForm.put(route(map[approvalAction], selectedAppraisal.id), { onSuccess: () => { setIsApprovalOpen(false); approvalForm.reset(); showSuccess('Berhasil!', 'Status penilaian diperbarui.'); } });
    };
    const handleSubmitToManager = (row) => showConfirm({ title: 'Ajukan ke Manager?', text: `Penilaian ${row.employee?.full_name} akan dikirim ke Manager.`, icon: 'question', confirmText: 'Ya, Ajukan',
        onConfirm: () => router.put(route('kpi.appraisals.submit', row.id), {}, { onSuccess: () => showSuccess('Berhasil!', 'Penilaian diajukan ke Manager.') }) });

    const filtered = appraisals.filter((a) =>
        !searchTerm || [a.employee?.full_name, a.period_name, a.template?.name].some((v) => v?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    const radarData = selectedAppraisal ? getRadarData(selectedAppraisal) : [];

    return (
        <AuthenticatedLayout headerTitle="Penilaian Kinerja (KPI)">
            <Head title="Penilaian KPI" />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                    { icon: BarChart3,    label: 'Total Penilaian',  value: stats.total,           color: 'indigo' },
                    { icon: Clock,        label: 'Menunggu Manager', value: stats.pending_manager, color: 'amber' },
                    { icon: Shield,       label: 'Menunggu HR',      value: stats.pending_hr,      color: 'blue' },
                    { icon: CheckCircle2, label: 'Disetujui',        value: stats.approved,        color: 'emerald' },
                ].map((s) => (
                    <div key={s.label} className={`bg-white rounded-2xl border border-${s.color}-100 p-5 flex items-center gap-4 shadow-sm`}>
                        <div className={`w-11 h-11 rounded-xl bg-${s.color}-100 flex items-center justify-center flex-shrink-0`}>
                            <s.icon className={`w-5 h-5 text-${s.color}-600`} />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-900">{s.value}</p>
                            <p className="text-xs text-slate-500 font-medium">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-6 pt-6 pb-6 border-b border-slate-100">
                    <div>
                        <h1 className="text-base font-black text-slate-900">Daftar Penilaian KPI</h1>
                        <p className="text-xs text-slate-500 mt-0.5">Pilih karyawan → Mulai penilaian menggunakan template</p>
                    </div>
                    <button onClick={() => { appraisalForm.reset(); setIsCreateOpen(true); }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/25 transition-colors">
                        <Plus className="w-3.5 h-3.5" /> Input Penilaian
                    </button>
                </div>

                <div className="flex min-h-[400px]">
                    <div className={`flex-1 flex flex-col ${selectedAppraisal ? 'border-r border-slate-100' : ''}`}>
                        <div className="p-4 px-6">
                            <input type="text" placeholder="Cari karyawan atau periode..."
                                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full max-w-sm px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
                        </div>
                        {filtered.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center py-16 text-slate-400">
                                <BarChart3 className="w-10 h-10 mb-3 opacity-25" />
                                <p className="font-semibold text-sm">Belum ada penilaian.</p>
                                <p className="text-xs mt-1">Klik "Input Penilaian" untuk memulai.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {filtered.map((row) => (
                                    <div key={row.id}
                                        onClick={() => setSelectedAppraisal(selectedAppraisal?.id === row.id ? null : row)}
                                        className={`flex items-center gap-4 px-6 py-4 cursor-pointer transition-colors ${selectedAppraisal?.id === row.id ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}>
                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-black text-sm flex items-center justify-center flex-shrink-0">
                                            {row.employee?.full_name?.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-bold text-slate-900 text-sm">{row.employee?.full_name}</span>
                                                <StatusPill status={row.status} />
                                            </div>
                                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                <span className="text-xs text-slate-500">{row.period_name}</span>
                                                {row.template && (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded-md">
                                                        <FileText className="w-2.5 h-2.5" />{row.template.name}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 flex-shrink-0">
                                            {row.grade && <GradeChip grade={row.grade} />}
                                            <div className="text-right hidden sm:block">
                                                <div className="text-xl font-black text-slate-900">{row.final_score}</div>
                                                <div className="text-[10px] text-slate-400 font-medium">{GRADE_CFG[row.grade]?.label}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                                            {row.status === 'draft' && (
                                                <button onClick={() => handleSubmitToManager(row)}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] rounded-lg transition-colors shadow-sm shadow-amber-500/30">
                                                    <ArrowRight className="w-3 h-3" />Ajukan
                                                </button>
                                            )}
                                            {(row.status === 'submitted_to_manager' || row.status === 'submitted') && (<>
                                                <button onClick={() => openApproval(row, 'manager_approve')} className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] rounded-lg transition-colors"><Check className="w-3 h-3" />Setujui</button>
                                                <button onClick={() => openApproval(row, 'reject')} className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-[10px] rounded-lg transition-colors"><X className="w-3 h-3" />Tolak</button>
                                            </>)}
                                            {row.status === 'submitted_to_hr' && (<>
                                                <button onClick={() => openApproval(row, 'hr_approve')} className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] rounded-lg transition-colors"><Check className="w-3 h-3" />Approve HR</button>
                                                <button onClick={() => openApproval(row, 'reject')} className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-[10px] rounded-lg transition-colors"><X className="w-3 h-3" />Tolak</button>
                                            </>)}
                                            <ChevronRight className={`w-4 h-4 transition-transform ${selectedAppraisal?.id === row.id ? 'rotate-90 text-indigo-500' : 'text-slate-300'}`} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {selectedAppraisal && (
                        <div className="w-72 xl:w-80 flex-shrink-0 flex flex-col border-l border-slate-100 bg-slate-50/40">
                            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                                <p className="font-black text-slate-800 text-xs uppercase tracking-wider">Detail Penilaian</p>
                                <button onClick={() => setSelectedAppraisal(null)} className="p-1 hover:bg-slate-200 rounded-lg text-slate-400"><X className="w-3.5 h-3.5" /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-5 space-y-4">
                                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-4 text-white">
                                    <p className="font-black">{selectedAppraisal.employee?.full_name}</p>
                                    <p className="text-indigo-200 text-[10px] font-mono mb-3">{selectedAppraisal.employee?.nik}</p>
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <p className="text-indigo-200 text-[10px]">Skor Akhir</p>
                                            <p className="text-3xl font-black leading-none">{selectedAppraisal.final_score}</p>
                                        </div>
                                        {selectedAppraisal.grade && (
                                            <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center border-2 ${GRADE_CFG[selectedAppraisal.grade]?.cls}`}>
                                                <span className="text-[9px] font-bold">Grade</span>
                                                <span className="text-xl font-black leading-none">{selectedAppraisal.grade}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {selectedAppraisal.template && (
                                    <div className="bg-white rounded-xl border border-slate-200 p-3">
                                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Template KPI</p>
                                        <p className="font-bold text-slate-800 text-xs">{selectedAppraisal.template.name}</p>
                                    </div>
                                )}
                                {radarData.length > 0 && (
                                    <div className="bg-white rounded-xl border border-slate-200 p-4">
                                        <p className="text-[9px] font-black text-slate-400 uppercase mb-3 flex items-center gap-1"><Activity className="w-3 h-3" />Profil Kinerja</p>
                                        <ResponsiveContainer width="100%" height={160}>
                                            <RadarChart data={radarData}>
                                                <PolarGrid stroke="#e2e8f0" />
                                                <PolarAngleAxis dataKey="category" tick={{ fontSize: 8, fill: '#64748b', fontWeight: 700 }} />
                                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 7, fill: '#94a3b8' }} />
                                                <Radar dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} dot={{ r: 3, fill: '#6366f1' }} />
                                                <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px' }} />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                    <p className="px-4 py-2.5 text-[9px] font-black text-slate-400 uppercase border-b border-slate-100">Skor Per Indikator</p>
                                    <div className="divide-y divide-slate-50 max-h-48 overflow-y-auto">
                                        {selectedAppraisal.details?.map((d) => {
                                            const ind = d.template_indicator ?? d.indicator;
                                            const cat = d.template_indicator?.category ?? d.indicator?.category;
                                            return (
                                                <div key={d.id} className="px-4 py-2.5 flex items-center justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-slate-800 text-[11px] truncate">{ind?.title}</p>
                                                        <p className="text-[9px] text-slate-400">{cat?.name}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2 flex-shrink-0">
                                                        <div className="w-14 bg-slate-100 rounded-full h-1.5"><div className="h-1.5 rounded-full bg-indigo-500" style={{ width: `${Math.min(parseFloat(d.score), 100)}%` }} /></div>
                                                        <span className="font-black text-xs text-slate-900 w-7 text-right">{d.score}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                {(selectedAppraisal.overall_feedback || selectedAppraisal.manager_notes || selectedAppraisal.hr_notes) && (
                                    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 text-xs">
                                        {selectedAppraisal.overall_feedback && <div><p className="text-[9px] font-black text-slate-400 uppercase mb-1">Feedback Evaluator</p><p className="text-slate-700">{selectedAppraisal.overall_feedback}</p></div>}
                                        {selectedAppraisal.manager_notes && <div><p className="text-[9px] font-black text-amber-500 uppercase mb-1">Catatan Manager</p><p className="text-slate-700">{selectedAppraisal.manager_notes}</p></div>}
                                        {selectedAppraisal.hr_notes && <div><p className="text-[9px] font-black text-blue-500 uppercase mb-1">Catatan HR</p><p className="text-slate-700">{selectedAppraisal.hr_notes}</p></div>}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Input Penilaian KPI">
                <form onSubmit={handleSubmitAppraisal} className="space-y-6">
                    <div>
                        <SectionLabel>1 — Siapa yang dinilai?</SectionLabel>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FormField label="Karyawan">
                                <Select2 value={appraisalForm.data.employee_id} onChange={(e) => appraisalForm.setData('employee_id', e.target.value)} required
                                    options={employees.map((e) => ({ value: e.id, label: `${e.full_name} (${e.nik})` }))} />
                            </FormField>
                            <FormField label="Template KPI">
                                <Select2 value={appraisalForm.data.kpi_template_id} onChange={(e) => handleTemplateSelect(e.target.value)} required
                                    options={[{ value: '', label: '— Pilih Template —' }, ...templates.filter((t) => t.is_active).map((t) => ({ value: t.id, label: t.name + (t.position ? ` · ${t.position.name}` : '') }))]} />
                            </FormField>
                        </div>
                    </div>
                    <div>
                        <SectionLabel>2 — Periode penilaian</SectionLabel>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="col-span-3 md:col-span-1">
                                <FormField label="Nama Periode">
                                    <input type="text" value={appraisalForm.data.period_name} onChange={(e) => appraisalForm.setData('period_name', e.target.value)} required placeholder="cth. Q3 2026" className={inputCls} />
                                </FormField>
                            </div>
                            <FormField label="Tanggal Mulai">
                                <input type="date" value={appraisalForm.data.start_date} onChange={(e) => appraisalForm.setData('start_date', e.target.value)} required className={inputCls} />
                            </FormField>
                            <FormField label="Tanggal Selesai">
                                <input type="date" value={appraisalForm.data.end_date} onChange={(e) => appraisalForm.setData('end_date', e.target.value)} required className={inputCls} />
                            </FormField>
                        </div>
                    </div>
                    {activeTpl ? (
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <SectionLabel>3 — Skor per indikator</SectionLabel>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-xl">
                                    <span className="text-[10px] font-bold text-indigo-600">Preview Skor:</span>
                                    <span className="text-base font-black text-indigo-800">{previewScore}</span>
                                    <span className={`text-xs font-black px-1.5 py-0.5 rounded-lg border ${GRADE_CFG[previewGrade]?.cls}`}>{previewGrade}</span>
                                </div>
                            </div>
                            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                                {activeTpl.categories?.map((cat) => (
                                    <div key={cat.id} className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                                        <div className="px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                                            <span className="font-black text-slate-700 text-xs">{cat.name}</span>
                                            <span className="text-[10px] text-slate-400 font-semibold">Bobot: {cat.weight_percentage}%</span>
                                        </div>
                                        <div className="divide-y divide-slate-100">
                                            {cat.indicators?.map((ind) => {
                                                const entry = appraisalForm.data.scores.find((s) => s.template_indicator_id === ind.id) ?? { score: 0, actual: 0 };
                                                return (
                                                    <div key={ind.id} className="flex items-center gap-4 px-4 py-2.5">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-bold text-slate-800 text-xs truncate">{ind.title}</p>
                                                            <p className="text-[9px] text-slate-400">Bobot: {ind.weight_percentage}% · Target: {ind.target_value} {ind.target_unit}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2 flex-shrink-0">
                                                            <div className="text-right">
                                                                <label className="text-[9px] text-slate-400 block mb-0.5">Aktual</label>
                                                                <input type="number" min="0" value={entry.actual} onChange={(e) => handleScoreChange(ind.id, 'actual', e.target.value)}
                                                                    className="w-16 px-2 py-1 border border-slate-200 rounded-lg text-xs font-semibold text-center focus:outline-none focus:border-indigo-400" />
                                                            </div>
                                                            <div className="text-right">
                                                                <label className="text-[9px] text-slate-400 block mb-0.5">Skor</label>
                                                                <input type="number" min="0" max="100" value={entry.score} onChange={(e) => handleScoreChange(ind.id, 'score', e.target.value)}
                                                                    className="w-16 px-2 py-1 border border-indigo-300 rounded-lg text-xs font-black text-center text-indigo-700 focus:outline-none focus:border-indigo-500 bg-indigo-50/50" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-400">
                            <Info className="w-4 h-4 flex-shrink-0" />
                            <p className="text-xs font-semibold">Pilih Template KPI di atas untuk melihat daftar indikator yang perlu dinilai.</p>
                        </div>
                    )}
                    <div>
                        <SectionLabel>4 — Catatan (opsional)</SectionLabel>
                        <textarea rows={2} value={appraisalForm.data.overall_feedback} onChange={(e) => appraisalForm.setData('overall_feedback', e.target.value)}
                            placeholder="Catatan keseluruhan tentang kinerja karyawan..." className={`${inputCls} resize-none`} />
                    </div>
                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                        <button type="button" onClick={() => setIsCreateOpen(false)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors">Batal</button>
                        <button type="submit" disabled={appraisalForm.processing || !activeTpl}
                            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/25 transition-colors disabled:opacity-50">
                            {appraisalForm.processing ? 'Menyimpan...' : 'Simpan Penilaian'}
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isApprovalOpen} onClose={() => setIsApprovalOpen(false)}
                title={approvalAction === 'reject' ? '✗ Tolak Penilaian' : approvalAction === 'hr_approve' ? '✓ Final Approve (HR)' : '✓ Setujui (Manager)'}>
                <form onSubmit={handleApprovalSubmit} className="space-y-4">
                    {selectedAppraisal && (
                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-black flex items-center justify-center">{selectedAppraisal.employee?.full_name?.charAt(0)}</div>
                            <div className="flex-1">
                                <p className="font-black text-slate-900 text-sm">{selectedAppraisal.employee?.full_name}</p>
                                <p className="text-xs text-slate-500">{selectedAppraisal.period_name}{selectedAppraisal.template ? ` · ${selectedAppraisal.template.name}` : ''}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-black text-slate-900">{selectedAppraisal.final_score}</p>
                                {selectedAppraisal.grade && <GradeChip grade={selectedAppraisal.grade} />}
                            </div>
                        </div>
                    )}
                    <div className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-semibold ${approvalAction === 'reject' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                        {approvalAction === 'reject' ? <XCircle className="w-4 h-4 flex-shrink-0" /> : <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
                        {approvalAction === 'reject' ? 'Penilaian akan ditandai Ditolak.' : approvalAction === 'hr_approve' ? 'Penilaian akan resmi Disetujui oleh HR dan selesai.' : 'Penilaian disetujui Manager, diteruskan ke HR.'}
                    </div>
                    <FormField label={`Catatan ${approvalAction === 'reject' ? 'Penolakan' : 'Persetujuan'} (opsional)`}>
                        <textarea rows={3} value={approvalForm.data.notes} onChange={(e) => approvalForm.setData('notes', e.target.value)}
                            placeholder={approvalAction === 'reject' ? 'Jelaskan alasan penolakan...' : 'Catatan tambahan...'} className={`${inputCls} resize-none`} />
                    </FormField>
                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                        <button type="button" onClick={() => setIsApprovalOpen(false)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl">Batal</button>
                        <button type="submit" disabled={approvalForm.processing}
                            className={`px-6 py-2.5 font-bold text-xs rounded-xl shadow-md text-white transition-colors ${approvalAction === 'reject' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/25' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25'}`}>
                            {approvalForm.processing ? 'Memproses...' : approvalAction === 'reject' ? 'Tolak' : 'Konfirmasi'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
