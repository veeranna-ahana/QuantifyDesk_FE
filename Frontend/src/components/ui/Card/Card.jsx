import { cn } from '@/lib/cn';

/** White surface used for page sections. */
export function Card({ className, ...rest }) {
  return <section className={cn('rounded-chip border border-line-card bg-surface-card shadow-header', className)} {...rest} />;
}
