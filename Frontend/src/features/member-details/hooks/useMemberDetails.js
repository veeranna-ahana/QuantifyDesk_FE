import { useMemo, useState } from "react";

import {
  mockMemberSummary,
  mockMembers,
  mockSkillAnalytics,
} from "../mock/mockMemberDetails";

const PAGE_SIZE = 10;

function toCsvRow(values) {
  return values
    .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
    .join(",");
}

function downloadCsv(filename, header, rows) {
  const blob = new Blob(
    [[header, ...rows].map(toCsvRow).join("\n")],
    { type: "text/csv" },
  );
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function useMemberDetails() {
  const [search, setSearch] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [page, setPage] = useState(1);

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return mockMembers;
    return mockMembers.filter((member) => {
      const values =
        filterBy === "experience"
          ? [member.experience, `${member.experience} years`]
          : filterBy === "skill"
            ? member.skills
            : filterBy === "member"
              ? [member.name, member.id]
              : [
                  member.name,
                  member.id,
                  member.experience,
                  member.joiningDate,
                  ...member.skills,
                  ...member.projects,
                  member.availability,
                ];
      return values.some((value) =>
        String(value).toLowerCase().includes(query),
      );
    });
  }, [filterBy, search]);

  const offset = (page - 1) * PAGE_SIZE;

  const exportMembers = () => {
    const header = [
      "Member",
      "Employee ID",
      "Experience",
      "DOJ",
      "Skills",
      "Current Project",
      "Allocation",
      "Availability",
      "Available From",
    ];
    const rows = filteredMembers.map((member) => [
      member.name,
      member.id,
      `${member.experience} Years`,
      member.joiningDate,
      member.skills.join("; "),
      member.projects.join("; "),
      `${member.allocation}%`,
      member.availability,
      member.availableFrom,
    ]);
    downloadCsv("member-details.csv", header, rows);
  };

  const exportSkills = () => {
    const header = ["Skill", "Total Members", "Available", "Partial", "Allocated"];
    const rows = mockSkillAnalytics.map((skill) => [
      skill.name,
      skill.total,
      skill.available,
      skill.partial,
      skill.allocated,
    ]);
    downloadCsv("skill-analytics.csv", header, rows);
  };

  return {
    members: filteredMembers.slice(offset, offset + PAGE_SIZE),
    totalMembers: filteredMembers.length,
    summary: mockMemberSummary,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(filteredMembers.length / PAGE_SIZE)),
    search,
    setSearch: (value) => {
      setSearch(value);
      setPage(1);
    },
    filterBy,
    setFilterBy: (value) => {
      setFilterBy(value);
      setPage(1);
    },
    setPage,
    skills: mockSkillAnalytics.slice(offset, offset + PAGE_SIZE),
    totalSkills: mockSkillAnalytics.length,
    exportMembers,
    exportSkills,
  };
}
