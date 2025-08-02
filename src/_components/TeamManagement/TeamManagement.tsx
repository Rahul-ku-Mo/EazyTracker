import React, { useState } from "react";
import {

  Settings,
  Mail,
  Eye,
  EyeOff,
  Search,
  Plus,
  Minus,
  Filter,
  MoreVertical,
  UserX,
  CheckSquare,
  Square,
  Link,
  UserMinus,
  SquareKanban,
} from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Skeleton } from "../../components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import MainLayout from "@/layouts/Container";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import { TeamManagementIcon } from "@/_components/shared/svg/SidebarIcons";
import {
  AccessLevelIcon,
  CrownIcon,
  InviteUserIcon,
  MemberIcon,
  PerformanceIcon,
  RecommendationIcon,
  RoleIcon,
  StrengthIcon,
  TrendingUpIcon,
} from "@/_components/shared/svg/SharedIcons";

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

interface Board {
  id: number;
  title: string;
  colorName: string;
  colorValue: string;
}

const TeamManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState("members");
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"ADMIN" | "MEMBER">("MEMBER");
  const [selectedWorkspace, setSelectedWorkspace] = useState<number | null>(
    null
  );
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(
    new Set()
  );
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedWorkspaceForBulk, setSelectedWorkspaceForBulk] = useState<
    number | null
  >(null);
  const [filterByRole, setFilterByRole] = useState<"ALL" | "ADMIN" | "MEMBER">(
    "ALL"
  );
  const [filterByStatus, setFilterByStatus] = useState<
    "ALL" | "ACTIVE" | "INACTIVE"
  >("ALL");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const accessToken = Cookies.get("accessToken");

  // Fetch team members
  const { data: teamData, isLoading: isLoadingTeam } = useQuery({
    queryKey: ["team-members"],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/teams/members`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data.data;
    },
    enabled: !!accessToken,
  });

  // Fetch team-related workspaces only
  const { data: workspaces = [], isLoading: isLoadingWorkspaces } = useQuery({
    queryKey: ["team-workspaces", teamData?.team?.id],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/teams/workspaces`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data.data.map((workspace: any) => ({
        id: workspace.id,
        title: workspace.title,
        colorName: workspace.colorName,
        colorValue: workspace.colorValue,
      }));
    },
    enabled: !!accessToken && !!teamData,
  });

  const teamMembers = teamData?.members || [];
  const currentUser =
    teamMembers.find((member: TeamMember) => member.role === "ADMIN") ||
    teamMembers[0];

  // Filter and search logic
  const filteredMembers = teamMembers.filter((member: TeamMember) => {
    const matchesSearch =
      member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole =
      filterByRole === "ALL" ||
      (filterByRole === "ADMIN" && member.role === "ADMIN") ||
      (filterByRole === "MEMBER" && member.role === "USER");
    const matchesStatus =
      filterByStatus === "ALL" ||
      (filterByStatus === "ACTIVE" && member.isActive !== false) ||
      (filterByStatus === "INACTIVE" && member.isActive === false);
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Bulk operations handlers
  const handleSelectMember = (memberId: string) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId);
    } else {
      newSelected.add(memberId);
    }
    setSelectedMembers(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const handleSelectAll = () => {
    if (selectedMembers.size === filteredMembers.length) {
      setSelectedMembers(new Set());
      setShowBulkActions(false);
    } else {
      const allIds = new Set<string>(
        filteredMembers.map((member: TeamMember) => member.id)
      );
      setSelectedMembers(allIds);
      setShowBulkActions(true);
    }
  };

  const handleBulkAddToWorkspace = () => {
    if (!selectedWorkspaceForBulk || selectedMembers.size === 0) return;

    const promises = Array.from(selectedMembers).map((userId) =>
      addToWorkspaceMutation.mutateAsync({
        userId,
        workspaceId: selectedWorkspaceForBulk,
        role: inviteRole,
      })
    );

    Promise.all(promises)
      .then(() => {
        toast({
          title: "Bulk Action Completed",
          description: `Added ${selectedMembers.size} members to the workspace.`,
        });
        setSelectedMembers(new Set());
        setShowBulkActions(false);
        setSelectedWorkspaceForBulk(null);
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Some operations failed. Please try again.",
          variant: "destructive",
        });
      });
  };

  const handleBulkRemoveFromWorkspace = () => {
    if (!selectedWorkspaceForBulk || selectedMembers.size === 0) return;

    const promises = Array.from(selectedMembers).map((userId) =>
      removeFromWorkspaceMutation.mutateAsync({
        userId,
        workspaceId: selectedWorkspaceForBulk,
      })
    );

    Promise.all(promises)
      .then(() => {
        toast({
          title: "Bulk Action Completed",
          description: `Removed ${selectedMembers.size} members from the workspace.`,
        });
        setSelectedMembers(new Set());
        setShowBulkActions(false);
        setSelectedWorkspaceForBulk(null);
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Some operations failed. Please try again.",
          variant: "destructive",
        });
      });
  };

  // Mutations for team management operations
  const toggleUserMutation = useMutation({
    mutationFn: async ({
      userId,
      isActive,
    }: {
      userId: string;
      isActive: boolean;
    }) => {
      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/teams/users/${userId}/status`,
        { isActive },
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
    },
  });

  const updatePermissionsMutation = useMutation({
    mutationFn: async ({
      userId,
      workspaceId,
      role,
    }: {
      userId: string;
      workspaceId: number;
      role: string;
    }) => {
      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/teams/workspaces/${workspaceId}/members/${userId}/permissions`,
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
    },
  });

  const removeFromWorkspaceMutation = useMutation({
    mutationFn: async ({
      userId,
      workspaceId,
    }: {
      userId: string;
      workspaceId: number;
    }) => {
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/teams/workspaces/${workspaceId}/members/${userId}`,
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
    },
  });

  const addToWorkspaceMutation = useMutation({
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
    },
  });

  // Loading state
  if (isLoadingTeam || isLoadingWorkspaces) {
    return (
      <MainLayout title="Team Management">
        <div className="space-y-6 py-2">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-72" />
              </div>
            </div>
            <Skeleton className="h-8 w-20" />
          </div>

          {/* Tabs Skeleton */}
          <div className="space-y-6">
            <div className="flex space-x-1 rounded-lg bg-muted p-1 w-fit">
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-9 w-40" />
              <Skeleton className="h-9 w-36" />
            </div>

            {/* Card Skeleton */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-40" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-64" />
                    <Skeleton className="h-9 w-32" />
                    <Skeleton className="h-9 w-32" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Table Header Skeleton */}
                <div className="space-y-3">
                  <div className="grid grid-cols-7 gap-4 py-3 border-b">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  
                  {/* Table Rows Skeleton */}
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="grid grid-cols-7 gap-4 py-3 items-center">
                      <Skeleton className="h-4 w-4" />
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                      <div className="flex justify-center">
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <div className="flex justify-center">
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </div>
                      <div className="flex justify-center">
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </div>
                      <div className="flex justify-center">
                        <Skeleton className="h-4 w-8" />
                      </div>
                      <div className="flex justify-center gap-2">
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    );
  }

  const handleToggleUserStatus = (userId: string, isActive: boolean) => {
    toggleUserMutation.mutate(
      { userId, isActive },
      {
        onSuccess: () => {
          toast({
            title: isActive ? "User Enabled" : "User Disabled",
            description: `User has been ${isActive ? "enabled" : "disabled"} successfully.`,
            variant: "default",
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to update user status.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleUpdatePermissions = (
    userId: string,
    workspaceId: number,
    role: "ADMIN" | "MEMBER"
  ) => {
    updatePermissionsMutation.mutate(
      { userId, workspaceId, role },
      {
        onSuccess: () => {
          toast({
            title: "Permissions Updated",
            description: `User permissions updated to ${role} for the selected workspace.`,
            variant: "default",
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to update permissions.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleRemoveFromWorkspace = (userId: string, workspaceId: number) => {
    removeFromWorkspaceMutation.mutate(
      { userId, workspaceId },
      {
        onSuccess: () => {
          toast({
            title: "User Removed",
            description: "User has been removed from the workspace.",
            variant: "default",
          });
          // Close the member dialog if removing from selected member
          if (selectedMember && selectedMember.id === userId) {
            setSelectedMember(null);
          }
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to remove user from workspace.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleSendInvitation = () => {
    if (!inviteEmail || !selectedWorkspace) {
      toast({
        title: "Missing Information",
        description: "Please provide email and select a workspace.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Invitation Sent",
      description: `Invitation sent to ${inviteEmail} for workspace access.`,
      variant: "default",
    });

    setShowInviteDialog(false);
    setInviteEmail("");
    setSelectedWorkspace(null);
    setInviteRole("MEMBER");
  };

  const getRoleIcon = (role: string) => {
    return role === "ADMIN" ? (
      <CrownIcon className="w-4 h-4 text-yellow-500 mr-1.5" />
    ) : (
      <RoleIcon className="w-4 h-4 text-blue-500 mr-1.5" />
    );
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return "text-green-600";
    if (efficiency >= 80) return "text-yellow-600";
    return "text-red-600";
  };

  const handleInviteToWorkspace = () => {
    if (!selectedWorkspace || !selectedMember) return;

    addToWorkspaceMutation.mutate(
      {
        userId: selectedMember.id,
        workspaceId: selectedWorkspace,
        role: inviteRole,
      },
      {
        onSuccess: () => {
          toast({
            title: "Workspace Access Granted",
            description: `${selectedMember.name} has been added to the workspace.`,
          });
          setSelectedWorkspace(null);
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to add user to workspace.",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <MainLayout title="Team Management">
      <div className="space-y-6 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <TeamManagementIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Team Management</h1>
              <p className="text-sm text-muted-foreground">
                Manage team members, permissions, and workspace access
              </p>
            </div>
          </div>

          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 rounded-md text-xs h-8 px-2.5">
                <InviteUserIcon className="h-4 w-4" />
                Invite
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="colleague@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowInviteDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSendInvitation}>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Invitation
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          defaultValue="members"
          className="space-y-6"
        >
          <TabsList className="grid grid-cols-3 w-fit">
            <TabsTrigger value="members" className="flex items-center gap-2">
              <MemberIcon className="w-4 h-4" />
              Team Members
            </TabsTrigger>
            <TabsTrigger
              value="permissions"
              className="flex items-center gap-2"
            >
              <RoleIcon className="w-4 h-4" />
              Workspace Permissions
            </TabsTrigger>
            <TabsTrigger
              value="performance"
              className="flex items-center gap-2"
            >
              <PerformanceIcon className="w-4 h-4" />
              Team Performance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-6 ">
            {/* Search and Filter Controls */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Team Members ({filteredMembers.length})</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search members..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 w-64"
                      />
                    </div>
                    <Select
                      value={filterByRole}
                      onValueChange={(value: "ALL" | "ADMIN" | "MEMBER") =>
                        setFilterByRole(value)
                      }
                    >
                      <SelectTrigger className="w-32">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Roles</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="MEMBER">Member</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={filterByStatus}
                      onValueChange={(value: "ALL" | "ACTIVE" | "INACTIVE") =>
                        setFilterByStatus(value)
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Status</SelectItem>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>

              {/* Bulk Actions Bar */}
              {showBulkActions && (
                <div className="px-6 py-3 bg-blue-50 dark:bg-blue-900/20 border-b">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {selectedMembers.size} member(s) selected
                    </span>
                    <div className="flex items-center gap-2">
                      <Select
                        value={selectedWorkspaceForBulk?.toString() || ""}
                        onValueChange={(value) =>
                          setSelectedWorkspaceForBulk(parseInt(value))
                        }
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue
                            placeholder={
                              workspaces.length === 0
                                ? "No workspaces available"
                                : "Select workspace for bulk action"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {workspaces.length === 0 ? (
                            <div className="p-2 text-sm text-muted-foreground text-center">
                              No workspaces available for bulk actions
                            </div>
                          ) : (
                            workspaces.map((workspace: Board) => (
                              <SelectItem
                                key={workspace.id}
                                value={workspace.id.toString()}
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{
                                      backgroundColor: workspace.colorValue,
                                    }}
                                  />
                                  {workspace.title}
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        onClick={handleBulkAddToWorkspace}
                        disabled={
                          !selectedWorkspaceForBulk || workspaces.length === 0
                        }
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add to Workspace
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={handleBulkRemoveFromWorkspace}
                        disabled={
                          !selectedWorkspaceForBulk || workspaces.length === 0
                        }
                      >
                        <Minus className="h-4 w-4 mr-1" />
                        Remove from Workspace
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <CardContent>
                <Table>
                  <TableHeader className="bg-muted sticky top-0 z-10">
                    <TableRow>
                      <TableHead className="w-12 text-[13px]">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleSelectAll}
                          className="h-8 w-8 p-0"
                        >
                          {selectedMembers.size === filteredMembers.length &&
                          filteredMembers.length > 0 ? (
                            <CheckSquare className="h-4 w-4" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </Button>
                      </TableHead>
                      <TableHead className="text-[13px]">
                        <div className="flex items-center gap-2">
                          <MemberIcon className="h-4 w-4" />
                          Member
                        </div>
                      </TableHead>
                      <TableHead className="text-[13px]">
                        <div className="flex items-center justify-center">
                          Department
                        </div>
                      </TableHead>
                      <TableHead className="text-[13px]">
                        <div className="flex items-center justify-center">
                          <RoleIcon className="h-4 w-4 mr-1.5" />
                          Role
                        </div>
                      </TableHead>
                      <TableHead className="text-[13px]">
                        <div className="flex items-center justify-center">
                          Status
                        </div>
                      </TableHead>
                      <TableHead className="text-[13px]">
                        <div className="flex items-center justify-center">
                          Efficiency
                        </div>
                      </TableHead>
                      <TableHead className="text-[13px]">
                        <div className="flex items-center justify-center">
                          Actions
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((member: TeamMember) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSelectMember(member.id)}
                            className="h-8 w-8 p-0"
                          >
                            {selectedMembers.has(member.id) ? (
                              <CheckSquare className="h-4 w-4" />
                            ) : (
                              <Square className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="size-6">
                              <AvatarImage src={member.imageUrl} />
                              <AvatarFallback className="text-[9px] border font-semibold">
                                {member?.name
                                  ?.split(" ")
                                  .map((n: string) => n[0])
                                  .join("") ||
                                  member?.email?.charAt(0).toUpperCase() ||
                                  "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {member.name || member.email}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {member.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center">
                            <span className="text-xs">
                              {member.department || "Not specified"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center">
                            <Badge
                              variant="outline"
                              className="text-muted-foreground px-1.5"
                            >
                              {getRoleIcon(member.role)}
                              {member.role}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center">
                            <Badge
                              variant="outline"
                              className="text-muted-foreground px-1.5"
                            >
                              {member.isActive !== false
                                ? "Active"
                                : "Disabled"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center">
                            <span
                              className={`text-xs ${getEfficiencyColor(member.efficiency || 0)}`}
                            >
                              {member.efficiency || 0}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            {currentUser?.role === "ADMIN" &&
                              member.id !== currentUser?.id && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs"
                                  onClick={() =>
                                    handleToggleUserStatus(
                                      member.id,
                                      member.isActive === false
                                    )
                                  }
                                >
                                  {member.isActive !== false ? (
                                    <>
                                      <EyeOff className="w-4 h-4 mr-1" />{" "}
                                      Disable
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="w-4 h-4 mr-1" /> Enable
                                    </>
                                  )}
                                </Button>
                              )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                                  size="icon"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() => setSelectedMember(member)}
                                >
                                  <Settings className="h-4 w-4 mr-2" />
                                  Manage Workspaces
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {currentUser?.role === "ADMIN" &&
                                  member.id !== currentUser?.id && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleToggleUserStatus(member.id, false)
                                      }
                                      className="text-destructive"
                                    >
                                      <UserX className="h-4 w-4 mr-2" />
                                      Remove from Team
                                    </DropdownMenuItem>
                                  )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-6">
            <div className="grid gap-4">
              {workspaces.map((workspace: Board) => (
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
                            New User
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
                                  (member: TeamMember) =>
                                    !member.boardAccess.some(
                                      (access: any) =>
                                        access.board.id === workspace.id
                                    )
                                )
                                .map((member: TeamMember) => (
                                  <div
                                    key={member.id}
                                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                                    onClick={() => {
                                      addToWorkspaceMutation.mutate({
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
                                        <div className="font-medium">
                                          {member.name || member.email}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
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
                                (member: TeamMember) =>
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
                          <TableHead className="text-[13px]">
                            <div className="flex items-center gap-2">
                              <MemberIcon className="h-4 w-4" />
                              Member
                            </div>
                          </TableHead>
                          <TableHead className="text-[13px]">
                            <div className="flex items-center justify-center">
                              <AccessLevelIcon className="h-4 w-4 mr-1.5" />
                              Access Level
                            </div>
                          </TableHead>
                          <TableHead className="text-[13px]">
                            <div className="flex items-center justify-center">
                              Actions
                            </div>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {teamMembers
                          .filter((member: TeamMember) =>
                            member.boardAccess.some(
                              (access: any) => access.board.id === workspace.id
                            )
                          )
                          .map((member: TeamMember) => {
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
                                    <span className="font-medium">
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
                                                handleUpdatePermissions(
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
                                                  title:
                                                    "Workspace link copied",
                                                  description:
                                                    "Workspace link has been copied to clipboard",
                                                });
                                              }}
                                            >
                                              <Link className="mr-2 h-4 w-4" />
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
                                                handleRemoveFromWorkspace(
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
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h2 className="text-lg font-semibold">
                  Team Performance
                </h2>
                <p className="text-sm text-muted-foreground">
                  Comprehensive team metrics, velocity, and performance insights
                </p>
              </div>
              <div className="flex gap-2">
                <Select defaultValue="week">
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Team Statistics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Team Velocity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {(
                      teamMembers.filter(
                        (member: TeamMember) => member.isActive !== false
                      ).length * 3.2
                    ).toFixed(0)}
                  </div>
                  <p className="text-xs text-gray-500">Cards per week</p>
                  <div className="text-xs text-green-600 mt-1">
                    +12% from last week
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Completion Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {teamMembers.length > 0
                      ? Math.round(
                          teamMembers.reduce(
                            (acc: number, member: TeamMember) =>
                              acc + (member.efficiency || 0),
                            0
                          ) / teamMembers.length
                        )
                      : 0}
                    %
                  </div>
                  <p className="text-xs text-gray-500">On-time delivery</p>
                  <div className="text-xs text-blue-600 mt-1">
                    +5% from last week
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Avg. Completion Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">2.3</div>
                  <p className="text-xs text-gray-500">Hours per card</p>
                  <div className="text-xs text-red-600 mt-1">
                    +8% from target
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    Team Efficiency
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {teamMembers.length > 0
                      ? Math.round(
                          teamMembers.reduce(
                            (acc: number, member: TeamMember) =>
                              acc + (member.efficiency || 0),
                            0
                          ) / teamMembers.length
                        )
                      : 0}
                    %
                  </div>
                  <p className="text-xs text-gray-500">Overall performance</p>
                  <div className="text-xs text-orange-600 mt-1">
                    +3% from last month
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Charts & Detailed Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Team Member Performance Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Team Member Performance
                  </CardTitle>
                  <div className="text-sm text-muted-foreground">
                    Individual efficiency and task completion metrics
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {teamMembers.map((member: TeamMember) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-2 h-10 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="size-6">
                            <AvatarImage src={member.imageUrl} />
                            <AvatarFallback className="text-[9px] font-mono font-bold border">
                              {member?.name
                                ?.split(" ")
                                .map((n: string) => n[0])
                                .join("") ||
                                member?.email?.charAt(0).toUpperCase() ||
                                "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-sm">
                              {member.name || member.email}
                            </div>
                            <div className="text-xs text-gray-500">
                              {member.department || "Not specified"}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div
                              className={`font-medium text-xs font-mono ${getEfficiencyColor(member.efficiency || 0)}`}
                            >
                              {member.efficiency || 0}%
                            </div>
                            <div className="text-xs text-gray-500">
                              Efficiency
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-xs font-mono">
                              {member.boardAccess.length}
                            </div>
                            <div className="text-xs text-gray-500">
                              Workspaces
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-xs text-green-600 font-mono flex items-center">
                              <TrendingUpIcon className="size-3" />
                              +5%
                            </div>
                            <div className="text-xs text-gray-500">Trend</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Velocity & Completion Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Velocity & Completion Trends
                  </CardTitle>
                  <div className="text-sm text-muted-foreground">
                    Weekly team velocity and completion rate trends
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-48">
                    <div className="text-center">
                      <div className="text-muted-foreground mb-2">📊</div>
                      <div className="text-sm font-medium">
                        Velocity Analytics
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Coming soon
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Insights & Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Performance Insights & Recommendations
                </CardTitle>
                <div className="text-sm text-muted-foreground">
                  AI-driven insights to optimize team performance
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-semibold mb-3 text-green-600 dark:text-green-900 p-2 inline-flex items-center gap-2">
                      <StrengthIcon className="size-4" /> Strengths
                    </h4> 
                    <div className="space-y-2">
                      <div className="text-xs bg-green-50 dark:bg-green-900/10 p-3 rounded border-l-2 border-green-500">
                        High team velocity with consistent delivery rates
                      </div>
                      <div className="text-xs bg-green-50 dark:bg-green-900/10 p-3 rounded border-l-2 border-green-500">
                        Strong collaboration across {workspaces.length} active
                        projects
                      </div>
                      <div className="text-xs bg-green-50 dark:bg-green-900/10 p-3 rounded border-l-2 border-green-500">
                        Efficient task completion with{" "}
                        {
                          teamMembers.filter(
                            (m: TeamMember) => (m.efficiency || 0) > 90
                          ).length
                        }{" "}
                        high-performers
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-3 text-orange-600 inline-flex items-center gap-2">
                      <RecommendationIcon className="size-4" /> Recommendations
                    </h4>
                    <div className="space-y-2">
                      <div className="text-xs bg-orange-50 dark:bg-orange-900/10 p-3 rounded border-l-2 border-orange-500">
                        Consider pairing junior members with high-performers for
                        knowledge transfer
                      </div>
                      <div className="text-xs bg-orange-50 dark:bg-orange-900/10 p-3 rounded border-l-2 border-orange-500">
                        Implement daily standups to improve communication and
                        reduce blockers
                      </div>
                      <div className="text-xs bg-orange-50 dark:bg-orange-900/10 p-3 rounded border-l-2 border-orange-500">
                        Review workload distribution to prevent burnout in top
                        performers
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Performance Score</div>
                    <div className="text-lg font-bold text-green-600">
                      {teamMembers.length > 0
                        ? Math.round(
                            teamMembers.reduce(
                              (acc: number, member: TeamMember) =>
                                acc + (member.efficiency || 0),
                              0
                            ) / teamMembers.length
                          )
                        : 0}
                      /100
                    </div>
                  </div>
                  <div className="mt-2 bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full"
                      style={{
                        width: `${teamMembers.length > 0 ? Math.round(teamMembers.reduce((acc: number, member: TeamMember) => acc + (member.efficiency || 0), 0) / teamMembers.length) : 0}%`,
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Based on velocity, completion rate, and team efficiency
                    metrics
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Member Management Dialog */}
        {selectedMember && (
          <Dialog
            open={!!selectedMember}
            onOpenChange={() => setSelectedMember(null)}
          >
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  Manage {selectedMember.name || selectedMember.email}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedMember.imageUrl} />
                    <AvatarFallback>
                      {selectedMember?.name
                        ?.split(" ")
                        .map((n: string) => n[0])
                        .join("") ||
                        selectedMember?.email?.charAt(0).toUpperCase() ||
                        "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">
                      {selectedMember.name || selectedMember.email}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedMember.email}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label>Add to Workspace</Label>
                    <div className="flex space-x-2 mt-1">
                      <Select
                        value={selectedWorkspace?.toString() || ""}
                        onValueChange={(value) =>
                          setSelectedWorkspace(parseInt(value))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              workspaces.filter(
                                (workspace: Board) =>
                                  !selectedMember.boardAccess.some(
                                    (access: any) =>
                                      access.board.id === workspace.id
                                  )
                              ).length === 0
                                ? "No workspaces available"
                                : "Select workspace"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {workspaces.filter(
                            (workspace: Board) =>
                              !selectedMember.boardAccess.some(
                                (access: any) =>
                                  access.board.id === workspace.id
                              )
                          ).length === 0 ? (
                            <div className="p-2 text-sm text-muted-foreground text-center">
                              No workspaces available to add
                            </div>
                          ) : (
                            workspaces
                              .filter(
                                (workspace: Board) =>
                                  !selectedMember.boardAccess.some(
                                    (access: any) =>
                                      access.board.id === workspace.id
                                  )
                              )
                              .map((workspace: Board) => (
                                <SelectItem
                                  key={workspace.id}
                                  value={workspace.id.toString()}
                                >
                                  {workspace.title}
                                </SelectItem>
                              ))
                          )}
                        </SelectContent>
                      </Select>
                      <Select
                        value={inviteRole}
                        onValueChange={(value: "ADMIN" | "MEMBER") =>
                          setInviteRole(value)
                        }
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MEMBER">Member</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={handleInviteToWorkspace}
                        disabled={
                          !selectedWorkspace ||
                          workspaces.filter(
                            (workspace: Board) =>
                              !selectedMember.boardAccess.some(
                                (access: any) =>
                                  access.board.id === workspace.id
                              )
                          ).length === 0
                        }
                      >
                        Add
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label>Current Workspace Access</Label>
                    <div className="space-y-2 mt-1">
                      {selectedMember.boardAccess.length === 0 ? (
                        <div className="p-4 text-sm text-muted-foreground text-center border rounded-lg border-dashed">
                          <UserX className="mx-auto h-8 w-8 mb-2 opacity-50" />
                          No workspace access yet
                          <p className="text-xs mt-1">
                            Add this member to workspaces to get started
                          </p>
                        </div>
                      ) : (
                        selectedMember.boardAccess.map((access: any) => (
                          <div
                            key={access.board.id}
                            className="flex items-center justify-between p-2 border rounded"
                          >
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-3 h-3 rounded"
                                style={{
                                  backgroundColor: access.board.colorValue,
                                }}
                              />
                              <span className="text-sm">
                                {access.board.title}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge
                                variant={
                                  access.role === "ADMIN"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {access.role}
                              </Badge>
                              {currentUser?.role === "ADMIN" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleRemoveFromWorkspace(
                                      selectedMember.id,
                                      access.board.id
                                    )
                                  }
                                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                >
                                  ×
                                </Button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </MainLayout>
  );
};

export default TeamManagement;
