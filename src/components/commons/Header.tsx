import { Layout, LayoutProps } from "antd";

const { Header: AntdHeader } = Layout;

export default function Header(props: LayoutProps) {
  return <AntdHeader {...props} />;
}
