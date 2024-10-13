"use client";

import React from "react";
import { motion } from "framer-motion";

export default function Page(props: any) {
  return (
    <div className="p-[5%] h-full">
      <motion.div
        variants={{
          enter: {
            x: 0,
            opacity: 1,
          },
          exit: {
            x: -20,
            opacity: 0,
          },
        }}
        key="heading"
      >
        Heading
      </motion.div>
      <motion.div
        variants={{
          enter: {
            x: 0,
            opacity: 1,
          },
          exit: {
            x: -20,
            opacity: 0,
          },
        }}
        key="sub-heading"
      >
        Sub Heading
      </motion.div>
    </div>
  );
}
