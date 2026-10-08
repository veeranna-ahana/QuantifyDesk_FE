// src/features/server-information/components/EnvironmentBadge.jsx
import { Badge } from '@/components/ui/Badge';

import { SERVER_BADGE_STYLES } from './serverBadgeStyles';

const ENV_STYLES = {
  Production: SERVER_BADGE_STYLES.active,
  UAT: SERVER_BADGE_STYLES.maintenance,
  QA: SERVER_BADGE_STYLES.qa,
  Development: SERVER_BADGE_STYLES.development,
};

/**
 * Renders an environment badge: Production → purple | UAT → amber | QA → blue | Development → grey.
 */
export function EnvironmentBadge({ environment }) {
  const className = ENV_STYLES[environment] ?? SERVER_BADGE_STYLES.neutral;
  return (
    <Badge variant="neutral" shape="chip" size="sm" className={`${className} border-0 rounded-full`}>
      {environment}
    </Badge>
  );
}
