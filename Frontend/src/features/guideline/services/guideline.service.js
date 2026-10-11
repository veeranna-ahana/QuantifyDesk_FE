import axiosInstance from "@/shared/axiosInstance";
import { PAGE_SIZE } from "../constants";

// Real backend (GET/POST/PUT /api/guidelines). axiosInstance's response interceptor already
// unwraps to response.data, so these return the JSON body directly.
export const guidelineService = {
  /** List: search by name/owner, version chips, last-updated window, server-side paging. */
  getGuidelines: ({
    page = 1,
    searchQuery = "",
    filters = { versions: [], lastUpdated: "all" },
  }) =>
    axiosInstance.get("/api/guidelines", {
      params: {
        page,
        pageSize: PAGE_SIZE,
        search: searchQuery.trim() || undefined,
        versions: filters.versions.length
          ? filters.versions.join(",")
          : undefined,
        lastUpdated:
          filters.lastUpdated !== "all" ? filters.lastUpdated : undefined,
      },
    }),

  getGuidelineById: (id) => axiosInstance.get(`/api/guidelines/${id}`),

  createGuideline: (data) =>
    axiosInstance.post("/api/guidelines", toPayload(data)),

  updateGuideline: (id, data) =>
    axiosInstance.put(`/api/guidelines/${id}`, toPayload(data)),
};

const toPayload = (data) => ({
  name: data.name,
  link: data.link,
  version: data.version,
  ownerName: data.ownerName,
  scope: data.scope,
});
