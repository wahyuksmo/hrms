import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import Select2 from '@/Components/Select2';
import { useForm, Head } from '@inertiajs/react';
import { Plus, Menu as MenuIcon, Shield, ArrowUpDown, Lock } from 'lucide-react';
import { showConfirm, showSuccess } from '@/Utils/swal';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import SortableMenuItem from '@/Components/SortableMenuItem';

export default function MenusIndex({ menus, parent_options }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, setData, post, processing, reset, errors } = useForm({
    parent_id: '',
    title: '',
    icon: 'LayoutDashboard',
    url: '',
    permission_key: '',
    order_no: 1,
  });

  // Flatten menus for sortable list
  const flattenMenus = (menuTree) => {
    let result = [];
    menuTree.forEach(menu => {
      result.push({ ...menu, depth: 0 });
      if (menu.children && menu.children.length > 0) {
        menu.children.forEach(child => {
          result.push({ ...child, depth: 1 });
        });
      }
    });
    return result;
  };

  const [activeId, setActiveId] = useState(null);
  const [flatMenus, setFlatMenus] = useState(flattenMenus(menus));

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      setFlatMenus((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const newArray = arrayMove(items, oldIndex, newIndex);

        // Recalculate parents and order_no
        let currentRootId = null;
        let rootOrder = 1;
        let childOrder = 1;

        const updatedArray = newArray.map((item) => {
          if (item.depth === 0) {
            currentRootId = item.id;
            item.parent_id = null;
            item.order_no = rootOrder++;
            childOrder = 1; // Reset child order for new root
          } else {
            // It's a child. Assign to the closest root above it
            item.parent_id = currentRootId;
            item.order_no = childOrder++;
          }
          return item;
        });

        // Send to backend
        router.post(route('menus.reorder'), { menus: updatedArray }, {
          preserveScroll: true,
          onSuccess: () => showSuccess('Tersimpan', 'Urutan menu telah diperbarui secara otomatis.'),
        });

        return updatedArray;
      });
    }
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    showConfirm({
      title: 'Tambah Menu Dinamis?',
      text: `Apakah Anda yakin ingin menambahkan menu "${data.title}"?`,
      icon: 'question',
      confirmText: 'Ya, Simpan Menu',
      onConfirm: () => {
        post(route('menus.store'), {
          onSuccess: () => {
            setIsModalOpen(false);
            reset();
            showSuccess('Berhasil!', 'Dynamic menu baru telah disimpan.');
          },
        });
      }
    });
  };

  return (
    <AuthenticatedLayout headerTitle="Pengaturan Menu Dinamis">
      <Head title="Pengaturan Menu" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <MenuIcon className="w-5 h-5 text-brand-600" />
            <span>Dynamic Navigation Menu Builder</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Semua menu dan pengaturannya tersimpan di dalam sistem, sehingga Anda dapat mengubahnya kapan saja dengan mudah.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-2 px-5 py-3 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-brand-600/30 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Menu Baru</span>
        </button>
      </div>

      {/* Menu Tree List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)] overflow-hidden">
        <div className="p-4.5 border-b border-slate-100 bg-slate-50/80 font-black text-[10px] uppercase tracking-wider text-slate-400 grid grid-cols-12 gap-4 items-center">
          <div className="col-span-1 text-center">Urutan</div>
          <div className="col-span-5 sm:col-span-4">Judul Menu & Submenu</div>
          <div className="col-span-3 hidden md:block">Permission Key</div>
          <div className="col-span-6 sm:col-span-3">URL Route</div>
          <div className="col-span-1 text-right hidden sm:block">Status</div>
        </div>

        <div className="p-4 bg-slate-50/30">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={flatMenus.map(m => m.id)}
              strategy={verticalListSortingStrategy}
            >
              {flatMenus.map((menu) => (
                <SortableMenuItem
                  key={menu.id}
                  id={menu.id}
                  menu={menu}
                  depth={menu.depth}
                  isDragging={activeId === menu.id}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div>

      {/* Add Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Dynamic Menu Baru">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Parent Menu (Opsional untuk Submenu)</label>
            <Select2
              value={data.parent_id}
              onChange={(e) => setData('parent_id', e.target.value)}
              placeholder="-- Menu Utama (Root) --"
              options={[
                { value: '', label: '-- Menu Utama (Root) --' },
                ...parent_options.map((p) => ({ value: p.id, label: p.title }))
              ]}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Judul Menu</label>
              <input
                type="text"
                value={data.title}
                onChange={(e) => setData('title', e.target.value)}
                required
                placeholder="Contoh: Manajemen Cuti"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Permission Key (Unik)</label>
              <input
                type="text"
                value={data.permission_key}
                onChange={(e) => setData('permission_key', e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                required
                placeholder="menu_custom_leave"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono font-bold"
              />
              {errors.permission_key && <span className="text-xs text-rose-600">{errors.permission_key}</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">URL Route</label>
              <input
                type="text"
                value={data.url}
                onChange={(e) => setData('url', e.target.value)}
                placeholder="/custom-module"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Urutan (Order No)</label>
              <input
                type="number"
                value={data.order_no}
                onChange={(e) => setData('order_no', e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold"
              />
            </div>
          </div>

          <div className="p-3.5 bg-brand-50/80 border border-brand-100 rounded-2xl text-xs text-brand-900 leading-relaxed font-semibold">
            <span className="font-extrabold">Info Bebas Ubah:</span> Saat menu baru dibuat, matriks permission (view, create, edit, delete, approve, export) akan otomatis dibuat dan siap untuk dicentang di UI Roles Management.
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={processing}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-brand-600/30 active:scale-95"
            >
              Simpan Dynamic Menu
            </button>
          </div>
        </form>
      </Modal>
    </AuthenticatedLayout>
  );
}
