import { cva } from 'class-variance-authority';

/**
 * Shared field look for Input / Select / Textarea.
 * Editable = white; disabled / read-only = surface-field-disabled (Figma #F8F9FF), border #DFE1E6.
 */
export const fieldStyles = cva(
  [
    'w-full rounded-control border bg-surface-card px-3 text-ink-primary',
    'placeholder:text-ink-muted transition-colors',
    'focus:outline-none focus:ring-2',
    'disabled:cursor-not-allowed disabled:bg-surface-field-disabled disabled:text-ink-secondary',
    'read-only:cursor-default read-only:bg-surface-field-disabled read-only:text-ink-secondary read-only:focus:ring-0',
  ],
  {
    variants: {
      size: { md: 'h-control-md text-[13px]', lg: 'h-control-lg text-sm' },
      invalid: {
        true: 'border-badge-danger-ink focus:ring-badge-danger-line',
        false: 'border-line-field focus:border-action-primary focus:ring-action-primary-ring',
      },
    },
    defaultVariants: { size: 'lg', invalid: false },
  },
);
