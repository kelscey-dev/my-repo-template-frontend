import { ColumnsType } from "antd/es/table";
import moment from "moment";
import { twMerge } from "tailwind-merge";
import { numberSeparator } from "@utils/helpers";
import { salesStatusPalette, salesTypesPalette } from "@utils/palettes";

export const salesColumns: ColumnsType<any> = [
  {
    title: "PO #",
    width: "15rem",
    align: "center",
    dataIndex: "custom_id",
    fixed: true,
  },
  {
    title: "Seller Name",
    width: "15rem",
    align: "center",
    dataIndex: "seller_name",
  },
  {
    title: "Line Items",
    width: "15rem",
    align: "center",
    dataIndex: "sales_details",
    className: "capitalize",
    render: (sales_details) => {
      return sales_details.map(
        ({ quantity, amount, inventory: { complete_item_name } }: any) => {
          return `${quantity} bottles of ${complete_item_name} - ₱ ${numberSeparator(
            amount * quantity,
            0
          )}`;
        }
      );
    },
  },
  {
    title: "Sales Type",
    width: "15rem",
    align: "center",
    dataIndex: "sales_type",
    render: (sales_type) => salesTypesPalette(sales_type, "label"),
  },
  {
    title: "Sales Date",
    width: "15rem",
    align: "center",
    dataIndex: "sales_date",
    className: "capitalize",
    render: (date) => {
      return moment(date).format("MMM DD, YYYY");
    },
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
            salesStatusPalette(status, "class")
          )}
        >
          {salesStatusPalette(status, "label")}
        </div>
      );
    },
  },
];

export const inventoryCheckerColumns: ColumnsType<any> = [
  {
    title: "BO #",
    width: "10rem",
    align: "left",
    dataIndex: "batch_order_id",
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
