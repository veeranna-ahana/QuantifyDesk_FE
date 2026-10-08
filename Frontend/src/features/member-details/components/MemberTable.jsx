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
  const badgeClassName =
    member.availability === "Available"
      ? "border-0 bg-[color:var(--color-member-available-bg)] px-2 py-0.5 text-[color:var(--color-member-available-text)]"
      : member.availability === "Partially Available"
        ? "border-0 bg-[color:var(--color-member-partial-bg)] px-2 py-0.5 font-semibold leading-[14px] tracking-[0.33px] text-[color:var(--color-member-partial-text)]"
        : "border-0 bg-[color:var(--color-member-allocated-bg)] px-2 py-0.5 leading-5 text-[color:var(--color-member-allocated-text)]";
  return (
    <Badge variant={style.variant} shape="pill" size="sm" className={badgeClassName}>
      {label}
    </Badge>
  );
}

function Allocation({ value }) {
  const tone = value === 100 ? "danger" : value > 0 ? "warning" : "success";
  return (
    <div className="flex min-w-12 flex-col gap-1">
      <span className="text-xs font-medium text-[color:var(--color-member-allocation)]">
        {value}%
      </span>
      <ProgressBar
        value={value}
        tone={tone}
        className="h-[6px] w-12 bg-[color:var(--color-member-allocation-track)]"
      />
    </div>
  );
}

export function MemberTable({ members }) {
  return (
    <Table className="table-fixed min-w-[var(--size-member-table-min-width)] text-[length:var(--font-size-member-table-body)]">
      <colgroup>
        <col className="w-[14.818%]" />
        <col className="w-[10.707%]" />
        <col className="w-[11.281%]" />
        <col className="w-[10.229%]" />
        <col className="w-[15.965%]" />
        <col className="w-[10.994%]" />
        <col className="w-[14.723%]" />
        <col className="w-[11.281%]" />
      </colgroup>
      <TableHead>
        <TableRow className="hover:bg-transparent">
          <TableHeaderCell className="h-table-head px-4 text-[length:var(--font-size-member-table-heading)] font-medium tracking-[0.6px] text-[color:var(--color-member-table-heading)]">Members</TableHeaderCell>
          <TableHeaderCell className="h-table-head px-4 text-[length:var(--font-size-member-table-heading)] font-medium tracking-[0.6px] text-[color:var(--color-member-table-heading)]">Experience</TableHeaderCell>
          <TableHeaderCell className="h-table-head px-4 text-[length:var(--font-size-member-table-heading)] font-medium tracking-[0.6px] text-[color:var(--color-member-table-heading)]">DOJ</TableHeaderCell>
          <TableHeaderCell className="h-table-head px-4 text-[length:var(--font-size-member-table-heading)] font-medium tracking-[0.6px] text-[color:var(--color-member-table-heading)]">Skill</TableHeaderCell>
          <TableHeaderCell className="h-table-head px-4 text-[length:var(--font-size-member-table-heading)] font-medium tracking-[0.6px] text-[color:var(--color-member-table-heading)]">Current Project</TableHeaderCell>
          <TableHeaderCell className="h-table-head px-4 text-[length:var(--font-size-member-table-heading)] font-medium tracking-[0.6px] text-[color:var(--color-member-table-heading)]">Allocation</TableHeaderCell>
          <TableHeaderCell className="h-table-head px-4 text-[length:var(--font-size-member-table-heading)] font-medium tracking-[0.6px] text-[color:var(--color-member-table-heading)]">Availability</TableHeaderCell>
          <TableHeaderCell className="h-table-head px-4 text-[length:var(--font-size-member-table-heading)] font-medium tracking-[0.6px] text-[color:var(--color-member-table-heading)]">Available From</TableHeaderCell>
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
              <TableCell className="min-w-24 px-4 py-2.5">
                <span className="block whitespace-nowrap text-[length:var(--font-size-member-name)] font-semibold leading-5 text-[color:var(--color-member-name)]">
                  {member.name}
                </span>
                <span className="block text-[length:var(--font-size-member-meta)] font-medium leading-5 text-[color:var(--color-member-meta)]">{member.id}</span>
              </TableCell>
              <TableCell className="whitespace-nowrap px-4 py-2.5 text-[length:var(--font-size-member-table-body)] leading-[18px] text-[color:var(--color-member-cell)]">
                {member.experience.toFixed(1)} Years
              </TableCell>
              <TableCell className="whitespace-nowrap px-4 py-2.5 text-[length:var(--font-size-member-table-body)] leading-[18px] text-[color:var(--color-member-date)]">
                {member.joiningDate}
              </TableCell>
              <TableCell className="min-w-20 px-4 py-2.5">
                <div className="flex flex-wrap gap-1">
                  {member.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-sm bg-[color:var(--color-member-skill-bg)] px-1.5 py-0.5 text-[length:var(--font-size-member-skill-tag)] font-medium leading-[14px] text-[color:var(--color-member-skill-text)]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </TableCell>
              <TableCell className="min-w-24 px-4 py-2.5">
                <div className="flex flex-wrap gap-1">
                  {member.projects.map((project) => (
                    <span
                      key={project}
                      className="rounded-sm bg-[color:var(--color-member-project-bg)] px-2 py-0.5 text-[length:var(--font-size-member-skill-tag)] font-medium leading-5 text-[color:var(--color-member-project-text)]"
                    >
                      {project}
                    </span>
                  ))}
                </div>
              </TableCell>
              <TableCell className="px-4 py-2.5">
                <Allocation value={member.allocation} />
              </TableCell>
              <TableCell className="whitespace-nowrap px-4 py-2.5">
                <AvailabilityBadge member={member} />
              </TableCell>
              <TableCell className="whitespace-nowrap px-4 py-2.5 text-[length:var(--font-size-member-table-body)] leading-[18px] text-[color:var(--color-member-date)]">
                {member.availableFrom}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
