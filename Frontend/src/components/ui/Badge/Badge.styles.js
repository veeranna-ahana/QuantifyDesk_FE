import { cva } from 'class-variance-authority';

/** Status pill. Colours are the 6 badge token families in tokens.css. */
export const badgeStyles = cva(
  'inline-flex items-center gap-1.5 whitespace-nowrap border font-medium leading-none',
  {
    variants: {
      variant: {
        success: 'bg-badge-success-bg border-badge-success-line text-badge-success-ink',
        warning: 'bg-badge-warning-bg border-badge-warning-line text-badge-warning-ink',
        neutral: 'bg-badge-neutral-bg border-badge-neutral-line text-badge-neutral-ink',
        danger: 'bg-badge-danger-bg border-badge-danger-line text-badge-danger-ink',
        info: 'bg-badge-info-bg border-badge-info-line text-badge-info-ink',
        brand: 'bg-badge-brand-bg border-badge-brand-line text-badge-brand-ink',
      },
      shape: { pill: 'rounded-full px-2.5 py-1', chip: 'rounded-chip px-2 py-1' },
      size: { sm: 'text-[11px]', md: 'text-xs' },
    },
    defaultVariants: { variant: 'neutral', shape: 'pill', size: 'md' },
  },
);

/** Dot colour follows the text colour of the variant. */
export const badgeDotStyles = 'h-1.5 w-1.5 shrink-0 rounded-full bg-current';
