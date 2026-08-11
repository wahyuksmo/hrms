import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Menu as MenuIcon, GripVertical } from 'lucide-react';

export default function SortableMenuItem({ id, menu, depth, isDragging }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isSorting,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginLeft: `${depth * 2}rem`,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 mb-2 bg-white rounded-xl border ${
        isDragging ? 'border-brand-500 shadow-lg' : 'border-slate-200 shadow-sm hover:border-slate-300'
      } transition-colors flex items-center gap-4`}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab hover:bg-slate-100 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 active:cursor-grabbing"
      >
        <GripVertical className="w-5 h-5" />
      </div>

      {/* Content */}
      <div className="flex-1 grid grid-cols-12 gap-4 items-center">
        <div className="col-span-1 text-center font-black text-xs text-brand-700 bg-brand-50 py-1.5 rounded-xl border border-brand-100 hidden sm:block">
          #{menu.order_no}
        </div>
        <div className="col-span-5 sm:col-span-4 flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200/60 shadow-xs hidden sm:block">
            <MenuIcon className="w-4 h-4" />
          </div>
          <div>
            <span className="font-extrabold text-slate-900 text-sm tracking-tight">{menu.title}</span>
            {menu.is_system && (
              <span className="ml-2 px-2 py-0.5 rounded-md text-[9px] font-black bg-amber-50 text-amber-800 border border-amber-200 hidden sm:inline-block">
                System
              </span>
            )}
          </div>
        </div>
        <div className="col-span-3 font-mono text-xs font-bold text-slate-700 bg-slate-50 px-3 py-1 rounded-xl border border-slate-200/60 hidden md:block truncate">
          {menu.permission_key}
        </div>
        <div className="col-span-6 sm:col-span-3 text-xs font-mono text-slate-500 font-semibold truncate">
          {menu.url}
        </div>
        <div className="col-span-1 text-right hidden sm:block">
          <span className="inline-flex px-2 py-1 rounded-lg text-[9px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            Aktif
          </span>
        </div>
      </div>
    </div>
  );
}
