import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { Card } from "@/components/ui/Card";

import { CardHeading } from "./HealthOverview";

const seriesColor = (n) => `var(--color-chart-${n})`;

// Recharts' default <Tooltip> renders a plain white/bordered box with no theming hook of its own
// — replacing it with a `content` render prop gives a tooltip that actually matches the rest of
// the app (dark rounded badge, color swatch, same style as the Work Allocation pie's tooltip on
// Project Overview) instead of the browser/library default.
function StatusTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="flex items-center gap-1.5 whitespace-nowrap rounded-md bg-ink-primary px-2.5 py-1.5 text-[11px] font-medium text-white shadow-lg">
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: seriesColor(item.payload.chart) }}
      />
      {item.name}
      <span className="text-white/70">· {item.value}%</span>
    </div>
  );
}

export function StatusDistribution({ data, totalProjects }) {
  return (
    <Card className="flex flex-col gap-3 p-4">
      <CardHeading
        title="Project Status Distribution"
        count={`${totalProjects} Projects`}
      />
      <div className="h-40 min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius="62%"
              outerRadius="92%"
              startAngle={90}
              endAngle={-270}
              stroke="var(--color-surface-card)"
              strokeWidth={1.5}
            >
              {data.map((d) => (
                <Cell key={d.name} fill={seriesColor(d.chart)} />
              ))}
            </Pie>
            <Tooltip content={<StatusTooltip />} cursor={false} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1">
        {data.map((d) => (
          <li
            key={d.name}
            className="flex items-center gap-1.5 text-xs font-medium text-ink-secondary"
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: seriesColor(d.chart) }}
              aria-hidden="true"
            />
            {d.name}
          </li>
        ))}
      </ul>
    </Card>
  );
}
