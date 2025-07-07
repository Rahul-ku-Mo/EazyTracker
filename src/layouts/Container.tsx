import React from "react";

import { AppSidebar } from "../components/app-sidebar";
import { SidebarInset, SidebarProvider } from "../components/ui/sidebar";

import AppHeader from "../components/app-header";
import { TrialStatusBanner } from "../components/TrialStatusBanner";
import { cn } from "../lib/utils";

type ContainerProps = {
  background?: string;
  children: React.ReactNode;
  fwdClassName?: string;
  title?: string;
  headerChildren?: React.ReactNode;
  viewBar?: React.ReactNode; // New prop for the view bar
};

const MainLayout = ({
  background,
  children,
  fwdClassName,
  headerChildren,
  viewBar,
}: ContainerProps) => {
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <AppHeader>{headerChildren}</AppHeader>
          <TrialStatusBanner />
          {/* View Bar - positioned below header and banner */}
          {viewBar && (
            <div className="border-b border-zinc-200 dark:border-zinc-800">
              {viewBar}
            </div>
          )}
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
