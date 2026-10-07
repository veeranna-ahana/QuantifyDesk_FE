import { ChevronDown } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { cn } from "@/lib/cn";

import { ProjectDocumentMatrix } from "./ProjectDocumentMatrix";

function DocumentIndicators({ documents }) {
  return (
    <div
      className="flex items-center justify-center gap-0.5"
      aria-label={`${documents.filter((document) => document.available).length} of ${documents.length} documents received`}
    >
      {documents.map((document) => (
        <span
          key={document.id}
          className={cn(
            "h-3 w-1.5 rounded-sm",
            document.available
              ? "bg-badge-success-ink"
              : "bg-badge-danger-ink",
          )}
        />
      ))}
    </div>
  );
}

function Compliance({ value }) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      <ProgressBar value={value} className="w-12" />
      <span className="text-[10px] font-semibold text-ink-secondary">
        {value}%
      </span>
    </div>
  );
}

export function ProjectChecklistList({
  projects,
  expandedProject,
  onToggleProject,
}) {
  return (
    <div className="max-h-[var(--size-project-checklist-list-max-height)] overflow-y-auto">
      <div className="sticky top-0 z-10 hidden h-8 grid-cols-[2fr_1fr_1.5fr_0.9fr_0.9fr_1fr_16px] items-center bg-surface-table-head px-3 text-[10px] font-medium text-ink-secondary sm:grid">
        <span>Project Name</span>
        <span>Project Status</span>
        <span className="text-center">16 Docs Matrix</span>
        <span className="text-center">Received</span>
        <span className="text-center">Pending</span>
        <span className="text-center">Compliance</span>
        <span aria-hidden="true" />
      </div>
      <div className="flex flex-col gap-2">
        {projects.map((project) => {
          const expanded = expandedProject === project.id;
          return (
            <Card
              key={project.id}
              className="overflow-hidden shadow-none"
            >
              <button
                type="button"
                aria-expanded={expanded}
                onClick={() => onToggleProject(expanded ? null : project.id)}
                className="relative grid min-h-11 w-full grid-cols-2 items-center gap-2 px-3 py-2 pr-8 text-left transition-colors hover:bg-surface-field-disabled sm:grid-cols-[2fr_1fr_1.5fr_0.9fr_0.9fr_1fr_16px]"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-ink-primary">
                    {project.name}
                  </span>
                  <span className="block text-[10px] text-ink-muted">
                    {project.code}
                  </span>
                </span>
                <span className="hidden sm:block">
                  <Badge variant="info" shape="chip" size="sm">
                    {project.status}
                  </Badge>
                </span>
                <span className="hidden sm:block">
                  <DocumentIndicators documents={project.documents} />
                </span>
                <span className="hidden text-center text-[10px] font-semibold text-badge-success-ink sm:block">
                  {project.received} / {project.documents.length}
                </span>
                <span className="hidden text-center text-[10px] font-semibold text-badge-danger-ink sm:block">
                  {project.pending}{" "}
                  {project.id === 1 ? "Not Available" : "Missing"}
                </span>
                <span className="hidden sm:block">
                  <Compliance value={project.compliance} />
                </span>
                <span className="col-span-2 flex items-center justify-between sm:hidden">
                  <Badge variant="info" shape="chip" size="sm">
                    {project.status}
                  </Badge>
                  <span className="text-[10px] text-badge-success-ink">
                    {project.received} / {project.documents.length} received
                  </span>
                  <span className="text-[10px] font-semibold text-badge-danger-ink">
                    {project.pending} pending
                  </span>
                </span>
                <ChevronDown
                  className={cn(
                    "absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-action-primary transition-transform",
                    expanded && "rotate-180",
                  )}
                  aria-hidden="true"
                />
              </button>
              {expanded && (
                <div className="border-t border-line-card p-2">
                  <ProjectDocumentMatrix documents={project.documents} />
                </div>
              )}
            </Card>
          );
        })}
        {projects.length === 0 && (
          <Card className="py-8 text-center text-xs text-ink-muted shadow-none">
            No projects match the selected filters.
          </Card>
        )}
      </div>
    </div>
  );
}
