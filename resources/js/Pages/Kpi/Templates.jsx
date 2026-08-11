import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import Select2 from '@/Components/Select2';
import { useForm, Head, router } from '@inertiajs/react';
import { Plus, Edit2, Trash2, Target, Settings, AlertCircle, FileText, Briefcase, ClipboardList, ToggleLeft, ToggleRight, ChevronRight, Info, Shield } from 'lucide-react';
import { showConfirm, showSuccess } from '@/Utils/swal';

const SectionLabel = ({ children }) => (
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{children}</p>
);

const FormField = ({ label, hint, children }) => (
    <div>
        <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1">{label}</label>
        {children}
        {hint && <p className="text-[10px] text-slate-400 mt-1">{hint}</p>}
    </div>
);

const inputCls = "w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400";

const totalWeight = (arr) => arr.reduce((s, i) => s + parseFloat(i.weight_percentage || 0), 0);

const WeightBadge = ({ items, label = 'Bobot' }) => {
    const w = totalWeight(items);
    const ok = Math.abs(w - 100) < 0.5;
    return (
        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg border ${ok ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
            {!ok && <AlertCircle className="w-2.5 h-2.5" />}{label}: {w}%{ok ? ' ✓' : ' ≠ 100%'}
        </span>
    );
};

export default function KpiTemplates({ templates, positions, approvalTemplates }) {
    const [selectedTemplate, setSelectedTemplate]   = useState(null);

    // template modals
    const [isTemplateOpen, setIsTemplateOpen]   = useState(false);
    const [isTplCatOpen, setIsTplCatOpen]       = useState(false);
    const [isTplIndOpen, setIsTplIndOpen]       = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [editingTplCat, setEditingTplCat]     = useState(null);
    const [editingTplInd, setEditingTplInd]     = useState(null);

    const templateForm  = useForm({ name: '', description: '', position_id: '', approval_template_id: '', is_active: true });
    const tplCatForm    = useForm({ kpi_template_id: '', name: '', weight_percentage: '', sort_order: 0 });
    const tplIndForm    = useForm({ kpi_template_category_id: '', title: '', description: '', target_unit: 'percentage', target_value: 100, weight_percentage: '', sort_order: 0 });

    const liveTpl = templates.find((t) => t.id === selectedTemplate?.id) ?? selectedTemplate;

    // Template CRUD
    const handleTemplateSubmit = (e) => {
        e.preventDefault();
        const opts = { onSuccess: () => { setIsTemplateOpen(false); templateForm.reset(); setEditingTemplate(null); } };
        editingTemplate ? templateForm.put(route('kpi.templates.update', editingTemplate.id), opts) : templateForm.post(route('kpi.templates.store'), opts);
    };
    const openEditTemplate = (t) => { setEditingTemplate(t); templateForm.setData({ name: t.name, description: t.description ?? '', position_id: t.position_id ?? '', approval_template_id: t.approval_template_id ?? '', is_active: t.is_active }); setIsTemplateOpen(true); };
    const deleteTemplate = (t) => showConfirm({ title: `Hapus "${t.name}"?`, text: 'Semua kategori & indikator di dalamnya akan terhapus.', icon: 'warning', confirmText: 'Hapus',
        onConfirm: () => router.delete(route('kpi.templates.destroy', t.id), { onSuccess: () => { if (selectedTemplate?.id === t.id) setSelectedTemplate(null); } }) });

    // Template Category CRUD
    const openAddTplCat = (tplId) => { setEditingTplCat(null); tplCatForm.reset(); tplCatForm.setData('kpi_template_id', tplId); setIsTplCatOpen(true); };
    const openEditTplCat = (cat) => { setEditingTplCat(cat); tplCatForm.setData({ kpi_template_id: cat.kpi_template_id, name: cat.name, weight_percentage: cat.weight_percentage, sort_order: cat.sort_order }); setIsTplCatOpen(true); };
    const handleTplCatSubmit = (e) => {
        e.preventDefault();
        const opts = { onSuccess: () => { setIsTplCatOpen(false); tplCatForm.reset(); setEditingTplCat(null); } };
        editingTplCat ? tplCatForm.put(route('kpi.template-categories.update', editingTplCat.id), opts) : tplCatForm.post(route('kpi.template-categories.store'), opts);
    };
    const deleteTplCat = (cat) => showConfirm({ title: `Hapus Kategori "${cat.name}"?`, text: 'Semua indikator di dalamnya ikut terhapus.', icon: 'warning', confirmText: 'Hapus',
        onConfirm: () => router.delete(route('kpi.template-categories.destroy', cat.id)) });

    // Template Indicator CRUD
    const openAddTplInd = (catId) => { setEditingTplInd(null); tplIndForm.reset(); tplIndForm.setData({ kpi_template_category_id: catId, title: '', description: '', target_unit: 'percentage', target_value: 100, weight_percentage: '', sort_order: 0 }); setIsTplIndOpen(true); };
    const openEditTplInd = (ind) => { setEditingTplInd(ind); tplIndForm.setData({ kpi_template_category_id: ind.kpi_template_category_id, title: ind.title, description: ind.description ?? '', target_unit: ind.target_unit, target_value: ind.target_value, weight_percentage: ind.weight_percentage, sort_order: ind.sort_order }); setIsTplIndOpen(true); };
    const handleTplIndSubmit = (e) => {
        e.preventDefault();
        const opts = { onSuccess: () => { setIsTplIndOpen(false); tplIndForm.reset(); setEditingTplInd(null); } };
        editingTplInd ? tplIndForm.put(route('kpi.template-indicators.update', editingTplInd.id), opts) : tplIndForm.post(route('kpi.template-indicators.store'), opts);
    };
    const deleteTplInd = (ind) => showConfirm({ title: `Hapus "${ind.title}"?`, text: '', icon: 'warning', confirmText: 'Hapus',
        onConfirm: () => router.delete(route('kpi.template-indicators.destroy', ind.id)) });

    return (
        <AuthenticatedLayout headerTitle="Template KPI">
            <Head title="Template KPI" />

            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex min-h-[500px] h-[calc(100vh-140px)]">
                {/* Left: Template List */}
                <div className="w-80 flex-shrink-0 border-r border-slate-100 flex flex-col bg-slate-50/50">
                    <div className="p-4 border-b border-slate-100 bg-white">
                        <button onClick={() => { setEditingTemplate(null); templateForm.reset(); setIsTemplateOpen(true); }}
                            className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors shadow-md shadow-indigo-500/25">
                            <Plus className="w-3.5 h-3.5" /> Buat Template Baru
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                        {templates.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 px-4 text-slate-400 text-center">
                                <ClipboardList className="w-8 h-8 mb-2 opacity-30" />
                                <p className="text-xs font-semibold">Belum ada template.</p>
                            </div>
                        ) : templates.map((t) => {
                            const indCount = t.categories?.reduce((s, c) => s + (c.indicators?.length ?? 0), 0) ?? 0;
                            const isSelected = selectedTemplate?.id === t.id;
                            return (
                                <button key={t.id} onClick={() => setSelectedTemplate(isSelected ? null : t)}
                                    className={`w-full text-left px-5 py-4 transition-colors ${isSelected ? 'bg-indigo-50/80' : 'hover:bg-white'}`}>
                                    <div className="flex items-start gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${isSelected ? 'bg-indigo-600 shadow-indigo-500/30' : 'bg-white border border-slate-200'}`}>
                                            <FileText className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-black text-sm truncate ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>{t.name}</p>
                                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                                {t.position && <span className="text-[10px] text-slate-500 flex items-center gap-0.5 font-medium"><Briefcase className="w-2.5 h-2.5" />{t.position.name}</span>}
                                            </div>
                                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                                <span className="text-[10px] text-slate-400 font-semibold">{t.categories?.length ?? 0} kat · {indCount} ind</span>
                                                {!t.is_active && <span className="text-[9px] bg-rose-50 border border-rose-100 text-rose-600 px-1.5 py-0.5 rounded font-bold">Non-aktif</span>}
                                            </div>
                                        </div>
                                        <ChevronRight className={`w-4 h-4 flex-shrink-0 mt-3 transition-transform ${isSelected ? 'text-indigo-500 rotate-90' : 'text-slate-300'}`} />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Right: Template Detail */}
                <div className="flex-1 flex flex-col overflow-hidden bg-white">
                    {!liveTpl ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3">
                            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                                <ClipboardList className="w-8 h-8 opacity-40" />
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-slate-500">Pilih template di sebelah kiri</p>
                                <p className="text-xs mt-1">Atau buat template baru untuk memulai</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto">
                            {/* Template header detail */}
                            <div className="p-8 border-b border-slate-100">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="font-black text-slate-900 text-2xl">{liveTpl.name}</h2>
                                        {liveTpl.description && <p className="text-sm text-slate-500 mt-2 max-w-2xl">{liveTpl.description}</p>}
                                        <div className="flex items-center gap-2 mt-4 flex-wrap">
                                            {liveTpl.position && (
                                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl">
                                                    <Briefcase className="w-3.5 h-3.5" />Untuk: {liveTpl.position.name}
                                                </span>
                                            )}
                                            {liveTpl.approval_template && (
                                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                                                    <Shield className="w-3.5 h-3.5" />Approval: {liveTpl.approval_template.name}
                                                </span>
                                            )}
                                            {liveTpl.categories?.length > 0 && (
                                                <WeightBadge items={liveTpl.categories} label="Total bobot kategori" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <button onClick={() => openEditTemplate(liveTpl)} className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors">
                                            <Edit2 className="w-3.5 h-3.5" />Edit
                                        </button>
                                        <button onClick={() => deleteTemplate(liveTpl)} className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl transition-colors">
                                            <Trash2 className="w-3.5 h-3.5" />Hapus
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Categories & Indicators */}
                            <div className="p-8 space-y-6 max-w-5xl">
                                <div className="flex items-center justify-between">
                                    <SectionLabel>Struktur Kategori & Indikator</SectionLabel>
                                    <button onClick={() => openAddTplCat(liveTpl.id)}
                                        className="flex items-center gap-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors shadow-md shadow-indigo-500/25">
                                        <Plus className="w-3.5 h-3.5" />Tambah Kategori
                                    </button>
                                </div>

                                {!liveTpl.categories?.length ? (
                                    <div className="flex items-center gap-3 p-5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-700 text-sm font-semibold shadow-sm">
                                        <Info className="w-5 h-5 flex-shrink-0 text-amber-500" />
                                        Belum ada kategori. Klik "Tambah Kategori" untuk mendefinisikan indikator KPI.
                                    </div>
                                ) : liveTpl.categories.map((cat) => (
                                    <div key={cat.id} className="border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                                        {/* Category header */}
                                        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className="font-black text-slate-800 text-sm">{cat.name}</div>
                                                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-lg">Bobot: {cat.weight_percentage}%</span>
                                                {cat.indicators?.length > 0 && <WeightBadge items={cat.indicators} label="Ind" />}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => openAddTplInd(cat.id)} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-bold text-xs rounded-lg transition-colors"><Plus className="w-3.5 h-3.5" />Tambah Indikator</button>
                                                <div className="w-px h-5 bg-slate-200 mx-1"></div>
                                                <button onClick={() => openEditTplCat(cat)} className="p-1.5 bg-white hover:bg-slate-100 text-slate-500 rounded-lg border border-slate-200 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                                                <button onClick={() => deleteTplCat(cat)} className="p-1.5 bg-white hover:bg-rose-50 text-rose-500 rounded-lg border border-slate-200 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                            </div>
                                        </div>
                                        {/* Indicators */}
                                        <div className="divide-y divide-slate-100 bg-white">
                                            {!cat.indicators?.length ? (
                                                <p className="px-6 py-4 text-xs text-slate-400 font-medium">Belum ada indikator di kategori ini.</p>
                                            ) : cat.indicators.map((ind) => (
                                                <div key={ind.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors group">
                                                    <div className="flex items-start gap-4">
                                                        <div className="mt-0.5 bg-slate-100 p-1.5 rounded-lg text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                                                            <Target className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-900 text-sm">{ind.title}</p>
                                                            {ind.description && <p className="text-xs text-slate-500 mt-1 max-w-lg">{ind.description}</p>}
                                                            <div className="flex items-center gap-3 mt-2">
                                                                <span className="text-[10px] font-black text-violet-700 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-md">Bobot: {ind.weight_percentage}%</span>
                                                                <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                                                    Target: {ind.target_value} {ind.target_unit}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => openEditTplInd(ind)} className="p-2 bg-white hover:bg-slate-100 text-slate-500 rounded-xl border border-slate-200 transition-colors shadow-sm"><Edit2 className="w-4 h-4" /></button>
                                                        <button onClick={() => deleteTplInd(ind)} className="p-2 bg-white hover:bg-rose-50 text-rose-500 rounded-xl border border-slate-200 transition-colors shadow-sm"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL: Template Header */}
            <Modal isOpen={isTemplateOpen} onClose={() => { setIsTemplateOpen(false); setEditingTemplate(null); templateForm.reset(); }}
                title={editingTemplate ? 'Edit Template KPI' : 'Buat Template KPI'}>
                <form onSubmit={handleTemplateSubmit} className="space-y-4">
                    <FormField label="Nama Template">
                        <input type="text" value={templateForm.data.name} onChange={(e) => templateForm.setData('name', e.target.value)} required placeholder="cth. KPI Staf Operasional 2026" className={inputCls} />
                    </FormField>
                    <FormField label="Deskripsi (opsional)">
                        <textarea rows={2} value={templateForm.data.description} onChange={(e) => templateForm.setData('description', e.target.value)} placeholder="Penjelasan singkat tujuan template ini..." className={`${inputCls} resize-none`} />
                    </FormField>
                    <div className="grid grid-cols-2 gap-3">
                        <FormField label="Untuk Jabatan (opsional)" hint="Pilih jabatan agar template mudah ditemukan.">
                            <Select2 value={templateForm.data.position_id} onChange={(e) => templateForm.setData('position_id', e.target.value)}
                                options={[{ value: '', label: '— Semua Jabatan —' }, ...positions.map((p) => ({ value: p.id, label: p.name }))]} />
                        </FormField>
                        <FormField label="Template Approval (opsional)">
                            <Select2 value={templateForm.data.approval_template_id} onChange={(e) => templateForm.setData('approval_template_id', e.target.value)}
                                options={[{ value: '', label: '— Tidak Ada —' }, ...approvalTemplates.map((a) => ({ value: a.id, label: a.name }))]} />
                        </FormField>
                    </div>
                    <div className="flex items-center gap-3 cursor-pointer p-2 bg-slate-50 rounded-xl border border-slate-100" onClick={() => templateForm.setData('is_active', !templateForm.data.is_active)}>
                        {templateForm.data.is_active ? <ToggleRight className="w-8 h-8 text-emerald-500" /> : <ToggleLeft className="w-8 h-8 text-slate-400" />}
                        <span className="text-xs font-bold text-slate-700">{templateForm.data.is_active ? 'Template Aktif — bisa dipilih saat penilaian' : 'Non-aktif — tidak muncul di pilihan penilaian'}</span>
                    </div>
                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                        <button type="button" onClick={() => { setIsTemplateOpen(false); setEditingTemplate(null); templateForm.reset(); }} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl">Batal</button>
                        <button type="submit" disabled={templateForm.processing} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/25">
                            {templateForm.processing ? 'Menyimpan...' : editingTemplate ? 'Simpan' : 'Buat Template'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* MODAL: Template Category */}
            <Modal isOpen={isTplCatOpen} onClose={() => { setIsTplCatOpen(false); setEditingTplCat(null); tplCatForm.reset(); }}
                title={editingTplCat ? 'Edit Kategori' : 'Tambah Kategori'}>
                <form onSubmit={handleTplCatSubmit} className="space-y-4">
                    <FormField label="Nama Kategori">
                        <input type="text" value={tplCatForm.data.name} onChange={(e) => tplCatForm.setData('name', e.target.value)} required placeholder="cth. Kompetensi Teknis" className={inputCls} />
                    </FormField>
                    <FormField label="Bobot Kategori (%)" hint="Jumlah semua bobot kategori dalam template harus = 100%.">
                        <input type="number" min="0" max="100" value={tplCatForm.data.weight_percentage} onChange={(e) => tplCatForm.setData('weight_percentage', e.target.value)} required placeholder="cth. 60" className={inputCls} />
                    </FormField>
                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                        <button type="button" onClick={() => { setIsTplCatOpen(false); setEditingTplCat(null); tplCatForm.reset(); }} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl">Batal</button>
                        <button type="submit" disabled={tplCatForm.processing} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/25">
                            {tplCatForm.processing ? 'Menyimpan...' : editingTplCat ? 'Simpan' : 'Tambah'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* MODAL: Template Indicator */}
            <Modal isOpen={isTplIndOpen} onClose={() => { setIsTplIndOpen(false); setEditingTplInd(null); tplIndForm.reset(); }}
                title={editingTplInd ? 'Edit Indikator' : 'Tambah Indikator'}>
                <form onSubmit={handleTplIndSubmit} className="space-y-4">
                    <FormField label="Nama Indikator">
                        <input type="text" value={tplIndForm.data.title} onChange={(e) => tplIndForm.setData('title', e.target.value)} required placeholder="cth. Ketepatan Waktu Penyelesaian Tugas" className={inputCls} />
                    </FormField>
                    <FormField label="Deskripsi (opsional)">
                        <input type="text" value={tplIndForm.data.description} onChange={(e) => tplIndForm.setData('description', e.target.value)} placeholder="Penjelasan singkat..." className={inputCls} />
                    </FormField>
                    <div className="grid grid-cols-3 gap-3">
                        <FormField label="Satuan">
                            <select value={tplIndForm.data.target_unit} onChange={(e) => tplIndForm.setData('target_unit', e.target.value)} className={inputCls}>
                                <option value="percentage">Persen (%)</option>
                                <option value="score">Skor</option>
                                <option value="count">Jumlah</option>
                            </select>
                        </FormField>
                        <FormField label="Nilai Target">
                            <input type="number" min="0" value={tplIndForm.data.target_value} onChange={(e) => tplIndForm.setData('target_value', e.target.value)} required className={inputCls} />
                        </FormField>
                        <FormField label="Bobot (%)" hint="Total per kategori = 100%.">
                            <input type="number" min="0" max="100" value={tplIndForm.data.weight_percentage} onChange={(e) => tplIndForm.setData('weight_percentage', e.target.value)} required placeholder="30" className={`${inputCls} border-indigo-200 text-indigo-700 font-black`} />
                        </FormField>
                    </div>
                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                        <button type="button" onClick={() => { setIsTplIndOpen(false); setEditingTplInd(null); tplIndForm.reset(); }} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl">Batal</button>
                        <button type="submit" disabled={tplIndForm.processing} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/25">
                            {tplIndForm.processing ? 'Menyimpan...' : editingTplInd ? 'Simpan' : 'Tambah'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
