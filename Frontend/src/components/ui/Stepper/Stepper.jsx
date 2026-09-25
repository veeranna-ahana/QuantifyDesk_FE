import { cn } from '@/lib/cn';

/**
 * Wizard progress: steps = [{ id, label }], currentStep = id.
 * Completed and current steps are filled purple, upcoming ones grey.
 */
export function Stepper({ steps, currentStep, onStepChange }) {
  return (
    <ol className="relative flex items-start justify-between">
      <span aria-hidden="true" className="absolute left-3.5 right-3.5 top-3.5 h-px bg-line" />
      {steps.map((step, i) => {
        const reached = step.id <= currentStep;
        const active = step.id === currentStep;
        const align = i === 0 ? 'items-start' : i === steps.length - 1 ? 'items-end' : 'items-center';
        return (
          <li key={step.id} className={cn('relative z-10 flex flex-col gap-1', align)}>
            <button type="button" onClick={() => onStepChange?.(step.id)} aria-current={active ? 'step' : undefined} className={cn('flex flex-col gap-1', align)}>
              <span className={cn('flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold', reached ? 'bg-action-primary text-ink-on-primary' : 'bg-badge-neutral-line text-ink-secondary')}>
                {String(step.id).padStart(2, '0')}
              </span>
              <span className={cn('whitespace-nowrap text-[11px] font-medium', active ? 'text-action-primary' : 'text-ink-secondary')}>{step.label}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
