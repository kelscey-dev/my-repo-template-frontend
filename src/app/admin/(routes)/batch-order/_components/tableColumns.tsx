import { ColumnsType } from "antd/es/table";
import moment from "moment";
import { twMerge } from "tailwind-merge";
import { BatchOrders } from "@app-types/APIResponseTypes";
import { numberSeparator } from "@utils/helpers";
import { batchOrderStatusPalette } from "@utils/palettes";

export const batchOrderColumns: ColumnsType<
  Pick<
    BatchOrders,
    | "custom_id"
    | "product"
    | "planned_production_quantity"
    | "actual_production_quantity"
    | "planned_date"
    | "actual_date"
    | "status"
  >
> = [
  {
    title: "BO #",
    width: "15rem",
    align: "center",
    dataIndex: "custom_id",
  },
  {
    title: "Batch Product",
    width: "15rem",
    align: "center",
    dataIndex: ["product", "complete_item_name"],
  },
  {
    title: "Production Quantity",
    children: [
      {
        title: "Planned Quantity",
        dataIndex: "planned_production_quantity",
        align: "center",
        width: "10rem",
        render: (qty) => {
          return numberSeparator(qty ?? 0, 0);
        },
      },
      {
        title: "Actual Quantity",
        dataIndex: "actual_production_quantity",
        align: "center",
        width: "10rem",
        render: (qty) => {
          return numberSeparator(qty ?? 0, 0);
        },
      },
    ],
    width: "15rem",
  },
  {
    title: "Product Date",
    children: [
      {
        title: "Planned Date",
        dataIndex: "planned_date",
        align: "center",
        width: "10rem",
        render: (date) => {
          if (date) return moment(date).format("MMM DD, YYYY") ?? 0;
        },
      },
      {
        title: "Actual Date",
        dataIndex: "actual_date",
        align: "center",
        width: "10rem",
        render: (date) => {
          if (date) return moment(date).format("MMM DD, YYYY") ?? 0;
        },
      },
    ],
    width: "15rem",
    className: "capitalize",
  },
  {
    title: "Status",
    width: "10rem",
    align: "center",
    dataIndex: "status",
    className: "capitalize",
    render: (status) => {
      return (
        <div
          className={twMerge(
            "max-w-[10rem] m-auto p-2 rounded-3xl bg-opacity-40 text-sm font-semibold tracking-wide",
            batchOrderStatusPalette(status, "class")
          )}
        >
          {batchOrderStatusPalette(status, "label")}
        </div>
      );
    },
  },
];

export const inventoryCheckerColumns: ColumnsType<any> = [
  {
    title: "PO #",
    width: "10rem",
    align: "left",
    dataIndex: "purchase_order_id",
  },
  {
    title: "Quantity Used",
    width: "10rem",
    align: "right",
    dataIndex: "used_quantity",
  },
  {
    title: "Remaining Quantity",
    width: "10rem",
    align: "right",
    dataIndex: "remaining_quantity",
  },
  {
    title: "Unit Item Cost",
    width: "10rem",
    align: "right",
    dataIndex: "unit_cost",
  },
  {
    title: "Used Items Cost",
    width: "10rem",
    align: "right",
    dataIndex: "used_items_cost",
  },
];
