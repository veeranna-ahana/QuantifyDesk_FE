import axiosInstance from "@/shared/axiosInstance";

// Real backend (/api/servers). axiosInstance's response interceptor already unwraps to
// response.data, so these return the JSON body directly.
export const serverService = {
  /** Environment / Initial Status / Operating System dropdown lists (backend constants). */
  getOptions: () => axiosInstance.get("/api/servers/options"),

  /** Allocated Projects options: unique PMS project titles + custom ones added via "Other". */
  getProjects: () => axiosInstance.get("/api/servers/projects"),

  /** Distinct projects actually assigned to a server — what the list's Filter popup offers. */
  getAssignedProjects: () =>
    axiosInstance.get("/api/servers/assigned-projects"),

  getServers: ({ page = 1, pageSize = 10, search = "" }) =>
    axiosInstance.get("/api/servers", {
      params: { page, pageSize, search: search.trim() || undefined },
    }),

  getServerById: (id) => axiosInstance.get(`/api/servers/${id}`),

  createServer: (data) => axiosInstance.post("/api/servers", toPayload(data)),

  updateServer: (id, data) =>
    axiosInstance.put(`/api/servers/${id}`, toPayload(data)),
};

const toPayload = (v) => ({
  serverName: v.serverName,
  ipAddress: v.ipAddress,
  ram: v.ram,
  cpu: v.cpu,
  storage: v.storage,
  os: v.os,
  environment: v.environment,
  gpu: v.gpu,
  status: v.status,
  assignedProjects: v.assignedProjects,
  description: v.description,
});
