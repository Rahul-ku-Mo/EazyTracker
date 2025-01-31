import React from "react";

import { AppSidebar } from "../components/app-sidebar";
import { SidebarInset, SidebarProvider } from "../components/ui/sidebar";

import AppHeader from "../components/app-header";
import { cn } from "../lib/utils";

type ContainerProps = {
  background?: string;
  children: React.ReactNode;
  fwdClassName?: string;
  title: string;
};

const MainLayout = ({
  background,
  children,
  fwdClassName,
  title,
}: ContainerProps) => {
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <AppHeader title={title} />
          <main
            className={cn(
              background,
              fwdClassName,
              "flex flex-col flex-1 gap-4 p-4 pt-0"
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
