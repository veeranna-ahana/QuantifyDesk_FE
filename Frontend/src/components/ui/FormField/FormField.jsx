import { cn } from '@/lib/cn';

/**
 * Label + control + helper/error text. Shared by Input, Select, Textarea so the
 * label/error layout exists in exactly one place.
 */
export function FormField({ label, htmlFor, required = false, error, helperText, className, children }) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1', className)}>
      {label && (
        <label htmlFor={htmlFor} className="text-xs font-medium text-ink-secondary">
          {label}
          {required && <span className="text-badge-danger-ink">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="text-xs text-badge-danger-ink">{error}</p>
      ) : (
        helperText && <p id={`${htmlFor}-helper`} className="text-xs text-ink-muted">{helperText}</p>
      )}
    </div>
  );
}
