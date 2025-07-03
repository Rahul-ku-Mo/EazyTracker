import * as React from "react";
import {
  GalleryVerticalEnd,
  Settings,
  Camera,
  Copy,
  EllipsisVerticalIcon,
} from "lucide-react";
import Cookies from "js-cookie";

import { Dialog, DialogContent, DialogTrigger } from "../components/ui/dialog";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../components/ui/sidebar";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { useUser } from "../hooks/useQueries";

type Team = {
  name: string;
  id: string;
  joinCode?: string;
  teamPhoto?: string;
  bannerImage?: string;
};

export function TeamSwitcher({ teams }: { teams: Team | Team[] }) {
  const accessToken = Cookies.get("accessToken") || "";
  const { data: userData } = useUser(accessToken);

  // Convert single team to array if not already an array
  const teamArray = Array.isArray(teams) ? teams : [teams];
  const [activeTeam, setActiveTeam] = React.useState<Team>(teamArray[0]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Form states
  const [teamName, setTeamName] = React.useState(activeTeam?.name || "");
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const copyTeamLink = () => {
    const teamLink = `${window.location.origin}/join/${
      activeTeam?.joinCode || "team"
    }`;
    navigator.clipboard.writeText(teamLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTeamPhotoUpload = () => {
    // Placeholder for team photo upload
    console.log("Upload team photo");
  };

  const handleSaveTeamName = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/teams`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ name: teamName }),
      });

      if (response.ok) {
        const data = await response.json();
        // Update the activeTeam state with the new name
        setActiveTeam((prev: Team) => ({ ...prev, name: data.data.name }));
        setIsEditingName(false);
        // Optional: Show success message
        console.log("Team name updated successfully");
      } else {
        const errorData = await response.json();
        console.error("Failed to update team name:", errorData.message);
        // Reset to original name on error
        setTeamName(activeTeam?.name || "");
      }
    } catch (error) {
      console.error("Error updating team name:", error);
      // Reset to original name on error
      setTeamName(activeTeam?.name || "");
    }
  };

  React.useEffect(() => {
    if (activeTeam) {
      setTeamName(activeTeam.name);
    }
  }, [activeTeam]);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex items-center justify-center rounded-lg aspect-square size-8 bg-sidebar-primary text-sidebar-primary-foreground">
                <GalleryVerticalEnd className="size-4" />
              </div>
              <div className="grid flex-1 text-sm leading-tight text-left">
                <span className="font-semibold truncate">
                  {activeTeam?.name}
                </span>
                <span className="text-xs truncate">Free Plan</span>
              </div>
              <EllipsisVerticalIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DialogTrigger>

          <DialogContent className="max-w-lg p-0 overflow-hidden bg-white dark:bg-zinc-900 shadow-none">
            {/* Default Banner Section */}
            <div className="relative h-24 bg-zinc-700 dark:bg-zinc-800">
              {activeTeam?.bannerImage && (
                <img
                  src={activeTeam.bannerImage}
                  alt="Team banner"
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-cyan-700" />
            </div>

            <div className="p-6 space-y-6">
              {/* Team Photo and Header */}
              <div className="flex items-start gap-4 -mt-12 relative z-10">
                <div className="relative">
                  <Avatar className="w-16 h-16 border-4 border-white dark:border-zinc-900 shadow-lg">
                    <AvatarImage
                      src={activeTeam?.teamPhoto}
                      alt={activeTeam?.name}
                    />
                    <AvatarFallback className="text-lg font-bold bg-emerald-600 text-white">
                      {activeTeam?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute -bottom-1 -right-1 rounded-full w-6 h-6 p-0 bg-white dark:bg-zinc-800 shadow-md hover:bg-zinc-50 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-600"
                    onClick={handleTeamPhotoUpload}
                  >
                    <Camera className="size-3 text-zinc-600 dark:text-zinc-400" />
                  </Button>
                </div>

                <div className="flex-1 mt-4">
                  <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                    {activeTeam?.name}
                  </h2>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {userData?.email}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyTeamLink}
                    className="border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <Copy className="size-4" />
                    {copied ? "Copied!" : "Copy Team Link"}
                  </Button>
                </div>
              </div>

              {/* Team Name Field */}
              <div className="space-y-2">
                <label
                  htmlFor="teamName"
                  className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Team Name
                </label>
                {isEditingName ? (
                  <div className="flex gap-2 items-center">
                    <Input
                      id="teamName"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      className="flex-1 border-zinc-300 dark:border-zinc-600 focus:border-emerald-500 dark:focus:border-emerald-400 bg-white dark:bg-zinc-900"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      onClick={handleSaveTeamName}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 px-4"
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setIsEditingName(false);
                        setTeamName(activeTeam?.name || "");
                      }}
                      className="border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 h-8 px-4"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div
                    className="flex items-center gap-2 cursor-pointer group font-bold w-fit rounded-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 px-1.5"
                    onClick={() => setIsEditingName(true)}
                  >
                    <span className="text-lg text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {activeTeam?.name}
                    </span>
                    <Settings className="size-4 text-zinc-400 dark:text-zinc-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition-all" />
                  </div>
                )}
              </div>

              {/* Admin Information */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-row gap-2 items-center">
                  <label
                    htmlFor="adminName"
                    className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 grow"
                  >
                    Name <span className="text-xs text-emerald-800 dark:text-emerald-400">(Admin)</span>
                  </label>
                  <Input
                    id="adminName"
                    value={userData?.username || ""}
                    readOnly
                    className="!max-w-md bg-zinc-100 dark:bg-zinc-800 cursor-not-allowed border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300"
                  />
                </div>
                <div className="flex flex-row gap-2 items-center">
                  <label
                    htmlFor="adminEmail"
                    className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 grow"
                  >
                    Email <span className="text-xs text-emerald-800 dark:text-emerald-400">(Admin)</span>{" "}
                  </label>
                  <Input
                    id="adminEmail"
                    value={userData?.email || ""}
                    readOnly
                    className="!max-w-md bg-zinc-100 dark:bg-zinc-800 cursor-not-allowed border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300"
                  />
                </div>
              </div>

              {/* Action Buttons */}
             
            </div>
          </DialogContent>
        </Dialog>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
