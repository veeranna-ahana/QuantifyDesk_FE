// Single mapping from a status label (as returned by the API / mocks) to a Badge variant.
// Add new statuses here - never colour a status inline in a component.
const STATUS_VARIANT = {
  Completed: "success",
  Approved: "success",
  Uploaded: "success",
  "On Track": "success",
  Delivered: "success",
  "In Progress": "warning",
  Running: "warning",
  "On Hold": "info",
  Submitted: "brand",
  Pending: "neutral",
  "Not Started": "neutral",
  Delayed: "danger",
  "At Risk": "danger",
  Cancelled: "danger",
  Rejected: "danger",
  "Over Utilized": "danger",
  "Under Utilized": "warning",
  "Optimally Used": "success",
};

// Case-insensitive lookup — PMS sends statuses ALL CAPS (e.g. "APPROVED"), while some local/mock
// statuses are Title Case ("Approved"). Without this, "APPROVED" silently missed the "Approved"
// key above and fell back to the neutral/gray default instead of matching Completed's green.
const NORMALIZED_STATUS_VARIANT = Object.fromEntries(
  Object.entries(STATUS_VARIANT).map(([key, value]) => [
    key.toUpperCase(),
    value,
  ]),
);

export const statusVariant = (status) =>
  NORMALIZED_STATUS_VARIANT[String(status || "").toUpperCase()] ?? "neutral";
