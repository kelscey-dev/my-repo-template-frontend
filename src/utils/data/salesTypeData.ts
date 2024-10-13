const data = [
  {
    label: "Walk In",
    value: "walk_in",
  },
  {
    label: "Shopee",
    value: "shopee",
  },
  {
    label: "Lazada",
    value: "lazada",
  },
  {
    label: "Tiktok",
    value: "tiktok",
  },
  {
    label: "Facebook",
    value: "facebook",
  },
] as const;

export type SalesTypes = (typeof data)[number]["value"];

export default data.map((item) => item);
