"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";

export function MobileHeader() {
  return (
    <header className="flex items-center h-12 px-3 border-b border-border shrink-0 md:hidden">
      <SidebarTrigger className="h-11 w-11 flex items-center justify-center -ml-1" />
      <span className="ml-1 text-sm font-semibold truncate">
        Traza Training
      </span>
    </header>
  );
}
