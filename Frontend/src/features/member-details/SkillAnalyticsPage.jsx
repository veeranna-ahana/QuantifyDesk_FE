import { Link } from "react-router-dom";

import { SkillCapacityCard } from "./components/SkillCapacityCard";
import { useSkillAnalytics } from "./hooks/useSkillAnalytics";

export default function SkillAnalyticsPage() {
  const { skills, maxCount, loading, error } = useSkillAnalytics();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1 text-[length:var(--font-size-skill-breadcrumb)]"
          >
            <Link
              to="/member-details"
              className="text-ink-secondary hover:text-action-primary"
            >
              Member Details
            </Link>
            <span className="text-ink-muted">/</span>
            <span className="font-medium text-action-primary">
              Skill Analytics
            </span>
          </nav>
          <h1 className="text-[length:var(--font-size-skill-heading)] font-bold leading-7 text-[color:var(--color-member-title)]">
            Skill Analytics
          </h1>
          <p className="text-xs leading-4 text-[color:var(--color-member-skill-subtitle)]">
            Skills across the delivery team and the members who have them
          </p>
        </div>
      </div>

      <SkillCapacityCard
        skills={skills}
        maxCount={maxCount}
        loading={loading}
        error={error}
      />
    </div>
  );
}
