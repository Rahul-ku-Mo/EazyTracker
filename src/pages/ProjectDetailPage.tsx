import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Container from '@/layouts/Container';
import { getProject } from '@/apis/project';
import { Loader2, Calendar } from 'lucide-react';

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
  const MemberAvatars = ({ members }: { members: any[] }) => (
    <div className="flex -space-x-2">
      {members.map((member, i) => (
        <div key={i} className="w-7 h-7 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-bold">
          {member.user.imageUrl ? (
            <img src={member.user.imageUrl} alt={member.user.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            member.user.name?.[0] || '?' 
          )}
        </div>
      ))}
    </div>
  );

  // Helper for lead avatar
  const LeadAvatar = ({ lead }: { lead: any }) => (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-bold">
        {lead?.imageUrl ? (
          <img src={lead.imageUrl} alt={lead.name} className="w-full h-full rounded-full object-cover" />
        ) : (
          lead?.name?.[0] || '?' 
        )}
      </div>
      <span className="text-xs">{lead?.name || 'Unassigned'}</span>
    </div>
  );

  return (
    <Container>
      <div className="flex flex-col lg:flex-row gap-8 min-h-screen">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
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
            <div className="flex flex-wrap gap-2 mt-2">
              {project.boards?.map(({ board }: any) => (
                <Badge key={board.id} variant="secondary">{board.title}</Badge>
              ))}
            </div>
          </div>

          {/* Initiatives */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Initiatives</h2>
            <div className="flex flex-wrap gap-2">
              {project.milestones && project.milestones.length > 0 ? (
                project.milestones.map((initiative: string, idx: number) => (
                  <Badge key={idx} variant="outline">{initiative}</Badge>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">No initiatives</span>
              )}
            </div>
          </div>

          {/* Resources & Customers (placeholders) */}
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <h2 className="text-sm font-medium mb-1">Resources</h2>
              <Button variant="ghost" size="sm" className="text-xs px-2">+ Add document or link...</Button>
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-medium mb-1">Customers</h2>
              <Button variant="ghost" size="sm" className="text-xs px-2">+ Add customer request</Button>
            </div>
          </div>

          {/* Project Update (placeholder) */}
          <div className="mb-6">
            <Button variant="outline" className="w-full h-12 text-muted-foreground">Write first project update</Button>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <div className="prose prose-sm max-w-none text-muted-foreground">
              {project.description || <span className="italic">Add description...</span>}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-80 flex-shrink-0 border-l border-border/40 pl-6 space-y-8">
          {/* Properties */}
          <div>
            <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Properties</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span>Status</span>
                <Badge variant="outline">{project.status}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Priority</span>
                <span>{project.priority || 'No priority'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Lead</span>
                <LeadAvatar lead={project.lead} />
              </div>
              <div className="flex items-center justify-between">
                <span>Members</span>
                <span className="flex items-center gap-1"><MemberAvatars members={project.members} /> {project.members.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Dates</span>
                <span>{project.targetDate ? new Date(project.targetDate).toLocaleDateString() : '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Teams</span>
                <span>{project.boards?.map(({ board }: any) => board.title).join(', ') || '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Initiatives</span>
                <span>{project.milestones?.length || 0}</span>
              </div>
            </div>
          </div>

          {/* Milestones */}
          <div>
            <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Milestones</h3>
            <div className="text-xs text-muted-foreground">Add milestones to organize work within your project and break it into more granular stages.</div>
          </div>

          {/* Progress (placeholder) */}
          <div>
            <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Progress</h3>
            <div className="flex items-center gap-2 text-xs">
              <span>Scope</span>
              <Badge variant="outline">{project.cards?.length || 0}</Badge>
              <span>Started</span>
              <Badge variant="outline">0</Badge>
              <span>Completed</span>
              <Badge variant="outline">{project.cards?.filter((c: any) => c.status === 'Completed').length || 0}</Badge>
            </div>
          </div>

          {/* Assignees (placeholder) */}
          <div>
            <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Assignees</h3>
            <div className="flex flex-col gap-2">
              {project.members.map((member: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                    {member.user.imageUrl ? (
                      <img src={member.user.imageUrl} alt={member.user.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      member.user.name?.[0] || '?' 
                    )}
                  </div>
                  <span>{member.user.name}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </Container>
  );
};

export default ProjectDetailPage; 