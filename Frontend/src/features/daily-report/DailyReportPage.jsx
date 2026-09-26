import { ClipboardCheck, Clock, Download, FolderKanban, RotateCw, Search, ShieldCheck } from 'lucide-react';

import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FilterTabs } from '@/components/ui/FilterTabs';
import { Input } from '@/components/ui/Input';
import { StatCard } from '@/components/ui/StatCard';

import { DateNavigator } from './components/DateNavigator';
import { ProjectReportCard } from './components/ProjectReportCard';
import { useDailyReport } from './hooks/useDailyReport';

export default function DailyReportPage() {
  const r = useDailyReport();
  const m = r.metrics;
  const iconClass = 'h-[18px] w-[18px]';
  const tabs = r.tabs.map((t) => ({ id: t.key, label: t.label, count: t.count }));

  return (
    <div className="flex flex-col gap-3">
      <PageHeader title="Daily Report" actions={<DateNavigator value={r.reportDate} onChange={r.setReportDate} onShift={r.shiftDate} />} />

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Total Projects" value={m.totalProjects} icon={<FolderKanban className={iconClass} />} />
        <StatCard label="Not Started Tasks" value={m.notStartedTasks} icon={<Clock className={iconClass} />} />
        <StatCard label="In Progress Tasks" value={m.inProgressTasks} icon={<RotateCw className={iconClass} />} />
        <StatCard label="Last Completed Tasks" value={m.lastCompleted} icon={<ShieldCheck className={iconClass} />} />
        <StatCard label="Total Completed Tasks" value={m.totalCompleted} icon={<ClipboardCheck className={iconClass} />} />
      </div>

      <Card className="flex flex-wrap items-center justify-between gap-3 px-3.5 py-2">
        <FilterTabs items={tabs} value={r.globalTab} onChange={r.setGlobalTab} />
        <div className="flex flex-wrap items-center gap-3">
          <Input size="md" aria-label="Search task titles" placeholder="Search task titles..." leadingIcon={<Search className="h-4 w-4" />} value={r.searchQuery} onChange={(e) => r.setSearchQuery(e.target.value)} wrapperClassName="w-56" />
          <Button leftIcon={<Download className="h-4 w-4" />} onClick={r.exportCsv}>Export Report</Button>
        </div>
      </Card>

      {r.projects.map((p) => <ProjectReportCard key={p.id} project={p} globalTab={r.globalTab} searchQuery={r.searchQuery} />)}
    </div>
  );
}
