import { UserTable } from "@/_components/Table/user-table";
import { columns } from "@/_components/Table/user-columns";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import Container from "@/layouts/Container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import TeamInviteDialog from "@/_components/TeamInviteDialog";

const TeamMembersPage = () => {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  const { data: teamData, isPending, error } = useQuery({
    queryKey: ["team-members"],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/teams/members`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("accessToken")}`,
          },
        }
      );
      return response.data.data;
    },
  });

  // Get team data for the invite dialog
  const { data: teamInfo } = useQuery({
    queryKey: ['team'],
    queryFn: async () => {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/teams`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("accessToken")}`
        }
      });
      return response.data.data;
    },
    enabled: !!Cookies.get("accessToken")
  });

  const openInviteDialog = () => {
    setIsInviteDialogOpen(true);
  };

  const closeInviteDialog = () => {
    setIsInviteDialogOpen(false);
  };

  if (isPending) {
    return (
      <Container title="Team Members">
        <Card className="w-full border-border/50 shadow-lg">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-xl font-semibold flex items-center gap-2 text-foreground">
              <Users className="h-5 w-5 text-primary" />
              Team Members
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Loading team member information...
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground">Loading team members...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (error) {
    return (
      <Container title="Team Members">
        <Card className="w-full border-border/50 shadow-lg">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-xl font-semibold flex items-center gap-2 text-foreground">
              <Users className="h-5 w-5 text-primary" />
              Team Members
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Unable to load team member information
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="p-3 bg-destructive/10 rounded-full">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-1">Failed to load team members</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {error.message || "An unexpected error occurred while fetching team data."}
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.reload()}
                    className="text-sm"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Container>
    );
  }

  // Transform the team members data to match the UserTable expected format
  const members = teamData?.members || [];
  const transformedData = members.map((member: any) => ({
    id: member.id,
    name: member.name || member.email,
    email: member.email,
    role: member.role || 'USER',
    status: member.isActive !== false ? 'Active' : 'Inactive',
    imageUrl: member.imageUrl || '',
  }));

  const memberCount = transformedData.length;
  const adminCount = transformedData.filter((member: any) => member.role === 'ADMIN').length;
  const userCount = memberCount - adminCount;

  return (
    <Container title="Team Members">
      <div className="space-y-6">
        {/* Header Card */}
        <Card className="w-full border-border/50 shadow-lg">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-xl font-semibold flex items-center gap-2 text-foreground">
              <Users className="h-5 w-5 text-primary" />
              Team Members
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Manage your team members, roles, and permissions
            </p>
            
            {/* Stats */}
            <div className="flex items-center gap-4 pt-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {memberCount} Total
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {adminCount} Admin{adminCount !== 1 ? 's' : ''}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {userCount} User{userCount !== 1 ? 's' : ''}
                </Badge>
              </div>
              
              <div className="ml-auto">
                <Button size="sm" className="gap-2" onClick={openInviteDialog}>
                  <UserPlus className="h-4 w-4" />
                  Invite Member
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Members Table Card */}
        <Card className="w-full border-border/50 shadow-lg">
          <CardContent className="p-0">
            {memberCount > 0 ? (
              <UserTable columns={columns} data={transformedData} />
            ) : (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="p-3 bg-muted rounded-full">
                    <Users className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-1">No team members found</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Start building your team by inviting members to collaborate.
                    </p>
                    <Button className="gap-2" onClick={openInviteDialog}>
                      <UserPlus className="h-4 w-4" />
                      Invite Your First Member
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {isInviteDialogOpen && (
        <TeamInviteDialog
          isOpen={isInviteDialogOpen}
          onClose={closeInviteDialog}
          teamData={teamInfo}
        />
      )}
    </Container>
  );
};

export default TeamMembersPage;
