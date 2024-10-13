import { Layout, SiderProps } from "antd";
import { twMerge } from "tailwind-merge";
import Drawer from "@components/commons/Drawer";

const { Sider: AntdSider } = Layout;

export default function Sider({
  onCloseDrawer,
  isDrawerOpen,
  ...rest
}: SiderProps & {
  onCloseDrawer: () => void;
  isDrawerOpen: boolean;
}) {
  return (
    <>
      <Drawer
        rootClassName="md:hidden"
        placement="left"
        open={isDrawerOpen}
        onClose={onCloseDrawer}
        getContainer={() => document.body}
      >
        {rest.children}
      </Drawer>
      <AntdSider
        {...rest}
        className={twMerge("max-md:hidden", rest.className)}
      />
    </>
  );
}
