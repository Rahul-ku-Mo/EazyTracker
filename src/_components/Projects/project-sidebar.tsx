
import { Circle, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface ProjectSidebarProps {
  project: {
    status: string;
    priority: string;
    lead: {
      name: string;
      avatar?: string;
    };
    members: {
      name: string;
      avatar?: string;
    }[];
    dates?: {
      start?: string;
      target?: string;
    };
    teams?: string[];
    initiatives?: string[];
  };
}

export const ProjectSidebar = ({ project }: ProjectSidebarProps) => {
  return (
    <div className="w-[300px] border-l p-4 space-y-6">
      <div className="space-y-4">
        <div>
          <Label className="text-xs text-muted-foreground">Status</Label>
          <div className="flex items-center gap-2 mt-1">
            <Circle className="h-4 w-4" />
            <span className="text-xs">{project.status}</span>
          </div>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">Priority</Label>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs">{project.priority}</span>
          </div>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">Lead</Label>
          <div className="flex items-center gap-2 mt-1">
            <Avatar className="h-5 w-5">
              <AvatarImage src={project.lead.avatar} />
              <AvatarFallback>{project.lead.name[0]}</AvatarFallback>
            </Avatar>
            <span className="text-xs">{project.lead.name}</span>
          </div>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">Members</Label>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex -space-x-2">
              {project.members.map((member, i) => (
                <Avatar key={i} className="h-5 w-5 border-2 border-background">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback>{member.name[0]}</AvatarFallback>
                </Avatar>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              {project.members.length} members
            </span>
          </div>
        </div>

        {project.dates && (
          <div>
            <Label className="text-xs text-muted-foreground">Dates</Label>
            <div className="space-y-1 mt-1">
              {project.dates.target && (
                <div className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4" />
                  <span className="text-xs">
                    {new Date(project.dates.target).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {project.teams && project.teams.length > 0 && (
          <div>
            <Label className="text-xs text-muted-foreground">Teams</Label>
            <div className="flex flex-wrap gap-1 mt-1">
              {project.teams.map((team, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {team}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {project.initiatives && project.initiatives.length > 0 && (
          <div>
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Initiatives</Label>
              <Button variant="ghost" size="sm" className="h-6 text-xs">
                <Circle className="h-3 w-3 mr-1" />
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {project.initiatives.map((initiative, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {initiative}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectSidebar;
