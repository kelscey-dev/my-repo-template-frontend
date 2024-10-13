"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function RouteChangeListener() {
  const pathname = usePathname();
  const [changes, setChanges] = useState(0);

  useEffect(() => {
    console.log(`Route changed to: ${pathname}`);
    setChanges((prev) => prev + 1);
  }, [pathname]);

  return <></>;
}
