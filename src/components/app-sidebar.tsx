import * as React from "react";
import {
  Inbox,
  SquareTerminal,
  Settings2,
  CreditCard,
  Star,
  Box,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { TeamSwitcher } from "./team-switcher";
import { TrialStatusIndicator } from "./TrialStatusIndicator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "./ui/sidebar";
import { useUser } from "../hooks/useQueries";
import Cookies from "js-cookie";

import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

// Favorites navigation component
const NavFavorites = ({ favoriteWorkspaces }: { favoriteWorkspaces: any[] }) => {
  const navigate = useNavigate();

  const { state } = useSidebar();
  
  if (!favoriteWorkspaces || favoriteWorkspaces.length === 0) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel className="flex items-center gap-2 text-[13px] leading-[1.2]">
          <Star className="h-4 w-4" />
          Favorites
        </SidebarGroupLabel>
        <div className={cn(state === "collapsed" ? "hidden" : "block px-2 py-1 text-[13px] leading-[1.2] text-muted-foreground")}>
          No favorite workspaces yet
        </div>
      </SidebarGroup>
    );
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="flex items-center gap-2">
        <Star className="h-4 w-4" />
        Favorites
      </SidebarGroupLabel>
      <SidebarMenu>
        {favoriteWorkspaces.map((workspace) => (
          <SidebarMenuItem key={workspace.id}>
            <SidebarMenuButton
              onClick={() => navigate(`/workspace/board/${workspace.id}`)}
              className="flex items-center gap-2 text-[13px] leading-[1.2]"
            >
              <div 
                className="w-4 h-4 rounded-sm" 
                style={{ backgroundColor: workspace.colorValue }}
              />
              <span className="truncate">{workspace.title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
};

const getNavigationData = (isAdmin: boolean, pathname: string) => {
  const baseNavigation = [
    {
      title: "Workspaces",
      url: "/workspace",
      icon: SquareTerminal,
      isActive: pathname.includes("/workspace"),
    },
    {
      title: "Projects",
      url: "/projects",
      icon: Box,
      isActive: pathname.includes("/projects"),
    },
    {
      title: "Notifications",
      url: "/inbox",
      icon: Inbox,
      isActive: pathname.includes("/inbox"),
    },
  ];

  // Only add billing section for admin users
  if (isAdmin) {
    baseNavigation.push({
      title: "Billing & Plans",
      url: "/billing",
      icon: CreditCard,
      isActive: pathname.includes("/billing"),
    });
  }

  baseNavigation.push({
    title: "Manage Team",
    url: "/team/management",
    icon: Settings2,
    isActive: pathname.includes("/team/management"),
  });

  return {
    navMain: baseNavigation,
  };
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const accessToken = Cookies.get("accessToken") || "";
  const { data: userData } = useUser(accessToken);
  const { role } = useContext(AuthContext);

  const { state } = useSidebar();
  
  // Check if user is admin
  const isAdmin = role === 'ADMIN';
  const pathname = useLocation().pathname;
  const navigationData = getNavigationData(isAdmin, pathname);


  
  const { data: teamData } = useQuery({
    queryKey: ['team'],
    queryFn: async () => {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/teams`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      return response.data.data;
    },
    enabled: !!accessToken
  });

  // Fetch favorite workspaces
  const { data: favoriteWorkspaces } = useQuery({
    queryKey: ['favoriteWorkspaces'],
    queryFn: async () => {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/workspaces/favorites`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      return response.data.data;
    },
    enabled: !!accessToken
  });


  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {teamData && <TeamSwitcher teams={teamData} />}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navigationData.navMain} />
        <NavFavorites favoriteWorkspaces={favoriteWorkspaces || []} />
        <div className={cn(state === "collapsed" ? "hidden" : "block px-3")}>
          <TrialStatusIndicator />
        </div>
      </SidebarContent>

      <SidebarFooter>
        {userData && <NavUser user={{
          username: userData.username,
          email: userData.email,
          imageUrl: userData.imageUrl || null
        }} />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
