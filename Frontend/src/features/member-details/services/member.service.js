import axiosInstance from "@/shared/axiosInstance";

const DELIVERY_DETAILS_TIMEOUT_MS = 5 * 60 * 1000;

// axiosInstance's response interceptor already unwraps to response.data.
export const memberService = {
  /**
   * Delivery employees with skills, projects and "Available From".
   * The backend makes one PMS lookup per employee (cached afterwards), so the first call can take
   * a while — the default 10s axios timeout is too short for it.
   */
  getDeliveryDetails: () =>
    axiosInstance.get("/api/employees/delivery-details", {
      timeout: DELIVERY_DETAILS_TIMEOUT_MS,
    }),

  /** Employees grouped by skill. */
  getSkillAnalytics: () =>
    axiosInstance.get("/api/skills/analytics", {
      timeout: DELIVERY_DETAILS_TIMEOUT_MS,
    }),
};
