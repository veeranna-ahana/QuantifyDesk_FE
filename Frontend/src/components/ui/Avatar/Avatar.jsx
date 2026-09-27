import { cva } from 'class-variance-authority';
import { User } from 'lucide-react';

import { cn } from '@/lib/cn';

const avatarStyles = cva(
  'inline-flex shrink-0 items-center justify-center rounded-full bg-action-primary font-semibold text-ink-on-primary',
  { variants: { size: { sm: 'h-6 w-6 text-[10px]', md: 'h-7 w-7 text-xs', lg: 'h-9 w-9 text-sm' } }, defaultVariants: { size: 'md' } },
);

/** Shows initials when `name` is given, otherwise a person icon. */
export function Avatar({ name, size, className }) {
  const initials = name ? name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() : '';
  return (
    <span className={cn(avatarStyles({ size }), className)} aria-hidden="true">
      {initials || <User className="h-3.5 w-3.5" strokeWidth={2.2} />}
    </span>
  );
}
