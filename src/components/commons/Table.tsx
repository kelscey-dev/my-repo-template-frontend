import { Table as AntdTable, TableProps } from "antd";

export default function Table({ ...props }: TableProps) {
  return <AntdTable {...props} />;
}
