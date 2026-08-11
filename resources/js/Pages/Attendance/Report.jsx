import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Download, Search, FileSpreadsheet } from 'lucide-react';

export default function AttendanceReport({ auth, reportData, filters }) {
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(route('attendance.report'), {
            start_date: startDate,
            end_date: endDate,
        }, { preserveState: true });
    };

    const handleExport = () => {
        const url = new URL(route('attendance.report.export'), window.location.origin);
        url.searchParams.append('start_date', startDate);
        url.searchParams.append('end_date', endDate);
        window.location.href = url.toString();
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-extrabold tracking-widest uppercase text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                                Manajemen SDM
                            </span>
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            Laporan Absensi
                        </h2>
                        <p className="text-sm text-slate-500 mt-1 font-medium">
                            Rekap kehadiran, keterlambatan, dan mangkir karyawan.
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Laporan Absensi" />

            <div className="py-8 relative">
                <div className="absolute top-0 left-0 w-full h-96 bg-brand-500/5 blur-3xl rounded-full -z-10 pointer-events-none"></div>
                <div className="absolute top-40 right-10 w-96 h-96 bg-blue-500/5 blur-3xl rounded-full -z-10 pointer-events-none"></div>

                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Action Bar (Filters) */}
                    <div className="bg-white/70 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:rounded-3xl border border-white/40 p-6 transition-all duration-300">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                            <form onSubmit={handleFilter} className="flex flex-wrap items-end gap-4 flex-1">
                                <div className="w-full sm:w-auto">
                                    <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Tanggal Awal</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="border-slate-200 focus:border-brand-500 focus:ring-brand-500 rounded-xl shadow-sm block w-full text-xs font-semibold px-3.5 py-2.5 transition-colors duration-300"
                                    />
                                </div>
                                <div className="w-full sm:w-auto">
                                    <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Tanggal Akhir</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="border-slate-200 focus:border-brand-500 focus:ring-brand-500 rounded-xl shadow-sm block w-full text-xs font-semibold px-3.5 py-2.5 transition-colors duration-300"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full sm:w-auto inline-flex justify-center items-center px-5 py-2.5 bg-slate-900 border border-transparent rounded-2xl font-bold text-xs text-white uppercase tracking-widest hover:bg-brand-600 hover:-translate-y-1 shadow-[0_8px_20px_rgba(0,0,0,0.1)] focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-all duration-300 group"
                                >
                                    <Search className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                                    Filter
                                </button>
                            </form>

                            <button
                                onClick={handleExport}
                                className="w-full md:w-auto inline-flex justify-center items-center px-5 py-2.5 bg-emerald-600 border border-transparent rounded-2xl font-bold text-xs text-white uppercase tracking-widest hover:bg-emerald-500 hover:-translate-y-1 shadow-[0_8px_20px_rgba(16,185,129,0.2)] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-300 group"
                            >
                                <FileSpreadsheet className="w-4 h-4 mr-2 group-hover:-translate-y-1 transition-transform duration-300" />
                                Export Excel
                            </button>
                        </div>
                    </div>

                    {/* Table Data */}
                    <div className="bg-white/80 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:rounded-3xl border border-white/40 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200/60">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-extrabold text-slate-700 uppercase tracking-widest">Karyawan</th>
                                        <th className="px-6 py-4 text-left text-xs font-extrabold text-slate-700 uppercase tracking-widest">Departemen</th>
                                        <th className="px-6 py-4 text-center text-xs font-extrabold text-slate-700 uppercase tracking-widest">Total Hari</th>
                                        <th className="px-6 py-4 text-center text-xs font-extrabold text-emerald-700 uppercase tracking-widest">Hadir</th>
                                        <th className="px-6 py-4 text-center text-xs font-extrabold text-amber-700 uppercase tracking-widest">Telat</th>
                                        <th className="px-6 py-4 text-center text-xs font-extrabold text-blue-700 uppercase tracking-widest">Cuti/Izin</th>
                                        <th className="px-6 py-4 text-center text-xs font-extrabold text-rose-700 uppercase tracking-widest">Mangkir</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white/60 divide-y divide-slate-200/60">
                                    {reportData.length > 0 ? (
                                        reportData.map((row) => (
                                            <tr key={row.id} className="hover:bg-slate-50/80 transition-colors duration-300 group">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 flex-shrink-0">
                                                            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:scale-105 transition-transform duration-300">
                                                                {row.name.charAt(0)}
                                                            </div>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors duration-300">{row.name}</div>
                                                            <div className="text-xs text-slate-500 font-mono mt-0.5">{row.nik}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                                                        {row.department}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-mono text-slate-600">
                                                    {row.total_work_days}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <span className={`inline-flex items-center justify-center h-8 w-8 rounded-xl font-mono text-sm font-bold ${row.total_present > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                                                        {row.total_present}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <span className={`inline-flex items-center justify-center h-8 w-8 rounded-xl font-mono text-sm font-bold ${row.total_late > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-400'}`}>
                                                        {row.total_late > 0 ? row.total_late : '-'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <span className={`inline-flex items-center justify-center h-8 w-8 rounded-xl font-mono text-sm font-bold ${row.total_leave > 0 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'}`}>
                                                        {row.total_leave > 0 ? row.total_leave : '-'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <span className={`inline-flex items-center justify-center h-8 w-8 rounded-xl font-mono text-sm font-black ${row.total_absent > 0 ? 'bg-rose-100 text-rose-700 shadow-sm' : 'bg-slate-100 text-slate-400'}`}>
                                                        {row.total_absent > 0 ? row.total_absent : '-'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-16 text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <FileSpreadsheet className="w-12 h-12 text-slate-300 mb-4" />
                                                    <h3 className="text-sm font-bold text-slate-900 mb-1">Tidak Ada Data</h3>
                                                    <p className="text-xs text-slate-500">Belum ada data kehadiran pada periode ini.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
