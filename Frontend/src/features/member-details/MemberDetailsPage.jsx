import { useNavigate } from "react-router-dom";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";

import { MemberFilters } from "./components/MemberFilters";
import { MemberSummaryCards } from "./components/MemberSummaryCards";
import { MemberTable } from "./components/MemberTable";
import { useMemberDetails } from "./hooks/useMemberDetails";

export default function MemberDetailsPage() {
  const navigate = useNavigate();
  const memberDetails = useMemberDetails();

  return (
    <div className="-mt-2 flex flex-col gap-4">
      <PageHeader
        title="Member Details"
        titleClassName="text-[length:var(--font-size-member-page-title)] leading-7 font-bold text-[color:var(--color-member-title)]"
      />

      <MemberSummaryCards summary={memberDetails.summary} />

      <MemberFilters
        search={memberDetails.search}
        onSearchChange={memberDetails.setSearch}
        filterBy={memberDetails.filterBy}
        onFilterByChange={memberDetails.setFilterBy}
        onSkillAnalytics={() => navigate("/member-details/skill-analytics")}
        onExport={memberDetails.exportMembers}
      />

      <Card className="overflow-hidden shadow-header">
        <MemberTable members={memberDetails.members} />
        <Pagination
          page={memberDetails.page}
          totalPages={memberDetails.totalPages}
          totalItems={memberDetails.totalMembers}
          pageSize={memberDetails.pageSize}
          onPageChange={memberDetails.setPage}
          itemLabel="Team Members"
        />
      </Card>
    </div>
  );
}
