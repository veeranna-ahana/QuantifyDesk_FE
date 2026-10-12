import { useEffect, useMemo, useState } from "react";

import { memberService } from "../services/member.service";

/** Skill Analytics data: GET /api/skills/analytics (employees grouped by skill, biggest first). */
export function useSkillAnalytics() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await memberService.getSkillAnalytics();
        if (active) setSkills(res.skills || []);
      } catch (err) {
        if (active)
          setError(
            err.response?.data?.message || "Failed to load skill analytics",
          );
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const maxCount = useMemo(
    () => skills.reduce((max, s) => Math.max(max, s.employee_count || 0), 0),
    [skills],
  );

  return { skills, maxCount, loading, error };
}
