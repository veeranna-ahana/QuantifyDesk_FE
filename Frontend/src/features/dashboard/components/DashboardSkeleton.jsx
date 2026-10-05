import { Skeleton } from '@/components/ui/Skeleton';

/** Skeleton card matching a StatCard tile */
function StatCardSkeleton() {
  return (
    <div className="flex min-w-0 items-start justify-between gap-2 rounded-chip border border-l-[3px] border-line-card bg-surface-card p-3 shadow-header">
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-7 w-12" />
        <Skeleton className="h-2.5 w-24" />
      </div>
      <Skeleton className="h-9 w-9 shrink-0 rounded-chip" />
    </div>
  );
}

/** Skeleton for one health-overview bar row */
function HealthRowSkeleton() {
  return (
    <div className="flex items-center gap-3">
      <Skeleton className="h-2.5 w-24 shrink-0" />
      <Skeleton className="h-2 flex-1 rounded-full" />
      <Skeleton className="h-2.5 w-6 shrink-0" />
    </div>
  );
}

/** Skeleton for one table row */
function TableRowSkeleton({ cols = 6 }) {
  return (
    <div className="flex items-center gap-4 border-b border-line-card px-4 py-3">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className="h-3 flex-1 rounded" style={{ maxWidth: i === 0 ? 180 : 100 }} />
      ))}
    </div>
  );
}

/** Full-page skeleton matching the Dashboard layout */
export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {/* PageHeader */}
      <div className="flex flex-col gap-1 py-1">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-3 w-80 mt-1" />
      </div>

      {/* 4 StatCards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>

      {/* HealthOverview + StatusDistribution */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {/* HealthOverview card */}
        <div className="rounded-chip border border-line-card bg-surface-card p-4 shadow-header flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => <HealthRowSkeleton key={i} />)}
          </div>
        </div>

        {/* StatusDistribution card */}
        <div className="rounded-chip border border-line-card bg-surface-card p-4 shadow-header flex flex-col gap-4">
          <Skeleton className="h-4 w-36" />
          <div className="flex items-center gap-6">
            {/* Donut placeholder */}
            <Skeleton className="h-32 w-32 shrink-0 rounded-full" />
            <div className="flex flex-col gap-2.5 flex-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-2.5 w-2.5 rounded-full shrink-0" />
                  <Skeleton className="h-2.5 flex-1" />
                  <Skeleton className="h-2.5 w-8 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Project Performance Table */}
      <div className="rounded-chip border border-line-card bg-surface-card shadow-header overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-line-card">
          <Skeleton className="h-4 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-32 rounded-control" />
            <Skeleton className="h-8 w-28 rounded-control" />
            <Skeleton className="h-8 w-36 rounded-control" />
          </div>
        </div>
        {/* Table header */}
        <div className="flex items-center gap-4 bg-surface-table-head px-4 py-2.5 border-b border-line-table-head">
          {['w-40', 'w-16', 'w-20', 'w-20', 'w-24', 'w-16'].map((w, i) => (
            <Skeleton key={i} className={`h-2.5 ${w}`} />
          ))}
        </div>
        {Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} cols={6} />)}
      </div>

      {/* Employee Utilization Table */}
      <div className="rounded-chip border border-line-card bg-surface-card shadow-header overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-line-card">
          <Skeleton className="h-4 w-44" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-36 rounded-control" />
            <Skeleton className="h-8 w-28 rounded-control" />
          </div>
        </div>
        {/* Table header */}
        <div className="flex items-center gap-4 bg-surface-table-head px-4 py-2.5 border-b border-line-table-head">
          {['w-36', 'w-20', 'w-28', 'w-24', 'w-20', 'w-28', 'w-16'].map((w, i) => (
            <Skeleton key={i} className={`h-2.5 ${w}`} />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-line-card px-4 py-3">
            {/* Avatar + name */}
            <div className="flex items-center gap-2 w-36 shrink-0">
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <div className="flex flex-col gap-1 flex-1">
                <Skeleton className="h-2.5 w-24" />
                <Skeleton className="h-2 w-16" />
              </div>
            </div>
            <Skeleton className="h-3 flex-1 rounded" />
            <Skeleton className="h-3 flex-1 rounded" />
            <Skeleton className="h-3 flex-1 rounded" />
            <Skeleton className="h-2 flex-1 rounded-full" />
            <Skeleton className="h-3 flex-1 rounded" />
            <Skeleton className="h-6 w-16 rounded-chip" />
          </div>
        ))}
      </div>
    </div>
  );
}
