import { cn } from '@/lib/cn';

/** Loading placeholder block. Size it with className (e.g. "h-3 w-24"). */
export function Skeleton({ className }) {
  return <div aria-hidden="true" className={cn('animate-pulse rounded bg-badge-neutral-line', className)} />;
}
