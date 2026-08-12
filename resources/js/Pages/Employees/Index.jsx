import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ServerDataTable from '@/Components/ServerDataTable';
import Drawer from '@/Components/Drawer';
import Select2 from '@/Components/Select2';
import { useForm, router, Head, Link } from '@inertiajs/react';
import { 
  Users, UserPlus, UserCog, Clock, Pencil, Trash2, Power, 
  Sparkles, CreditCard, Briefcase, User as UserIcon, Shield, CheckCircle2, XCircle, MapPin,
  GraduationCap, PhoneCall, Heart, FileText, Check, Layers, Plus, Award, Network
} from 'lucide-react';
import { showConfirm, showSuccess } from '@/Utils/swal';
import TimeDisplay from '@/Components/TimeDisplay';

export default function EmployeesIndex({ employees, queryParams = {}, departments, positions, levels, shifts = [], workLocations = [] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [activeTab, setActiveTab] = useState('personal'); // personal | education | employment | locations | superiors | financial | status

  // Main Unified Employee Form
  const employeeForm = useForm({
    // Data Pribadi
    full_name: '',
    email: '',
    gender: 'L',
    phone: '',
    address: '',
    birth_date: '',
    birth_place: '',
    nik_ktp: '',
    marital_status: 'Single',
    religion: 'Islam',
    
    // Pendidikan & Pengalaman
    education: 'S1',
    last_education_institution: '',
    major: '',
    gpa: '',
    non_formal_education: '',
    experience_years: '1-3 Tahun',
    work_experience_detail: '',

    // Dynamic History Arrays
    education_history: [],
    non_formal_education_history: [],
    work_experience_history: [],

    // Kontak Darurat
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relation: 'Orang Tua / Pasangan',

    // Kepegawaian & Shift
    department_id: departments[0] ? departments[0].id : '',
    position_id: positions[0] ? positions[0].id : '',
    level_id: levels[0] ? levels[0].id : '',
    shift_id: shifts[0] ? shifts[0].id : '',
    join_date: new Date().toISOString().split('T')[0],
    employment_status: 'Permanent',

    // Lokasi Presensi
    work_location_ids: [],

    // Atasan Direct
    superior_employee_id: '',
    approval_level: 'level_1',
    module: 'all',

    // Financial & Pajak
    base_salary: 8000000,
    bank_name: 'BCA',
    bank_account_number: '',
    bank_account_holder: '',
    npwp: '',
    bpjs_kesehatan: '',
    bpjs_ketenagakerjaan: '',
    tax_status: 'TK/0',

    // Status & Akun
    create_user_account: true,
    is_active: true,
  });

  // Helper Array Handlers
  const addEduRow = () => {
    employeeForm.setData('education_history', [
      ...(employeeForm.data.education_history || []),
      { level: 'S1', institution: '', major: '', gpa: '', start_year: '' }
    ]);
  };

  const removeEduRow = (index) => {
    const updated = (employeeForm.data.education_history || []).filter((_, i) => i !== index);
    employeeForm.setData('education_history', updated);
  };

  const updateEduRow = (index, field, value) => {
    const updated = [...(employeeForm.data.education_history || [])];
    updated[index][field] = value;
    employeeForm.setData('education_history', updated);
  };

  const addNonFormalRow = () => {
    employeeForm.setData('non_formal_education_history', [
      ...(employeeForm.data.non_formal_education_history || []),
      { name: '', organizer: '', year: '', certificate_no: '' }
    ]);
  };

  const removeNonFormalRow = (index) => {
    const updated = (employeeForm.data.non_formal_education_history || []).filter((_, i) => i !== index);
    employeeForm.setData('non_formal_education_history', updated);
  };

  const updateNonFormalRow = (index, field, value) => {
    const updated = [...(employeeForm.data.non_formal_education_history || [])];
    updated[index][field] = value;
    employeeForm.setData('non_formal_education_history', updated);
  };

  const addWorkRow = () => {
    employeeForm.setData('work_experience_history', [
      ...(employeeForm.data.work_experience_history || []),
      { company: '', position: '', period: '', description: '', salary: '' }
    ]);
  };

  const removeWorkRow = (index) => {
    const updated = (employeeForm.data.work_experience_history || []).filter((_, i) => i !== index);
    employeeForm.setData('work_experience_history', updated);
  };

  const updateWorkRow = (index, field, value) => {
    const updated = [...(employeeForm.data.work_experience_history || [])];
    updated[index][field] = value;
    employeeForm.setData('work_experience_history', updated);
  };

  const openCreateModal = () => {
    setEditingEmployee(null);
    setActiveTab('personal');
    employeeForm.reset();
    employeeForm.clearErrors();
    employeeForm.setData({
      full_name: '',
      email: '',
      gender: 'L',
      phone: '',
      address: '',
      birth_date: '',
      birth_place: '',
      nik_ktp: '',
      marital_status: 'Single',
      religion: 'Islam',
      
      education: 'S1',
      last_education_institution: '',
      major: '',
      gpa: '',
      non_formal_education: '',
      experience_years: '1-3 Tahun',
      work_experience_detail: '',

      education_history: [
        { level: 'S1', institution: '', major: '', gpa: '', start_year: '' }
      ],
      non_formal_education_history: [],
      work_experience_history: [],

      emergency_contact_name: '',
      emergency_contact_phone: '',
      emergency_contact_relation: 'Orang Tua / Pasangan',

      department_id: departments[0] ? departments[0].id : '',
      position_id: positions[0] ? positions[0].id : '',
      level_id: levels[0] ? levels[0].id : '',
      shift_id: shifts[0] ? shifts[0].id : '',
      join_date: new Date().toISOString().split('T')[0],
      employment_status: 'Permanent',

      work_location_ids: [],
      superior_employee_id: '',
      approval_level: 'level_1',
      module: 'all',

      base_salary: 8000000,
      bank_name: 'BCA',
      bank_account_number: '',
      bank_account_holder: '',
      npwp: '',
      bpjs_kesehatan: '',
      bpjs_ketenagakerjaan: '',
      tax_status: 'TK/0',

      create_user_account: true,
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (emp) => {
    setEditingEmployee(emp);
    setActiveTab('personal');
    employeeForm.clearErrors();

    const existingLocations = emp.work_locations ? emp.work_locations.map((l) => l.id) : [];
    const firstSuperior = emp.superiors && emp.superiors.length > 0 ? emp.superiors[0] : null;

    employeeForm.setData({
      full_name: emp.full_name || '',
      email: emp.email || '',
      gender: emp.gender || 'L',
      phone: emp.phone || '',
      address: emp.address || '',
      birth_date: emp.birth_date ? emp.birth_date.substring(0, 10) : '',
      birth_place: emp.birth_place || '',
      nik_ktp: emp.nik_ktp || '',
      marital_status: emp.marital_status || 'Single',
      religion: emp.religion || 'Islam',

      education: emp.education || 'S1',
      last_education_institution: emp.last_education_institution || '',
      major: emp.major || '',
      gpa: emp.gpa || '',
      non_formal_education: emp.non_formal_education || '',
      experience_years: emp.experience_years || '1-3 Tahun',
      work_experience_detail: emp.work_experience_detail || '',

      education_history: Array.isArray(emp.education_history) && emp.education_history.length > 0
        ? emp.education_history 
        : [{ level: emp.education || 'S1', institution: emp.last_education_institution || '', major: emp.major || '', gpa: emp.gpa || '', start_year: '' }],
      non_formal_education_history: Array.isArray(emp.non_formal_education_history) ? emp.non_formal_education_history : [],
      work_experience_history: Array.isArray(emp.work_experience_history) ? emp.work_experience_history : [],

      emergency_contact_name: emp.emergency_contact_name || '',
      emergency_contact_phone: emp.emergency_contact_phone || '',
      emergency_contact_relation: emp.emergency_contact_relation || 'Orang Tua / Pasangan',

      department_id: emp.department_id || (departments[0] ? departments[0].id : ''),
      position_id: emp.position_id || (positions[0] ? positions[0].id : ''),
      level_id: emp.level_id || (levels[0] ? levels[0].id : ''),
      shift_id: emp.shift_id || '',
      join_date: emp.join_date ? emp.join_date.substring(0, 10) : new Date().toISOString().split('T')[0],
      employment_status: emp.employment_status || 'Permanent',

      work_location_ids: existingLocations,
      superior_employee_id: firstSuperior ? firstSuperior.superior_employee_id : '',
      approval_level: firstSuperior ? firstSuperior.approval_level : 'level_1',
      module: firstSuperior ? firstSuperior.module : 'all',

      base_salary: emp.base_salary || 0,
      bank_name: emp.bank_name || '',
      bank_account_number: emp.bank_account_number || '',
      bank_account_holder: emp.bank_account_holder || '',
      npwp: emp.npwp || '',
      bpjs_kesehatan: emp.bpjs_kesehatan || '',
      bpjs_ketenagakerjaan: emp.bpjs_ketenagakerjaan || '',
      tax_status: emp.tax_status || 'TK/0',

      create_user_account: false,
      is_active: emp.is_active ?? true,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (editingEmployee) {
      showConfirm({
        title: 'Perbarui Data Karyawan?',
        text: `Apakah Anda yakin ingin memperbarui data profil & konfigurasi "${employeeForm.data.full_name}"?`,
        icon: 'question',
        confirmText: 'Ya, Perbarui',
        onConfirm: () => {
          // Submit main profile updates
          employeeForm.put(route('employees.update', editingEmployee.id), {
            onSuccess: () => {
              // Sync locations if changed
              router.put(route('employees.locations.update', editingEmployee.id), {
                work_location_ids: employeeForm.data.work_location_ids
              });

              // Sync superior if selected
              if (employeeForm.data.superior_employee_id) {
                router.post(route('employees.superiors.assign', editingEmployee.id), {
                  superior_employee_id: employeeForm.data.superior_employee_id,
                  approval_level: employeeForm.data.approval_level,
                  module: employeeForm.data.module,
                });
              }

              setIsModalOpen(false);
              employeeForm.reset();
              showSuccess('Berhasil!', 'Data profil & konfigurasi karyawan telah diperbarui.');
            },
          });
        }
      });
    } else {
      showConfirm({
        title: 'Tambah Karyawan Baru?',
        text: `Apakah Anda yakin ingin menambahkan karyawan "${employeeForm.data.full_name}"? NIK akan di-generate otomatis.`,
        icon: 'question',
        confirmText: 'Ya, Simpan',
        onConfirm: () => {
          employeeForm.post(route('employees.store'), {
            onSuccess: () => {
              setIsModalOpen(false);
              employeeForm.reset();
              showSuccess('Berhasil!', 'Data karyawan baru telah disimpan.');
            },
          });
        }
      });
    }
  };

  const handleToggleStatus = (emp) => {
    const actionText = emp.is_active ? 'menonaktifkan' : 'mengaktifkan';
    showConfirm({
      title: `${emp.is_active ? 'Nonaktifkan' : 'Aktifkan'} Karyawan?`,
      text: `Apakah Anda yakin ingin ${actionText} karyawan "${emp.full_name}"?`,
      icon: emp.is_active ? 'warning' : 'question',
      confirmText: `Ya, ${emp.is_active ? 'Nonaktifkan' : 'Aktifkan'}`,
      onConfirm: () => {
        router.patch(route('employees.toggle-status', emp.id), {}, {
          onSuccess: () => {
            if (editingEmployee) setIsModalOpen(false);
            showSuccess('Berhasil!', `Status karyawan ${emp.full_name} telah diperbarui.`);
          }
        });
      }
    });
  };

  const handleDeleteEmployee = (emp) => {
    showConfirm({
      title: 'Hapus Data Karyawan?',
      text: `Penghapusan ini akan menyembunyikan data "${emp.full_name}" (Soft Delete). Lanjutkan?`,
      icon: 'error',
      confirmText: 'Ya, Hapus Data',
      onConfirm: () => {
        router.delete(route('employees.destroy', emp.id), {
          onSuccess: () => {
            if (editingEmployee) setIsModalOpen(false);
            showSuccess('Berhasil!', `Data karyawan ${emp.full_name} telah dihapus.`);
          }
        });
      }
    });
  };

  const columns = [
    {
      id: 'name',
      header: 'Karyawan & NIK',
      accessor: (row) => row.full_name,
      render: (row) => (
        <div className="flex items-center space-x-4 group/emp cursor-pointer">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-700 text-white font-black text-sm flex items-center justify-center shadow-[0_4px_15px_rgba(0,0,0,0.1)] group-hover/emp:from-brand-600 group-hover/emp:to-brand-500 transition-all duration-300 group-hover/emp:scale-105 group-hover/emp:shadow-[0_8px_20px_rgba(var(--brand-500-rgb),0.3)] ring-2 ring-white">
              {row.full_name.charAt(0)}
            </div>
            {row.is_active ? (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm"></div>
            ) : (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-rose-500 border-2 border-white rounded-full shadow-sm"></div>
            )}
          </div>
          <div>
            <div className="font-black text-slate-900 text-sm tracking-tight group-hover/emp:text-brand-700 transition-colors">
              {row.full_name}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="text-[10px] font-mono text-slate-600 font-bold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                {row.nik}
              </div>
              {!row.is_active && (
                <span className="text-[9px] font-black uppercase text-rose-600 tracking-wider">Non-Aktif</span>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Departemen & Jabatan',
      render: (row) => (
        <div className="text-xs">
          <div className="font-extrabold text-slate-800">{row.position?.name || '-'}</div>
          <div className="text-slate-500 font-semibold">{row.department?.name || '-'}</div>
        </div>
      ),
    },
    {
      header: 'Shift Kerja',
      render: (row) => (
        <div className="text-xs">
          {row.shift ? (
            <div className="flex flex-col items-start mt-1">
              <span className="inline-flex items-center space-x-1 text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 mb-1">
                {row.shift.name}
              </span>
              <div className="flex items-center gap-1">
                <TimeDisplay time={row.shift.clock_in_time} theme="emerald" />
                <span className="text-slate-300 font-black">-</span>
                <TimeDisplay time={row.shift.clock_out_time} theme="rose" />
              </div>
            </div>
          ) : (
            <span className="text-amber-600 bg-amber-50 px-2.5 py-1 rounded-xl font-bold text-[11px] border border-amber-200/60 inline-block">
              Belum Mapping
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Atasan Direct (Approval)',
      render: (row) => (
        <div className="text-xs space-y-1">
          {row.superiors && row.superiors.length > 0 ? (
            row.superiors.map((s) => (
              <span key={s.id} className="inline-flex items-center px-2.5 py-1 rounded-xl bg-slate-100/80 text-slate-700 font-bold mr-1 border border-slate-200/60">
                <span className="font-black text-brand-600 mr-1">{s.approval_level}:</span> {s.superior?.full_name}
              </span>
            ))
          ) : (
            <span className="text-slate-400 font-medium italic">Belum Set Atasan</span>
          )}
        </div>
      ),
    },
    {
      header: 'Status & Gaji Pokok',
      render: (row) => (
        <div className="text-xs">
          <div className="font-mono font-black text-emerald-700">Rp {Number(row.base_salary).toLocaleString('id-ID')}</div>
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">{row.employment_status}</span>
        </div>
      ),
    },
    {
      header: 'Info Cuti',
      render: (row) => (
        <div className="text-xs space-y-1.5 w-36">
          {row.leave_balances && row.leave_balances.length > 0 ? (
            row.leave_balances.map((b, i) => (
              <div key={i} className="group/leave">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="font-bold text-slate-600 text-[10px]" title={b.name}>{b.code}</span>
                  <span className={`font-black text-[10px] ${b.remaining > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{b.remaining} hari</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${b.remaining > 0 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-rose-500'}`} 
                    style={{ width: `${Math.min(100, Math.max(0, (b.remaining / 12) * 100))}%` }}
                  ></div>
                </div>
              </div>
            ))
          ) : (
            <span className="inline-flex items-center px-2 py-1 bg-slate-50 text-slate-400 italic text-[10px] rounded border border-slate-100">Tidak ada kuota</span>
          )}
        </div>
      ),
    },
    {
      header: 'Aksi',
      render: (row) => (
        <div className="flex items-center justify-end">
          <button
            onClick={() => openEditModal(row)}
            className="group/btn px-3 py-1.5 bg-white hover:bg-slate-900 text-slate-700 hover:text-white rounded-xl text-xs font-bold transition-all duration-300 border border-slate-200 hover:border-slate-900 flex items-center gap-1.5 shadow-sm hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 active:translate-y-0"
            title="Edit Profil & Kelola Karyawan"
          >
            <Pencil className="w-3.5 h-3.5 group-hover/btn:rotate-12 transition-transform" />
            <span>Kelola</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <AuthenticatedLayout headerTitle="Manajemen Karyawan">
      <Head title="Data Karyawan" />

      {/* Action Bar */}
      <div className="relative overflow-hidden mb-8 bg-white/70 backdrop-blur-xl p-8 rounded-3xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-500/20 transition-all duration-700"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 group-hover:bg-blue-500/20 transition-all duration-700"></div>
        
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-brand-50 border border-brand-100 rounded-full text-brand-700 text-[10px] font-black uppercase tracking-widest mb-3 shadow-sm">
              <Sparkles className="w-3 h-3" />
              <span>Manajemen SDM</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <span>Daftar Karyawan</span>
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-2 max-w-xl leading-relaxed">
              Kelola data profil lengkap, pendidikan, atasan direct, shift, lokasi presensi, dan status dalam satu tempat dengan mudah dan terintegrasi.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link
              href={route('employees.org-chart')}
              className="inline-flex items-center justify-center space-x-2 px-5 py-3.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-sm rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 active:translate-y-0 w-full sm:w-auto"
            >
              <Network className="w-4.5 h-4.5 text-brand-600" />
              <span>Struktur Organisasi</span>
            </Link>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 bg-slate-900 hover:bg-brand-600 text-white font-bold text-sm rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_25px_rgba(var(--brand-600-rgb),0.3)] transition-all duration-300 hover:-translate-y-1 active:translate-y-0 w-full sm:w-auto"
            >
              <UserPlus className="w-4.5 h-4.5" />
              <span>Tambah Karyawan</span>
            </button>
          </div>
        </div>
      </div>

      <ServerDataTable columns={columns} data={employees} searchPlaceholder="Cari nama karyawan atau NIK..." queryParams={queryParams} />

      {/* Unified Edit / Add Employee Drawer */}
      <Drawer 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingEmployee ? `Kelola & Edit Karyawan: ${editingEmployee.full_name} (${editingEmployee.nik})` : "Tambah Karyawan Baru (Auto NIK)"}
        position="right"
        width="w-full lg:w-[800px] xl:w-[900px]"
      >
        {/* Modal Tab Headers */}
        <div className="flex p-1.5 bg-slate-100/80 backdrop-blur-sm rounded-2xl mb-6 overflow-x-auto no-scrollbar gap-1.5 border border-slate-200/60 shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab('personal')}
            className={`px-4 py-2.5 font-bold text-xs flex items-center gap-2 transition-all duration-300 shrink-0 rounded-xl ${
              activeTab === 'personal'
                ? 'bg-white text-brand-700 shadow-[0_2px_10px_rgba(0,0,0,0.08)] scale-100 ring-1 ring-slate-200/50'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 hover:scale-95'
            }`}
          >
            <UserIcon className={`w-4 h-4 ${activeTab === 'personal' ? 'text-brand-600' : 'text-slate-400'}`} />
            <span>Informasi Pribadi</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('education')}
            className={`px-4 py-2.5 font-bold text-xs flex items-center gap-2 transition-all duration-300 shrink-0 rounded-xl ${
              activeTab === 'education'
                ? 'bg-white text-purple-700 shadow-[0_2px_10px_rgba(0,0,0,0.08)] scale-100 ring-1 ring-slate-200/50'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 hover:scale-95'
            }`}
          >
            <GraduationCap className={`w-4 h-4 ${activeTab === 'education' ? 'text-purple-600' : 'text-slate-400'}`} />
            <span>Pendidikan & Pengalaman</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('employment')}
            className={`px-4 py-2.5 font-bold text-xs flex items-center gap-2 transition-all duration-300 shrink-0 rounded-xl ${
              activeTab === 'employment'
                ? 'bg-white text-blue-700 shadow-[0_2px_10px_rgba(0,0,0,0.08)] scale-100 ring-1 ring-slate-200/50'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 hover:scale-95'
            }`}
          >
            <Briefcase className={`w-4 h-4 ${activeTab === 'employment' ? 'text-blue-600' : 'text-slate-400'}`} />
            <span>Kepegawaian & Shift</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('locations')}
            className={`px-4 py-2.5 font-bold text-xs flex items-center gap-2 transition-all duration-300 shrink-0 rounded-xl ${
              activeTab === 'locations'
                ? 'bg-white text-emerald-700 shadow-[0_2px_10px_rgba(0,0,0,0.08)] scale-100 ring-1 ring-slate-200/50'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 hover:scale-95'
            }`}
          >
            <MapPin className={`w-4 h-4 ${activeTab === 'locations' ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>Lokasi Presensi</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('superiors')}
            className={`px-4 py-2.5 font-bold text-xs flex items-center gap-2 transition-all duration-300 shrink-0 rounded-xl ${
              activeTab === 'superiors'
                ? 'bg-white text-orange-700 shadow-[0_2px_10px_rgba(0,0,0,0.08)] scale-100 ring-1 ring-slate-200/50'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 hover:scale-95'
            }`}
          >
            <UserCog className={`w-4 h-4 ${activeTab === 'superiors' ? 'text-orange-600' : 'text-slate-400'}`} />
            <span>Atasan Direct</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('financial')}
            className={`px-4 py-2.5 font-bold text-xs flex items-center gap-2 transition-all duration-300 shrink-0 rounded-xl ${
              activeTab === 'financial'
                ? 'bg-white text-cyan-700 shadow-[0_2px_10px_rgba(0,0,0,0.08)] scale-100 ring-1 ring-slate-200/50'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 hover:scale-95'
            }`}
          >
            <CreditCard className={`w-4 h-4 ${activeTab === 'financial' ? 'text-cyan-600' : 'text-slate-400'}`} />
            <span>Bank & Pajak</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('status')}
            className={`px-4 py-2.5 font-bold text-xs flex items-center gap-2 transition-all duration-300 shrink-0 rounded-xl ${
              activeTab === 'status'
                ? 'bg-white text-rose-700 shadow-[0_2px_10px_rgba(0,0,0,0.08)] scale-100 ring-1 ring-slate-200/50'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 hover:scale-95'
            }`}
          >
            <Shield className={`w-4 h-4 ${activeTab === 'status' ? 'text-rose-600' : 'text-slate-400'}`} />
            <span>Status & Akun</span>
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          {/* TAB 1: Informasi Pribadi & Kontak */}
          {activeTab === 'personal' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    value={employeeForm.data.full_name}
                    onChange={(e) => employeeForm.setData('full_name', e.target.value)}
                    required
                    placeholder="Contoh: Rian Kurniawan"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                  {employeeForm.errors.full_name && <span className="text-rose-500 text-[11px] mt-1 block">{employeeForm.errors.full_name}</span>}
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">NIK Identitas (KTP)</label>
                  <input
                    type="text"
                    value={employeeForm.data.nik_ktp}
                    onChange={(e) => employeeForm.setData('nik_ktp', e.target.value)}
                    placeholder="3171xxxxxxxxxxxx"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Email Aktif *</label>
                  <input
                    type="email"
                    value={employeeForm.data.email}
                    onChange={(e) => employeeForm.setData('email', e.target.value)}
                    required
                    placeholder="rian@company.com"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                  {employeeForm.errors.email && <span className="text-rose-500 text-[11px] mt-1 block">{employeeForm.errors.email}</span>}
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">No Telepon / WhatsApp</label>
                  <input
                    type="text"
                    value={employeeForm.data.phone}
                    onChange={(e) => employeeForm.setData('phone', e.target.value)}
                    placeholder="08123456789"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Jenis Kelamin</label>
                  <Select2
                    value={employeeForm.data.gender}
                    onChange={(e) => employeeForm.setData('gender', e.target.value)}
                    options={[
                      { value: 'L', label: 'Laki-Laki' },
                      { value: 'P', label: 'Perempuan' }
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Status Pernikahan</label>
                  <Select2
                    value={employeeForm.data.marital_status}
                    onChange={(e) => employeeForm.setData('marital_status', e.target.value)}
                    options={[
                      { value: 'Single', label: 'Single (Belum Menikah)' },
                      { value: 'Married', label: 'Married (Menikah)' },
                      { value: 'Divorced', label: 'Divorced (Cerai)' }
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Agama</label>
                  <Select2
                    value={employeeForm.data.religion}
                    onChange={(e) => employeeForm.setData('religion', e.target.value)}
                    options={[
                      { value: 'Islam', label: 'Islam' },
                      { value: 'Kristen', label: 'Kristen' },
                      { value: 'Katolik', label: 'Katolik' },
                      { value: 'Hindu', label: 'Hindu' },
                      { value: 'Buddha', label: 'Buddha' },
                      { value: 'Konghucu', label: 'Konghucu' }
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={employeeForm.data.birth_date}
                    onChange={(e) => employeeForm.setData('birth_date', e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Tempat Lahir</label>
                <input
                  type="text"
                  value={employeeForm.data.birth_place}
                  onChange={(e) => employeeForm.setData('birth_place', e.target.value)}
                  placeholder="Jakarta"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Alamat Tempat Tinggal</label>
                <textarea
                  value={employeeForm.data.address}
                  onChange={(e) => employeeForm.setData('address', e.target.value)}
                  rows={2}
                  placeholder="Jl. Sudirman No. 123..."
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>

              {/* Sub-Section Kontak Darurat */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                  <PhoneCall className="w-4 h-4 text-brand-600" />
                  <span>Kontak Darurat (Emergency Contact)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Nama Kontak</label>
                    <input
                      type="text"
                      value={employeeForm.data.emergency_contact_name}
                      onChange={(e) => employeeForm.setData('emergency_contact_name', e.target.value)}
                      placeholder="Budi Santoso"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">No Telepon Darurat</label>
                    <input
                      type="text"
                      value={employeeForm.data.emergency_contact_phone}
                      onChange={(e) => employeeForm.setData('emergency_contact_phone', e.target.value)}
                      placeholder="08198765432"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Hubungan</label>
                    <input
                      type="text"
                      value={employeeForm.data.emergency_contact_relation}
                      onChange={(e) => employeeForm.setData('emergency_contact_relation', e.target.value)}
                      placeholder="Orang Tua / Pasangan / Saudara"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Pendidikan & Pengalaman (Dynamic Multi-Entry) */}
          {activeTab === 'education' && (
            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1">
              
              {/* 1. Dynamic Formal Education */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="w-4 h-4 text-purple-600" />
                    <h4 className="text-xs font-black text-slate-900 uppercase">1. Riwayat Pendidikan Formal</h4>
                  </div>
                  <button
                    type="button"
                    onClick={addEduRow}
                    className="px-2.5 py-1 bg-purple-100 hover:bg-purple-200 text-purple-800 text-[11px] font-bold rounded-lg flex items-center space-x-1 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Baris</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {(employeeForm.data.education_history || []).map((edu, idx) => (
                    <div key={idx} className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-3 relative shadow-2xs">
                      <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                        <span className="text-[10px] font-extrabold uppercase text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                          Pendidikan #{idx + 1}
                        </span>
                        {(employeeForm.data.education_history || []).length > 0 && (
                          <button
                            type="button"
                            onClick={() => removeEduRow(idx)}
                            className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tingkat</label>
                          <Select2
                            value={edu.level}
                            onChange={(e) => updateEduRow(idx, 'level', e.target.value)}
                            options={[
                              { value: 'SMA/SMK', label: 'SMA / SMK' },
                              { value: 'D3', label: 'Diploma (D3)' },
                              { value: 'S1', label: 'Sarjana (S1)' },
                              { value: 'S2', label: 'Magister (S2)' }
                            ]}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nama Institusi / Sekolah</label>
                          <input
                            type="text"
                            value={edu.institution}
                            onChange={(e) => updateEduRow(idx, 'institution', e.target.value)}
                            placeholder="Universitas Indonesia"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Jurusan</label>
                          <input
                            type="text"
                            value={edu.major}
                            onChange={(e) => updateEduRow(idx, 'major', e.target.value)}
                            placeholder="Teknik Informatika"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">IPK / Nilai</label>
                          <input
                            type="number"
                            step="0.01"
                            value={edu.gpa}
                            onChange={(e) => updateEduRow(idx, 'gpa', e.target.value)}
                            placeholder="3.50"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tahun Lulus</label>
                          <input
                            type="text"
                            value={edu.start_year}
                            onChange={(e) => updateEduRow(idx, 'start_year', e.target.value)}
                            placeholder="2022"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Dynamic Non-Formal Education */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Award className="w-4 h-4 text-teal-600" />
                    <h4 className="text-xs font-black text-slate-900 uppercase">2. Sertifikasi & Kursus Non-Formal</h4>
                  </div>
                  <button
                    type="button"
                    onClick={addNonFormalRow}
                    className="px-2.5 py-1 bg-teal-100 hover:bg-teal-200 text-teal-800 text-[11px] font-bold rounded-lg flex items-center space-x-1 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Baris</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {(employeeForm.data.non_formal_education_history || []).map((item, idx) => (
                    <div key={idx} className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-3 relative shadow-2xs">
                      <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                        <span className="text-[10px] font-extrabold uppercase text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                          Sertifikasi #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeNonFormalRow(idx)}
                          className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nama Sertifikasi / Pelatihan</label>
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => updateNonFormalRow(idx, 'name', e.target.value)}
                            placeholder="Sertifikasi Scrum Master"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Penyelenggara</label>
                          <input
                            type="text"
                            value={item.organizer}
                            onChange={(e) => updateNonFormalRow(idx, 'organizer', e.target.value)}
                            placeholder="Scrum.org"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tahun Perolehan</label>
                          <input
                            type="text"
                            value={item.year}
                            onChange={(e) => updateNonFormalRow(idx, 'year', e.target.value)}
                            placeholder="2023"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">No Lisensi / Sertifikat</label>
                          <input
                            type="text"
                            value={item.certificate_no}
                            onChange={(e) => updateNonFormalRow(idx, 'certificate_no', e.target.value)}
                            placeholder="PSM-12345"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-semibold"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {(employeeForm.data.non_formal_education_history || []).length === 0 && (
                    <div className="text-center py-4 text-xs text-slate-400 font-medium">
                      Belum ada data sertifikasi/kursus. Klik "+ Tambah Baris" untuk menambahkan.
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Dynamic Work Experience */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                    <h4 className="text-xs font-black text-slate-900 uppercase">3. Riwayat Pengalaman Kerja</h4>
                  </div>
                  <button
                    type="button"
                    onClick={addWorkRow}
                    className="px-2.5 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 text-[11px] font-bold rounded-lg flex items-center space-x-1 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Baris</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {(employeeForm.data.work_experience_history || []).map((work, idx) => (
                    <div key={idx} className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-3 relative shadow-2xs">
                      <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                        <span className="text-[10px] font-extrabold uppercase text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          Pengalaman #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeWorkRow(idx)}
                          className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nama Perusahaan</label>
                          <input
                            type="text"
                            value={work.company}
                            onChange={(e) => updateWorkRow(idx, 'company', e.target.value)}
                            placeholder="PT Tech Indonesia"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Jabatan / Posisi</label>
                          <input
                            type="text"
                            value={work.position}
                            onChange={(e) => updateWorkRow(idx, 'position', e.target.value)}
                            placeholder="Software Engineer"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Periode Kerja</label>
                          <input
                            type="text"
                            value={work.period}
                            onChange={(e) => updateWorkRow(idx, 'period', e.target.value)}
                            placeholder="2021 - 2023"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Deskripsi Pekerjaan</label>
                        <textarea
                          rows={2}
                          value={work.description}
                          onChange={(e) => updateWorkRow(idx, 'description', e.target.value)}
                          placeholder="Mengembangkan modul HRMS..."
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                        />
                      </div>
                    </div>
                  ))}

                  {(employeeForm.data.work_experience_history || []).length === 0 && (
                    <div className="text-center py-4 text-xs text-slate-400 font-medium">
                      Belum ada riwayat pengalaman kerja. Klik "+ Tambah Baris" untuk menambahkan.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Kepegawaian & Shift */}
          {activeTab === 'employment' && (
            <div className="space-y-4">
              {editingEmployee && (
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">NIK Karyawan (Auto-Generated)</label>
                  <input
                    type="text"
                    value={editingEmployee.nik}
                    disabled
                    className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-600 cursor-not-allowed"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Departemen *</label>
                  <Select2
                    value={employeeForm.data.department_id}
                    onChange={(e) => employeeForm.setData('department_id', e.target.value)}
                    required
                    options={departments.map((d) => ({ value: d.id, label: `${d.name} (${d.code})` }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Jabatan *</label>
                  <Select2
                    value={employeeForm.data.position_id}
                    onChange={(e) => employeeForm.setData('position_id', e.target.value)}
                    required
                    options={positions.map((p) => ({ value: p.id, label: p.name }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Level Karyawan</label>
                  <Select2
                    value={employeeForm.data.level_id}
                    onChange={(e) => employeeForm.setData('level_id', e.target.value)}
                    options={[
                      { value: '', label: '-- Tanpa Level --' },
                      ...levels.map((l) => ({ value: l.id, label: l.name }))
                    ]}
                  />
                </div>

                {/* Shift Kerja Assignment */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Shift Kerja (Presensi & Jam Kerja)</label>
                  <Select2
                    value={employeeForm.data.shift_id}
                    onChange={(e) => employeeForm.setData('shift_id', e.target.value)}
                    options={[
                      { value: '', label: '-- Tanpa Shift / Belum Mapping --' },
                      ...shifts.map((s) => ({
                        value: s.id,
                        label: `${s.name} (${s.clock_in_time?.substring(0, 5)} - ${s.clock_out_time?.substring(0, 5)})`
                      }))
                    ]}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Tanggal Bergabung (Join Date) *</label>
                  <input
                    type="date"
                    value={employeeForm.data.join_date}
                    onChange={(e) => employeeForm.setData('join_date', e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Status Kepegawaian *</label>
                  <Select2
                    value={employeeForm.data.employment_status}
                    onChange={(e) => employeeForm.setData('employment_status', e.target.value)}
                    options={[
                      { value: 'Permanent', label: 'Permanent (Karyawan Tetap)' },
                      { value: 'Contract', label: 'Contract (Karyawan Kontrak)' },
                      { value: 'Probation', label: 'Probation (Masa Percobaan)' },
                      { value: 'Intern', label: 'Internship (Magang)' }
                    ]}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Lokasi Presensi */}
          {activeTab === 'locations' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-xs text-emerald-900 leading-relaxed flex items-center space-x-2.5">
                <MapPin className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Pilih satu atau beberapa lokasi kantor/customer tempat karyawan diizinkan melakukan presensi GPS online.</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-1">
                {workLocations.map((loc) => {
                  const isChecked = employeeForm.data.work_location_ids.includes(loc.id);
                  return (
                    <label
                      key={loc.id}
                      className={`flex items-start space-x-3 p-3 rounded-xl border transition-all cursor-pointer ${
                        isChecked ? 'bg-brand-50/60 border-brand-300 ring-2 ring-brand-500/20' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            employeeForm.setData('work_location_ids', [...employeeForm.data.work_location_ids, loc.id]);
                          } else {
                            employeeForm.setData(
                              'work_location_ids',
                              employeeForm.data.work_location_ids.filter((id) => id !== loc.id)
                            );
                          }
                        }}
                        className="mt-0.5 rounded text-brand-600 focus:ring-brand-500"
                      />
                      <div>
                        <span className="font-extrabold text-slate-800 text-xs block">{loc.name}</span>
                        <span className="text-[11px] text-slate-500 block truncate">{loc.address || 'Radius GPS default'}</span>
                        <span className="inline-block px-1.5 py-0.5 bg-slate-200 text-slate-700 text-[10px] font-mono font-bold rounded mt-1">
                          Radius: {loc.radius_meters || 100}m
                        </span>
                      </div>
                    </label>
                  );
                })}

                {workLocations.length === 0 && (
                  <div className="col-span-2 text-center py-6 text-xs text-slate-400 font-medium">
                    Belum ada data Master Lokasi Kerja. Silakan buat di menu Data Induk.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: Atasan Direct (Approval) */}
          {activeTab === 'superiors' && (
            <div className="space-y-4">
              <div className="p-4 bg-brand-50/80 border border-brand-200 rounded-2xl text-xs text-brand-900 leading-relaxed flex items-center space-x-2.5">
                <UserCog className="w-5 h-5 text-brand-600 shrink-0" />
                <span>Tetapkan Atasan Direct yang akan menyetujui (approval) pengajuan Cuti, Overtime, dan Reimbursement karyawan ini.</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Pilih Atasan Direct</label>
                  <Select2
                    value={employeeForm.data.superior_employee_id}
                    onChange={(e) => employeeForm.setData('superior_employee_id', e.target.value)}
                    options={[
                      { value: '', label: '-- Tanpa Atasan / Direksi --' },
                      ...employees
                        .filter((e) => !editingEmployee || e.id !== editingEmployee.id)
                        .map((e) => ({ value: e.id, label: `${e.full_name} (${e.nik} - ${e.position?.name || ''})` }))
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Level Approval Hierarchy</label>
                  <Select2
                    value={employeeForm.data.approval_level}
                    onChange={(e) => employeeForm.setData('approval_level', e.target.value)}
                    options={[
                      { value: 'level_1', label: 'Level 1 (Atasan Direct Utama)' },
                      { value: 'level_2', label: 'Level 2 (Manager / Head of Dept)' },
                      { value: 'level_3', label: 'Level 3 (Director / HR Manager)' }
                    ]}
                  />
                </div>
              </div>


            </div>
          )}

          {/* TAB 6: Bank, Pajak & Salary */}
          {activeTab === 'financial' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Gaji Pokok (IDR)</label>
                <input
                  type="number"
                  value={employeeForm.data.base_salary}
                  onChange={(e) => employeeForm.setData('base_salary', e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono font-extrabold text-emerald-700"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Nama Bank</label>
                  <input
                    type="text"
                    value={employeeForm.data.bank_name}
                    onChange={(e) => employeeForm.setData('bank_name', e.target.value)}
                    placeholder="BCA / Mandiri / BNI"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">No Rekening Payroll</label>
                  <input
                    type="text"
                    value={employeeForm.data.bank_account_number}
                    onChange={(e) => employeeForm.setData('bank_account_number', e.target.value)}
                    placeholder="1234567890"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Atas Nama Rekening</label>
                  <input
                    type="text"
                    value={employeeForm.data.bank_account_holder}
                    onChange={(e) => employeeForm.setData('bank_account_holder', e.target.value)}
                    placeholder="Rian Kurniawan"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">NPWP Pajak</label>
                  <input
                    type="text"
                    value={employeeForm.data.npwp}
                    onChange={(e) => employeeForm.setData('npwp', e.target.value)}
                    placeholder="12.345.678.9-012.000"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Status PTKP Pajak</label>
                  <Select2
                    value={employeeForm.data.tax_status}
                    onChange={(e) => employeeForm.setData('tax_status', e.target.value)}
                    options={[
                      { value: 'TK/0', label: 'TK/0 (Tidak Kawin - 0 Tanggungan)' },
                      { value: 'TK/1', label: 'TK/1 (Tidak Kawin - 1 Tanggungan)' },
                      { value: 'K/0', label: 'K/0 (Kawin - 0 Tanggungan)' },
                      { value: 'K/1', label: 'K/1 (Kawin - 1 Tanggungan)' },
                      { value: 'K/2', label: 'K/2 (Kawin - 2 Tanggungan)' },
                      { value: 'K/3', label: 'K/3 (Kawin - 3 Tanggungan)' }
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">BPJS Kesehatan</label>
                  <input
                    type="text"
                    value={employeeForm.data.bpjs_kesehatan}
                    onChange={(e) => employeeForm.setData('bpjs_kesehatan', e.target.value)}
                    placeholder="000123456789"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">BPJS Ketenagakerjaan</label>
                  <input
                    type="text"
                    value={employeeForm.data.bpjs_ketenagakerjaan}
                    onChange={(e) => employeeForm.setData('bpjs_ketenagakerjaan', e.target.value)}
                    placeholder="21012345678"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono font-semibold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: Status & Akun */}
          {activeTab === 'status' && (
            <div className="space-y-5">
              {editingEmployee ? (
                <div className="space-y-4">
                  {/* Status Toggle Block */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black text-slate-900 block">Status Keaktifan Karyawan</span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Saat non-aktif, karyawan tidak dapat melmelakukan presensi atau login ke portal.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(editingEmployee)}
                      className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                        editingEmployee.is_active
                          ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      <Power className="w-4 h-4" />
                      <span>{editingEmployee.is_active ? 'Nonaktifkan Karyawan' : 'Aktifkan Karyawan'}</span>
                    </button>
                  </div>

                  {/* Soft Delete Block */}
                  <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black text-rose-900 block">Hapus Permanent / Soft Delete Karyawan</span>
                      <span className="text-[11px] text-rose-700 font-medium">
                        Menyembunyikan record karyawan ini dari sistem HRMS secara aman.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteEmployee(editingEmployee)}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-rose-600/20 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Hapus Data Karyawan</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-brand-50/80 border border-brand-200 rounded-2xl">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={employeeForm.data.create_user_account}
                      onChange={(e) => employeeForm.setData('create_user_account', e.target.checked)}
                      className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                    />
                    <div>
                      <span className="text-xs font-extrabold text-slate-900 block">Buat Akun Login User Otomatis</span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Akun login HRMS akan dibuat menggunakan email karyawan dengan password default: <code className="font-mono text-brand-700 font-bold bg-white px-1.5 py-0.5 rounded border border-brand-200">Password123!</code>
                      </span>
                    </div>
                  </label>
                </div>
              )}
            </div>
          )}

          {!editingEmployee && (
            <div className="p-3.5 bg-brand-50/80 border border-brand-100 rounded-2xl text-xs text-brand-900 leading-relaxed flex items-center space-x-2.5">
              <Sparkles className="w-4 h-4 text-brand-600 shrink-0" />
              <span className="font-semibold">NIK di-generate otomatis saat klik Simpan dan Shift Kerja langsung terhubung ke presensi online.</span>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold text-xs rounded-xl transition-colors"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={employeeForm.processing}
              className="px-6 py-2.5 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-black text-xs rounded-xl shadow-md shadow-brand-600/30 transition-all flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{editingEmployee ? "Perbarui Data Karyawan" : "Simpan Karyawan Baru"}</span>
            </button>
          </div>
        </form>
      </Drawer>
    </AuthenticatedLayout>
  );
}
