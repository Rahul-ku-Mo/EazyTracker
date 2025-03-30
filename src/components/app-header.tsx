import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { useLocation } from "react-router-dom";
import { ModeToggle } from "./mode-toggle";
import { ViewToggle } from "./view-toggle";

const AppHeader = () => {
  const { pathname } = useLocation();
  const pathArray = pathname.split("/").filter((path) => path !== "");

  return (
    <header className="flex h-12 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-4 mr-2" />
        
        <Breadcrumb>
          <BreadcrumbList className="flex items-center">
            <BreadcrumbItem className="hidden md:inline-flex items-center">
              <BreadcrumbLink>Dashboard</BreadcrumbLink>
            </BreadcrumbItem>

            {pathArray.length > 0 && (
              <BreadcrumbSeparator className="hidden md:inline-flex" />
            )}

            {pathArray.map((path, index) => (
              <BreadcrumbItem key={index} className="inline-flex items-center">
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbPage className="capitalize">
                  {path.charAt(0).toUpperCase() + path.slice(1)}
                </BreadcrumbPage>
              </BreadcrumbItem>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      
      <div className="flex items-center gap-2 pr-2">
        <ViewToggle />
        <ModeToggle />
      </div>
    </header>
  );
};

export default AppHeader;
