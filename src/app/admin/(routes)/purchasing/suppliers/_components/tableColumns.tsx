import { ColumnsType } from "antd/es/table";
import { Suppliers } from "@app-types/APIResponseTypes";
import { mobileFormat } from "@utils/helpers";

export const supplierColumns: ColumnsType<
  Pick<Suppliers, "custom_id" | "supplier_name" | "contact_name" | "contact_no">
> = [
  {
    title: "Supplier #",
    width: "10rem",
    align: "center",
    dataIndex: "custom_id",
  },
  {
    title: "Supplier Name",
    width: "15rem",
    align: "center",
    dataIndex: "supplier_name",
  },
  {
    title: "Contact Name",
    width: "15rem",
    align: "center",
    dataIndex: "contact_name",
  },
  {
    title: "Contact No.",
    width: "15rem",
    align: "center",
    dataIndex: "contact_no",
    render: (contact_no) => <div>{mobileFormat(contact_no)}</div>,
  },
];
