import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import Cookies from "js-cookie";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Shield, 
  UserCheck, 
  UserX, 
  Mail, 
  Crown,
  Clock,
  CheckCircle,
  XCircle,
  Briefcase,
  FolderKanban
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MemberIcon } from "../shared/svg/SharedIcons";
import { Badge } from "@/components/ui/badge";

interface BoardPermissionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  workspaceSlug: string;
  workspaceTitle: string;
}

interface ProjectMember {
  id: string;
  name: string;
  email: string;
  imageUrl?: string;
  role: "ADMIN" | "USER";
  boardAccess?: {
    role: "ADMIN" | "MEMBER";
    grantedAt: string;
  } | null;
}

interface PermissionsData {
  members: ProjectMember[];
  workspace: {
    id: number;
    title: string;
    slug: string;
  };
  project: {
    id: string;
    title: string;
    slug: string;
  };
  team: {
    id: string;
    name: string;
  };
}

const WorkspacePermissionsDialog = ({ 
  isOpen, 
  onClose, 
  teamId,
  workspaceSlug,
  workspaceTitle 
}: BoardPermissionsDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const accessToken = Cookies.get("accessToken") || "";

  // Fetch project members with workspace access status
  const { data: permissionsData, isLoading } = useQuery<PermissionsData>({
    queryKey: ["workspace-permissions", teamId, workspaceSlug],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/workspaces/${teamId}/${workspaceSlug}/permissions`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data.data;
    },
    enabled: isOpen && !!teamId && !!workspaceSlug,
  });

  // Grant workspace access mutation
  const grantAccessMutation = useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: string }) => {
      return axios.post(
        `${import.meta.env.VITE_API_URL}/workspaces/${teamId}/${workspaceSlug}/permissions`,
        { memberId, role },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
    },
    onSuccess: () => {
      toast({
        title: "Access granted",
        description: `Workspace access has been granted successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["workspace-permissions", teamId, workspaceSlug] });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "An error occurred";
      toast({
        title: "Failed to grant access",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Revoke workspace access mutation
  const revokeAccessMutation = useMutation({
    mutationFn: async (memberId: string) => {
      return axios.delete(
        `${import.meta.env.VITE_API_URL}/workspaces/${teamId}/${workspaceSlug}/permissions/${memberId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
    },
    onSuccess: () => {
      toast({
        title: "Access revoked",
        description: "Workspace access has been revoked successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["workspace-permissions", teamId, workspaceSlug] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to revoke access",
        description: error.response?.data?.message || "An error occurred",
        variant: "destructive",
      });
    },
  });

  const handleGrantAccess = (memberId: string, role: string = "MEMBER") => {
    grantAccessMutation.mutate({ memberId, role });
  };

  const handleRevokeAccess = (memberId: string) => {
    revokeAccessMutation.mutate(memberId);
  };

  const handleRoleChange = (memberId: string, newRole: string) => {
    grantAccessMutation.mutate({ memberId, role: newRole });
  };

  const getInitials = (name: string, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Workspace Access Control
            </DialogTitle>
            <DialogDescription>Loading project members...</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const members: ProjectMember[] = permissionsData?.members || [];
  const membersWithAccess = members.filter(m => m.boardAccess);
  const membersWithoutAccess = members.filter(m => !m.boardAccess);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Workspace Access Control
          </DialogTitle>
          <DialogDescription>
            Control which project members can access <strong>{workspaceTitle}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Context Information */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="flex items-center gap-2 text-sm">
                      <MemberIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Team:</span>
                      <span className="text-muted-foreground">{permissionsData?.team?.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Project:</span>
                      <span className="text-muted-foreground">{permissionsData?.project?.title}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <FolderKanban className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Workspace:</span>
                      <span className="text-muted-foreground">{workspaceTitle}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <Badge variant="outline" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      {membersWithAccess.length} with access
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      of {members.length} project members
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> Only project members can be granted workspace access. 
              To add new people, first add them to the project "{permissionsData?.project?.title}".
            </p>
          </div>

          {/* Members with Access */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500" />
              <h3 className="text-lg font-semibold">Project Members with Workspace Access ({membersWithAccess.length})</h3>
            </div>
            
            {membersWithAccess.length > 0 ? (
              <div className="space-y-3">
                {membersWithAccess.map((member) => (
                  <Card key={member.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.imageUrl} />
                          <AvatarFallback>
                            {getInitials(member.name, member.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{member.name || member.email}</p>
                            {member.role === "ADMIN" && (
                              <Crown className="h-4 w-4 text-yellow-500" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {member.email}
                            {member.boardAccess && (
                              <>
                                <span>•</span>
                                <Clock className="h-3 w-3" />
                                <span>Added {formatDate(member.boardAccess.grantedAt)}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Select
                          value={member.boardAccess?.role || "MEMBER"}
                          onValueChange={(value) => handleRoleChange(member.id, value)}
                          disabled={grantAccessMutation.isPending}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MEMBER">Member</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRevokeAccess(member.id)}
                          disabled={revokeAccessMutation.isPending}
                          className="text-red-600 hover:text-red-700"
                        >
                          <UserX className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No project members have access to this workspace yet.
              </p>
            )}
          </div>

          <Separator />

          {/* Members without Access */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Project Members without Access ({membersWithoutAccess.length})</h3>
            </div>
            
            {membersWithoutAccess.length > 0 ? (
              <div className="space-y-3">
                {membersWithoutAccess.map((member) => (
                  <Card key={member.id} className="p-4 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.imageUrl} />
                          <AvatarFallback>
                            {getInitials(member.name, member.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{member.name || member.email}</p>
                            {member.role === "ADMIN" && (
                              <Crown className="h-4 w-4 text-yellow-500" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {member.email}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Select
                          defaultValue="MEMBER"
                          onValueChange={(value) => handleGrantAccess(member.id, value)}
                          disabled={grantAccessMutation.isPending}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MEMBER">Member</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGrantAccess(member.id, "MEMBER")}
                          disabled={grantAccessMutation.isPending}
                          className="text-green-600 hover:text-green-700"
                        >
                          <UserCheck className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                All project members have access to this workspace.
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WorkspacePermissionsDialog; 