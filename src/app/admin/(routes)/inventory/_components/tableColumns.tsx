import { ColumnsType } from "antd/es/table";
import { Inventories } from "@app-types/APIResponseTypes";

export const inventoriesColumns: ColumnsType<
  Pick<
    Inventories,
    | "custom_id"
    | "item_name"
    | "item_type"
    | "item_description"
    | "remaining_stocks"
  >
> = [
  {
    title: "Item #",
    width: "10rem",
    align: "center",
    dataIndex: "custom_id",
  },
  {
    title: "Item Name",
    width: "15rem",
    align: "center",
    dataIndex: "item_name",
  },
  {
    title: "Item Type",
    width: "15rem",
    align: "center",
    dataIndex: "item_type",
    className: "capitalize",
  },
  {
    title: "Item Description",
    width: "15rem",
    align: "center",
    dataIndex: "item_description",
  },
  {
    title: "Available Stocks",
    width: "15rem",
    align: "center",
    dataIndex: ["remaining_stocks", "remaining_quantity"],
    render: (qty) => `${qty} ${qty > 1 ? "Units" : "Unit"}`,
  },
];
