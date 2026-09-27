import { forwardRef } from 'react';

import { cn } from '@/lib/cn';

import { iconButtonStyles } from './IconButton.styles';

/** Icon-only button. `label` is required for accessibility (becomes aria-label). */
export const IconButton = forwardRef(function IconButton(
  { label, variant, size, className, children, type = 'button', ...rest },
  ref,
) {
  return (
    <button ref={ref} type={type} aria-label={label} title={label} className={cn(iconButtonStyles({ variant, size }), className)} {...rest}>
      {children}
    </button>
  );
});
