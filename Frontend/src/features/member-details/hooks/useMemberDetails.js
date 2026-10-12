import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { memberService } from "../services/member.service";
import {
  decodeEntities,
  downloadCsv,
  formatAvailableFrom,
  formatDate,
  formatExperience,
  isImmediate,
} from "../utils";

const PAGE_SIZE = 10;

const csvCell = (value) => {
  let text = String(value ?? "");
  if (/^[=+\-@]/.test(text)) text = `'${text}`; // keep Excel from reading it as a formula
  return `"${text.replace(/"/g, '""')}"`;
};

/** API employee (GET /api/employees/delivery-details) -> the member shape the table works with. */
function toMember(employee) {
  return {
    id: employee.emp_id,
    name: decodeEntities(employee.emp_name),
    designation: decodeEntities(employee.designation),
    experience: employee.experience_years,
    joiningDate: formatDate(employee.doj),
    skills: [
      ...new Set([...(employee.skills || []), ...(employee.sub_skills || [])]),
    ],
    projects: employee.projects || [],
    availableFrom: formatAvailableFrom(employee.available),
    immediate: isImmediate(employee),
  };
}

/**
 * Member Details data + search / paging. One API call loads every delivery employee, so search
 * and paging run in the browser. There is no allocation data yet, so only "Available From"
 * (immediate / a date) is shown.
 */
export function useMemberDetails() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await memberService.getDeliveryDetails();
        if (active) setMembers((res.employees || []).map(toMember));
      } catch (err) {
        if (active)
          setError(
            err.response?.data?.message || "Failed to load member details",
          );
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return members;
    return members.filter((member) => {
      const values =
        filterBy === "experience"
          ? [formatExperience(member.experience), member.experience]
          : filterBy === "skill"
            ? member.skills
            : filterBy === "member"
              ? [member.name, member.id]
              : [
                  member.name,
                  member.id,
                  formatExperience(member.experience),
                  member.joiningDate,
                  ...member.skills,
                  ...member.projects,
                  member.availableFrom,
                ];
      return values.some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(query),
      );
    });
  }, [filterBy, search, members]);

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const offset = (currentPage - 1) * PAGE_SIZE;

  const summary = useMemo(
    () => ({
      totalResources: members.length,
      immediatelyAvailable: members.filter((m) => m.immediate).length,
    }),
    [members],
  );

  const exportMembers = () => {
    if (filteredMembers.length === 0) {
      toast.error("No members to export");
      return;
    }
    const header = [
      "Member",
      "Employee ID",
      "Designation",
      "Experience",
      "DOJ",
      "Skills",
      "Current Project",
      "Available From",
    ];
    const rows = filteredMembers.map((member) => [
      member.name,
      member.id,
      member.designation,
      formatExperience(member.experience),
      member.joiningDate,
      member.skills.join("; "),
      member.projects.join("; "),
      member.availableFrom,
    ]);
    downloadCsv(
      [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n"),
      `member-details-${new Date().toISOString().slice(0, 10)}.csv`,
    );
  };

  return {
    members: filteredMembers.slice(offset, offset + PAGE_SIZE),
    totalMembers: filteredMembers.length,
    summary,
    loading,
    error,
    page: currentPage,
    pageSize: PAGE_SIZE,
    totalPages,
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
    exportMembers,
  };
}
