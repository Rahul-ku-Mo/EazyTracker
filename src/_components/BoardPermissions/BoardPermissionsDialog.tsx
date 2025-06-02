import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  Shield, 
  UserCheck, 
  UserX, 
  Mail, 
  Crown,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BoardPermissionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
  boardTitle: string;
}

interface TeamMember {
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

const BoardPermissionsDialog = ({ 
  isOpen, 
  onClose, 
  boardId, 
  boardTitle 
}: BoardPermissionsDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const accessToken = Cookies.get("accessToken") || "";

  // Fetch team members with board access status
  const { data: permissionsData, isLoading } = useQuery({
    queryKey: ["board-permissions", boardId],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/boards/${boardId}/permissions`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data.data;
    },
    enabled: isOpen && !!boardId,
  });

  // Grant board access mutation
  const grantAccessMutation = useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: string }) => {
      return axios.post(
        `${import.meta.env.VITE_API_URL}/boards/${boardId}/permissions/grant`,
        { memberId, role },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Access granted",
        description: `Board access has been granted successfully`,
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["board-permissions", boardId] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to grant access",
        description: error.response?.data?.message || "An error occurred",
        variant: "destructive",
      });
    },
  });

  // Revoke board access mutation
  const revokeAccessMutation = useMutation({
    mutationFn: async (memberId: string) => {
      return axios.delete(
        `${import.meta.env.VITE_API_URL}/boards/${boardId}/permissions/${memberId}`,
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
        description: "Board access has been revoked successfully",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["board-permissions", boardId] });
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
            <DialogTitle>Board Permissions</DialogTitle>
            <DialogDescription>Loading team members...</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const members: TeamMember[] = permissionsData?.members || [];
  const membersWithAccess = members.filter(m => m.boardAccess);
  const membersWithoutAccess = members.filter(m => !m.boardAccess);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Board Permissions
          </DialogTitle>
          <DialogDescription>
            Manage team member access to <strong>{boardTitle}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Board Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team: {permissionsData?.team?.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{members.length} total members</span>
                <span>•</span>
                <span>{membersWithAccess.length} have board access</span>
              </div>
            </CardContent>
          </Card>

          {/* Members with Access */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold">Members with Access ({membersWithAccess.length})</h3>
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
                No team members have access to this board yet.
              </p>
            )}
          </div>

          <Separator />

          {/* Members without Access */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-gray-500" />
              <h3 className="text-lg font-semibold">Team Members without Access ({membersWithoutAccess.length})</h3>
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
                All team members have access to this board.
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BoardPermissionsDialog; 