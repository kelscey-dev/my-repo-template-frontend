const data = [
  {
    label: "Pending",
    value: "pending",
    buttonLabel: "Save Order",
  },
  {
    label: "In Progress",
    value: "in_progress",
    buttonLabel: "Process Order",
  },
  {
    label: "Completed",
    value: "completed",
    buttonLabel: "Complete Order",
  },
  {
    label: "Returned",
    value: "returned",
    buttonLabel: "Return Order",
  },
  {
    label: "Completed",
    value: "cancelled",
    buttonLabel: "Cancel Order",
  },
] as const;

export type BatchOrderStatusTypes = (typeof data)[number]["value"];

export default data.map((item) => item);
