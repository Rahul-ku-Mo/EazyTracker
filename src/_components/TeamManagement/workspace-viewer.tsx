import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Workspace } from "@/apis/WorkspaceApis";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Link as LinkIcon,
  Mail,
  UserMinus,
  SquareKanban,
  MoreVertical,
} from "lucide-react";
import {
  InviteUserIcon,
  AccessLevelIcon,
  MemberIcon,
} from "../shared/svg/SharedIcons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export const WorkspaceViewer = ({
  selectedProject,
  projectWorkspaces,
  teamMembers = [],
  currentUser,
  onUpdatePermissions,
  onRemoveFromWorkspace,
  addToWorkspaceMutation,
}: {
  selectedProject: string;
  projectWorkspaces: Workspace[];
  teamMembers?: any[];
  currentUser?: any;
  onUpdatePermissions?: (
    userId: string,
    workspaceId: number,
    role: "ADMIN" | "MEMBER"
  ) => void;
  onRemoveFromWorkspace?: (userId: string, workspaceId: number) => void;
  addToWorkspaceMutation?: any;
}) => {
  const { toast } = useToast();

  console.log("ProjectWorkspaces" ,projectWorkspaces)

  return (
    <>
      {/* Workspace Permissions Section - Only show workspaces for selected project */}
      {selectedProject &&
        selectedProject !== "N/A" &&
        projectWorkspaces &&
        projectWorkspaces?.length > 0 && (
          <div className="space-y-4 mt-8">
            <div className="flex items-center gap-2 mb-4">
              <SquareKanban className="w-5 h-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Workspace Permissions</h3>
              <Badge variant="outline" className="ml-2">
                {projectWorkspaces?.length}{" "}
                {projectWorkspaces.length === 1 ? "Workspace" : "Workspaces"}
              </Badge>
            </div>

            {projectWorkspaces?.map((workspace: Workspace) => (
              <Card key={workspace.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <SquareKanban
                        className="w-4 h-4"
                        style={{ color: workspace.colorValue }}
                      />
                      {workspace.title}
                    </CardTitle>

                    {/* Add Users to Workspace Button */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <InviteUserIcon className="w-4 h-4" />
                          Add User
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>
                            Add Users to {workspace.title}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Select users to add:</Label>
                            {teamMembers
                              .filter(
                                (member: any) =>
                                  !member.boardAccess.some(
                                    (access: any) =>
                                      access.board.id === workspace.id
                                  )
                              )
                              .map((member: any) => (
                                <div
                                  key={member.id}
                                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                                  onClick={() => {
                                    addToWorkspaceMutation?.mutate({
                                      userId: member.id,
                                      workspaceId: workspace.id,
                                      role: "MEMBER",
                                    });
                                  }}
                                >
                                  <div className="flex items-center gap-3">
                                    <Avatar className="size-6">
                                      <AvatarImage src={member.imageUrl} />
                                      <AvatarFallback className="text-[9px] border font-semibold">
                                        {member?.name
                                          ?.split(" ")
                                          .map((n: string) => n[0])
                                          .join("") ||
                                          member?.email
                                            ?.charAt(0)
                                            .toUpperCase() ||
                                          "U"}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="font-medium text-sm">
                                        {member.name || member.email}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {member.department || "No department"}
                                      </div>
                                    </div>
                                  </div>
                                  <Button size="sm">
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                            {teamMembers.filter(
                              (member: any) =>
                                !member.boardAccess.some(
                                  (access: any) =>
                                    access.board.id === workspace.id
                                )
                            ).length === 0 && (
                              <p className="text-sm text-muted-foreground text-center py-4">
                                All team members already have access to this
                                workspace
                              </p>
                            )}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader className="bg-muted sticky top-0 z-10">
                      <TableRow>
                        <TableHead className="text-sm">
                          <div className="flex items-center gap-2">
                            <MemberIcon className="h-4 w-4" />
                            Member
                          </div>
                        </TableHead>
                        <TableHead className="text-sm">
                          <div className="flex items-center justify-center">
                            <AccessLevelIcon className="h-4 w-4 mr-1.5" />
                            Access Level
                          </div>
                        </TableHead>
                        <TableHead className="text-sm">
                          <div className="flex items-center justify-center">
                            Actions
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teamMembers
                        .filter((member: any) =>
                          member.boardAccess.some(
                            (access: any) => access.board.id === workspace.id
                          )
                        )
                        .map((member: any) => {
                          const boardAccess = member.boardAccess.find(
                            (access: any) => access.board.id === workspace.id
                          );
                          return (
                            <TableRow key={`${workspace.id}-${member.id}`}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="size-6">
                                    <AvatarImage src={member.imageUrl} />
                                    <AvatarFallback className="text-[9px] border font-semibold">
                                      {member?.name
                                        ?.split(" ")
                                        .map((n: string) => n[0])
                                        .join("") ||
                                        member?.email
                                          ?.charAt(0)
                                          .toUpperCase() ||
                                        "U"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium text-sm">
                                    {member.name || member.email}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center justify-center">
                                  <Badge
                                    variant="outline"
                                    className="text-muted-foreground px-1.5"
                                  >
                                    {boardAccess?.role}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center justify-center">
                                  {currentUser?.role === "ADMIN" &&
                                    member.id !== currentUser?.id && (
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                                            size="icon"
                                          >
                                            <MoreVertical className="h-4 w-4" />
                                            <span className="sr-only">
                                              Open menu
                                            </span>
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                          align="end"
                                          className="w-40"
                                        >
                                          <DropdownMenuLabel>
                                            Workspace Actions
                                          </DropdownMenuLabel>
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem
                                            className="text-xs"
                                            onClick={() =>
                                              onUpdatePermissions?.(
                                                member.id,
                                                workspace.id,
                                                boardAccess?.role === "ADMIN"
                                                  ? "MEMBER"
                                                  : "ADMIN"
                                              )
                                            }
                                          >
                                            <AccessLevelIcon className="mr-2 h-4 w-4" />
                                            Make{" "}
                                            {boardAccess?.role === "ADMIN"
                                              ? "Member"
                                              : "Admin"}
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            className="text-xs"
                                            onClick={() => {
                                              navigator.clipboard.writeText(
                                                `${window.location.origin}/workspaces/${workspace.id}`
                                              );
                                              toast({
                                                title: "Workspace link copied",
                                                description:
                                                  "Workspace link has been copied to clipboard",
                                              });
                                            }}
                                          >
                                            <LinkIcon className="mr-2 h-4 w-4" />
                                            Copy Workspace Link
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            className="text-xs"
                                            onClick={() => {
                                              const subject = `Workspace Access: ${workspace.title}`;
                                              const body = `You have ${boardAccess?.role?.toLowerCase()} access to the workspace "${workspace.title}". You can access it here: ${window.location.origin}/workspaces/${workspace.id}`;
                                              window.open(
                                                `mailto:${member.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
                                              );
                                            }}
                                          >
                                            <Mail className="mr-2 h-4 w-4" />
                                            Send Access Email
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem
                                            className="text-destructive text-xs"
                                            onClick={() =>
                                              onRemoveFromWorkspace?.(
                                                member.id,
                                                workspace.id
                                              )
                                            }
                                          >
                                            <UserMinus className="mr-2 h-4 w-4" />
                                            Remove from Workspace
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    )}
                                  {member.id === currentUser?.id && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      You
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

      {/* Show message when project has no workspaces */}
      {selectedProject &&
        selectedProject !== "N/A" &&
        projectWorkspaces &&
        projectWorkspaces?.length === 0 && (
          <Card className="mt-8">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <SquareKanban className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-base font-semibold mb-2">
                  No Workspaces Yet
                </h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  This project doesn't have any workspaces yet. Create a
                  workspace to organize your work within this project.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
    </>
  );
};
