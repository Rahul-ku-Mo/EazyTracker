import * as React from "react";
import { Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

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
import { useTeam } from "@/context/TeamContext";
import {
  BillingIcon,
  TeamManagementIcon,
  InboxIcon,
  ProjectIcon,
} from "@/_components/shared/svg/SidebarIcons";
import { getFavoriteWorkspaces } from "@/apis/WorkspaceApis";

// Favorites navigation component
const NavFavorites = ({
  favoriteWorkspaces,
}: {
  favoriteWorkspaces: any[];
}) => {
  const navigate = useNavigate();
  const { state } = useSidebar();

  if (!favoriteWorkspaces || favoriteWorkspaces.length === 0) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel className="flex items-center gap-2 text-sm">
          <Star className="h-4 w-4" />
          Favorites
        </SidebarGroupLabel>
        <div
          className={cn(
            state === "collapsed"
              ? "hidden"
              : "block px-2 py-1 text-sm text-muted-foreground"
          )}
        >
          No favorite workspaces yet
        </div>
      </SidebarGroup>
    );
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="flex items-center gap-2">
        <Star className="h-4 w-4 shrink-0" />
        Favorites
      </SidebarGroupLabel>
      <SidebarMenu>
        {favoriteWorkspaces.map((workspace) => (
          <SidebarMenuItem key={workspace.slug}>
            <SidebarMenuButton
              onClick={() =>
                navigate(`/projects/${workspace.project?.slug ?? ""}/workspace/${workspace.slug}`)
              }
              className="flex items-center gap-2 text-sm"
            >
              <div
                className="h-4 w-4 rounded-sm flex-shrink-0"
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

const getNavigationData = (
  isAdmin: boolean,
  pathname: string,
) => {
  const baseNavigation = [
    {
      title: "Projects",
      url: "/projects",
      icon: ProjectIcon,
      isActive: pathname.includes("/projects"),
    },
    {
      title: "Inbox",
      url: "/inbox",
      icon: InboxIcon,
      isActive: pathname.includes("/inbox"),
    },
  ];

  // Only add billing and team management sections for admin users
  if (isAdmin) {
    baseNavigation.push({
      title: "Billing & Plans",
      url: "/billing",
      icon: BillingIcon,
      isActive: pathname.includes("/billing"),
    });

    baseNavigation.push({
      title: "Manage Team",
      url: "/team/management",
      icon: TeamManagementIcon,
      isActive: pathname.includes("/team/management"),
    });
  }

  return {
    navMain: baseNavigation,
  };
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const accessToken = Cookies.get("accessToken") || "";
  const { data: userData } = useUser(accessToken);
  const { role } = useContext(AuthContext);

  const { currentTeam } = useTeam();

  const { state } = useSidebar();

  // Check if user is admin
  const isAdmin = role === "ADMIN";
  const pathname = useLocation().pathname;
  const navigationData = getNavigationData(isAdmin, pathname);

  // Fetch favorite workspaces
  const { data: favoriteWorkspaces } = useQuery({
    queryKey: ["favoriteWorkspaces"],
    queryFn: getFavoriteWorkspaces,
    enabled: !!accessToken,
  });

  // Show TeamSwitcher if we have teams, or if we have a current team
  // For debugging, let's show it always
  const shouldShowTeamSwitcher = true; // allTeams.length > 0 || currentTeam;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {shouldShowTeamSwitcher && (
          <TeamSwitcher team={currentTeam || undefined} />
        )}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navigationData.navMain} />
        <NavFavorites favoriteWorkspaces={favoriteWorkspaces || []} />
        {/* Only show trial status indicator for admin users */}
        {isAdmin && (
          <div className={cn(state === "collapsed" ? "hidden" : "block px-3")}>
            <TrialStatusIndicator />
          </div>
        )}
      </SidebarContent>

      <SidebarFooter>
        {userData && (
          <NavUser
            user={{
              username: userData.username,
              email: userData.email,
              imageUrl: userData.imageUrl || null,
            }}
          />
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
