import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import { useForm, Head, router } from '@inertiajs/react';
import { ShieldCheck, Plus, Check, Lock, Info } from 'lucide-react';
import { showConfirm, showSuccess } from '@/Utils/swal';

export default function RolesIndex({ roles, menus }) {
  const [selectedRole, setSelectedRole] = useState(roles[0] || null);
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);

  const [permissionIds, setPermissionIds] = useState(
    selectedRole ? selectedRole.permissions.map((p) => p.id) : []
  );

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    setPermissionIds(role.permissions.map((p) => p.id));
  };

  const handleTogglePermission = (permId) => {
    if (permissionIds.includes(permId)) {
      setPermissionIds(permissionIds.filter((id) => id !== permId));
    } else {
      setPermissionIds([...permissionIds, permId]);
    }
  };

  const handleSavePermissions = () => {
    if (!selectedRole) return;
    showConfirm({
      title: 'Simpan Matriks Permission?',
      text: `Apakah Anda yakin ingin menyimpannya untuk role "${selectedRole.name}"? Hak akses pengguna dengan role ini akan langsung diperbarui.`,
      icon: 'question',
      confirmText: 'Ya, Simpan Matriks',
      onConfirm: () => {
        router.put(route('roles.update', selectedRole.id), {
          name: selectedRole.name,
          description: selectedRole.description,
          permissions: permissionIds,
        }, {
          onSuccess: () => {
            showSuccess('Berhasil!', 'Matriks permission role berhasil diperbarui.');
          }
        });
      }
    });
  };

  // New Role Form
  const { data, setData, post, processing, reset } = useForm({
    name: '',
    description: '',
  });

  const handleCreateRole = (e) => {
    e.preventDefault();
    showConfirm({
      title: 'Buat Role Baru?',
      text: `Apakah Anda yakin ingin membuat role "${data.name}"?`,
      icon: 'question',
      confirmText: 'Ya, Buat Role',
      onConfirm: () => {
        post(route('roles.store'), {
          onSuccess: () => {
            setIsAddRoleOpen(false);
            reset();
            showSuccess('Berhasil!', 'Role baru telah berhasil dibuat.');
          },
        });
      }
    });
  };

  return (
    <AuthenticatedLayout headerTitle="Pengaturan Hak Akses">
      <Head title="Pengaturan Hak Akses" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Role List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Daftar Role Hak Akses</h2>
            <button
              onClick={() => setIsAddRoleOpen(true)}
              className="p-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl transition-all shadow-xs active:scale-95"
              title="Tambah Role Baru"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)] divide-y divide-slate-100 overflow-hidden">
            {roles.map((role) => {
              const isSelected = selectedRole && selectedRole.id === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => handleSelectRole(role)}
                  className={`w-full p-4 text-left transition-all flex items-center justify-between ${
                    isSelected ? 'bg-brand-50/80 border-l-4 border-brand-600' : 'hover:bg-slate-50/80'
                  }`}
                >
                  <div>
                    <div className={`font-extrabold text-sm ${isSelected ? 'text-brand-800' : 'text-slate-900'}`}>
                      {role.name}
                    </div>
                    <div className="text-xs font-medium text-slate-500 mt-0.5">{role.description || 'Tidak ada deskripsi'}</div>
                    <div className="text-[10px] font-mono text-slate-400 font-bold mt-1">
                      {role.permissions ? role.permissions.length : 0} Hak Akses Tercentang
                    </div>
                  </div>
                  {role.is_system && (
                    <Lock className="w-4 h-4 text-amber-500 shrink-0" title="System Role" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Dynamic Permissions Matrix Grid */}
        <div className="lg:col-span-8">
          {selectedRole ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)] p-6 md:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-6 border-b border-slate-100 gap-3">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    Matriks Permission: <span className="text-brand-600">{selectedRole.name}</span>
                  </h2>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">Atur hak akses dengan mudah cukup dengan memberikan centang pada pilihan yang tersedia.</p>
                </div>
                <button
                  onClick={handleSavePermissions}
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-brand-600/30 transition-all flex items-center space-x-2 active:scale-95 self-end sm:self-auto"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Matriks Permission</span>
                </button>
              </div>

              {/* Matrix Table */}
              <div className="space-y-6">
                {menus.map((menu) => (
                  <div key={menu.id} className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80">
                    <div className="font-extrabold text-slate-900 text-sm mb-3 flex items-center justify-between">
                      <span>{menu.title}</span>
                      <span className="text-xs font-mono text-slate-400 font-semibold">{menu.permission_key}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                      {menu.permissions && menu.permissions.map((perm) => {
                        const isChecked = permissionIds.includes(perm.id);
                        return (
                          <label
                            key={perm.id}
                            className={`flex items-center space-x-2 p-2.5 rounded-xl border text-xs font-extrabold cursor-pointer transition-all ${
                              isChecked
                                ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleTogglePermission(perm.id)}
                              className="hidden"
                            />
                            <span className="capitalize">{perm.action_type}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center text-slate-400 font-bold">
              Pilih role di sebelah kiri untuk melihat matriks permission.
            </div>
          )}
        </div>
      </div>

      {/* Modal Add Role */}
      <Modal isOpen={isAddRoleOpen} onClose={() => setIsAddRoleOpen(false)} title="Buat Role Baru">
        <form onSubmit={handleCreateRole} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Nama Role</label>
            <input
              type="text"
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
              required
              placeholder="Contoh: HR Supervisor / Staff Keuangan"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold"
            />
          </div>
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Deskripsi Role</label>
            <textarea
              value={data.description}
              onChange={(e) => setData('description', e.target.value)}
              rows="3"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold"
            ></textarea>
          </div>
          <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsAddRoleOpen(false)}
              className="px-5 py-2.5 bg-slate-100 text-slate-700 font-extrabold text-xs rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={processing}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-brand-600/30 active:scale-95"
            >
              Simpan Role
            </button>
          </div>
        </form>
      </Modal>
    </AuthenticatedLayout>
  );
}
