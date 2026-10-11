// src/features/server-information/constants.js
//
// Environment / Initial Status / Operating System option lists and the default selections are
// served by the backend (GET /api/servers/options) — nothing is hard-coded here any more.

/** Returns an empty server form state (used for Add flow). */
export const EMPTY_SERVER_FORM = {
  serverName: "",
  ipAddress: "",
  ram: "",
  cpu: "",
  storage: "",
  os: "",
  environment: "",
  gpu: "",
  status: "",
  assignedProjects: [],
  description: "",
};
