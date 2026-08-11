import React from 'react';

export default function StatusBadge({ status, text }) {
  const getBadgeStyle = (str) => {
    const s = (str || '').toLowerCase();
    if (s === 'approved' || s === 'hired' || s === 'passed' || s === 'fit' || s === 'paid' || s === 'active' || s === 'present') {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (s === 'pending' || s === 'in_process' || s === 'draft' || s === 'unpaid' || s === 'follow-up') {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    if (s === 'rejected' || s === 'failed' || s === 'unfit' || s === 'inactive' || s === 'absent') {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
    return 'bg-slate-50 text-slate-700 border-slate-200';
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeStyle(status)}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 fill-current bg-current"></span>
      {text || status}
    </span>
  );
}
