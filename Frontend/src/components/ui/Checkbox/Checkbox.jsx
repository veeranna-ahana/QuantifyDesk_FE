import { forwardRef } from 'react';

import { cn } from '@/lib/cn';

export const Checkbox = forwardRef(function Checkbox({ label, className, ...rest }, ref) {
  return (
    <label className={cn('inline-flex cursor-pointer items-center gap-2 text-[13px] text-ink-primary', className)}>
      <input
        ref={ref}
        type="checkbox"
        className="h-4 w-4 cursor-pointer rounded-[3px] border border-line-field accent-action-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary-ring"
        {...rest}
      />
      {label}
    </label>
  );
});
