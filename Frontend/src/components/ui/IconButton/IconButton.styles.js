import { cva } from 'class-variance-authority';

export const iconButtonStyles = cva(
  [
    'inline-flex shrink-0 items-center justify-center rounded-control transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary-ring',
    'disabled:opacity-50 disabled:pointer-events-none',
  ],
  {
    variants: {
      variant: {
        ghost: 'text-action-primary hover:bg-action-primary-soft',
        neutral: 'text-ink-secondary hover:bg-surface-field-disabled',
        outline: 'border border-line-field bg-surface-card text-ink-secondary hover:bg-surface-field-disabled',
      },
      size: { sm: 'h-7 w-7', md: 'h-8 w-8' },
    },
    defaultVariants: { variant: 'ghost', size: 'md' },
  },
);
