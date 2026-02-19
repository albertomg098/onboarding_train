"use client";

import { usePathname } from "next/navigation";
import { useSidebar } from "@/components/ui/sidebar";
import { useEffect, useRef } from "react";

export function SidebarCloseOnNav() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (prevPathname.current !== pathname) {
      setOpenMobile(false);
      prevPathname.current = pathname;
    }
  }, [pathname, setOpenMobile]);

  return null;
}
