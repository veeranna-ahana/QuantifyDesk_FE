import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/cn';

import { buttonStyles } from './Button.styles';

/**
 * @typedef {Object} ButtonProps
 * @property {'primary'|'secondary'|'ghost'|'danger'} [variant]
 * @property {'sm'|'md'} [size]
 * @property {boolean} [fullWidth]
 * @property {boolean} [isLoading]
 * @property {import('react').ReactNode} [leftIcon]
 * @property {import('react').ReactNode} [rightIcon]
 */

export const Button = forwardRef(function Button(
  { children, variant, size, fullWidth, isLoading = false, leftIcon, rightIcon, disabled, className, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(buttonStyles({ variant, size, fullWidth }), className)}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
});
