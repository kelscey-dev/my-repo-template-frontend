"use client";
import React from "react";

import Layout, { Content } from "antd/es/layout/layout";

import { motion } from "framer-motion";

import { usePathname } from "next/navigation";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathName = usePathname();

  return (
    <Layout>
      <Content>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            type: "spring",
            bounce: 0.5,
          }}
          className="h-full flex flex-auto"
          key={pathName}
        >
          {children}
        </motion.div>
      </Content>
    </Layout>
  );
}
