import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Select } from "@/components/ui/Select";
import { DataTable } from "@/components/ui/Table";
import { statusVariant } from "@/lib/status";

import {
  PROJECT_RISK_FILTERS,
  PROJECT_STATUS_FILTERS,
} from "../mock/mockDashboard";

const RISK_VARIANT = {
  Low: "success",
  Medium: "warning",
  High: "danger",
  Critical: "danger",
};
const barTone = (pct) =>
  pct >= 80 ? "success" : pct >= 50 ? "warning" : "danger";

export function ProjectPerformanceTable({ d }) {
  const navigate = useNavigate();
  const columns = [
    { key: "name", label: "Project", className: "font-medium" },
    { key: "code", label: "Code", className: "text-ink-secondary" },
    { key: "units", label: "Units" },
    {
      key: "completion",
      label: "Completion",
      className: "min-w-[160px]",
      render: (p) => (
        <div className="flex items-center gap-2">
          <ProgressBar
            value={p.completion}
            tone={barTone(p.completion)}
            className="w-24"
          />
          <span className="text-xs font-semibold">{p.completion}%</span>
        </div>
      ),
    },
    {
      key: "risk",
      label: "Risk",
      render: (p) => (
        <Badge
          variant={RISK_VARIANT[p.risk] ?? "neutral"}
          shape="pill"
          size="sm"
        >
          {p.risk}
        </Badge>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (p) => (
        <Badge variant={statusVariant(p.status)} size="sm">
          {p.status}
        </Badge>
      ),
    },
    {
      key: "action",
      label: "Action",
      render: (p) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/projects/${p.code}?tab=Project Overview`)}
        >
          View →
        </Button>
      ),
    },
  ];
  const rows = d.projects.map((p) => ({ ...p, id: p.code }));

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-card p-3">
        <h2 className="text-sm font-semibold text-ink-primary">
          Project Delivery Performance
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            aria-label="Search project"
            placeholder="Search project…"
            leadingIcon={<Search className="h-4 w-4" />}
            value={d.projectSearch}
            onChange={(e) => d.setProjectSearch(e.target.value)}
            size="sm"
            wrapperClassName="w-48"
          />
          <Select
            aria-label="Status"
            size="sm"
            options={PROJECT_STATUS_FILTERS}
            value={d.statusFilter}
            onChange={(e) => d.setStatusFilter(e.target.value)}
            wrapperClassName="w-36"
          />
          <Select
            aria-label="Risk"
            size="sm"
            options={PROJECT_RISK_FILTERS}
            value={d.riskFilter}
            onChange={(e) => d.setRiskFilter(e.target.value)}
            wrapperClassName="w-32"
          />
        </div>
      </div>
      <DataTable
        columns={columns}
        rows={rows}
        emptyMessage="No projects match your filters."
      />
    </Card>
  );
}
