import { forwardRef, useId } from 'react';
import { X } from 'lucide-react';

import { FormField } from '@/components/ui/FormField';
import { cn } from '@/lib/cn';

import { fieldStyles } from './Input.styles';

export const Input = forwardRef(function Input(
  { label, error, helperText, required, leadingIcon, leadingIconClassName, size, id, className, wrapperClassName, onClear, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hasClear = Boolean(onClear && rest.value);
  return (
    <FormField label={label} htmlFor={inputId} required={required} error={error} helperText={helperText} className={wrapperClassName}>
      <div className="relative">
        {leadingIcon && (
          <span aria-hidden="true" className={cn('pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted', leadingIconClassName)}>
            {leadingIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          autoComplete="off"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          className={cn(fieldStyles({ size, invalid: Boolean(error) }), leadingIcon && 'pl-9', hasClear && 'pr-8', className)}
          {...rest}
        />
        {hasClear && (
          <button
            type="button"
            aria-label="Clear"
            onClick={onClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full w-4 h-4 text-ink-muted hover:text-ink-primary hover:bg-surface-field-disabled transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary"
          >
            <X className="w-3 h-3" strokeWidth={2.5} />
          </button>
        )}
      </div>
    </FormField>
  );
});

