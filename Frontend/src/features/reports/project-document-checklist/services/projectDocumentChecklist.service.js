import axiosInstance from "@/shared/axiosInstance";

// axiosInstance's response interceptor already unwraps to response.data.
export const projectDocumentChecklistService = {
  getReport: ({ page = 1, pageSize = 10, search = "", status = "" }) =>
    axiosInstance.get("/api/project-document-checklist", {
      params: {
        page,
        pageSize,
        search: search.trim() || undefined,
        status: status || undefined,
      },
    }),
};
