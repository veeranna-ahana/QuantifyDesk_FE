import { cn } from '@/lib/cn';

import { badgeDotStyles, badgeStyles } from './Badge.styles';

export function Badge({ variant, shape, size, dot = false, className, children, ...rest }) {
  return (
    <span className={cn(badgeStyles({ variant, shape, size }), className)} {...rest}>
      {dot && <span className={badgeDotStyles} aria-hidden="true" />}
      {children}
    </span>
  );
}
