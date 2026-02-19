"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { Settings } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { MODULES } from "@/lib/modules";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "next-themes";

export function AppSidebar() {
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <Image
            src={resolvedTheme === "dark" ? "/traza-logo.png" : "/traza-logo-light.png"}
            alt="Traza"
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
          />
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold text-foreground">
              Traza Training
            </span>
            <span className="text-[10px] text-muted-foreground">
              Interview Prep
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Modules</SidebarGroupLabel>
          <SidebarMenu>
            {MODULES.map((mod) => {
              const Icon = mod.icon;
              const isActive = pathname === mod.href;
              return (
                <SidebarMenuItem key={mod.id}>
                  <SidebarMenuButton asChild isActive={isActive} tooltip={mod.label}>
                    <Link href={mod.href}>
                      <Icon className="h-4 w-4" />
                      <span>{mod.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center justify-between px-2 py-1">
          <UserButton afterSignOutUrl="/sign-in" />
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Link href="/settings" className="p-2 rounded-md hover:bg-accent">
              <Settings className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
