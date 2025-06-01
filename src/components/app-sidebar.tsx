import * as React from "react";
import {
  //Inbox,
  SquareTerminal,
  Eye,
  EyeOff,
  Copy,
  CheckCircle,
  Settings2,
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
} from "./ui/sidebar";
import { useUser } from "../hooks/useQueries";
import Cookies from "js-cookie";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
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
    // {
    //   title: "Team Chat",
    //   url: "#",
    //   icon: Inbox,
    //   items: [
    //     {
    //       title: "Inbox",
    //       url: "/conversation/inbox",
    //     },
    //     {
    //       title: "Meetings",
    //       url: "/conversation/meetings",
    //     },
    //     {
    //       title: "Settings",
    //       url: "/conversation/settings",
    //     },
    //   ],
    // },
    {
      title: "Manage Team",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Members",
          url: "/team/members",
        },
        {
          title: "Settings",
          url: "/setting/account",
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


  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {teamData && <TeamSwitcher teams={teamData} />}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <div className={`p-4 border rounded-lg dark:bg-zinc-800/90 shadow-md m-2 ${state === "collapsed" ? "hidden" : ""}`}>
        {teamData?.joinCode && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-black dark:text-white gt-walsheim-font">Invite Code</span>
              <button 
                type="button"
                onClick={toggleJoinCode}
                className="text-xs text-black dark:text-white/70 hover:text-black dark:hover:text-white transition-colors"
                aria-label={showJoinCode ? "Hide join code" : "Show join code"}
              >
                {showJoinCode ? 
                  <EyeOff className="size-4" /> : 
                  <Eye className="size-4" />
                }
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm text-black dark:text-white">
                {showJoinCode ? teamData.joinCode : "••••••"}
              </span>
              {showJoinCode && (
                <button
                  type="button"
                  onClick={() => copyToClipboard(teamData.joinCode)}
                  className="text-xs text-black dark:text-white/70 hover:text-black dark:hover:text-white transition-colors ml-2"
                  aria-label="Copy join code"
                >
                  {copied ? <CheckCircle className="size-4" /> : <Copy className="size-4" />}
                </button>
              )}
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
