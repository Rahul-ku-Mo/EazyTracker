import React, { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Skeleton } from "../../components/ui/skeleton";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { useToast } from "@/hooks/use-toast";
import MainLayout from "@/layouts/Container";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import {
  ProjectIcon,
  TeamManagementIcon,
} from "@/_components/shared/svg/SidebarIcons";
import {
  MemberIcon,
  PerformanceIcon,
  RecommendationIcon,
  StrengthIcon,
  TrendingUpIcon,
} from "@/_components/shared/svg/SharedIcons";
import { useProjects } from "@/hooks/use-projects";
import { useWorkspaces } from "@/hooks/useQueries";

import TeamViewer from "./team-viewer";
import ProjectViewer from "./project-viewer";
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

const TeamManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState("members");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const accessToken = Cookies.get("accessToken");

  const { projects, isPending: isPendingProjects } = useProjects();

  const teamId = localStorage.getItem("teamId");

  // Fetch team members
  const { teamData, isPendingTeamMembers: isLoadingTeam } =
    useFetchTeamMemberOrProject();

  const { data: workspaces } = useWorkspaces(teamId as string);

  const teamMembers = teamData?.members || [];
  const currentUser =
    teamMembers.find((member: TeamMember) => member.role === "ADMIN") ||
    teamMembers[0];
  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return "text-green-600";
    if (efficiency >= 80) return "text-yellow-600";
    return "text-red-600";
  };

  // Mutations for workspace management operations
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
  if (isLoadingTeam || isPendingProjects) {
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
          </div>
        </div>
      </MainLayout>
    );
  }

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
            description: `User permissions updated to ${role} for the selected project.`,
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
            title: "Member Removed",
            description: "User has been removed from the workspace.",
            variant: "default",
          });
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
              value="project-permissions"
              className="flex items-center gap-2"
            >
              <ProjectIcon className="w-4 h-4" />
              Projects & Workspaces
            </TabsTrigger>
            <TabsTrigger
              value="performance"
              className="flex items-center gap-2"
            >
              <PerformanceIcon className="w-4 h-4" />
              Team Performance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-6">
            <TeamViewer
              currentUser={currentUser}
              isLoading={isLoadingTeam}
            />
          </TabsContent>

          <TabsContent value="project-permissions" className="space-y-6">
            <ProjectViewer
              projects={projects as any}
              workspaces={workspaces}
              teamMembers={teamMembers}
              currentUser={currentUser}
              onUpdatePermissions={handleUpdatePermissions}
              onRemoveFromWorkspace={handleRemoveFromWorkspace}
              addToWorkspaceMutation={addToWorkspaceMutation}
            />
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h2 className="text-lg font-semibold">Team Performance</h2>
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
                            <AvatarImage src={member?.imageUrl} />
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
                        Strong collaboration across {workspaces?.length} active
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
      </div>
    </MainLayout>
  );
};

export default TeamManagement;
