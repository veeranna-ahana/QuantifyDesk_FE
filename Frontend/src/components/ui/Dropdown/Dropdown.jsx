import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/cn';

export function Dropdown({ trigger, children, className, align = 'left' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <div className="relative inline-block" ref={ref}>
      <div className="cursor-pointer inline-flex" onClick={() => setOpen(!open)}>
        {trigger}
      </div>
      {open && (
        <div 
          className={cn(
            'absolute top-full mt-2 z-50 bg-surface-card rounded-[8px] border border-line-card shadow-form-card py-2 px-2 flex flex-col gap-1 min-w-[140px]',
            align === 'right' ? 'right-0' : 'left-0',
            className
          )}
          onClick={(e) => {
            if (e.target.closest('button')) {
              setOpen(false);
            }
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({ children, onClick, active, className }) {
  return (
    <button
      type="button"
      className={cn(
        'w-full text-left px-2 py-2 text-[13px] flex items-center gap-[10px] rounded-[8px] transition-colors',
        active ? 'bg-action-primary-soft text-ink-primary font-medium' : 'bg-transparent text-ink-primary font-normal hover:bg-surface-muted',
        className
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
