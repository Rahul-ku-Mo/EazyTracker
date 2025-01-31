import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Building2,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Inbox,
  BrainCircuit,
  BarChart,
  type LucideIcon,
} from "lucide-react";
import Cookies from "js-cookie";
import { useQueryClient } from "@tanstack/react-query";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Button } from "../../components/ui/button";
import { AppSidebar } from "../../components/app-sidebar";
import { cn } from "../../lib/utils";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "../../components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../components/ui/breadcrumb";
import { Separator } from "../../components/ui/separator";

interface SidebarItemProps {
  icon: LucideIcon;
  text: string;
  active: boolean;
  onClick?: () => void;
  isOpen: boolean;
}

const SidebarItem = ({
  icon: Icon,
  text,
  active,
  onClick,
  isOpen,
}: SidebarItemProps) => {
  return (
    <li>
      <Link
        onClick={onClick}
        to={`/${text.toLowerCase()}`}
        className={cn(
          "flex items-center gap-3 cursor-pointer mx-2 my-1 rounded-lg transition-colors px-3 py-2",
          active
            ? "text-primary bg-primary/10 hover:bg-primary/20"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        )}
      >
        <Icon className="w-5 h-5" />
        {isOpen && (
          <span className="text-sm font-medium capitalize">{text}</span>
        )}
      </Link>
    </li>
  );
};

const SIDEBAR_ITEMS = [
  { icon: BarChart, text: "Analysis", id: "analysis" },
  { icon: Building2, text: "organization", id: "organization" },
  { icon: Inbox, text: "conversation", id: "conversation" },
  { icon: ClipboardList, text: "boards", id: "boards" },
  { icon: BrainCircuit, text: "Generative AI", id: "genai" },
] as const;

// const AppSidebar = () => {
//   const { pathname } = useLocation();
//   const navigate = useNavigate();
//   const queryClient = useQueryClient();

//   const handleLogout = () => {
//     Cookies.remove("accessToken");
//     navigate("/auth");
//     queryClient.clear();
//   };

//   return (
//     <aside className="fixed top-0 left-0 z-30 h-screen border-r bg-background">
//       <ScrollArea className="flex-grow">
//         <nav className="p-4">
//           <ol className="flex flex-col space-y-1 list-none">
//             {SIDEBAR_ITEMS.map((item) => (
//               <SidebarItem
//                 key={item.id}
//                 icon={item.icon}
//                 text={item.text}
//                 active={pathname.split("/")[1] === item.text.toLowerCase()}
//                 isOpen={true}
//               />
//             ))}
//           </ol>
//         </nav>
//       </ScrollArea>
//     </aside>
//   );
// };


export { MainLayout, AppSidebar };
