import * as React from "react";
import {
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  Inbox,
  SquareTerminal,
} from "lucide-react";

import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { TeamSwitcher } from "./team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
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
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Workspaces",
          url: "/boards",
        },
        {
          title: "Planner",
          url: "/planner",
        },
      ],
    },
    {
      title: "Team Chat",
      url: "#",
      icon: Inbox,
      items: [
        {
          title: "Inbox",
          url: "/conversation/inbox",
        },
        {
          title: "Meetings",
          url: "/conversation/meetings",
        },
        {
          title: "Settings",
          url: "/conversation/settings",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const accessToken = Cookies.get("accessToken") || "";
  const { data: userData } = useUser(accessToken);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
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
