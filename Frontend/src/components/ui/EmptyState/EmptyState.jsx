import { Inbox } from 'lucide-react';

export function EmptyState({ title = 'Nothing here yet', message, action }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-badge-brand-bg text-action-primary"><Inbox className="h-6 w-6" /></span>
      <h3 className="text-sm font-semibold text-ink-primary">{title}</h3>
      {message && <p className="max-w-xs text-xs text-ink-muted">{message}</p>}
      {action}
    </div>
  );
}
