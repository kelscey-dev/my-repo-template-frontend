"use client";
import React from "react";
import { motion } from "framer-motion";
import { usePathname, useSearchParams } from "next/navigation";
import { fadeIn } from "@animations/index";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={{
        enter: {
          ...fadeIn.enter,
          transition: {
            ease: "easeOut",
            duration: 0.3,
            when: "beforeChildren",
            staggerChildren: 0.2,
          },
        },
        exit: fadeIn.exit,
      }}
      initial="exit"
      animate="enter"
      exit="exit"
      className="h-full flex flex-auto"
    >
      {children}
    </motion.div>
  );
}
