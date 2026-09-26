import { cva } from 'class-variance-authority';

/**
 * Button = 2 independent axes (variant x size) + fullWidth.
 * Only 4 variants are allowed on purpose: every screen in the Figma maps to one of them.
 * All values come from tokens (tailwind.config.js -> tokens.css).
 */
export const buttonStyles = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'rounded-control font-medium transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary-ring focus-visible:ring-offset-1',
    'disabled:opacity-50 disabled:pointer-events-none',
  ],
  {
    variants: {
      variant: {
        primary: 'bg-action-primary text-ink-on-primary hover:bg-action-primary-hover',
        secondary: 'bg-surface-card text-ink-primary border border-line hover:bg-surface-field-disabled',
        ghost: 'bg-transparent text-ink-secondary hover:bg-surface-field-disabled',
        danger: 'bg-badge-danger-ink text-ink-on-primary hover:opacity-90',
      },
      size: {
        sm: 'h-control-sm px-3 text-xs',
        md: 'h-control-md px-4 text-sm',
      },
      fullWidth: { true: 'w-full' },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);
