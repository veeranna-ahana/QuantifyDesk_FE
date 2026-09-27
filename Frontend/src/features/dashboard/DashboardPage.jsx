import { PageHeader } from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatCard } from "@/components/ui/StatCard";

import { EmployeeUtilization } from "./components/EmployeeUtilization";
import { HealthOverview } from "./components/HealthOverview";
import { ProjectPerformanceTable } from "./components/ProjectPerformanceTable";
import { StatusDistribution } from "./components/StatusDistribution";
import { useDashboard } from "./hooks/useDashboard";

export default function DashboardPage() {
  const d = useDashboard();
  if (d.loading) return <Skeleton className="h-64 w-full" />;
  const k = d.kpis;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Project Utilization"
        subtitle="Department-wide delivery, utilization and operational health"
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="All Projects"
          value={k.totalProjects}
          caption="Total portfolio"
        />
        <StatCard
          label="In Progress"
          value={k.inProgress}
          caption="Active delivery"
          tone="info"
        />
        <StatCard
          label="Completed"
          value={k.completed}
          caption="Delivered projects"
          tone="success"
        />
        <StatCard
          label="Delayed"
          value={k.delayed}
          caption="Behind schedule"
          tone="danger"
        />
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <HealthOverview rows={d.health} totalProjects={k.totalProjects} />
        <StatusDistribution
          data={d.distribution}
          totalProjects={k.totalProjects}
        />
      </div>
      <ProjectPerformanceTable d={d} />
      <EmployeeUtilization d={d} />
    </div>
  );
}
