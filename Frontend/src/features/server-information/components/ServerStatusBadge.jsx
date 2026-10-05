// src/features/server-information/components/ServerStatusBadge.jsx
import { Badge } from '@/components/ui/Badge';

const STATUS_STYLES = {
  Active: 'bg-[#00875A1A] text-[#00875A]',
  Maintenance: 'bg-[#F59E0B1A] text-[#F59E0B]',
  'Not Active': 'bg-[#EDEDF8] text-[#8A91A0]',
};

/**
 * Renders a status pill for server status.
 * Active → green  |  Maintenance → amber  |  Not Active → grey
 */
export function ServerStatusBadge({ status }) {
  const className = STATUS_STYLES[status] ?? 'bg-[#EDEDF8] text-[#8A91A0]';
  return (
    <Badge variant="neutral" className={`${className} border-0`} dot size="sm">
      {status}
    </Badge>
  );
}
