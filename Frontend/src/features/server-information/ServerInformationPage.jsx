// src/features/server-information/ServerInformationPage.jsx
import { useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Download, Plus } from "lucide-react";
import toast from "react-hot-toast";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";

import { ServerFilterBar } from "./components/ServerFilterBar";
import { ServerTable } from "./components/ServerTable";
import { useServerInformation } from "./hooks/useServerInformation";
import { serverService } from "./services/server.service";

export default function ServerInformationPage() {
  const navigate = useNavigate();
  const { state } = useLocation();

  // The "Assign Project" filter should show the full PMS catalog (same one Add/Edit Server's own
  // picker uses) — PLUS any custom name someone typed through "Other (Add Project)" while adding
  // a server, since those never existed in PMS and would otherwise be invisible as filter options
  // even though a server really is assigned to them. So this merges both sources and de-dupes.
  const catalogQuery = useQuery({
    queryKey: ["server-projects"],
    queryFn: () => serverService.getProjects(),
    staleTime: 2 * 60 * 1000,
  });
  // staleTime: 0 (not 2 minutes like the PMS catalog above) — this is a cheap local DB read, not
  // a PMS call, and it needs to reflect a project someone just assigned on Add/Edit Server a
  // moment ago. Relying only on ServerFormPage's invalidateQueries() after save is one path to
  // freshness; this is the other, so opening the filter is correct even if this page was already
  // sitting open in another tab when the assignment happened.
  const assignedQuery = useQuery({
    queryKey: ["server-assigned-projects"],
    queryFn: () => serverService.getAssignedProjects(),
    staleTime: 0,
  });

  const projectOptions = useMemo(() => {
    const names = new Set([
      ...(catalogQuery.data?.projects || []),
      ...(assignedQuery.data?.projects || []),
    ]);
    return [...names].sort((a, b) => a.localeCompare(b));
  }, [catalogQuery.data, assignedQuery.data]);

  const {
    servers,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    page,
    setPage,
    totalPages,
    totalItems,
    pageSize,
    activeCount,
    loading,
    error,
    exporting,
    exportCsv,
  } = useServerInformation();

  // Show a success toast when navigated back from the Add/Edit form
  useEffect(() => {
    if (state?.successMessage) {
      toast.success(state.successMessage, { id: "server-saved" });
      window.history.replaceState({}, "");
    }
  }, [state]);

  const handleAddServer = () => navigate("/server-information/add");

  const handleEditServer = (server) =>
    navigate(`/server-information/${server.id}/edit`);

  return (
    <div className="flex w-full flex-col gap-2">
      <PageHeader
        titleClassName="text-2xl font-bold leading-[38px] text-[#0B1C30]"
        actionsClassName="gap-2.5"
        title={
          <span className="inline-flex items-center gap-3">
            Server Information
            <span className="inline-flex h-[22px] items-center gap-1.5 rounded-full bg-[#E4E9EE] px-2.5 py-0.5 text-xs font-normal text-[#002045]">
              <span
                className="h-1.5 w-1.5 rounded-full bg-[#4CADAB]"
                aria-hidden="true"
              />
              {activeCount} Active Hosts
            </span>
          </span>
        }
        actions={
          <>
            <Button
              variant="secondary"
              size="md"
              className="border-action-primary bg-surface-card px-3.5 text-action-primary shadow-[var(--shadow-1)] hover:bg-action-primary-soft"
              leftIcon={<Download className="h-3 w-3" />}
              onClick={exportCsv}
              disabled={exporting}
            >
              {exporting ? "Exporting..." : "Export CSV"}
            </Button>
            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus className="h-[10.5px] w-[10.5px]" />}
              onClick={handleAddServer}
              className="shadow-[var(--shadow-1)]"
            >
              Add Server
            </Button>
          </>
        }
      />

      <ServerFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={filters}
        onFiltersChange={setFilters}
        activeCount={activeCount}
        projectOptions={projectOptions}
        projectsLoading={catalogQuery.isLoading || assignedQuery.isLoading}
        projectsError={
          // The PMS catalog is the one that can realistically fail (it's a live PMS call); if the
          // assigned-projects lookup fails, the filter just falls back to the catalog alone rather
          // than showing an error for something that isn't the user's problem.
          catalogQuery.data?.pmsError ||
          (catalogQuery.isError ? "Could not load projects." : null)
        }
      />

      {error && <p className="px-1 text-sm text-badge-danger-ink">{error}</p>}

      <Card className="overflow-hidden rounded-none border-0 bg-transparent shadow-none">
        <ServerTable
          servers={servers}
          loading={loading}
          pageSize={pageSize}
          onEdit={handleEditServer}
        />
        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setPage}
          itemLabel="Servers"
          className="py-2 [&_b]:font-medium [&_button]:rounded-lg [&>span]:text-sm [&>span]:leading-5"
        />
      </Card>
    </div>
  );
}
