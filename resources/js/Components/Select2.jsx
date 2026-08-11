import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search, Check, X } from 'lucide-react';

export default function Select2({
  options: rawOptions,
  children,
  value,
  onChange,
  placeholder = '-- Pilih --',
  searchPlaceholder = 'Cari pilihan...',
  disabled = false,
  required = false,
  className = '',
  name = '',
  id = '',
  searchable = true,
  clearable = false,
  size = 'md',
  error = null,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Normalize options from props or children
  const options = useMemo(() => {
    if (rawOptions && Array.isArray(rawOptions)) {
      return rawOptions.map((opt) => {
        if (typeof opt === 'object' && opt !== null) {
          return {
            value: String(opt.value ?? ''),
            label: String(opt.label ?? opt.value ?? ''),
            disabled: !!opt.disabled,
            badge: opt.badge,
            icon: opt.icon,
            description: opt.description,
          };
        }
        return { value: String(opt), label: String(opt), disabled: false };
      });
    }

    // Fallback: parse React children <option>
    const parsedOptions = [];
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && child.type === 'option') {
        parsedOptions.push({
          value: String(child.props.value ?? ''),
          label: String(child.props.children ?? child.props.value ?? ''),
          disabled: !!child.props.disabled,
        });
      }
    });
    return parsedOptions;
  }, [rawOptions, children]);

  // Find currently selected option
  const selectedOption = useMemo(() => {
    return options.find((opt) => String(opt.value) === String(value ?? ''));
  }, [options, value]);

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    const term = searchTerm.toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(term) ||
        (opt.description && opt.description.toLowerCase().includes(term))
    );
  }, [options, searchTerm]);

  // Update coordinates for Portal positioning (using fixed viewport coordinates)
  const updateCoords = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 6,
        left: rect.left,
        width: rect.width,
      });
    }
  };

  // Handle outside click to close popover
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current && !containerRef.current.contains(event.target) &&
        dropdownRef.current && !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update position on open, scroll, or resize
  useEffect(() => {
    if (isOpen) {
      updateCoords();
      window.addEventListener('resize', updateCoords);
      window.addEventListener('scroll', updateCoords, true);
    } else {
      setSearchTerm('');
    }
    return () => {
      window.removeEventListener('resize', updateCoords);
      window.removeEventListener('scroll', updateCoords, true);
    };
  }, [isOpen]);

  // Focus search input on open
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const handleSelect = (option) => {
    if (option.disabled || disabled) return;
    setIsOpen(false);
    if (onChange) {
      const syntheticEvent = {
        target: { name, value: option.value, id },
        currentTarget: { name, value: option.value, id },
        value: option.value,
      };
      onChange(syntheticEvent);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (disabled) return;
    if (onChange) {
      const syntheticEvent = {
        target: { name, value: '', id },
        currentTarget: { name, value: '', id },
        value: '',
      };
      onChange(syntheticEvent);
    }
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-lg',
    md: 'px-3.5 py-2.5 text-xs rounded-xl',
    lg: 'px-4 py-3 text-sm rounded-2xl',
  }[size] || 'px-3.5 py-2.5 text-xs rounded-xl';

  const isError = Boolean(error);

  return (
    <div className={`relative inline-block w-full ${className}`} ref={containerRef}>
      {required && (
        <input
          type="text"
          name={name}
          value={value ?? ''}
          required={required}
          tabIndex={-1}
          aria-hidden="true"
          className="opacity-0 absolute pointer-events-none inset-0 w-0 h-0"
          onChange={() => {}}
        />
      )}

      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!isOpen) updateCoords();
          setIsOpen(!isOpen);
        }}
        className={`w-full flex items-center justify-between gap-2 bg-white border text-left font-semibold transition-all shadow-xs outline-none ${
          disabled
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200'
            : isError
            ? 'border-red-500 ring-2 ring-red-500/20 text-slate-800'
            : isOpen
            ? 'border-brand-500 ring-2 ring-brand-500/20 text-slate-800'
            : 'border-slate-200 hover:border-slate-300 text-slate-800'
        } ${sizeClasses}`}
      >
        <span className="truncate flex items-center gap-2">
          {selectedOption ? (
            <>
              {selectedOption.icon && <span className="shrink-0">{selectedOption.icon}</span>}
              <span className={selectedOption.value === '' ? 'text-slate-400 font-normal' : 'font-semibold text-slate-800'}>
                {selectedOption.label}
              </span>
              {selectedOption.badge && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-brand-50 text-brand-700 font-extrabold">
                  {selectedOption.badge}
                </span>
              )}
            </>
          ) : (
            <span className="text-slate-400 font-normal">{placeholder}</span>
          )}
        </span>

        <div className="flex items-center gap-1 shrink-0 ml-1">
          {clearable && value && !disabled && (
            <span
              onClick={handleClear}
              className="p-0.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-brand-600' : ''
            }`}
          />
        </div>
      </button>

      {/* Terjadi Kesalahan Message Feedback */}
      {typeof error === 'string' && error && (
        <span className="text-[11px] text-red-500 font-medium mt-1 block">{error}</span>
      )}

      {/* Popover Dropdown rendered via Portal with zIndex 99999 and fixed positioning */}
      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: 'fixed',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              zIndex: 99999,
            }}
            className="bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-100"
          >
            {/* Search Box */}
            {searchable && options.length > 3 && (
              <div className="p-2 border-b border-slate-100 bg-slate-50/50">
                <div className="relative flex items-center">
                  <Search className="w-3.5 h-3.5 absolute left-3 text-slate-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-full pl-8 pr-3 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-800 placeholder-slate-400"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Options List */}
            <div className="max-h-60 overflow-y-auto p-1 scrollbar-thin">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt, idx) => {
                  const isSelected = String(opt.value) === String(value ?? '');
                  return (
                    <div
                      key={opt.value || idx}
                      onClick={() => handleSelect(opt)}
                      className={`flex items-center justify-between px-3 py-2 text-xs rounded-xl cursor-pointer transition-colors ${
                        opt.disabled
                          ? 'opacity-50 cursor-not-allowed text-slate-400'
                          : isSelected
                          ? 'bg-brand-50 text-brand-700 font-extrabold'
                          : 'text-slate-700 hover:bg-slate-100 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                        <div className="truncate">
                          <div className="truncate">{opt.label}</div>
                          {opt.description && (
                            <div className="text-[10px] text-slate-400 font-normal truncate">
                              {opt.description}
                            </div>
                          )}
                        </div>
                        {opt.badge && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold ml-1">
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-brand-600 shrink-0 ml-2" />}
                    </div>
                  );
                })
              ) : (
                <div className="p-4 text-center text-xs text-slate-400 font-medium">
                  Tidak ada pilihan ditemukan
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
