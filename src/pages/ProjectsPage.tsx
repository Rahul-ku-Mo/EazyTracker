import { useQuery } from "@tanstack/react-query";
import { Box } from "lucide-react";
import { getProjects } from "@/apis/project";
import Container from "@/layouts/Container";

import {
  ProjectsTable,
  ProjectTableRow,
} from "@/_components/Projects/all-projects-table";

export default function ProjectsPage() {
 
  // Fetch current user's team
  const teamId = localStorage.getItem("teamId");

  // Fetch projects
  const { data: projects, isLoading: isLoadingProjects } = useQuery({
    queryKey: ["projects", teamId],
    queryFn: () => getProjects(teamId!),
    enabled: !!teamId,
  });



  // Map projects to table rows using real data
  const tableData: ProjectTableRow[] = (projects || []).map((project) => ({
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
      <Container>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold">Loading Projects...</h2>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container fwdClassName="!px-0">
      <div className="flex items-center justify-between pt-4 px-4">
        <div className="flex items-center gap-3 pb-2 ">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
            <Box className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold hidden md:block">My Projects</h1>
            <p className="text-sm text-muted-foreground">
              Manage your projects and create new ones
            </p>
          </div>
        </div>

      </div>

      {/* Use the custom table for projects */}
      <ProjectsTable data={tableData} teamId={teamId!} />
    </Container>
  );
}
