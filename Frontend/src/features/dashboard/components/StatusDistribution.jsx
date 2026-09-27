import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { Card } from '@/components/ui/Card';

import { CardHeading } from './HealthOverview';

const seriesColor = (n) => `var(--color-chart-${n})`;

export function StatusDistribution({ data, totalProjects }) {
  return (
    <Card className="flex flex-col gap-3 p-4">
      <CardHeading title="Project Status Distribution" count={`${totalProjects} Projects`} />
      <div className="h-40 min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" cx="50%" cy="50%" innerRadius="62%" outerRadius="92%" startAngle={90} endAngle={-270} stroke="var(--color-surface-card)" strokeWidth={1.5}>
              {data.map((d) => <Cell key={d.name} fill={seriesColor(d.chart)} />)}
            </Pie>
            <Tooltip formatter={(v, n) => [`${v}%`, n]} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1">
        {data.map((d) => (
          <li key={d.name} className="flex items-center gap-1.5 text-xs font-medium text-ink-secondary">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: seriesColor(d.chart) }} aria-hidden="true" />
            {d.name}
          </li>
        ))}
      </ul>
    </Card>
  );
}
