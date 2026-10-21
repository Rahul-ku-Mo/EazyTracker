import React, { useState } from "react";
import {
  Mail,
  Eye,
  EyeOff,
  Search,
  Filter,
  CheckSquare,
  Square,
} from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
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
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import {
  InviteUserIcon,
  MemberIcon,
} from "@/_components/shared/svg/SharedIcons";
import { CrownIcon, RoleIcon } from "@/_components/shared/svg/SharedIcons";
import { useFetchTeamMemberOrProject } from "../Card/_newCardComponentsAndActions/fetch-team-member-project";

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

interface TeamViewerProps {
  currentUser?: TeamMember;
  isLoading?: boolean;
}

const TeamViewer: React.FC<TeamViewerProps> = ({
  currentUser,
  isLoading = false,
}) => {
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(
    new Set()
  );
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [filterByRole, setFilterByRole] = useState<"ALL" | "ADMIN" | "MEMBER">(
    "ALL"
  );
  const [filterByStatus, setFilterByStatus] = useState<
    "ALL" | "ACTIVE" | "INACTIVE"
  >("ALL");

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const accessToken = Cookies.get("accessToken");

  const { teamData } = useFetchTeamMemberOrProject();

  // Filter and search logic
  const filteredMembers = teamData.members.filter((member: TeamMember) => {
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
  const handleSelectMember = (memberId: string, memberRole: string) => {
    // Prevent selecting admin users
    if (memberRole === "ADMIN") return;
    
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
    // Only select non-admin members
    const nonAdminMembers = filteredMembers.filter(
      (member: TeamMember) => member.role !== "ADMIN"
    );
    
    if (selectedMembers.size === nonAdminMembers.length) {
      setSelectedMembers(new Set());
      setShowBulkActions(false);
    } else {
      const allIds = new Set<string>(
        nonAdminMembers.map((member: TeamMember) => member.id)
      );
      setSelectedMembers(allIds);
      setShowBulkActions(true);
    }
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

  

  const inviteUserMutation = useMutation({
    mutationFn: async ({
      email,
      role,
    }: {
      email: string;
      role: "ADMIN" | "MEMBER";
    }) => {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/teams/invite`,
        { email, role },
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


  const handleSendInvitation = () => {
    if (!inviteEmail) {
      toast({
        title: "Missing Information",
        description: "Please provide email address.",
        variant: "destructive",
      });
      return;
    }

    inviteUserMutation.mutate(
      { email: inviteEmail, role: "MEMBER" },
      {
        onSuccess: () => {
          toast({
            title: "Invitation Sent",
            description: `Invitation sent to ${inviteEmail}.`,
            variant: "default",
          });
          setShowInviteDialog(false);
          setInviteEmail("");
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to send invitation.",
            variant: "destructive",
          });
        },
      }
    );
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="p-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-40" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-64" />
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-9 w-32" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4">
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
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="grid grid-cols-7 gap-4 py-3 items-center"
              >
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
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <Card>
        <CardHeader className="p-4">
          <div className="flex items-center justify-between">
            <CardTitle>Team Members</CardTitle>
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
              <Dialog
                open={showInviteDialog}
                onOpenChange={setShowInviteDialog}
              >
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
                    <div className="flex flex-col gap-2">
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
                        <Mail className="size-4" />
                        Send Invitation
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>

        {/* Bulk Actions Bar */}
        {showBulkActions && (
          <div className="px-4 py-3 bg-blue-50 dark:bg-emerald-900/20 border-b mx-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedMembers.size} member(s) selected
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    // Handle bulk toggle - only for non-admin members
                    const promises = Array.from(selectedMembers).map((userId) => {
                      const member = filteredMembers.find((m: TeamMember) => m.id === userId);
                      // Skip admin users
                      if (member && member.role !== "ADMIN") {
                        return toggleUserMutation.mutateAsync({ 
                          userId, 
                          isActive: member.isActive === false 
                        });
                      }
                      return Promise.resolve();
                    });
                
                    Promise.all(promises)
                      .then(() => {
                        toast({
                          title: "Bulk Action Completed",
                          description: `Toggled status for ${selectedMembers.size} member(s).`,
                        });
                        setSelectedMembers(new Set());
                        setShowBulkActions(false);
                      })
                      .catch(() => {
                        toast({
                          title: "Error",
                          description:
                            "Some operations failed. Please try again.",
                          variant: "destructive",
                        });
                      });
                  }}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Toggle Selected
                </Button>
              </div>
            </div>
          </div>
        )}

        <CardContent className="px-4">
          <Table>
            <TableHeader className="bg-muted sticky top-0 z-10">
              <TableRow>
                <TableHead className="w-12 text-sm">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectAll}
                    className="h-8 w-8 p-0"
                  >
                    {(() => {
                      const nonAdminMembers = filteredMembers.filter(
                        (m: TeamMember) => m.role !== "ADMIN"
                      );
                      return selectedMembers.size === nonAdminMembers.length &&
                        nonAdminMembers.length > 0 ? (
                        <CheckSquare className="h-4 w-4" />
                      ) : (
                        <Square className="h-4 w-4" />
                      );
                    })()}
                  </Button>
                </TableHead>
                <TableHead className="text-sm">
                  <div className="flex items-center gap-2">
                    <MemberIcon className="h-4 w-4" />
                    Member
                  </div>
                </TableHead>
                <TableHead className="text-sm">
                  <div className="flex items-center justify-center">
                    Department
                  </div>
                </TableHead>
                <TableHead className="text-sm">
                  <div className="flex items-center justify-center">
                    <RoleIcon className="h-4 w-4 mr-1.5" />
                    Role
                  </div>
                </TableHead>
                <TableHead className="text-sm">
                  <div className="flex items-center justify-center">Status</div>
                </TableHead>
                <TableHead className="text-sm">
                  <div className="flex items-center justify-center">
                    Efficiency
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
              {filteredMembers.map((member: TeamMember) => {
                

                return (
                  <TableRow key={member.id}>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSelectMember(member.id, member.role)}
                        className="h-8 w-8 p-0"
                        disabled={member.role === "ADMIN"}
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
                          {member.isActive !== false ? "Active" : "Disabled"}
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
                          member.id !== currentUser?.id &&
                          member.role !== "ADMIN" && (
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
                                  <EyeOff className="w-4 h-4 mr-1" /> Disable
                                </>
                              ) : (
                                <>
                                  <Eye className="w-4 h-4 mr-1" /> Enable
                                </>
                              )}
                            </Button>
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
    </div>
  );
};

export default TeamViewer;
