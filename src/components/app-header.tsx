import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { useLocation } from "react-router-dom";
import { ModeToggle } from "./mode-toggle";
import { NotificationCenter } from "../_components/NotificationCenter";
import { OnlineStatus } from "../_components/OnlineStatus";
import { ReactNode } from "react";

interface AppHeaderProps {
  children?: ReactNode;
}

const AppHeader = ({ children }: AppHeaderProps) => {
  const { pathname } = useLocation();
  const pathArray = pathname.split("/").filter((path) => path !== "");

  return (
    <header className="flex h-12 bg-sidebar shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b border-zinc-200 dark:border-zinc-700">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-4 mr-2" />
        
        <Breadcrumb>
          <BreadcrumbList className="flex items-center">
            {pathArray.map((path, index) => (
              <BreadcrumbItem key={index} className="inline-flex items-center">
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbLink href={`/${path}`} className="capitalize">
                  {path.charAt(0).toUpperCase() + path.slice(1)}
                </BreadcrumbLink>
              </BreadcrumbItem>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      
      <div className="flex items-center gap-3 pr-2">
        {/* Custom children elements (like settings button) */}
      
        
        {/* Default header elements */}
        <OnlineStatus />
        <NotificationCenter />
        <ModeToggle />
        {children}
      </div>
    </header>
  );
};

export default AppHeader;
