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

// RAM Capacity / CPU Architecture / Storage are all optional, but previously had no format
// validation at all — an IP address or any random text was accepted and saved silently. These
// three patterns mirror the fields' own placeholders ("e.g. 32 GB", "e.g. 8 Core Xeon / EPYC",
// "e.g. 500 GB NVMe SSD") so a legitimate entry in that shape still passes, while an IP address
// or unrelated text does not. Only checked when the field isn't blank — leaving them empty is
// still allowed. The backend (server.controller.js's parseBody) enforces the same patterns, so a
// request that bypasses this form can't slip an invalid value past validation either.

/** RAM Capacity: a number with a unit — "32GB", "32 GB", "0.5 TB". */
export const RAM_PATTERN = /^\d+(\.\d+)?\s*(MB|GB|TB)$/i;
export const RAM_ERROR =
  "RAM Capacity must be a number with a unit (MB, GB or TB), e.g. 32 GB.";

/** Storage: the same capacity + unit, optionally followed by a free-text descriptor. */
export const STORAGE_PATTERN =
  /^\d+(\.\d+)?\s*(MB|GB|TB)(\s+[A-Za-z0-9/().,+-]+(\s+[A-Za-z0-9/().,+-]+)*)?$/i;
export const STORAGE_ERROR =
  "Storage must start with a number and unit (MB, GB or TB), e.g. 500 GB NVMe SSD.";

/** CPU Architecture: a core / vCPU count, e.g. "8 Core Xeon / EPYC", "16 vCPUs". */
export const CPU_PATTERN = /^\d+\s*(core|cores|vcpu|vcpus)\b.*$/i;
export const CPU_ERROR =
  "CPU Architecture must start with a core or vCPU count, e.g. 8 Core Xeon / EPYC.";
