import { forwardRef, useId } from 'react';

import { FormField } from '@/components/ui/FormField';
import { fieldStyles } from '@/components/ui/Input/Input.styles';
import { cn } from '@/lib/cn';

export const Textarea = forwardRef(function Textarea(
  { label, error, helperText, required, id, rows = 3, className, wrapperClassName, ...rest },
  ref,
) {
  const autoId = useId();
  const areaId = id ?? autoId;
  return (
    <FormField label={label} htmlFor={areaId} required={required} error={error} helperText={helperText} className={wrapperClassName}>
      <textarea
        ref={ref}
        id={areaId}
        rows={rows}
        aria-invalid={Boolean(error)}
        className={cn(fieldStyles({ invalid: Boolean(error) }), 'h-auto min-h-[5rem] resize-y py-2', className)}
        {...rest}
      />
    </FormField>
  );
});
