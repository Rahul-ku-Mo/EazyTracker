import * as React from "react";
import {
  Inbox,
  SquareTerminal,
  Eye,
  EyeOff,
  Copy,
  CheckCircle,
  Settings2,
  Users,
  Hash,
  CreditCard,
  Star,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { TeamSwitcher } from "./team-switcher";
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
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

// Favorites navigation component
const NavFavorites = ({ favoriteBoards }: { favoriteBoards: any[] }) => {
  const navigate = useNavigate();
  
  if (!favoriteBoards || favoriteBoards.length === 0) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel className="flex items-center gap-2">
          <Star className="h-4 w-4" />
          Favorites
        </SidebarGroupLabel>
        <div className="px-2 py-1 text-xs text-muted-foreground">
          No favorite boards yet
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
        {favoriteBoards.map((board) => (
          <SidebarMenuItem key={board.id}>
            <SidebarMenuButton
              onClick={() => navigate(`/workspace/board/${board.id}`)}
              className="flex items-center gap-2"
            >
              <div 
                className="w-3 h-3 rounded-sm" 
                style={{ backgroundColor: board.colorValue }}
              />
              <span className="truncate">{board.title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
};

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Workspaces",
          url: "/workspace",
        },
      ],
    },
    {
      title: "Inbox",
      url: "#",
      icon: Inbox,
      items: [
        {
          title: "Notifications",
          url: "/inbox",
        },
      ],
    },
    {
      title: "Billing & Plans",
      url: "#",
      icon: CreditCard,
      items: [
        {
          title: "Subscription",
          url: "/workspace/billing",
        },
      ],
    },
    {
      title: "Manage Team",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Team Management",
          url: "/team/management",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const accessToken = Cookies.get("accessToken") || "";
  const { data: userData } = useUser(accessToken);

  const { state } = useSidebar();

  const [showJoinCode, setShowJoinCode] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const toggleJoinCode = () => {
    setShowJoinCode(!showJoinCode);
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
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

  // Fetch favorite boards
  const { data: favoriteBoards } = useQuery({
    queryKey: ['favoriteBoards'],
    queryFn: async () => {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/boards/favorites`, {
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
        <NavMain items={data.navMain} />
        <NavFavorites favoriteBoards={favoriteBoards || []} />
      </SidebarContent>
      
      {/* Enhanced Team Code Section */}
      <div className={cn(
        "transition-all duration-300 ease-in-out",
        state === "collapsed" ? "hidden" : "block"
      )}>
        {teamData?.joinCode && (
          <div className="m-3 mb-4">
            <div className={cn(
              "relative overflow-hidden rounded-xl",
              "bg-gradient-to-br from-emerald-50 to-green-50",
              "dark:from-zinc-800/50 dark:to-zinc-900/50",
              "border border-emerald-200/50 dark:border-zinc-700/50",
              "backdrop-blur-sm shadow-sm",
              "hover:shadow-md transition-all duration-200"
            )}>
              {/* Header */}
              <div className="flex items-center justify-between p-3 pb-2">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "flex items-center justify-center w-7 h-7 rounded-lg",
                    "bg-emerald-100 dark:bg-emerald-900/30",
                    "text-emerald-600 dark:text-emerald-400"
                  )}>
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-emerald-900 dark:text-emerald-100 gt-walsheim-font">
                      Team Invite
                    </span>
                    <div className="text-xs text-emerald-600/70 dark:text-emerald-300/70">
                      Share with your team
                    </div>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                  Active
                </Badge>
              </div>

              {/* Code Display */}
              <div className="px-3 pb-3">
                <div className={cn(
                  "flex items-center justify-between p-3 rounded-lg",
                  "bg-white/80 dark:bg-zinc-800/80",
                  "border border-emerald-200/30 dark:border-zinc-600/30",
                  "backdrop-blur-sm"
                )}>
                  <div className="flex items-center gap-2 flex-1">
                    <Hash className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                    <span className={cn(
                      "font-mono text-sm font-medium tracking-wider",
                      "text-emerald-900 dark:text-emerald-100",
                      showJoinCode ? "select-all" : ""
                    )}>
                      {showJoinCode ? teamData.joinCode : "••••••••"}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button 
                      type="button"
                      onClick={toggleJoinCode}
                      className={cn(
                        "p-1.5 rounded-md transition-all duration-200",
                        "hover:bg-emerald-100 dark:hover:bg-emerald-900/30",
                        "text-emerald-600 dark:text-emerald-400",
                        "hover:text-emerald-700 dark:hover:text-emerald-300"
                      )}
                      aria-label={showJoinCode ? "Hide join code" : "Show join code"}
                    >
                      {showJoinCode ? 
                        <EyeOff className="w-4 h-4" /> : 
                        <Eye className="w-4 h-4" />
                      }
                    </button>
                    
                    {showJoinCode && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(teamData.joinCode)}
                        className={cn(
                          "p-1.5 rounded-md transition-all duration-200",
                          "hover:bg-green-100 dark:hover:bg-green-900/30",
                          "text-emerald-600 dark:text-emerald-400",
                          "hover:text-green-600 dark:hover:text-green-400",
                          copied && "text-green-600 dark:text-green-400"
                        )}
                        aria-label="Copy join code"
                      >
                        {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Helper Text */}
                {showJoinCode && (
                  <div className="mt-2 text-xs text-emerald-600/70 dark:text-emerald-300/70 text-center">
                    {copied ? "Copied to clipboard!" : "Click to copy and share with team members"}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
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
