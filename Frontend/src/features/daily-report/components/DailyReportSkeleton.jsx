import { Skeleton } from '@/components/ui/Skeleton';

/** Skeleton tile matching a Daily Report StatCard */
function StatCardSkeleton() {
  return (
    <div className="flex min-w-0 items-start justify-between gap-2 rounded-chip border border-l-[3px] border-line-card bg-surface-card p-3 shadow-header">
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-7 w-10" />
        <Skeleton className="h-2.5 w-28" />
      </div>
      <Skeleton className="h-9 w-9 shrink-0 rounded-chip" />
    </div>
  );
}

/** Skeleton for the filter bar (tabs + search + export) */
function FilterBarSkeleton() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-chip border border-line-card bg-surface-card px-3.5 py-2 shadow-header">
      {/* Tab pills */}
      <div className="flex items-center gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className={`h-7 rounded-full ${i === 1 ? 'w-28' : 'w-20'}`} />
        ))}
      </div>
      {/* Right controls */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-44 rounded-control" />
        <Skeleton className="h-8 w-32 rounded-control" />
      </div>
    </div>
  );
}

/** Skeleton for a single project accordion card */
function ProjectCardSkeleton() {
  return (
    <div className="rounded-chip border border-line-card bg-surface-card shadow-header overflow-hidden">
      {/* Card header */}
      <div className="flex flex-col gap-2 border-b border-line-card px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-3 w-32" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-2.5 w-32" />
            <Skeleton className="h-2.5 w-24" />
            <Skeleton className="h-2.5 w-28" />
            <Skeleton className="h-2.5 w-20" />
          </div>
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-2 w-24 rounded-full" />
            <Skeleton className="h-7 w-7 rounded-control" />
          </div>
        </div>
      </div>

      {/* Filter tabs row */}
      <div className="flex flex-wrap items-center gap-3 border-b border-line-card px-4 py-2">
        <div className="flex items-center gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className={`h-7 rounded-full ${i === 0 ? 'w-24' : 'w-20'}`} />
          ))}
        </div>
        <div className="mx-1 h-5 w-px bg-line-card" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-22 rounded-full" />
        </div>
      </div>

      {/* Table header row */}
      <div className="flex items-center gap-4 bg-surface-table-head px-3 py-2.5 border-b border-line-table-head">
        {['w-28', 'w-40', 'w-24', 'w-16', 'w-20', 'w-12', 'w-20', 'w-24', 'w-24', 'w-32'].map((w, i) => (
          <Skeleton key={i} className={`h-2.5 ${w} shrink-0`} />
        ))}
      </div>

      {/* Table body rows */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-start gap-4 border-b border-line-card px-3 py-3 last:border-0">
          <Skeleton className="mt-0.5 h-5 w-28 shrink-0 rounded-full" />
          <div className="flex flex-col gap-1 w-40 shrink-0">
            <Skeleton className="h-3 w-36" />
            <Skeleton className="h-2.5 w-16" />
          </div>
          <Skeleton className="h-3 w-24 shrink-0" />
          <Skeleton className="h-5 w-16 shrink-0 rounded-full" />
          <Skeleton className="h-5 w-20 shrink-0 rounded-full" />
          <Skeleton className="h-5 w-12 shrink-0 rounded-full" />
          <Skeleton className="h-5 w-10 shrink-0 rounded-full" />
          <div className="flex flex-col gap-1 w-24 shrink-0">
            <Skeleton className="h-2.5 w-20" />
            <Skeleton className="h-2.5 w-20" />
          </div>
          <div className="flex flex-col gap-1 w-24 shrink-0">
            <Skeleton className="h-2.5 w-20" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
          <Skeleton className="h-3 flex-1" />
        </div>
      ))}
    </div>
  );
}

/** Full-page skeleton matching the Daily Report layout */
export function DailyReportSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {/* PageHeader */}
      <div className="py-1">
        <Skeleton className="h-6 w-36" />
      </div>

      {/* 5 StatCards */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>

      {/* Filter bar */}
      <FilterBarSkeleton />

      {/* Project accordion cards */}
      {Array.from({ length: 2 }).map((_, i) => <ProjectCardSkeleton key={i} />)}
    </div>
  );
}
