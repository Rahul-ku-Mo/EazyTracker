import * as React from "react";
import {
  Settings,
  Camera,
  X,
  ZoomIn,
  Settings2,
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
import { uploadImageToS3 } from "../_components/Card/_editor/Plugins/CopyImagePlugin";
import { useTeam } from "@/context/TeamContext";
import { LabelIcon } from "@/_components/shared/svg/SharedIcons";

type Team = {
  id: string;
  name: string;
  joinCode?: string;
  captainId: string;
  teamImageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  captain: {
    id: string;
    name: string;
    email: string;
    imageUrl?: string | null;
  };
  members: Array<{
    id: string;
    name: string;
    email: string;
    imageUrl?: string | null;
  }>;
  bannerImage?: string;
};

export function TeamSwitcher({ team }: { team?: Team }) {
  const accessToken = Cookies.get("accessToken") || "";
  const { data: userData } = useUser(accessToken);

  // Get current team from context
  const { currentTeam } = useTeam();

  // Use the current team from context or fall back to the provided team
  const [activeTeam, setActiveTeam] = React.useState<Team | null>(
    currentTeam || team || null
  );

  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Form states
  const [teamName, setTeamName] = React.useState(activeTeam?.name || "");
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [teamPhoto, setTeamPhoto] = React.useState(
    activeTeam?.teamImageUrl || ""
  );

  //Image Viewing States
  const [isImageModalOpen, setIsImageModalOpen] = React.useState(false);
  const [imageLoading, setImageLoading] = React.useState(false);

  const copyTeamLink = () => {
    if (!activeTeam) return;
    const teamLink = `${window.location.origin}/join/${
      activeTeam.joinCode || "team"
    }`;
    navigator.clipboard.writeText(teamLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTeamPhotoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageLoading(true);
    console.log("Uploading team photo:", file);

    try {
      const url = await uploadImageToS3(file as File);
      console.log("Uploaded image to S3:", url);

      if (url) {
        setTeamPhoto(url);

        //Update the team photo in the database
        const response = await fetch(`${import.meta.env.VITE_API_URL}/teams`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ teamImageUrl: url, name: teamName }),
        });

        if (response.ok) {
          console.log("Team photo updated successfully");
        } else {
          console.error("Failed to update team photo");
        }
      }
    } catch (error) {
      console.error("Error uploading team photo:", error);
    } finally {
      setImageLoading(false);
    }
  };

  const handleSaveTeamName = async () => {
    if (!activeTeam) return;
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
        setActiveTeam((prev: Team | null) =>
          prev ? { ...prev, name: data.data.name } : null
        );
        setIsEditingName(false);
        // Optional: Show success message
        console.log("Team name updated successfully");
      } else {
        const errorData = await response.json();
        console.error("Failed to update team name:", errorData.message);
        // Reset to original name on error
        setTeamName(activeTeam.name || "");
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

  // Sync with current team from context
  React.useEffect(() => {
    if (currentTeam && currentTeam.id !== activeTeam?.id) {
      setActiveTeam(currentTeam);
      setTeamName(currentTeam.name);
      setTeamPhoto(currentTeam.teamImageUrl || "");
    }
  }, [currentTeam, activeTeam]);

  // Don't render if no team is available
  if (!activeTeam) {
    return null;
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="flex items-center justify-center rounded-lg aspect-square size-8 bg-sidebar-primary text-sidebar-primary-foreground">
                  {teamPhoto ? (
                    <img
                      src={teamPhoto}
                      alt="Team photo"
                      className="size-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="size-full text-white bg-emerald-600 text-lg font-bold rounded-md flex items-center justify-center">
                      {activeTeam.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="grid flex-1 text-sm leading-tight text-left">
                  <span className="font-semibold truncate">
                    {activeTeam.name}
                  </span>
                  <span className="text-xs truncate">Free Plan</span>
                </div>
              </SidebarMenuButton>
            </DialogTrigger>

            <DialogContent className="max-w-lg p-0 overflow-hidden border border-white/10 shadow-2xl">
              {/* Glass background container */}
              <div className="relative bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl">
                {/* Default Banner Section */}
                <div className="relative h-24 bg-gradient-to-r from-zinc-200 to-zinc-100 dark:from-zinc-800 dark:to-zinc-700">
                  {activeTeam.bannerImage && (
                    <img
                      src={activeTeam.bannerImage}
                      alt="Team banner"
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-zinc-200/80 to-zinc-100/80 dark:from-zinc-800/80 dark:to-zinc-700/80 backdrop-blur-sm" />
                </div>

                <div className="p-6">
                  {/* Team Photo and Header */}
                  <div className="flex items-start gap-4 -mt-[4.5rem] relative z-10">
                    <div className="relative group">
                      <Avatar className="w-16 h-16 border-4 border-white dark:border-zinc-900 shadow-lg cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-xl">
                        <AvatarImage
                          className="object-cover rounded-full bg-center transition-all duration-200 group-hover:brightness-110"
                          src={teamPhoto}
                          alt={activeTeam.name}
                        />
                        <AvatarFallback className="text-lg font-bold bg-emerald-600 text-white">
                          {activeTeam.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      {/* Zoom indicator overlay */}
                      <div
                        onClick={() => {
                          setIsImageModalOpen(true);
                          console.log("Opening image modal");
                        }}
                        className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
                      >
                        <ZoomIn className="size-4 text-white" />
                      </div>

                      {/* Loading overlay */}
                      {imageLoading && (
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                        </div>
                      )}

                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute -bottom-1 -right-1 rounded-full w-6 h-6 p-0 bg-white dark:bg-zinc-800 shadow-md hover:bg-zinc-50 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 transition-all duration-200 hover:scale-110"
                        disabled={imageLoading}
                      >
                        <Camera className="size-3 text-zinc-600 dark:text-zinc-400" />
                        <input
                          type="file"
                          accept="image/*"
                          className="opacity-0 size-5 absolute inset-0 appearance-none cursor-pointer"
                          onChange={handleTeamPhotoUpload}
                          disabled={imageLoading}
                        />
                      </Button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 absolute -bottom-8 right-0">
                      <LabelIcon onClick={copyTeamLink} className="size-4 cursor-pointer" />
                    </div>
                  </div>

                  {/* Team Name Field */}
                  <div className="flex flex-col mt-2">
                    <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                      {activeTeam.name}
                    </p>
                    <p className="text-sm text-zinc-900/50 font-semibold tracking-tight dark:text-zinc-400">
                      {userData?.email}
                    </p>
                  </div>

                  <div className="mt-2">
                    <label
                      htmlFor="teamName"
                      className="text-sm font-medium text-zinc-700 dark:text-zinc-300 tracking-tight hidden"
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
                            setTeamName(activeTeam.name || "");
                          }}
                          className="border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 h-8 px-4"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div
                        className="flex items-center gap-2 cursor-pointer group font-bold w-fit"
                        onClick={() => setIsEditingName(true)}
                      >
                        <span className="text-lg text-emerald-600 dark:text-emerald-400 transition-colors">
                          Change Team
                        </span>
                        <Settings className="size-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </SidebarMenuItem>
      </SidebarMenu>
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent
          isOverlayRequired={false}
          className="max-w-4xl max-h-[90vh] p-0 border-none bg-transparent shadow-none overflow-hidden bg-white"
        >
          <div className="relative flex items-center justify-center min-h-[400px]">
            {/* Close button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 text-white hover:text-white hover:bg-white/20 z-20 rounded-full w-8 h-8 p-0"
              onClick={() => setIsImageModalOpen(false)}
            >
              <X className="size-4" />
            </Button>

            {/* Glass container for image */}
            <div className="relative overflow-hidden bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl max-w-full max-h-full">
              <img
                src={teamPhoto}
                alt="Team photo"
                className="w-full h-auto max-h-[80vh] object-contain block"
                style={{ minWidth: "300px", minHeight: "300px" }}
              />

              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Team info overlay */}
            <div className="absolute bottom-6 left-6 right-6 bg-black/40 backdrop-blur-md rounded-lg p-4 text-white flex justify-between items-center">
              <div className="flex flex-col">
                <h3 className="font-semibold text-lg">{activeTeam.name}</h3>
                <p className="text-sm text-white/80">Team Photo</p>
              </div>
              <div className="flex gap-2">
                <Button variant="default" size="sm" className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    className="opacity-0 size-5 absolute inset-0 w-full h-full appearance-none cursor-pointer"
                    onChange={handleTeamPhotoUpload}
                  />
                  <Settings2 className="size-4" />
                  <span className="text-xs font-semibold">Change Photo</span>
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
