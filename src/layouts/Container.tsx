import React from "react";

import { AppSidebar } from "../components/app-sidebar";
import { SidebarInset, SidebarProvider } from "../components/ui/sidebar";

import AppHeader from "../components/app-header";
import { cn } from "../lib/utils";

type ContainerProps = {
  background?: string;
  children: React.ReactNode;
  fwdClassName?: string;
  title?: string;
};

const MainLayout = ({
  background,
  children,
  fwdClassName,
  
}: ContainerProps) => {
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <AppHeader />
          <main
            className={cn(
              background,
              fwdClassName,
              "flex flex-col flex-1 gap-4 px-4 py-2 pt-0","overflow-y-hidden"
            )}
          >
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
};

export default MainLayout;
