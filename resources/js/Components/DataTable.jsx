import React, { useState } from 'react';
import { Search, Database } from 'lucide-react';

export default function DataTable({ columns, data = [], searchPlaceholder = "Cari data..." }) {
  const [search, setSearch] = useState('');

  const filteredData = (data || []).filter((row) =>
    columns.some((col) => {
      let val = '';
      if (typeof col.accessor === 'function') {
        val = col.accessor(row);
      } else if (typeof col.accessor === 'string') {
        val = row[col.accessor];
      } else {
        val = row[col.key];
      }
      return String(val || '').toLowerCase().includes(search.toLowerCase());
    })
  );

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.03)] overflow-hidden transition-all">
      {/* Search Header */}
      <div className="p-4 md:p-5 border-b border-slate-100 bg-slate-50/60 backdrop-blur flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold bg-white border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 text-slate-800 placeholder-slate-400 transition-all shadow-xs"
          />
        </div>
        <div className="text-xs text-slate-500 font-semibold flex items-center gap-1.5 self-end sm:self-auto bg-white px-3 py-1.5 rounded-xl border border-slate-200/60 shadow-xs">
          <Database className="w-3.5 h-3.5 text-brand-600" />
          <span>Menampilkan <span className="font-bold text-slate-900">{filteredData.length}</span> dari {(data || []).length} data</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50/90 text-slate-600 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200/80">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="px-6 py-4">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredData.length > 0 ? (
              filteredData.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-slate-50/80 transition-colors group">
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className="px-6 py-4 whitespace-nowrap">
                      {col.render ? col.render(row) : (typeof col.accessor === 'function' ? col.accessor(row) : (col.accessor ? row[col.accessor] : row[col.key]))}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-400 bg-slate-50/30">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Database className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                    <p className="text-xs font-medium text-slate-500">Tidak ada data yang ditemukan.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
