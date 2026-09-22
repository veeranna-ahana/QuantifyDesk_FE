import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import "./BulkUpdateTasksPage.css";
import {
  MOCK_MILESTONES,
  MOCK_PROJECT_CONTEXT,
} from "@/features/projects/mock/mockTasks";

// ── Dropdown option constants ─────────────────────────────────
const ROLE_OPTIONS = [
  "Business Analyst",
  "Developer",
  "QA Engineer",
  "Project Manager",
  "DevOps Engineer",
  "Designer",
];

const TASK_TYPE_OPTIONS = [
  "Analysis",
  "Development",
  "Testing",
  "Review",
  "Deployment",
  "Design",
];

// ── SVG Icons ─────────────────────────────────────────────────

const BuildingIcon = () => (
  <svg width="12" height="11" viewBox="0 0 12 11" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 10V3.5L6 1L11 3.5V10" stroke="#545F72" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="4" y="6" width="4" height="4" rx="0.5" stroke="#545F72" strokeWidth="1.1" />
  </svg>
);

const FilterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M2 3.5H14M4 8H12M6.5 12.5H9.5"
      stroke="#856bff"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M3.5 8.2L6.5 11.2L12.5 4.8"
      stroke="#000000"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SelectChevronIcon = () => (
  <svg width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 1L4 4L7 1" stroke="#6b778c" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="8" r="7" stroke="#ffffff" strokeWidth="1.5" />
    <path d="M5 8.2L7 10.2L11 6" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MilestoneChevronIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 4L10 8L6 12" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ── Component ─────────────────────────────────────────────────

export default function BulkUpdateTasksPage({ onCancel, onSave }) {
  const [search, setSearch] = useState("");
  const [selectedMilestone, setSelectedMilestone] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterOption, setFilterOption] = useState("all"); // 'all' | 'milestone' | 'owner'

  const filterRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setFilterOpen(false);
      }
    }
    if (filterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [filterOpen]);

  // Flatten all tasks across milestones with milestone metadata
  const initialFlatTasks = useMemo(() => {
    const list = [];
    const ownerList = ["Devanshi", "Gopi", "Sarah J."];
    let ownerIdx = 0;

    MOCK_MILESTONES.forEach((m) => {
      m.tasks.forEach((t) => {
        list.push({
          id: t.id,
          taskId: t.taskId,
          title: t.title,
          milestoneId: m.id,
          milestoneName: m.name,
          owner: t.owner === "Sarah J." ? ownerList[ownerIdx++ % ownerList.length] : t.owner,
          role: t.role || "Business Analyst",
          taskType: t.taskType || "Analysis",
          unit: t.unit || "1",
        });
      });
    });
    return list;
  }, []);

  // Form values state per task id
  const [taskValues, setTaskValues] = useState(() => {
    const initialMap = {};
    initialFlatTasks.forEach((t) => {
      initialMap[t.id] = {
        role: t.role,
        taskType: t.taskType,
        unit: t.unit || "1",
      };
    });
    return initialMap;
  });

  const handleFieldChange = useCallback((taskId, field, value) => {
    setTaskValues((prev) => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        [field]: value,
      },
    }));
  }, []);

  // Filter tasks based on search, milestone selection, and filter option
  const visibleTasks = useMemo(() => {
    const q = search.trim().toLowerCase();
    let tasks = initialFlatTasks.filter((t) => {
      if (selectedMilestone && t.milestoneId !== selectedMilestone) {
        return false;
      }
      if (q) {
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesId = t.taskId.toLowerCase().includes(q);
        const matchesMilestone = t.milestoneName.toLowerCase().includes(q);
        const matchesOwner = t.owner.toLowerCase().includes(q);
        if (!matchesTitle && !matchesId && !matchesMilestone && !matchesOwner) {
          return false;
        }
      }
      return true;
    });

    if (filterOption === "milestone") {
      tasks = [...tasks].sort((a, b) => a.milestoneName.localeCompare(b.milestoneName));
    } else if (filterOption === "owner") {
      tasks = [...tasks].sort((a, b) => a.owner.localeCompare(b.owner));
    }

    return tasks;
  }, [initialFlatTasks, search, selectedMilestone, filterOption]);

  const handleSubmit = () => {
    if (onSave) {
      onSave(taskValues);
    } else {
      alert("Bulk tasks updated successfully!");
      if (onCancel) onCancel();
    }
  };

  return (
    <div className="but-page-container">
      {/* ── Page Header Card ── */}
      <div className="but-header-card">
        {/* Title + Compact Context Bar */}
        <div className="but-header-top">
          <h1 className="but-title">Bulk Update Tasks</h1>
          <div className="but-context-bar">
            <span className="but-context-icon">
              <BuildingIcon />
            </span>
            <span className="but-context-fms">{MOCK_PROJECT_CONTEXT.projectName}</span>
            <span className="but-context-divider" />
            <span className="but-context-pms">PMS ID: {MOCK_PROJECT_CONTEXT.pmsId}</span>
          </div>
        </div>

        {/* Search and Filters Toolbar */}
        <div className="but-toolbar">
          {/* Search bar */}
          <div className="but-search-wrap">
            <Search size={16} className="but-search-icon" />
            <input
              id="bulk-task-search"
              type="text"
              className="but-search-input"
              placeholder="Search by task"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Milestone dropdown */}
          <div className="but-milestone-select-wrap">
            <select
              id="bulk-milestone-filter"
              className="but-milestone-select"
              value={selectedMilestone}
              onChange={(e) => setSelectedMilestone(e.target.value)}
            >
              <option value="">Milestone</option>
              {MOCK_MILESTONES.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            <span className="but-milestone-chevron">
              <MilestoneChevronIcon />
            </span>
          </div>

          {/* Filter button + Popover */}
          <div className="but-filter-wrap" ref={filterRef}>
            <button
              type="button"
              id="bulk-filter-btn"
              className={`but-filter-btn ${filterOpen ? "but-filter-btn--active" : ""}`}
              onClick={() => setFilterOpen((prev) => !prev)}
              aria-haspopup="true"
              aria-expanded={filterOpen}
            >
              <span className="but-filter-icon">
                <FilterIcon />
              </span>
              <span className="but-filter-text">Filter</span>
            </button>

            {/* Filter Popover Dropdown Menu (105px x 110px) */}
            {filterOpen && (
              <div className="but-filter-dropdown" role="menu">
                {/* All item */}
                <button
                  type="button"
                  className={`but-filter-item ${filterOption === "all" ? "but-filter-item--active" : ""}`}
                  onClick={() => {
                    setFilterOption("all");
                    setFilterOpen(false);
                  }}
                  role="menuitem"
                >
                  {filterOption === "all" && (
                    <span className="but-filter-item-check">
                      <CheckIcon />
                    </span>
                  )}
                  <span className="but-filter-item-text">All</span>
                </button>

                {/* Milestone item */}
                <button
                  type="button"
                  className={`but-filter-item ${filterOption === "milestone" ? "but-filter-item--active" : ""}`}
                  onClick={() => {
                    setFilterOption("milestone");
                    setFilterOpen(false);
                  }}
                  role="menuitem"
                >
                  {filterOption === "milestone" && (
                    <span className="but-filter-item-check">
                      <CheckIcon />
                    </span>
                  )}
                  <span className="but-filter-item-text">Milestone</span>
                </button>

                {/* Owner item */}
                <button
                  type="button"
                  className={`but-filter-item ${filterOption === "owner" ? "but-filter-item--active" : ""}`}
                  onClick={() => {
                    setFilterOption("owner");
                    setFilterOpen(false);
                  }}
                  role="menuitem"
                >
                  {filterOption === "owner" && (
                    <span className="but-filter-item-check">
                      <CheckIcon />
                    </span>
                  )}
                  <span className="but-filter-item-text">Owner</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Table Card ── */}
      <div className="but-table-card">
        <div className="but-table-scroll">
          <table className="but-table">
            <thead className="but-thead">
              <tr>
                <th className="but-th but-th--task">Task</th>
                <th className="but-th but-th--milestone">Milestone</th>
                <th className="but-th but-th--owner">Owner</th>
                <th className="but-th but-th--role but-th--tinted">Role</th>
                <th className="but-th but-th--tasktype but-th--tinted">Task Type</th>
                <th className="but-th but-th--unit but-th--tinted">Unit</th>
              </tr>
            </thead>
            <tbody>
              {visibleTasks.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "#94a3b8" }}>
                    No tasks found matching your search.
                  </td>
                </tr>
              ) : (
                visibleTasks.map((t) => {
                  const values = taskValues[t.id] || {
                    role: t.role,
                    taskType: t.taskType,
                    unit: t.unit,
                  };
                  return (
                    <tr key={t.id} className="but-tr">
                      {/* Task title + ID */}
                      <td className="but-td but-td--readonly">
                        <div className="but-task-cell">
                          <span className="but-task-title">{t.title}</span>
                          <span className="but-task-id">{t.taskId}</span>
                        </div>
                      </td>

                      {/* Milestone */}
                      <td className="but-td but-td--readonly">
                        <span className="but-milestone-text">{t.milestoneName}</span>
                      </td>

                      {/* Owner */}
                      <td className="but-td but-td--readonly">
                        <span className="but-owner-text">{t.owner}</span>
                      </td>

                      {/* Role Dropdown */}
                      <td className="but-td but-td--editable">
                        <div className="but-select-wrap">
                          <select
                            id={`role-select-${t.id}`}
                            className="but-select but-select--role"
                            value={values.role}
                            onChange={(e) => handleFieldChange(t.id, "role", e.target.value)}
                          >
                            {ROLE_OPTIONS.map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                          <span className="but-select-chevron">
                            <SelectChevronIcon />
                          </span>
                        </div>
                      </td>

                      {/* Task Type Dropdown */}
                      <td className="but-td but-td--editable">
                        <div className="but-select-wrap">
                          <select
                            id={`tasktype-select-${t.id}`}
                            className="but-select but-select--tasktype"
                            value={values.taskType}
                            onChange={(e) => handleFieldChange(t.id, "taskType", e.target.value)}
                          >
                            {TASK_TYPE_OPTIONS.map((tt) => (
                              <option key={tt} value={tt}>
                                {tt}
                              </option>
                            ))}
                          </select>
                          <span className="but-select-chevron">
                            <SelectChevronIcon />
                          </span>
                        </div>
                      </td>

                      {/* Unit Input */}
                      <td className="but-td but-td--editable">
                        <div className="but-unit-input-wrap">
                          <input
                            id={`unit-input-${t.id}`}
                            type="number"
                            min="0"
                            className="but-unit-input"
                            value={values.unit}
                            onChange={(e) => handleFieldChange(t.id, "unit", e.target.value)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Footer Actions ── */}
      <div className="but-footer">
        <div className="but-footer-spacer" aria-hidden="true" />
        <div className="but-footer-right">
          <button
            type="button"
            id="bulk-update-cancel-btn"
            className="but-btn-cancel"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            id="bulk-update-submit-btn"
            className="but-btn-submit"
            onClick={handleSubmit}
          >
            <span className="but-btn-icon">
              <CheckCircleIcon />
            </span>
            <span>Bulk Update Tasks</span>
          </button>
        </div>
      </div>
    </div>
  );
}
