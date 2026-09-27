import { forwardRef, useId } from 'react';
import { ChevronDown } from 'lucide-react';

import { FormField } from '@/components/ui/FormField';
import { fieldStyles } from '@/components/ui/Input/Input.styles';
import { cn } from '@/lib/cn';

/**
 * Native select with the standard field look.
 * Pass `options` ([{ value, label }] or plain strings) or your own <option> children.
 */
export const Select = forwardRef(function Select(
  { label, error, helperText, required, size, id, options, placeholder, className, wrapperClassName, children, ...rest },
  ref,
) {
  const autoId = useId();
  const selectId = id ?? autoId;
  return (
    <FormField label={label} htmlFor={selectId} required={required} error={error} helperText={helperText} className={wrapperClassName}>
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          aria-invalid={Boolean(error)}
          className={cn(fieldStyles({ size, invalid: Boolean(error) }), 'appearance-none pr-9 disabled:opacity-100', className)}
          {...rest}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options
            ? options.map((o) => {
                const opt = typeof o === 'string' ? { value: o, label: o } : o;
                return <option key={opt.value} value={opt.value}>{opt.label}</option>;
              })
            : children}
        </select>
        <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
      </div>
    </FormField>
  );
});
