import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/Table";

import { formatExperience } from "../utils";

export function MemberTable({ members, loading = false }) {
  return (
    <Table className="table-fixed min-w-[var(--size-member-table-min-width)] text-[length:var(--font-size-member-table-body)]">
      <colgroup>
        <col className="w-[18%]" />
        <col className="w-[12%]" />
        <col className="w-[13%]" />
        <col className="w-[20%]" />
        <col className="w-[22%]" />
        <col className="w-[15%]" />
      </colgroup>
      <TableHead>
        <TableRow className="hover:bg-transparent">
          <TableHeaderCell className="h-table-head px-4 text-[length:var(--font-size-member-table-heading)] font-medium tracking-[0.6px] text-[color:var(--color-member-table-heading)]">
            Members
          </TableHeaderCell>
          <TableHeaderCell className="h-table-head px-4 text-[length:var(--font-size-member-table-heading)] font-medium tracking-[0.6px] text-[color:var(--color-member-table-heading)]">
            Experience
          </TableHeaderCell>
          <TableHeaderCell className="h-table-head px-4 text-[length:var(--font-size-member-table-heading)] font-medium tracking-[0.6px] text-[color:var(--color-member-table-heading)]">
            DOJ
          </TableHeaderCell>
          <TableHeaderCell className="h-table-head px-4 text-[length:var(--font-size-member-table-heading)] font-medium tracking-[0.6px] text-[color:var(--color-member-table-heading)]">
            Skill
          </TableHeaderCell>
          <TableHeaderCell className="h-table-head px-4 text-[length:var(--font-size-member-table-heading)] font-medium tracking-[0.6px] text-[color:var(--color-member-table-heading)]">
            Current Project
          </TableHeaderCell>
          <TableHeaderCell className="h-table-head px-4 text-[length:var(--font-size-member-table-heading)] font-medium tracking-[0.6px] text-[color:var(--color-member-table-heading)]">
            Available From
          </TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {loading ? (
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={6} className="py-8 text-center text-ink-muted">
              Loading members...
            </TableCell>
          </TableRow>
        ) : members.length === 0 ? (
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={6} className="py-8 text-center text-ink-muted">
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
                <span className="block text-[length:var(--font-size-member-meta)] font-medium leading-5 text-[color:var(--color-member-meta)]">
                  {member.id}
                </span>
              </TableCell>
              <TableCell className="whitespace-nowrap px-4 py-2.5 text-[length:var(--font-size-member-table-body)] leading-[18px] text-[color:var(--color-member-cell)]">
                {formatExperience(member.experience)}
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
