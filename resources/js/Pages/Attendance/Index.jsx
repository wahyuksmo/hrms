import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import StatusBadge from '@/Components/StatusBadge';
import Select2 from '@/Components/Select2';
import WebcamCaptureModal from '@/Components/WebcamCaptureModal';
import AttendanceCorrectionModal from './Components/AttendanceCorrectionModal';
import TimeDisplay from '@/Components/TimeDisplay';
import DateDisplay from '@/Components/DateDisplay';
import { useForm, Head, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, MapPin, Camera, CheckCircle2, LogOut as LogOutIcon, 
  AlertCircle, Eye, ExternalLink, ShieldCheck, FileCheck, 
  PlusCircle, FileText, Check, X, CalendarDays, ChevronRight
} from 'lucide-react';
import { showConfirm, showLoading, showError } from '@/Utils/swal';

export default function AttendanceIndex({ attendances, corrections = [], shifts, locations, employeeShift }) {
  const [activeTab, setActiveTab] = useState('attendance'); 
  const [webcamOpen, setWebcamOpen] = useState(false);
  const [correctionModalOpen, setCorrectionModalOpen] = useState(false);
  const [activeModalType, setActiveModalType] = useState('clockIn'); 
  const [selectedPhotoModal, setSelectedPhotoModal] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState(null);

  const clockInForm = useForm({
    work_mode: 'WFO',
    work_location_id: locations && locations.length > 0 ? locations[0].id : '',
    latitude: null,
    longitude: null,
    clock_in_photo: '',
  });

  const clockOutForm = useForm({
    latitude: null,
    longitude: null,
    clock_out_photo: '',
  });

  useEffect(() => {
    fetchGpsCoordinates();
  }, []);

  const fetchGpsCoordinates = () => {
    if ('geolocation' in navigator) {
      setGpsLoading(true);
      setGpsError(null);
      const timeoutId = setTimeout(() => {
        setGpsLoading(false);
        setGpsError('Waktu permintaan lokasi habis.');
      }, 15000);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId);
          const { latitude, longitude } = position.coords;
          clockInForm.setData((prev) => ({ ...prev, latitude, longitude }));
          clockOutForm.setData((prev) => ({ ...prev, latitude, longitude }));
          setGpsLoading(false);
        },
        (error) => {
          clearTimeout(timeoutId);
          setGpsError('Gagal mendapatkan lokasi GPS.');
          setGpsLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setGpsError('Browser tidak mendukung GPS.');
    }
  };

  const openClockInWebcam = (e) => {
    e.preventDefault();
    if (clockInForm.data.work_mode === 'WFO' && (clockInForm.data.latitude === null || clockInForm.data.longitude === null)) {
      showError('Lokasi Tidak Terdeteksi', 'Silakan aktifkan GPS browser Anda untuk presensi WFO.');
      fetchGpsCoordinates();
      return;
    }
    setActiveModalType('clockIn');
    setWebcamOpen(true);
  };

  const openClockOutWebcam = (e) => {
    e.preventDefault();
    setActiveModalType('clockOut');
    setWebcamOpen(true);
  };

  const handleWebcamCapture = (base64Image) => {
    if (activeModalType === 'clockIn') {
      clockInForm.setData('clock_in_photo', base64Image);
      showConfirm({
        title: 'Konfirmasi Clock In?',
        text: `Presensi masuk akan dikirim (Mode: ${clockInForm.data.work_mode}).`,
        icon: 'question',
        confirmText: 'Kirim Presensi',
        confirmButtonColor: 'emerald',
        onConfirm: () => {
          showLoading('Mengirim Presensi Masuk...');
          clockInForm.transform((data) => ({ ...data, clock_in_photo: base64Image }));
          clockInForm.post(route('attendance.clock-in'), {
            preserveScroll: true,
            onFinish: () => { if (window.Swal?.isVisible()) window.Swal.close(); }
          });
        }
      });
    } else {
      clockOutForm.setData('clock_out_photo', base64Image);
      showConfirm({
        title: 'Konfirmasi Clock Out?',
        text: 'Selesaikan presensi pulang hari ini?',
        icon: 'warning',
        confirmText: 'Kirim Clock Out',
        confirmButtonColor: 'rose',
        onConfirm: () => {
          showLoading('Mengirim Presensi Pulang...');
          clockOutForm.transform((data) => ({ ...data, clock_out_photo: base64Image }));
          clockOutForm.post(route('attendance.clock-out'), {
            preserveScroll: true,
            onFinish: () => { if (window.Swal?.isVisible()) window.Swal.close(); }
          });
        }
      });
    }
  };

  const handleApproveCorrection = (row, action) => {
    showConfirm({
      title: action === 'approve' ? 'Setujui Pengajuan?' : 'Tolak Pengajuan?',
      text: `Koreksi presensi untuk ${row.employee?.full_name} (${row.date}).`,
      icon: action === 'approve' ? 'question' : 'warning',
      confirmText: action === 'approve' ? 'Setujui' : 'Tolak',
      confirmButtonColor: action === 'approve' ? 'emerald' : 'rose',
      onConfirm: () => {
        showLoading('Memproses...');
        router.post(route('attendance.corrections.approve', row.id), { action }, {
          preserveScroll: true,
          onFinish: () => { if (window.Swal?.isVisible()) window.Swal.close(); }
        });
      }
    });
  };

  const tabVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
  };

  return (
    <AuthenticatedLayout headerTitle="Kehadiran Karyawan">
      <Head title="Kehadiran Online" />

      {/* MOBILE FRIENDLY ACTION PANEL */}
      <div className="bg-gradient-to-b from-white to-slate-50 p-4 sm:p-8 rounded-[32px] border border-slate-200/80 shadow-lg shadow-slate-200/40 mb-8 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-50 rounded-full blur-3xl opacity-50 pointer-events-none" />
        
        {/* Header & GPS Status (Mobile optimized) */}
        <div className="flex flex-col items-center text-center sm:text-left sm:flex-row sm:justify-between gap-4 mb-8 relative z-10">
          <div>
            <h3 className="font-black text-slate-900 text-xl tracking-tight mb-1">Presensi Hari Ini</h3>
            <p className="text-xs text-slate-500 font-medium">Catat kehadiran Anda secara real-time.</p>
          </div>

          <div className="flex justify-center w-full sm:w-auto">
            {gpsLoading ? (
              <span className="text-amber-600 bg-amber-50 px-4 py-2 rounded-2xl border border-amber-200 font-bold text-[11px] flex items-center gap-2 shadow-sm">
                <MapPin className="w-4 h-4 animate-bounce" /> Memuat GPS...
              </span>
            ) : gpsError ? (
              <button onClick={fetchGpsCoordinates} className="text-rose-600 bg-rose-50 hover:bg-rose-100 px-4 py-2 rounded-2xl border border-rose-200 font-bold text-[11px] flex items-center gap-2 shadow-sm transition">
                <AlertCircle className="w-4 h-4" /> {gpsError} (Ulangi)
              </button>
            ) : typeof clockInForm.data.latitude === 'number' ? (
              <span className="text-emerald-700 bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-200 font-bold text-[11px] flex items-center gap-2 shadow-sm">
                <ShieldCheck className="w-4 h-4" /> GPS Terkunci
              </span>
            ) : (
              <span className="text-amber-700 bg-amber-50 px-4 py-2 rounded-2xl border border-amber-200 font-bold text-[11px] flex items-center gap-2 shadow-sm">
                <MapPin className="w-4 h-4" /> Menunggu GPS...
              </span>
            )}
          </div>
        </div>

        {/* Shift Info */}
        <div className="mb-8 relative z-10">
          {employeeShift ? (
            <div className="p-4 rounded-2xl bg-white border border-brand-100 shadow-sm flex flex-col items-center sm:flex-row justify-between gap-3 text-center sm:text-left">
              <div>
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Shift Kerja Saat Ini</div>
                <div className="text-sm font-black text-brand-900">{employeeShift.name}</div>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                <TimeDisplay time={employeeShift.clock_in_time} theme="emerald" />
                <span className="text-slate-300 font-black">-</span>
                <TimeDisplay time={employeeShift.clock_out_time} theme="rose" />
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold text-center flex flex-col items-center gap-2">
              <AlertCircle className="w-6 h-6 text-amber-500" />
              <span>Belum ada Shift terdaftar. Hubungi HRD.</span>
            </div>
          )}
        </div>

        {/* Big Action Buttons (Mobile First) */}
        <div className="grid grid-cols-2 gap-4 relative z-10">
          
          {/* CLOCK IN */}
          <div className="flex flex-col">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={openClockInWebcam}
              disabled={clockInForm.processing}
              className="group flex flex-col items-center justify-center p-6 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-[32px] shadow-xl shadow-emerald-500/30 border border-emerald-400/50 aspect-square sm:aspect-auto sm:py-10 transition-all hover:shadow-emerald-500/50"
            >
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <span className="text-white font-black text-lg tracking-tight">Clock In</span>
              <span className="text-emerald-100 font-medium text-[10px] uppercase tracking-wider mt-1">Ketuk untuk Masuk</span>
            </motion.button>
            
            <div className="mt-4 space-y-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex-1">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Mode Kerja</label>
                <Select2 value={clockInForm.data.work_mode} onChange={(e) => clockInForm.setData('work_mode', e.target.value)} options={[{ value: 'WFO', label: 'Office' }, { value: 'WFH', label: 'Remote' }, { value: 'Flexible', label: 'Trip' }]} />
              </div>
              {clockInForm.data.work_mode === 'WFO' && locations?.length > 0 && (
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Lokasi</label>
                  <Select2 value={clockInForm.data.work_location_id} onChange={(e) => clockInForm.setData('work_location_id', e.target.value)} options={locations.map((loc) => ({ value: loc.id, label: loc.name }))} />
                </div>
              )}
            </div>
          </div>

          {/* CLOCK OUT */}
          <div className="flex flex-col">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={openClockOutWebcam}
              disabled={clockOutForm.processing}
              className="group flex flex-col items-center justify-center p-6 bg-gradient-to-b from-rose-400 to-rose-600 rounded-[32px] shadow-xl shadow-rose-500/30 border border-rose-400/50 aspect-square sm:aspect-auto sm:py-10 transition-all hover:shadow-rose-500/50"
            >
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <LogOutIcon className="w-8 h-8 text-white" />
              </div>
              <span className="text-white font-black text-lg tracking-tight">Clock Out</span>
              <span className="text-rose-100 font-medium text-[10px] uppercase tracking-wider mt-1">Ketuk untuk Pulang</span>
            </motion.button>

            <div className="mt-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex-1 flex flex-col justify-center text-center">
              <CheckCircle2 className="w-8 h-8 text-rose-300 mx-auto mb-2" />
              <p className="text-[11px] font-bold text-slate-500 leading-relaxed">
                Pastikan mengambil foto selfie dengan pencahayaan terang saat pulang.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex p-1.5 bg-slate-200/50 rounded-2xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('attendance')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-black transition-all ${
              activeTab === 'attendance' ? 'bg-white text-brand-700 shadow-md shadow-slate-200' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Clock className="w-4 h-4" /> <span>Riwayat</span>
          </button>
          <button
            onClick={() => setActiveTab('corrections')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-black transition-all ${
              activeTab === 'corrections' ? 'bg-white text-indigo-700 shadow-md shadow-slate-200' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <FileCheck className="w-4 h-4" /> <span>Koreksi</span>
            {corrections.filter(c => c.status === 'pending').length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px]">{corrections.filter(c => c.status === 'pending').length}</span>
            )}
          </button>
        </div>

        <button
          onClick={() => setCorrectionModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-lg shadow-slate-900/20 active:scale-95 transition-all"
        >
          <PlusCircle className="w-4 h-4" /> <span>Buat Koreksi</span>
        </button>
      </div>

      {/* Content Feed/Cards */}
      <div className="pb-20">
        <AnimatePresence mode="wait">
          {activeTab === 'attendance' && (
            <motion.div key="attendance" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4">
              {attendances.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
                  <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-bold">Belum ada riwayat presensi.</p>
                </div>
              ) : (
                attendances.map((row) => (
                  <div key={row.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-brand-300 transition-colors">
                    {/* Left Info */}
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-100 to-brand-50 flex items-center justify-center shrink-0 border border-brand-200/50">
                        <CalendarDays className="w-6 h-6 text-brand-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <DateDisplay date={row.date} format="long" className="font-black text-slate-900 text-sm" />
                          <span className="text-[9px] font-black uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">{row.work_mode}</span>
                        </div>
                        <div className="text-xs font-bold text-slate-500">{row.employee?.full_name}</div>
                      </div>
                    </div>

                    {/* Right Info: Times */}
                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Masuk</span>
                        <TimeDisplay time={row.clock_in_at} theme="emerald" />
                      </div>
                      <div className="w-px h-8 bg-slate-200"></div>
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pulang</span>
                        <TimeDisplay time={row.clock_out_at} theme="rose" />
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center justify-between md:flex-col md:items-end gap-2 pt-4 md:pt-0 border-t border-slate-100 md:border-0">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={row.status} />
                        {row.late_minutes > 0 && <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-1 rounded-lg">Telat {row.late_minutes}m</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        {row.clock_in_photo && (
                          <button onClick={() => setSelectedPhotoModal({ title: 'Foto Masuk', url: row.clock_in_photo })} className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100"><Eye className="w-4 h-4"/></button>
                        )}
                        {row.clock_out_photo && (
                          <button onClick={() => setSelectedPhotoModal({ title: 'Foto Pulang', url: row.clock_out_photo })} className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100"><Eye className="w-4 h-4"/></button>
                        )}
                        {row.clock_in_lat && (
                          <a href={`https://maps.google.com/?q=${row.clock_in_lat},${row.clock_in_lng}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100"><MapPin className="w-4 h-4"/></a>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {activeTab === 'corrections' && (
            <motion.div key="corrections" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4">
              {corrections.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
                  <FileCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-bold">Tidak ada pengajuan koreksi.</p>
                </div>
              ) : (
                corrections.map((row) => (
                  <div key={row.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between gap-4 border-l-4 border-l-indigo-500">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <DateDisplay date={row.date} format="long" className="font-black text-slate-900 text-sm" />
                        <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-lg border border-indigo-100">{row.correction_type}</span>
                      </div>
                      <div className="text-xs font-bold text-slate-600">{row.employee?.full_name}</div>
                      <p className="text-xs text-slate-500 mt-2 bg-slate-50 p-3 rounded-xl border border-slate-100">{row.reason}</p>
                    </div>

                    <div className="flex flex-col items-end gap-3 justify-center min-w-[150px]">
                      <StatusBadge status={row.status} />
                      
                      {row.status === 'pending' && (
                        <div className="flex w-full gap-2 mt-2">
                          <button onClick={() => handleApproveCorrection(row, 'approve')} className="flex-1 py-2 bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl hover:bg-emerald-200 transition">Setuju</button>
                          <button onClick={() => handleApproveCorrection(row, 'reject')} className="flex-1 py-2 bg-rose-100 text-rose-700 font-bold text-xs rounded-xl hover:bg-rose-200 transition">Tolak</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AttendanceCorrectionModal isOpen={correctionModalOpen} onClose={() => setCorrectionModalOpen(false)} />
      <WebcamCaptureModal isOpen={webcamOpen} onClose={() => setWebcamOpen(false)} onCapture={handleWebcamCapture} mode={activeModalType === 'clockIn' ? 'Masuk' : 'Pulang'} />
      
      {selectedPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <h4 className="font-black text-slate-900 text-center mb-4">{selectedPhotoModal.title}</h4>
            <div className="aspect-[3/4] w-full rounded-2xl overflow-hidden bg-slate-100 mb-4 border border-slate-200 shadow-inner">
              <img src={`/${selectedPhotoModal.url}`} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <button onClick={() => setSelectedPhotoModal(null)} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm">Tutup Foto</button>
          </div>
        </div>
      )}
    </AuthenticatedLayout>
  );
}
