"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
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
import { BookOpen, Brain, Target, Settings } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

const NAV_ITEMS = [
  {
    href: "/domain",
    label: "Domain Knowledge",
    icon: BookOpen,
    description: "Freight forwarding fundamentals",
  },
  {
    href: "/framework",
    label: "Mental Framework",
    icon: Brain,
    description: "5-step problem solving",
  },
  {
    href: "/simulation",
    label: "Scenario Simulation",
    icon: Target,
    description: "Practice work trials",
  },
] as const;

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/20 text-primary font-bold text-sm">
            T
          </div>
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
            {NAV_ITEMS.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center justify-between px-2 py-1">
          <UserButton afterSignOutUrl="/sign-in" />
          <Link href="/settings" className="p-2 rounded-md hover:bg-accent">
            <Settings className="h-4 w-4" />
          </Link>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
