import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/Table";

const AVAILABILITY_STYLE = {
  Available: { variant: "success", label: "Available (100%)" },
  "Partially Available": { variant: "warning" },
  Allocated: { variant: "danger", label: "Allocated (0%)" },
};

function AvailabilityBadge({ member }) {
  const style = AVAILABILITY_STYLE[member.availability];
  const label =
    style.label ??
    `Partially (${Math.max(0, 100 - member.allocation)}%)`;
  return (
    <Badge variant={style.variant} shape="pill" size="sm" dot>
      {label}
    </Badge>
  );
}

function Allocation({ value }) {
  const tone = value === 100 ? "danger" : value > 0 ? "warning" : "success";
  return (
    <div className="flex min-w-12 flex-col gap-1">
      <span className="text-[10px] font-semibold text-ink-primary">
        {value}%
      </span>
      <ProgressBar value={value} tone={tone} className="h-1" />
    </div>
  );
}

export function MemberTable({ members }) {
  return (
    <Table className="min-w-[var(--size-member-table-min-width)] text-[length:var(--font-size-member-table-body)]">
      <TableHead>
        <TableRow className="hover:bg-transparent">
          <TableHeaderCell className="h-8 px-2 text-[length:var(--font-size-member-table-heading)]">Members</TableHeaderCell>
          <TableHeaderCell className="h-8 px-2 text-[length:var(--font-size-member-table-heading)]">Experience</TableHeaderCell>
          <TableHeaderCell className="h-8 px-2 text-[length:var(--font-size-member-table-heading)]">DOJ</TableHeaderCell>
          <TableHeaderCell className="h-8 px-2 text-[length:var(--font-size-member-table-heading)]">Skill</TableHeaderCell>
          <TableHeaderCell className="h-8 px-2 text-[length:var(--font-size-member-table-heading)]">Current Project</TableHeaderCell>
          <TableHeaderCell className="h-8 px-2 text-[length:var(--font-size-member-table-heading)]">Allocation</TableHeaderCell>
          <TableHeaderCell className="h-8 px-2 text-[length:var(--font-size-member-table-heading)]">Availability</TableHeaderCell>
          <TableHeaderCell className="h-8 px-2 text-[length:var(--font-size-member-table-heading)]">Available From</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {members.length === 0 ? (
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={8} className="py-8 text-center text-ink-muted">
              No members match your search.
            </TableCell>
          </TableRow>
        ) : (
          members.map((member) => (
            <TableRow key={member.id}>
              <TableCell className="min-w-24 px-2 py-2">
                <span className="block whitespace-nowrap text-[length:var(--font-size-member-name)] font-semibold text-ink-primary">
                  {member.name}
                </span>
                <span className="block text-[length:var(--font-size-member-meta)] text-ink-muted">{member.id}</span>
              </TableCell>
              <TableCell className="whitespace-nowrap px-2 py-2 text-[length:var(--font-size-member-table-body)] text-ink-secondary">
                {member.experience.toFixed(1)} Years
              </TableCell>
              <TableCell className="whitespace-nowrap px-2 py-2 text-[length:var(--font-size-member-table-body)] text-ink-secondary">
                {member.joiningDate}
              </TableCell>
              <TableCell className="min-w-20 px-2 py-2">
                <div className="flex max-w-24 flex-wrap gap-0.5">
                  {member.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-sm bg-surface-table-head px-1 py-0.5 text-[length:var(--font-size-member-skill-tag)] leading-tight text-ink-secondary"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </TableCell>
              <TableCell className="min-w-24 px-2 py-2">
                <div className="flex max-w-28 flex-wrap gap-0.5">
                  {member.projects.map((project) => (
                    <span
                      key={project}
                      className="rounded-sm bg-badge-info-bg px-1 py-0.5 text-[length:var(--font-size-member-skill-tag)] leading-tight text-ink-primary"
                    >
                      {project}
                    </span>
                  ))}
                </div>
              </TableCell>
              <TableCell className="px-2 py-2">
                <Allocation value={member.allocation} />
              </TableCell>
              <TableCell className="whitespace-nowrap px-2 py-2">
                <AvailabilityBadge member={member} />
              </TableCell>
              <TableCell className="whitespace-nowrap px-2 py-2 text-[length:var(--font-size-member-table-body)] text-ink-secondary">
                {member.availableFrom}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
