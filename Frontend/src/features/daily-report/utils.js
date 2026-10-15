const GLOBAL_FILTERS = {
  "In Progress": (task) => task.status === "In Progress",
  Completed: (task) => task.status === "Completed",
  "On Hold": (task) => task.status === "Blocked" || task.status === "On Hold",
};

const PROJECT_FILTERS = {
  "in-progress": (task) => task.status === "In Progress",
  "last-completed": (task) =>
    (task.classification || "").includes("LAST COMPLETED"),
  "total-completed": (task) => task.status === "Completed",
  "not-started": (task) => task.status === "Not Started",
  blockers: (task) => task.isBlocker || task.status === "Blocked",
  delayed: (task) => task.isDelayed,
  "due-today": (task) => task.isDueToday,
};

export function filterReportTasks(
  tasks,
  { globalTab = "All", filter = "in-progress", searchQuery = "" } = {},
) {
  let filteredTasks = tasks || [];

  if (GLOBAL_FILTERS[globalTab]) {
    filteredTasks = filteredTasks.filter(GLOBAL_FILTERS[globalTab]);
  }
  if (PROJECT_FILTERS[filter]) {
    filteredTasks = filteredTasks.filter(PROJECT_FILTERS[filter]);
  }

  const query = searchQuery.trim().toLowerCase();
  if (query) {
    filteredTasks = filteredTasks.filter((task) =>
      [task.taskName, task.ownerName, task.remarks].some((value) =>
        (value || "").toLowerCase().includes(query),
      ),
    );
  }

  return filteredTasks;
}
