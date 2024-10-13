const data = [
  {
    label: "Pending",
    value: "pending",
    buttonLabel: "Save Order",
  },
  {
    label: "Shipped",
    value: "shipped",
    buttonLabel: "Ship Order",
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
    label: "Cancelled",
    value: "cancelled",
    buttonLabel: "Cancel Order",
  },
  {
    label: "Refunded",
    value: "refunded",
    buttonLabel: "Refund Order",
  },
] as const;

export type SalesStatusTypes = (typeof data)[number]["value"];

export default data.map((item) => item);
