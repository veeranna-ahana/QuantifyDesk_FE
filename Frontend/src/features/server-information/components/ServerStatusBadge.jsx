// src/features/server-information/components/ServerStatusBadge.jsx
import { Badge } from '@/components/ui/Badge';

import { SERVER_BADGE_STYLES } from './serverBadgeStyles';

const STATUS_STYLES = {
  Active: SERVER_BADGE_STYLES.active,
  Maintenance: SERVER_BADGE_STYLES.maintenance,
  'Not Active': SERVER_BADGE_STYLES.inactive,
};

/**
 * Renders a status pill for server status.
 * Active → green  |  Maintenance → amber  |  Not Active → grey
 */
export function ServerStatusBadge({ status }) {
  const className = STATUS_STYLES[status] ?? SERVER_BADGE_STYLES.inactive;
  return (
    <Badge variant="neutral" className={`${className} border-0`} dot size="sm">
      {status}
    </Badge>
  );
}
