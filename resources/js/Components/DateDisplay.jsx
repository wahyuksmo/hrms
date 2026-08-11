import React from 'react';
import { CalendarDays } from 'lucide-react';

export default function DateDisplay({ date, className = '', format = 'long' }) {
  if (!date) return <span className="text-slate-400 font-semibold text-xs">-</span>;

  let formattedDate = date;
  
  try {
    const dateObj = new Date(date);
    if (!isNaN(dateObj.getTime())) {
      const options = format === 'short' 
        ? { day: '2-digit', month: 'short', year: 'numeric' }
        : { day: '2-digit', month: 'long', year: 'numeric' };
      
      formattedDate = dateObj.toLocaleDateString('id-ID', options);
    }
  } catch (e) {
    // Fallback to original string if parsing fails
  }

  // If the raw date still has a time component (e.g. from backend without proper cast)
  // Let's ensure it's just the date text.
  if (typeof formattedDate === 'string' && formattedDate.includes('T')) {
    formattedDate = formattedDate.split('T')[0];
  }

  return (
    <span>{formattedDate}</span>
  );
}
