import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import Container from '@/layouts/Container';
import { getProject } from '@/apis/project';
import { Loader2, Calendar } from 'lucide-react';
import ProjectSidebar from '@/_components/Projects/project-sidebar';
import { MemberAvatars, LeadAvatar } from '@/_components/Projects/utils';

const ProjectDetailPage = () => {
  const { projectSlug } = useParams();

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', projectSlug],
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
      <div className="flex flex-col lg:flex-row gap-8 min-h-screen">
        {/* Main Content */}
        <div className="flex-1 min-w-0 py-4">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-1">{project.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-2">
              <span className="flex items-center gap-1">
                <Badge variant="outline">{project.status}</Badge>
              </span>
              <span className="flex items-center gap-1">
                <Badge variant="outline">{project.priority || 'No priority'}</Badge>
              </span>
              <span className="flex items-center gap-1">
                <LeadAvatar lead={project.lead} />
              </span>
              <span className="flex items-center gap-1">
                <MemberAvatars members={project.members} />
                <span className="text-xs">{project.members.length} members</span>
              </span>
              {project.targetDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(project.targetDate).toLocaleDateString()}
                </span>
              )}
            </div>
            {project.workspaces && project.workspaces.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {project.workspaces.map(({ workspace }: any) => (
                  <Badge key={workspace.id} variant="secondary">{workspace.title}</Badge>
                ))}
              </div>
            )}
          </div>

          {/* Initiatives */}
          {project.milestones && project.milestones.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Initiatives</h2>
              <div className="flex flex-wrap gap-2">
                {project.milestones.map((initiative: string, idx: number) => (
                  <Badge key={idx} variant="outline">{initiative}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {project.description && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <div className="prose prose-sm max-w-none text-muted-foreground">
                {project.description}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-80 flex-shrink-0 border-l border-border/40 pl-6 space-y-8 py-4">
          <ProjectSidebar project={project} />
        </aside>
      </div>
    </Container>
  );
};

export default ProjectDetailPage; 