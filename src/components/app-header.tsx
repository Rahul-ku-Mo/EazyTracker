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
import { ReactNode } from "react";

interface AppHeaderProps {
  children?: ReactNode;
}

const generateBreadcrumbLinks = (pathArray: Array<string>) => {
  return pathArray.map((_path, index) => {
    const link = index > 0 &&`/${pathArray.slice(0, index + 1).join("/")}`;

    return { link, label: _path };
  });
};

const AppHeader = ({ children }: AppHeaderProps) => {
  const { pathname } = useLocation();
  const pathArray = pathname.split("/").filter((path) => path !== "");

  const breadcrumbLinks = generateBreadcrumbLinks(pathArray);

  return (
    <header className="flex h-12 bg-sidebar shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-4 mr-2" />

        <Breadcrumb>
          <BreadcrumbList className="flex items-center">
            {breadcrumbLinks.map(({ link, label }, index) => (
              <BreadcrumbItem key={index} className="inline-flex items-center font-semibold text-xs">
                {index > 0 && <BreadcrumbSeparator />}
                {link ? (
                  <BreadcrumbLink href={link as string} className="">
                    {label.charAt(0).toUpperCase() + label.slice(1).toLowerCase()}
                  </BreadcrumbLink>
                ) : (
                  <span className="capitalize">{label}</span>
                )}
              </BreadcrumbItem>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center pr-2">
        {/* Custom children elements (like settings button) */}

        {/* Default header elements */}
        <NotificationCenter />
        <ModeToggle />
        {children}
      </div>
    </header>
  );
};

export default AppHeader;
