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
  matchesMemberFilters,
  countMembersByAvailability,
} from "../utils";

const PAGE_SIZE = 10;
const EMPTY_FILTERS = {
  availabilityStatuses: [],
  experience: "all",
  timing: "",
};

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
    availabilityValue: employee.available ?? employee.availability ?? "",
    availabilityStatus:
      employee.availability_status ??
      employee.availabilityStatus ??
      employee.availability,
    allocation:
      employee.allocation_percentage ??
      employee.allocationPercentage ??
      employee.allocation,
    immediate: isImmediate({
      available: employee.available ?? employee.availability,
    }),
  };
}

/**
 * Member Details data + search / paging. One API call loads every delivery employee, so search,
 * filtering, and paging run in the browser. Availability classification uses optional
 * allocation/status fields when present and does not infer missing values.
 */
export function useMemberDetails() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(EMPTY_FILTERS);
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

  const matchingMembers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return members.filter((member) => {
      const matchesSearch =
        !query ||
        [
          member.name,
          member.id,
          formatExperience(member.experience),
          member.joiningDate,
          ...member.skills,
          ...member.projects,
          member.availableFrom,
        ].some((value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(query),
      );
      return matchesSearch && matchesMemberFilters(member, filters);
    });
  }, [filters, search, members]);

  const totalPages = Math.max(1, Math.ceil(matchingMembers.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const offset = (currentPage - 1) * PAGE_SIZE;

  const availabilityCounts = useMemo(
    () => countMembersByAvailability(members),
    [members],
  );
  const summary = useMemo(
    () => ({
      totalResources: members.length,
      fullyAllocated: availabilityCounts.allocated,
      partiallyAllocated: availabilityCounts.partial,
      immediatelyAvailable: members.filter((m) => m.immediate).length,
    }),
    [availabilityCounts, members],
  );

  const exportMembers = () => {
    if (matchingMembers.length === 0) {
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
    const rows = matchingMembers.map((member) => [
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
    members: matchingMembers.slice(offset, offset + PAGE_SIZE),
    totalMembers: matchingMembers.length,
    availabilityCounts,
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
    filters,
    setFilters: (value) => {
      setFilters(value);
      setPage(1);
    },
    setPage,
    exportMembers,
  };
}
