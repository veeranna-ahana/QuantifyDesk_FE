// Single mapping from a status label (as returned by the API / mocks) to a Badge variant.
// Add new statuses here - never colour a status inline in a component.
const STATUS_VARIANT = {
  Completed: 'success',
  Approved: 'success',
  Uploaded: 'success',
  'On Track': 'success',
  Delivered: 'success',
  'In Progress': 'warning',
  Running: 'warning',
  'On Hold': 'info',
  Submitted: 'brand',
  Pending: 'neutral',
  'Not Started': 'neutral',
  Delayed: 'danger',
  'At Risk': 'danger',
  Cancelled: 'danger',
  Rejected: 'danger',
  'Over Utilized': 'danger',
  'Under Utilized': 'warning',
  'Optimally Used': 'success',
};

export const statusVariant = (status) => STATUS_VARIANT[status] ?? 'neutral';
