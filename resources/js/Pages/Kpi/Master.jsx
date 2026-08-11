import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import Select2 from '@/Components/Select2';
import { useForm, Head, router } from '@inertiajs/react';
import { Plus, CheckCircle2, Clock, XCircle, Edit2, Trash2, Target, Settings, Info } from 'lucide-react';
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

export default function KpiMaster({ categories }) {
    const [isCatOpen, setIsCatOpen] = useState(false);
    const [isIndOpen, setIsIndOpen] = useState(false);
    const [editingCat, setEditingCat] = useState(null);
    const [editingInd, setEditingInd] = useState(null);

    const catForm = useForm({ name: '', weight_percentage: '' });
    const indForm = useForm({ kpi_category_id: '', title: '', description: '', target_unit: 'percentage', target_value: 100, weight_percentage: '' });

    const handleCatSubmit = (e) => {
        e.preventDefault();
        const opts = { onSuccess: () => { setIsCatOpen(false); catForm.reset(); setEditingCat(null); showSuccess('Berhasil!', 'Kategori tersimpan.'); } };
        editingCat ? catForm.put(route('kpi.categories.update', editingCat.id), opts) : catForm.post(route('kpi.categories.store'), opts);
    };
    const openEditCat = (c) => { setEditingCat(c); catForm.setData({ name: c.name, weight_percentage: c.weight_percentage }); setIsCatOpen(true); };
    const deleteCat = (c) => showConfirm({ title: `Hapus "${c.name}"?`, text: 'Semua indikator global di dalamnya ikut terhapus.', icon: 'warning', confirmText: 'Hapus',
        onConfirm: () => router.delete(route('kpi.categories.destroy', c.id)) });

    const handleIndSubmit = (e) => {
        e.preventDefault();
        const opts = { onSuccess: () => { setIsIndOpen(false); indForm.reset(); setEditingInd(null); showSuccess('Berhasil!', 'Indikator tersimpan.'); } };
        editingInd ? indForm.put(route('kpi.indicators.update', editingInd.id), opts) : indForm.post(route('kpi.indicators.store'), opts);
    };
    const openEditInd = (i) => { setEditingInd(i); indForm.setData({ kpi_category_id: i.kpi_category_id, title: i.title, description: i.description ?? '', target_unit: i.target_unit, target_value: i.target_value, weight_percentage: i.weight_percentage }); setIsIndOpen(true); };
    const deleteInd = (i) => showConfirm({ title: `Hapus "${i.title}"?`, text: '', icon: 'warning', confirmText: 'Hapus',
        onConfirm: () => router.delete(route('kpi.indicators.destroy', i.id)) });

    return (
        <AuthenticatedLayout headerTitle="Data Induk KPI Global">
            <Head title="Data Induk KPI" />

            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden p-6">
                <div className="flex items-center gap-2 p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-xs font-semibold mb-5">
                    <Info className="w-4 h-4 flex-shrink-0" />
                    Data Induk Global digunakan sebagai fallback jika penilaian tidak menggunakan Template KPI.
                </div>
                <div className="flex items-center justify-between mb-4">
                    <SectionLabel>Kategori & Indikator Global</SectionLabel>
                    <button onClick={() => { setEditingCat(null); catForm.reset(); setIsCatOpen(true); }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-colors shadow-sm shadow-indigo-500/25">
                        <Plus className="w-3 h-3" />Tambah Kategori
                    </button>
                </div>
                <div className="space-y-3">
                    {categories.map((cat) => (
                        <div key={cat.id} className="border border-slate-200 rounded-2xl overflow-hidden">
                            <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50">
                                <div className="flex items-center gap-3">
                                    <span className="font-black text-slate-800">{cat.name}</span>
                                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-lg">Bobot: {cat.weight_percentage}%</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <button onClick={() => { setEditingInd(null); indForm.reset(); indForm.setData({ ...indForm.data, kpi_category_id: cat.id }); setIsIndOpen(true); }}
                                        className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] rounded-lg transition-colors"><Plus className="w-3 h-3" />Tambah</button>
                                    <button onClick={() => openEditCat(cat)} className="p-1.5 bg-white hover:bg-slate-100 text-slate-500 rounded-lg border border-slate-200 transition-colors"><Edit2 className="w-3 h-3" /></button>
                                    <button onClick={() => deleteCat(cat)} className="p-1.5 bg-white hover:bg-rose-50 text-rose-500 rounded-lg border border-slate-200 transition-colors"><Trash2 className="w-3 h-3" /></button>
                                </div>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {!cat.indicators?.length ? <p className="px-5 py-3 text-xs text-slate-400 italic">Belum ada indikator.</p> :
                                    cat.indicators.map((ind) => (
                                        <div key={ind.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <Target className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                                                <div>
                                                    <p className="font-bold text-slate-800 text-xs">{ind.title}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[10px] font-bold text-violet-600 bg-violet-50 border border-violet-200 px-1.5 py-0.5 rounded">Bobot: {ind.weight_percentage}%</span>
                                                        <span className="text-[10px] text-slate-400">Target: {ind.target_value} {ind.target_unit}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <button onClick={() => openEditInd(ind)} className="p-1.5 bg-white hover:bg-slate-100 text-slate-500 rounded-lg border border-slate-200 transition-colors"><Edit2 className="w-3 h-3" /></button>
                                                <button onClick={() => deleteInd(ind)} className="p-1.5 bg-white hover:bg-rose-50 text-rose-500 rounded-lg border border-slate-200 transition-colors"><Trash2 className="w-3 h-3" /></button>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Modal isOpen={isCatOpen} onClose={() => { setIsCatOpen(false); setEditingCat(null); catForm.reset(); }} title={editingCat ? 'Edit Kategori Global' : 'Tambah Kategori Global'}>
                <form onSubmit={handleCatSubmit} className="space-y-4">
                    <FormField label="Nama Kategori"><input type="text" value={catForm.data.name} onChange={(e) => catForm.setData('name', e.target.value)} required className={inputCls} /></FormField>
                    <FormField label="Bobot (%)" hint="Total semua kategori global harus = 100%."><input type="number" min="0" max="100" value={catForm.data.weight_percentage} onChange={(e) => catForm.setData('weight_percentage', e.target.value)} required className={inputCls} /></FormField>
                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                        <button type="button" onClick={() => { setIsCatOpen(false); setEditingCat(null); catForm.reset(); }} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl">Batal</button>
                        <button type="submit" disabled={catForm.processing} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl">{catForm.processing ? 'Menyimpan...' : editingCat ? 'Simpan' : 'Tambah'}</button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isIndOpen} onClose={() => { setIsIndOpen(false); setEditingInd(null); indForm.reset(); }} title={editingInd ? 'Edit Indikator Global' : 'Tambah Indikator Global'}>
                <form onSubmit={handleIndSubmit} className="space-y-4">
                    <FormField label="Kategori"><Select2 value={indForm.data.kpi_category_id} onChange={(e) => indForm.setData('kpi_category_id', e.target.value)} required options={categories.map((c) => ({ value: c.id, label: c.name }))} /></FormField>
                    <FormField label="Nama Indikator"><input type="text" value={indForm.data.title} onChange={(e) => indForm.setData('title', e.target.value)} required className={inputCls} /></FormField>
                    <div className="grid grid-cols-3 gap-3">
                        <FormField label="Satuan">
                            <select value={indForm.data.target_unit} onChange={(e) => indForm.setData('target_unit', e.target.value)} className={inputCls}>
                                <option value="percentage">Persen</option><option value="score">Skor</option><option value="count">Jumlah</option>
                            </select>
                        </FormField>
                        <FormField label="Target"><input type="number" min="0" value={indForm.data.target_value} onChange={(e) => indForm.setData('target_value', e.target.value)} required className={inputCls} /></FormField>
                        <FormField label="Bobot (%)"><input type="number" min="0" max="100" value={indForm.data.weight_percentage} onChange={(e) => indForm.setData('weight_percentage', e.target.value)} required className={`${inputCls} border-indigo-200 text-indigo-700 font-black`} /></FormField>
                    </div>
                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                        <button type="button" onClick={() => { setIsIndOpen(false); setEditingInd(null); indForm.reset(); }} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl">Batal</button>
                        <button type="submit" disabled={indForm.processing} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl">{indForm.processing ? 'Menyimpan...' : editingInd ? 'Simpan' : 'Tambah'}</button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
