import React, { useState, useEffect, useRef } from 'react';
import { 
  flexRender,
  useTable,
} from '@tanstack/react-table';
import { router } from '@inertiajs/react';
import { Search, Database, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUp, ArrowDown } from 'lucide-react';

export default function ServerDataTable({ 
  columns, 
  data, // Laravel paginated data object
  searchPlaceholder = "Cari data...", 
  queryParams = {} 
}) {
  const [search, setSearch] = useState(queryParams.search || '');
  const [sorting, setSorting] = useState(
    queryParams.sort ? [{ id: queryParams.sort, desc: queryParams.direction === 'desc' }] : []
  );
  
  const isMounted = useRef(false);

  // Debounce search
  useEffect(() => {
    if (!isMounted.current) {
        isMounted.current = true;
        return;
    }
    const delayDebounceFn = setTimeout(() => {
        fetchData({ search, sort: sorting });
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const fetchData = (params) => {
    let query = { ...queryParams };
    
    if (params.search !== undefined) {
      if (params.search) query.search = params.search;
      else delete query.search;
      query.page = 1; // Reset page on new search
    }
    
    if (params.sort !== undefined && params.sort.length > 0) {
      query.sort = params.sort[0].id;
      query.direction = params.sort[0].desc ? 'desc' : 'asc';
    } else if (params.sort !== undefined && params.sort.length === 0) {
      delete query.sort;
      delete query.direction;
    }

    if (params.page !== undefined) {
      query.page = params.page;
    }

    router.get(window.location.pathname, query, {
      preserveState: true,
      preserveScroll: true,
      replace: true
    });
  };

  const reactTableColumns = React.useMemo(() => {
    return columns.map((col, idx) => ({
      id: col.id || col.key || (typeof col.accessor === 'string' ? col.accessor : `col_${idx}`),
      header: col.header,
      accessorFn: typeof col.accessor === 'function' ? col.accessor : (row => col.accessor ? row[col.accessor] : row),
      cell: info => col.render ? col.render(info.row.original) : info.getValue(),
      enableSorting: !!(col.id || col.key || (typeof col.accessor === 'string')),
    }));
  }, [columns]);

  const table = useTable({
    data: data.data || [],
    columns: reactTableColumns,
    state: {
      sorting,
    },
    onSortingChange: (updater) => {
      const newSorting = typeof updater === 'function' ? updater(sorting) : updater;
      setSorting(newSorting);
      fetchData({ sort: newSorting });
    },
    manualSorting: true,
    manualPagination: true,
    pageCount: data.last_page || 1,
  });

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
          <span>Menampilkan <span className="font-bold text-slate-900">{data.data?.length || 0}</span> dari {data.total || 0} data</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50/90 text-slate-600 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200/80">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  const canSort = header.column.columnDef.enableSorting;
                  const isSorted = sorting.length > 0 && sorting[0].id === header.column.id ? (sorting[0].desc ? 'desc' : 'asc') : false;
                  const toggleSortingHandler = () => {
                    if (!canSort) return;
                    const isDesc = sorting.length > 0 && sorting[0].id === header.column.id && !sorting[0].desc;
                    const newSorting = [{ id: header.column.id, desc: isDesc }];
                    setSorting(newSorting);
                    fetchData({ sort: newSorting });
                  };

                  return (
                    <th 
                      key={header.id} 
                      className="px-6 py-4"
                      style={{ cursor: canSort ? 'pointer' : 'default' }}
                      onClick={toggleSortingHandler}
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: <ArrowUp className="w-3 h-3 text-brand-500" />,
                          desc: <ArrowDown className="w-3 h-3 text-brand-500" />,
                        }[isSorted] ?? null}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-slate-50/80 transition-colors group">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
      
      {/* Pagination */}
      {data.last_page > 1 && (
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="text-xs text-slate-500">
            Halaman <span className="font-bold text-slate-700">{data.current_page}</span> dari {data.last_page}
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => fetchData({ page: 1 })}
              disabled={data.current_page === 1}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white hover:text-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => fetchData({ page: data.current_page - 1 })}
              disabled={data.current_page === 1}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white hover:text-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => fetchData({ page: data.current_page + 1 })}
              disabled={data.current_page === data.last_page}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white hover:text-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => fetchData({ page: data.last_page })}
              disabled={data.current_page === data.last_page}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white hover:text-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
