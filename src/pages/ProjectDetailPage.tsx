import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import Container from "@/layouts/Container";
import { getProject } from "@/apis/project";
import { Loader2 } from "lucide-react";
import { ProjectSidebar } from "@/_components/Projects/project-sidebar";
import { ProjectDescriptionEditor } from "@/_components/Projects/project-description-editor-v2";
import { MemberAvatars, LeadAvatar } from "@/_components/Projects/utils";
import Milestone from "@/_components/Projects/actions/milestone";
import { TargetIcon } from "@/_components/shared/svg/SharedIcons";

const ProjectDetailPage = () => {
  const { projectSlug } = useParams();

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", projectSlug],
    queryFn: () => getProject(projectSlug!),
    enabled: !!projectSlug,
  });

  if (isLoading) {
    return (
      <Container>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
        </div>
      </Container>
    );
  }

  if (!project) {
    return (
      <Container>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground text-xs">Project not found</div>
        </div>
      </Container>
    );
  }

  // Helper for member avatars

  return (
    <Container>
      <div className="flex flex-col lg:flex-row gap-4 min-h-screen">
        {/* Main Content */}
        <div className="flex-1 min-w-0 py-4 flex flex-col gap-2">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">
              {project.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-2">
              <span className="flex items-center gap-1">
                <Badge variant="outline">{project.status}</Badge>
              </span>
              <span className="flex items-center gap-1">
                <Badge variant="outline">
                  {project.priority || "No priority"}
                </Badge>
              </span>
              <span className="flex items-center gap-1">
                <LeadAvatar lead={project.lead} />
              </span>
              <span className="flex items-center gap-1">
                <MemberAvatars members={project.members} />
                <span className="text-xs">
                  {project.members.length} members
                </span>
              </span>
              {project.targetDate && (
                <span className="flex items-center gap-1 text-xs font-mono">
                  <TargetIcon className="w-4 h-4" />
                  {new Date(project.targetDate).toLocaleDateString()}
                </span>
              )}
            </div>
            {project.workspaces && project.workspaces.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {project.workspaces.map(({ workspace }: any) => (
                  <Badge key={workspace.id} variant="secondary">
                    {workspace.title}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <ProjectDescriptionEditor
            project={project}
            initialDescription={project.description || ""}
          />

          {/* Milestones */}
          {project.milestones && project.milestones.length > 0 && (
            <Milestone
              fwdClassname="mx-0"
              externalMilestones={project.milestones}
              projectSlug={projectSlug}
              readOnly={false}
            />
          )}
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-60 flex-shrink-0 border-l border-border/40 pl-4 py-4">
          <ProjectSidebar project={project} />
        </aside>
      </div>
    </Container>
  );
};

export default ProjectDetailPage;
