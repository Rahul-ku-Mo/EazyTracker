import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Container from "@/layouts/Container";
import { getProject } from "@/apis/project";
import { Loader2, Lock, ArrowLeft, Plus } from "lucide-react";
import { ProjectSidebar } from "@/_components/Projects/project-sidebar";
import { ProjectDescriptionEditor } from "@/_components/Projects/project-description-editor";
import { MemberAvatars, LeadAvatar } from "@/_components/Projects/utils";
import Milestone from "@/_components/Projects/actions/milestone";
import { TargetIcon } from "@/_components/shared/svg/SharedIcons";
import { NewWorkspaceDialog } from "@/_components/Projects/new-workspace-dialog";

const ProjectDetailPage = () => {
  const { projectSlug } = useParams();
  const navigate = useNavigate();
  const [isNewWorkspaceOpen, setIsNewWorkspaceOpen] = useState(false);

  const { data: project, isLoading, error } = useQuery({
    queryKey: ["project", projectSlug],
    queryFn: () => getProject(projectSlug!),
    enabled: !!projectSlug,
    retry: false, // Don't retry on access denied errors
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

  // Handle access denied error
  if (error && (error as any)?.response?.status === 403) {
    return (
      <Container>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md w-full border-orange-200 dark:border-orange-800">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/30">
                  <Lock className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Access Denied</h3>
                  <p className="text-sm text-muted-foreground">
                    You don't have permission to access this project. Please contact your team admin or the project lead to request access.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/projects")}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Projects
                </Button>
              </div>
            </CardContent>
          </Card>
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
                  {project?.members?.length || 0} members
                </span>
              </span>
              {project.targetDate && (
                <span className="flex items-center gap-1 text-xs font-mono">
                  <TargetIcon className="w-4 h-4" />
                  {new Date(project.targetDate).toLocaleDateString()}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {(project.workspaces ?? []).length > 0 && (
                <>
                  {(project.workspaces ?? []).map((item: any) => {
                    const workspace = item.workspace ?? item;
                    return (
                      <Badge
                        key={workspace.id}
                        variant="secondary"
                        className="gap-1 cursor-pointer hover:opacity-90 transition-opacity"
                        style={{
                          backgroundColor: workspace.colorValue ? `${workspace.colorValue}20` : undefined,
                          color: workspace.colorValue || undefined,
                          borderColor: workspace.colorValue || undefined,
                        }}
                        onClick={() => {
                          const slug = workspace.slug ?? String(workspace.id);
                          navigate(`/projects/${projectSlug}/workspace/${slug}`);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            const slug = workspace.slug ?? String(workspace.id);
                            navigate(`/projects/${projectSlug}/workspace/${slug}`);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                      >
                        {workspace.title}
                      </Badge>
                    );
                  })}
                </>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setIsNewWorkspaceOpen(true)}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add workspace
              </Button>
            </div>
          </div>

          {/* Workspaces section — quick access to boards */}
          {((project.workspaces ?? []).length) > 0 && (
            <div className="rounded-lg border bg-muted/30 p-3">
              <h3 className="text-sm font-medium text-foreground mb-2">Workspaces</h3>
              <p className="text-xs text-muted-foreground mb-2">
                Open a board to view and manage cards.
              </p>
              <div className="flex flex-wrap gap-2">
                {(project.workspaces ?? []).map((item: any) => {
                  const workspace = item.workspace ?? item;
                  const slug = workspace.slug ?? String(workspace.id);
                  return (
                    <Button
                      key={workspace.id}
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs gap-1.5"
                      onClick={() => navigate(`/projects/${projectSlug}/workspace/${slug}`)}
                    >
                      <span
                        className="size-2 rounded-full shrink-0"
                        style={{ backgroundColor: workspace.colorValue || "#64748B" }}
                      />
                      {workspace.title}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          <NewWorkspaceDialog
            isOpen={isNewWorkspaceOpen}
            onClose={() => setIsNewWorkspaceOpen(false)}
            projectSlug={projectSlug!}
          />

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
