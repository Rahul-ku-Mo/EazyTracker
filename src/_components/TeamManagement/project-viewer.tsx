import React, { useState } from "react";
import {
  Search,
  Plus,
  UserMinus,
  Shield,
  SquareKanban,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getProjectMembersWithAccess,
  grantProjectAccess,
  revokeProjectAccess,
  updateProjectRole,
} from "@/apis/project-permission-api";
import { ProjectIcon } from "../shared/svg/SidebarIcons";
import {
  InviteUserIcon,
} from "../shared/svg/SharedIcons";
import useProjectSlugStore from "@/store/projectSlugStore";
import axios from "axios";
import Cookies from "js-cookie";

interface Project {
  id: string;
  title: string;
  slug: string;
  status: string;
  lead?: {
    name: string;
    email: string;
  };
}

interface ProjectMemberData {
  id: string;
  userId: string;
  name: string;
  email: string;
  imageUrl?: string;
  teamRole: string;
  appRole: string;
  hasProjectAccess: boolean;
  projectRole: string | null;
  projectMemberId: string | null;
}

interface Workspace {
  id: number;
  title: string;
  colorName: string;
  colorValue: string;
  projectId?: string;
}

interface TeamMember {
  id: string;
  name?: string;
  email: string;
  username?: string;
  imageUrl?: string;
  department?: string;
  efficiency?: number;
  isActive?: boolean;
  role: "ADMIN" | "USER";
  boardAccess: {
    board: {
      id: number;
      title: string;
      colorName: string;
      colorValue: string;
    };
    role: "ADMIN" | "MEMBER";
    canEdit: boolean;
  }[];
}

interface ProjectViewerProps {
  projects: Project[];
  workspaces?: Workspace[];
  teamMembers?: TeamMember[];
  currentUser?: TeamMember;
  onUpdatePermissions?: (
    userId: string,
    workspaceId: number,
    role: "ADMIN" | "MEMBER"
  ) => void;
  onRemoveFromWorkspace?: (userId: string, workspaceId: number) => void;
  addToWorkspaceMutation?: any;
}

const ProjectViewer: React.FC<ProjectViewerProps> = ({
  projects,
  workspaces = [],
  teamMembers = [],
  // currentUser,
  // onUpdatePermissions,
  // onRemoveFromWorkspace,
  addToWorkspaceMutation,
}) => {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<"ADMIN" | "MEMBER" | "OBSERVER">("MEMBER");
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [selectedWorkspaceForInvite, setSelectedWorkspaceForInvite] = useState<number | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { updateCurrentProjectSlug } = useProjectSlugStore();
  const accessToken = Cookies.get("accessToken");

  // Fetch all members with their project access status
  const {data: allProjectMembers} = useQuery({
    queryKey: ["project-members-access", selectedProject],
    queryFn: async () => await getProjectMembersWithAccess(selectedProject as string),
    enabled: !!selectedProject && selectedProject !== "N/A"
  })

  // Filter members with and without project access
  const membersWithAccess = allProjectMembers?.filter((member: ProjectMemberData) => member.hasProjectAccess) || [];
  const membersWithoutAccess = allProjectMembers?.filter((member: ProjectMemberData) => !member.hasProjectAccess) || [];
  
  console.log("All members:", allProjectMembers)
  console.log("Members with access:", membersWithAccess)
  console.log("Members without access:", membersWithoutAccess)

  // Grant access mutation
  const grantAccessMutation = useMutation({
    mutationFn: ({
      projectId,
      userId,
      role,
    }: {
      projectId: string;
      userId: string;
      role: "ADMIN" | "MEMBER" | "OBSERVER";
    }) => grantProjectAccess(projectId, userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["project-members-access", selectedProject],
      });
      toast({
        title: "Success",
        description: "Project access granted successfully",
      });
      setShowAddDialog(false);
      setSelectedUserId("");
      setSelectedRole("MEMBER");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to grant access",
        variant: "destructive",
      });
    },
  });

  // Revoke access mutation
  const revokeAccessMutation = useMutation({
    mutationFn: ({
      projectId,
      memberId,
    }: {
      projectId: string;
      memberId: string;
    }) => revokeProjectAccess(projectId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["project-members-access", selectedProject],
      });
      toast({
        title: "Success",
        description: "Project access revoked successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to revoke access",
        variant: "destructive",
      });
    },
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({
      projectId,
      memberId,
      role,
    }: {
      projectId: string;
      memberId: string;
      role: "ADMIN" | "MEMBER" | "OBSERVER";
    }) => updateProjectRole(projectId, memberId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["project-members-access", selectedProject],
      });
      toast({
        title: "Success",
        description: "Role updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update role",
        variant: "destructive",
      });
    },
  });

  // Add to workspace mutation (internal)
  const addToWorkspaceMutationInternal = useMutation({
    mutationFn: async ({
      userId,
      workspaceId,
      role,
    }: {
      userId: string;
      workspaceId: number;
      role: string;
    }) => {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/teams/workspaces/${workspaceId}/members/${userId}`,
        { role },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      queryClient.invalidateQueries({ queryKey: ["team-workspaces"] });
      toast({
        title: "Success",
        description: "User added to workspace successfully",
      });
      setShowInviteDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add user to workspace",
        variant: "destructive",
      });
    },
  });

  
  // Filter workspaces that belong to the selected project
  const projectWorkspaces = workspaces.filter(
    (workspace: Workspace) => workspace.projectId === selectedProject && selectedProject !== "N/A"
  );

  const handleGrantAccess = () => {
    if (!selectedProject || !selectedUserId) return;
    grantAccessMutation.mutate({
      projectId: selectedProject,
      userId: selectedUserId,
      role: selectedRole,
    });
  };

  const handleRevokeAccess = (memberId: string) => {
    if (!selectedProject) return;
    revokeAccessMutation.mutate({
      projectId: selectedProject,
      memberId,
    });
  };

  const handleUpdateRole = (
    memberId: string,
    newRole: "ADMIN" | "MEMBER" | "OBSERVER"
  ) => {
    if (!selectedProject) return;
    updateRoleMutation.mutate({
      projectId: selectedProject,
      memberId,
      role: newRole,
    });
  };

  const handleAddToWorkspace = (userId: string, workspaceId: number, role: string) => {
    const mutation = addToWorkspaceMutation || addToWorkspaceMutationInternal;
    mutation.mutate({
      userId,
      workspaceId,
      role,
    });
  };

  return (
    <div className="space-y-6">
      {/* Project Selection Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ProjectIcon className="size-5 text-muted-foreground" />
              <CardTitle className="text-base font-semibold">Select Project</CardTitle>
            </div>
            {selectedProject && selectedProject !== "N/A" && (
              <Button 
                size="sm" 
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => setShowAddDialog(true)}
              >
                <InviteUserIcon className="size-4" />
                Invite to Project
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Choose a project to view its workspaces and team members
          </p>
          <Select
            value={selectedProject || ""}
            onValueChange={setSelectedProject}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a project to manage permissions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem key="not-available" value="N/A">
                None
              </SelectItem>
              {projects.map((project) => (
                <SelectItem
                  key={project.id}
                  value={project.id}
                  onClick={() => updateCurrentProjectSlug(project.slug)}
                >
                  {project.title}{" "}
                  {project.lead && `(Lead: ${project.lead.name})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

    

      {selectedProject && selectedProject !== "N/A" && (
        <>
          {/* Workspaces Section */}
          <div className="space-y-2">
           
              <h2 className="text-xl font-bold">Workspaces</h2>
            <p className="text-sm text-muted-foreground">
              Organize your team into focused workspaces
            </p>

            {/* Workspace Cards Grid */}
            {projectWorkspaces && projectWorkspaces.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projectWorkspaces.map((workspace: Workspace) => (
                  <Card key={workspace.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="size-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: workspace.colorValue + '20' }}
                          >
                            <SquareKanban 
                              className="size-5" 
                              style={{ color: workspace.colorValue }}
                            />
                          </div>
                          <div>
                            <h3 className="font-bold text-base">{workspace.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {teamMembers.filter((m: any) => 
                                m.boardAccess.some((access: any) => access.board.id === workspace.id)
                              ).length} members
                            </p>
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => {
                          setSelectedWorkspaceForInvite(workspace.id);
                          setShowInviteDialog(true);
                        }}
                      >
                        <InviteUserIcon className="size-4" />
                        Invite to Workspace
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <SquareKanban className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-base font-semibold mb-2">No Workspaces Yet</h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                      This project doesn't have any workspaces yet. Create a workspace to organize your work.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Team Members Section */}
          <div className="space-y-4 mt-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Team Members</h2>
                <p className="text-sm text-muted-foreground">All project members</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, or role..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-80"
                  />
                </div>
                <Badge variant="outline" className="px-3 py-1">
                  {membersWithAccess?.length || 0} members
                </Badge>
              </div>
            </div>

            {/* Team Members List */}
            {membersWithAccess && membersWithAccess?.length > 0 && (
              <div className="space-y-3">
                {membersWithAccess?.map((member: ProjectMemberData) => {
                  const memberWorkspaces = teamMembers.find((tm: any) => tm.id === member.userId)?.boardAccess || [];
                  
                  return (
                    <Card key={member.userId} className="hover:shadow-sm transition-shadow">
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={member.imageUrl} />
                              <AvatarFallback className="font-semibold">
                                {member.name?.substring(0, 2).toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold">{member.name || "Unknown"}</h4>
                              </div>
                              <p className="text-sm text-muted-foreground">{member.email}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-8">
                            <div className="text-right">
                              <div className="text-sm font-medium mb-1">
                                <Badge variant="secondary" className="font-medium">
                                  {member.projectRole || "MEMBER"}
                                </Badge>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {memberWorkspaces.length > 0 
                                  ? memberWorkspaces[0]?.board?.title 
                                  : member.teamRole}
                              </div>
                            </div>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    // Cycle through roles
                                    const roles: ("ADMIN" | "MEMBER" | "OBSERVER")[] = ["MEMBER", "OBSERVER", "ADMIN"];
                                    const currentIndex = roles.indexOf(member.projectRole as any) || 0;
                                    const nextRole = roles[(currentIndex + 1) % roles.length];
                                    handleUpdateRole(member.projectMemberId!, nextRole);
                                  }}
                                  disabled={member.projectRole === "ADMIN"}
                                >
                                  <Shield className="mr-2 h-4 w-4" />
                                  Change Role
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleRevokeAccess(member.projectMemberId!)}
                                  disabled={member.projectRole === "ADMIN"}
                                >
                                  <UserMinus className="mr-2 h-4 w-4" />
                                  Remove Access
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

          </div>
        </>
      )}

      {/* Add Member to Project Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Member to Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Select Member</label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a team member" />
                </SelectTrigger>
                <SelectContent>
                  {membersWithoutAccess && membersWithoutAccess?.map((member: ProjectMemberData) => (
                    <SelectItem key={member.userId} value={member.userId}>
                      {member.name} ({member.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Project Role</label>
              <Select
                value={selectedRole}
                onValueChange={(value: any) => setSelectedRole(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MEMBER">Member</SelectItem>
                  <SelectItem value="OBSERVER">Observer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleGrantAccess}
                disabled={!selectedUserId || grantAccessMutation.isPending}
              >
                Add Member
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invite to Workspace Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Add Users to Workspace
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              {selectedWorkspaceForInvite && (
                <>
                  {teamMembers
                    .filter(
                      (member: any) =>
                        !member.boardAccess.some(
                          (access: any) =>
                            access.board.id === selectedWorkspaceForInvite
                        )
                    )
                    .map((member: any) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarImage src={member.imageUrl} />
                            <AvatarFallback className="text-xs border font-semibold">
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
                              {member.email}
                            </div>
                          </div>
                        </div>
                        <Button 
                          size="sm"
                          onClick={() => {
                            handleAddToWorkspace(
                              member.id,
                              selectedWorkspaceForInvite,
                              "MEMBER"
                            );
                          }}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    ))}
                  {teamMembers.filter(
                    (member: any) =>
                      !member.boardAccess.some(
                        (access: any) =>
                          access.board.id === selectedWorkspaceForInvite
                      )
                  ).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      All team members already have access to this workspace
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {(selectedProject === "N/A" || !selectedProject) && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ProjectIcon className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select a Project</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Choose a project from the dropdown above to manage its members
                and permissions. Project members can access all workspaces
                within the project.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProjectViewer;
