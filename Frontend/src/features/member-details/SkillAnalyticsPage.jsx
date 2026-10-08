import { Download } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/Button";

import { SkillCapacityCard } from "./components/SkillCapacityCard";
import { useMemberDetails } from "./hooks/useMemberDetails";

export default function SkillAnalyticsPage() {
  const memberDetails = useMemberDetails();

  return (
    <div className="flex flex-col gap-4">
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
          <h1 className="text-[length:var(--font-size-skill-heading)] font-bold leading-7 text-[color:var(--color-member-title)]">
            Skill Analytics
          </h1>
          <p className="text-xs leading-4 text-[color:var(--color-member-skill-subtitle)]">
            Real-time capacity, skill allocation, and resource availability breakdown
          </p>
        </div>
      </div>

      <SkillCapacityCard skills={memberDetails.skills} />

    </div>
  );
}
