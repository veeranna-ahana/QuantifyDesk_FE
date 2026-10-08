import { Download } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";

import { SkillCapacityCard } from "./components/SkillCapacityCard";
import { useMemberDetails } from "./hooks/useMemberDetails";

export default function SkillAnalyticsPage() {
  const memberDetails = useMemberDetails();

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[length:var(--font-size-skill-breadcrumb)]">
            <Link
              to="/member-details"
              className="text-ink-secondary hover:text-action-primary"
            >
              Member Details
            </Link>
            <span className="text-ink-muted">/</span>
            <span className="font-medium text-action-primary">Skill Analytics</span>
          </nav>
          <h1 className="text-[length:var(--font-size-skill-heading)] font-semibold leading-8 text-ink-primary">
            Skill Analytics
          </h1>
          <p className="text-xs text-ink-secondary">
            Real-time capacity, skill allocation, and resource availability breakdown
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Download className="h-4 w-4" />}
          onClick={memberDetails.exportSkills}
          className="border-action-primary px-2 text-action-primary hover:bg-action-primary-soft"
        >
          Export Report
        </Button>
      </div>

      <SkillCapacityCard skills={memberDetails.skills} />

      <Pagination
        page={memberDetails.page}
        totalPages={memberDetails.totalPages}
        totalItems={memberDetails.totalSkills}
        pageSize={memberDetails.pageSize}
        onPageChange={memberDetails.setPage}
        itemLabel="Skills"
      />
    </div>
  );
}
