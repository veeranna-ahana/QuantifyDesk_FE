import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';

import { IconButton } from '@/components/ui/IconButton';

import { formatReportDate } from '../hooks/useDailyReport';

/** "< Today • Aug 22, 2026 >" with a native date picker behind the label. */
export function DateNavigator({ value, onChange, onShift }) {
  const inputRef = useRef(null);
  return (
    <div className="relative inline-flex items-center gap-1 rounded-chip border border-line-card bg-surface-card px-2 py-1 text-xs font-medium text-ink-secondary shadow-header">
      <IconButton label="Previous day" variant="neutral" size="sm" onClick={() => onShift(-1)}><ChevronLeft className="h-4 w-4" /></IconButton>
      <button type="button" onClick={() => inputRef.current?.showPicker?.() ?? inputRef.current?.focus()} className="inline-flex items-center gap-1.5 px-1">
        <Calendar className="h-3.5 w-3.5 text-ink-muted" aria-hidden="true" />
        <span className="whitespace-nowrap">{formatReportDate(value)}</span>
      </button>
      <IconButton label="Next day" variant="neutral" size="sm" onClick={() => onShift(1)}><ChevronRight className="h-4 w-4" /></IconButton>
      <input ref={inputRef} type="date" value={value} onChange={(e) => e.target.value && onChange(e.target.value)} className="sr-only" tabIndex={-1} aria-label="Report date" />
    </div>
  );
}
