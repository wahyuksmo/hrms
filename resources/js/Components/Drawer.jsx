import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Drawer({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  width = 'w-full md:w-[600px] lg:w-[800px]',
  position = 'right' // right or left
}) {

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: position === 'right' ? '100%' : '-100%', opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: position === 'right' ? '100%' : '-100%', opacity: 0.5 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed top-0 ${position === 'right' ? 'right-0' : 'left-0'} h-full bg-white shadow-2xl z-50 flex flex-col ${width} border-l border-white/40`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white/80 backdrop-blur-md">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h3>
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-6 bg-[#F8FAFC]">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
