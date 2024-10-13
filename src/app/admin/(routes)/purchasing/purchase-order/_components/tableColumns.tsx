import { ColumnsType } from "antd/es/table";
import moment from "moment";
import { twMerge } from "tailwind-merge";
import { PurchaseOrders } from "@app-types/APIResponseTypes";
import { purchaseOrderStatusPalette } from "@utils/palettes";

export const purchaseOrderColumns: ColumnsType<
  Pick<PurchaseOrders, "custom_id" | "supplier" | "order_date" | "status">
> = [
  {
    title: "PO #",
    width: "15rem",
    align: "center",
    dataIndex: "custom_id",
  },
  {
    title: "Supplier Name",
    width: "15rem",
    align: "center",
    dataIndex: ["supplier", "supplier_name"],
  },
  {
    title: "Contact Name",
    width: "15rem",
    align: "center",
    dataIndex: ["supplier", "contact_name"],
  },
  {
    title: "Order Date",
    width: "15rem",
    align: "center",
    dataIndex: "order_date",
    className: "capitalize",
    render: (date) => {
      return moment(date).format("MMM DD, YYYY");
    },
  },
  {
    title: "Status",
    width: "1rem",
    align: "center",
    dataIndex: "status",
    className: "capitalize",
    render: (status) => {
      return (
        <div
          className={twMerge(
            "max-w-[10rem] m-auto p-2 rounded-3xl bg-opacity-40 text-sm font-semibold tracking-wide",
            purchaseOrderStatusPalette(status, "class")
          )}
        >
          {purchaseOrderStatusPalette(status, "label")}
        </div>
      );
    },
  },
];
