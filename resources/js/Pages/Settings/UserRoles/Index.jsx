import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Check, Shield } from 'lucide-react';
import { showConfirm, showSuccess } from '@/Utils/swal';

export default function UserRolesIndex({ users, roles }) {
  const [selectedUser, setSelectedUser] = useState(users[0] || null);
  const [roleIds, setRoleIds] = useState(
    selectedUser ? selectedUser.roles.map((r) => r.id) : []
  );

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setRoleIds(user.roles.map((r) => r.id));
  };

  const handleToggleRole = (roleId) => {
    if (roleIds.includes(roleId)) {
      setRoleIds(roleIds.filter((id) => id !== roleId));
    } else {
      setRoleIds([...roleIds, roleId]);
    }
  };

  const handleSaveRoles = () => {
    if (!selectedUser) return;
    showConfirm({
      title: 'Simpan Mapping Role?',
      text: `Apakah Anda yakin ingin menyimpan mapping role untuk pengguna "${selectedUser.name}"?`,
      icon: 'question',
      confirmText: 'Ya, Simpan',
      onConfirm: () => {
        router.post(route('user-roles.update', selectedUser.id), {
          roles: roleIds,
        }, {
          onSuccess: () => {
            showSuccess('Berhasil!', 'Mapping role pengguna berhasil diperbarui.');
          }
        });
      }
    });
  };

  return (
    <AuthenticatedLayout headerTitle="Akses Pengguna ke Peran">
      <Head title="Akses Pengguna" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: User List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Daftar Pengguna</h2>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)] divide-y divide-slate-100 overflow-hidden max-h-[70vh] overflow-y-auto">
            {users.map((user) => {
              const isSelected = selectedUser && selectedUser.id === user.id;
              return (
                <button
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  className={`w-full p-4 text-left transition-all flex items-center justify-between ${
                    isSelected ? 'bg-brand-50/80 border-l-4 border-brand-600' : 'hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.name} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold border-2 border-white shadow-sm">
                        {user.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className={`font-extrabold text-sm ${isSelected ? 'text-brand-800' : 'text-slate-900'}`}>
                        {user.name}
                      </div>
                      <div className="text-xs font-medium text-slate-500 mt-0.5">{user.email}</div>
                      <div className="text-[10px] font-mono text-slate-400 font-bold mt-1 flex gap-1 flex-wrap">
                        {user.roles && user.roles.map(r => (
                          <span key={r.id} className="bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded-md">
                            {r.name}
                          </span>
                        ))}
                        {(!user.roles || user.roles.length === 0) && (
                          <span className="text-amber-500">Belum ada role</span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Roles Checkboxes */}
        <div className="lg:col-span-8">
          {selectedUser ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)] p-6 md:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-6 border-b border-slate-100 gap-3">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    Role untuk: <span className="text-brand-600">{selectedUser.name}</span>
                  </h2>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">Silakan pilih tingkat hak akses yang ingin diberikan kepada pengguna ini.</p>
                </div>
                <button
                  onClick={handleSaveRoles}
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-brand-600/30 transition-all flex items-center space-x-2 active:scale-95 self-end sm:self-auto"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Mapping Role</span>
                </button>
              </div>

              {/* Roles Matrix */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {roles.map((role) => {
                    const isChecked = roleIds.includes(role.id);
                    return (
                      <div key={role.id} className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        isChecked ? 'bg-brand-50 border-brand-300' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`} onClick={() => handleToggleRole(role.id)}>
                        <div className="flex items-start space-x-3">
                          <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                            isChecked ? 'bg-brand-600 border-brand-600 text-white' : 'bg-white border-slate-300'
                          }`}>
                            {isChecked && <Check className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <div className="font-extrabold text-sm text-slate-900">{role.name}</div>
                            <div className="text-xs text-slate-500 mt-1 line-clamp-2">{role.description || '-'}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {roles.length === 0 && (
                    <div className="col-span-full p-6 text-center text-slate-500 font-semibold bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                      Belum ada role yang tersedia di perusahaan ini.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center text-slate-400 font-bold flex flex-col items-center justify-center">
              <Shield className="w-12 h-12 mb-4 opacity-50" />
              Pilih pengguna di sebelah kiri untuk melihat dan mengubah mapping rolenya.
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
