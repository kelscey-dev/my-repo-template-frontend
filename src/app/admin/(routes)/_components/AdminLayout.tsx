"use client";
import React from "react";
import { Menu } from "antd";
import type { GetProp, MenuProps } from "antd";

import Layout, { Content } from "antd/es/layout/layout";

import { motion } from "framer-motion";

import { usePathname, useRouter } from "next/navigation";

import { AiFillCaretDown } from "react-icons/ai";

import { CiBoxes } from "react-icons/ci";

import { FaRegChartBar } from "react-icons/fa";

import { IoMdMenu } from "react-icons/io";

import { LiaHandshake } from "react-icons/lia";

import { LuClipboardList, LuReceipt } from "react-icons/lu";

import {
  MdOutlineChecklist,
  MdOutlineSell,
  MdOutlineShoppingCart,
} from "react-icons/md";

import { PiCookingPot } from "react-icons/pi";

import { RxHamburgerMenu } from "react-icons/rx";

import { twMerge } from "tailwind-merge";

import Avatar from "@components/commons/Avatar";

import Button from "@components/commons/Button";

import Dropdown from "@components/commons/Dropdown";

import Header from "@components/commons/Header";

import ImageBlur from "@components/commons/ImageBlur";

import Sider from "@components/commons/Sider";

import { Context } from "@context/AdminProvider";

import { usePostRequest } from "@utils/api/apiRequests";

import { splitUrl } from "@utils/helpers";

import { fadeInSlideUp, fadeInSlideRight } from "../../../../animations/index";

type MenuItem = GetProp<MenuProps, "items">[number];

const menuItems: MenuItem[] = [
  {
    key: "/admin",
    icon: <FaRegChartBar />,
    label: "Dashboard",
  },
  {
    key: "/admin/sales",
    icon: <LuReceipt />,
    label: "Sales",
  },
  {
    key: "/admin/batch-order",
    icon: <PiCookingPot />,
    label: "Batch Order",
  },
  {
    key: "/admin/inventory",
    icon: <CiBoxes />,
    label: "Inventory",
  },
  {
    key: "/admin/purchasing",
    icon: <MdOutlineShoppingCart />,
    label: "Purchasing",
    children: [
      {
        key: "/purchase-order",
        icon: <LuClipboardList />,
        label: "Purchase Order",
      },
      { key: "/suppliers", icon: <LiaHandshake />, label: "Suppliers" },
    ],
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = React.useContext(Context);

  const pathName = usePathname();
  const pathNameArray = splitUrl(pathName);
  const router = useRouter();

  const [isSiderCollapsed, setSiderIsCollapsed] = React.useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  const { mutate: logout, isPending: IsLogoutLoading } = usePostRequest(
    "/api/auth/logout",
    {
      mutationOptions: {
        onSuccess: () => {
          window.location.reload();
        },
      },
    }
  );

  const dropdownItems = React.useMemo(
    () => [
      {
        key: "1",
        label: <div>Logout</div>,
        onClick: () => {
          logout();
        },
      },
    ],
    [logout]
  );

  return (
    <Layout hasSider={true}>
      <Sider
        className="shadow-xl"
        width="20rem"
        collapsible
        trigger={null}
        collapsed={isSiderCollapsed}
        isDrawerOpen={isDrawerOpen}
        onCloseDrawer={() => setIsDrawerOpen(false)}
      >
        <div
          className="max-md:hidden md:absolute top-0 left-full z-10 bg-primary bg-opacity-70 text-white p-2 text-2xl mt-8 cursor-pointer rounded-tr-md rounded-br-md"
          onClick={() => setSiderIsCollapsed((prevState) => !prevState)}
        >
          <RxHamburgerMenu />
        </div>
        <div className="h-auto min-h-full py-8 flex flex-col">
          <ImageBlur
            src={"/images/logo.png"}
            containerClass="w-full h-[6rem] md:h-[8rem]"
            alt="CRM Logo"
            loading="eager"
            priority={true}
            className="px-4"
          />
          <div className="my-12 flex-auto">
            <Menu
              mode="inline"
              items={menuItems}
              selectedKeys={pathNameArray}
              defaultOpenKeys={pathNameArray}
              onClick={(e) => {
                let route = e.keyPath.reverse().join("");

                if (pathName !== route) {
                  router.push(route);
                  setIsDrawerOpen(false);
                }
              }}
              className="!m-0"
            />
          </div>
          <Dropdown
            menu={{ items: dropdownItems }}
            trigger={["click"]}
            overlayStyle={{
              minWidth: "15rem",
            }}
            placement="top"
          >
            <Button type="link" className="!px-4">
              <div className="flex gap-4 items-center justify-center">
                <Avatar
                  src={
                    <ImageBlur
                      src={"/images/profile.jpg"}
                      containerClass="w-full h-full"
                      alt="Photo of Profile"
                      loading="eager"
                      priority={true}
                    />
                  }
                  className="!border-gray-200 !h-[2.5rem] !w-[2.5rem] leading-[normal]"
                />
                <div
                  className={twMerge(
                    "overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-base text-standard-text",
                    isSiderCollapsed ? "max-md:block hidden" : ""
                  )}
                >
                  {profile?.user.first_name} {profile?.user.last_name}
                </div>
                <AiFillCaretDown
                  className={twMerge(
                    "text-primary-500",
                    isSiderCollapsed ? "max-md:block hidden" : ""
                  )}
                />
              </div>
            </Button>
          </Dropdown>
        </div>
      </Sider>
      <Layout>
        <Header className="md:hidden">
          <div className="flex justify-between items-center">
            <Button
              type="link"
              onClick={() => setIsDrawerOpen((prevState) => !prevState)}
            >
              <IoMdMenu className="text-[2.5rem]" />
            </Button>
            <ImageBlur
              src={"/images/logo.png"}
              containerClass="w-full h-[5rem]"
              alt="CRM Logo"
              loading="eager"
              priority={true}
            />
            <div></div>
          </div>
        </Header>
        <Content className="bg-neutral-100">
          <motion.div
            variants={{
              enter: {
                ...fadeInSlideUp.enter,
                transition: {
                  ...fadeInSlideUp.enter.transition,
                  when: "beforeChildren",
                  staggerChildren: 0.2,
                },
              },
              exit: fadeInSlideUp.exit,
            }}
            className="h-full flex flex-auto"
            key={pathName}
          >
            {children}
          </motion.div>
        </Content>
      </Layout>
    </Layout>
  );
}
