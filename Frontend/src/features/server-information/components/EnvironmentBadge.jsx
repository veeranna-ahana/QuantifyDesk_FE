// src/features/server-information/components/EnvironmentBadge.jsx
import { Badge } from '@/components/ui/Badge';

const ENV_STYLES = {
  Production: 'bg-[#00875A1A] text-[#00875A]',
  UAT: 'bg-[#F59E0B1A] text-[#F59E0B]',
  QA: 'bg-[#E1E2EC] text-[#434654]',
  Development: 'bg-[#DAE2FF] text-[#00875A]',
};

/**
 * Renders an environment badge: Production → purple | UAT → amber | QA → blue | Development → grey.
 */
export function EnvironmentBadge({ environment }) {
  const className = ENV_STYLES[environment] ?? 'bg-[#EDEDF8] text-[#434654]';
  return (
    <Badge variant="neutral" shape="chip" size="sm" className={`${className} border-0 rounded-full`}>
      {environment}
    </Badge>
  );
}
