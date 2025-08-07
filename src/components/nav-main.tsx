"use client";

import { SVGProps } from "react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
 
} from "./ui/sidebar";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: (props: SVGProps<SVGSVGElement>) => JSX.Element;
    isActive?: boolean;
  }[];
}) {
  return (
    <SidebarGroup className="flex flex-col h-full">
      <SidebarGroupContent>
        <SidebarMenu className="flex-1">
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={item.isActive} className="data-[active=true]:bg-zinc-900 data-[active=true]:text-white dark:data-[active=true]:bg-zinc-700 dark:data-[active=true]:text-white font-medium">
                <a href={item.url} className="flex items-center gap-2 text-sm">
                  {item.icon && <item.icon className="h-4 w-4" />}
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
