import React from 'react';
import { cn } from '@/lib/cn';

/**
 * Table building blocks. Header = surface-table-head, 41px.
 * No scrollbar when fitHeight is enabled; rows share height equally.
 */
export function Table({ className, wrapperClassName, fitHeight = false, children, ...rest }) {
  return (
    <div
      className={cn(
        'w-full',
        fitHeight ? 'h-full flex flex-col min-h-0 overflow-hidden' : 'overflow-x-auto figma-table-scroll',
        wrapperClassName
      )}
    >
      <table
        className={cn(
          'w-full border-collapse text-left text-[12px]',
          fitHeight && 'h-full table-fixed',
          className
        )}
        {...rest}
      >
        {children}
      </table>
    </div>
  );
}

export const TableHead = ({ className, children, ...rest }) => (
  <thead className={cn('bg-surface-table-head shrink-0', className)} {...rest}>
    {children}
  </thead>
);

export const TableBody = ({ className, fitHeight = false, children, ...rest }) => (
  <tbody className={cn(fitHeight && 'h-full', className)} {...rest}>
    {children}
  </tbody>
);

export const TableRow = ({ className, fitHeight = false, ...rest }) => (
  <tr
    className={cn(
      'group transition-colors hover:bg-surface-field-disabled border-b border-[#F1F5F9] last:border-b-0',
      fitHeight && 'h-[10%] min-h-[28px] max-h-[50px]',
      className
    )}
    {...rest}
  />
);

export const TableHeaderCell = ({ className, align = 'left', ...rest }) => (
  <th
    className={cn(
      'h-[41px] whitespace-nowrap border-b border-line-card bg-surface-table-head px-5 py-3 text-[12px] font-semibold text-ink-secondary',
      align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left',
      className
    )}
    {...rest}
  />
);

export const TableCell = ({ className, align = 'left', ...rest }) => (
  <td
    className={cn(
      'border-b border-[#F1F5F9] px-5 py-1.5 align-middle text-[12px] text-ink-primary',
      align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left',
      className
    )}
    {...rest}
  />
);

export const TableFooter = ({ className, children, ...rest }) => (
  <div
    className={cn(
      'h-[50px] shrink-0 border-t border-line-card bg-surface-table-head px-6 flex items-center justify-between',
      className
    )}
    {...rest}
  >
    {children}
  </div>
);
