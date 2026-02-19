"use client";

import Image from "next/image";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "next-themes";

export function MobileHeader() {
  const { resolvedTheme } = useTheme();

  return (
    <header className="flex items-center h-12 px-3 border-b border-border shrink-0 md:hidden">
      <SidebarTrigger className="h-11 w-11 flex items-center justify-center -ml-1" />
      <Image
        src={resolvedTheme === "dark" ? "/traza-logo.png" : "/traza-logo-light.png"}
        alt="Traza"
        width={24}
        height={24}
        className="ml-1 h-6 w-6 object-contain"
      />
      <span className="ml-1.5 text-sm font-semibold truncate">
        Traza Training
      </span>
      <div className="ml-auto">
        <ThemeToggle />
      </div>
    </header>
  );
}
