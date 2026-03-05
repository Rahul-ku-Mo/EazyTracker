import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { getProjects } from "@/apis/project";
import Container from "@/layouts/Container";
import { Card, CardContent } from "@/components/ui/card";
import { Lock, Mail, FolderPlus } from "lucide-react";

import {
  ProjectsList,
  ProjectListRow,
} from "@/_components/Projects/all-projects-list";
import { ProjectIcon } from "@/_components/shared/svg/SidebarIcons";
import ProjectsTableSkeleton from "@/_components/Projects/ProjectsTableSkeleton";
import { useAdminCheck } from "@/hooks/useAdminCheck";
//import { NewProjectDialog } from "@/_components/Projects/new-project-dialog";
import { NewProjectForm } from "@/_components/Projects/new-project-form";
import { Button } from "@/components/ui/button";

export default function ProjectsPage() {
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
 
  // Fetch current user's team
  const teamId = localStorage.getItem("teamId");
  const { isAdmin } = useAdminCheck();

  // Fetch projects
  const { data: projects, isLoading: isLoadingProjects } = useQuery({
    queryKey: ["projects", teamId],
    queryFn: () => getProjects(teamId!),
    enabled: !!teamId,
  });

  // Map projects to table rows using real data
  const tableData: ProjectListRow[] = (projects || []).map((project) => ({
    id: project.id,
    slug: project.slug || project.id, // Use slug if available, otherwise use id
    title: project.title,
    status: project.status,
    priority: project.priority || "No priority",
    lead: project.lead ? {
      id: project.lead.id,
      name: project.lead.name,
      imageUrl: project.lead.imageUrl,
    } : null,
    members: project.members.map((m: any) => ({
      id: m.user.id,
      name: m.user.name,
      imageUrl: m.user.imageUrl,
    })),
    targetDate: project.targetDate ? String(project.targetDate) : "",
    workspaces: project.workspaces?.map((w: any) => ({
      id: w.workspace.id,
      title: w.workspace.title,
      colorName: w.workspace.colorName,
      colorValue: w.workspace.colorValue,
    })) || [],
  }));


  if (!teamId) {
    return (
      <Container>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold">No Team Found</h2>
            <p className="mt-2 text-muted-foreground">
              You need to be part of a team to view projects
            </p>
          </div>
        </div>
      </Container>
    );
  }

  if (isLoadingProjects) {
    return (
      <Container fwdClassName="!px-0">
        <div className="flex items-center justify-between pt-4 px-4">
          <div className="flex items-center gap-3 pb-2">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <ProjectIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold hidden md:block">My Projects</h1>
              <p className="text-sm text-muted-foreground">
                Manage your client projects
              </p>
            </div>
          </div>
        </div>
        <ProjectsTableSkeleton />
      </Container>
    );
  }

  // Show empty state if no projects
  if (!isLoadingProjects && tableData.length === 0) {
    return (
      <Container fwdClassName="!px-0">
        <div className="flex items-center justify-between pt-4 px-4">
          <div className="flex items-center gap-3 pb-2">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <ProjectIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold hidden md:block">My Projects</h1>
              <p className="text-sm text-muted-foreground">
                {isAdmin ? "Create and manage your client projects" : "Projects you have access to"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center min-h-[60vh] px-4">
          {isAdmin ? (
            <Card className="max-w-md w-full border dark:bg-[#18181b]">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                  <ProjectIcon />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">No Projects</h3>
                    <p className="text-sm text-muted-foreground">
                      You haven't created any projects yet. Get started by creating your first project!
                    </p>
                  </div>
                  <Button 
                    onClick={() => setIsCreateProjectOpen(true)}
                    className="w-full"
                  >
                    New Project
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="max-w-md w-full border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-900/10">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/30">
                    <Lock className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">No Projects Available</h3>
                    <p className="text-sm text-muted-foreground">
                      You are not invited to any projects yet. Contact your team administrator to get access to projects.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span>Need access? Contact your team admin</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Add NewProjectForm dialog */}
        {isAdmin && (
          <NewProjectForm
            isOpen={isCreateProjectOpen}
            onClose={() => setIsCreateProjectOpen(false)}
            teamId={teamId!}
          />
        )}
      </Container>
    );
  }

  return (
    <Container fwdClassName="!px-0">
      <div className="flex items-center justify-between pt-4 px-4">
        <div className="flex items-center gap-3 pb-2 ">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
            <ProjectIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold hidden md:block">My Projects</h1>
            <p className="text-sm text-muted-foreground">
              Keep track of all your client projects
            </p>
          </div>
        </div>

      </div>

      {/* Use the custom table for projects */}
      <ProjectsList data={tableData} teamId={teamId!} />
    </Container>
  );
}
