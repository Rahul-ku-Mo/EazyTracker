import React, { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2,
  Circle,
  ChevronRight,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Container from '@/layouts/Container';
import { api } from '@/lib/api';

interface Project {
  id: string;
  title: string;
  slug: string;
  description?: string;
  status: 'Parking Lot' | 'In Progress' | 'Done';
  priority: 'No priority' | 'Low' | 'Medium' | 'High';
  lead: {
    id: string;
    name: string;
    avatar?: string;
  };
  members: {
    id: string;
    name: string;
    avatar?: string;
  }[];
  targetDate?: string;
  team: string;
  initiatives: string[];
}

const ProjectsPage = () => {
  const { teamId } = useParams(); // Get teamId from URL params
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    status: 'Parking Lot',
    priority: 'No priority',
    leadId: '',
    members: [],
    targetDate: '',
    team: '',
    initiatives: []
  });
  const titleRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Fetch projects for the current team
  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects', teamId],
    queryFn: async () => {
      if (!teamId) {
        throw new Error('Team ID is required');
      }
      const response = await api.get(`/projects/team/${teamId}`);
      return response.data;
    },
    enabled: !!teamId // Only run query if teamId exists
  });

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.title) {
      toast({
        title: 'Error',
        description: 'Title is required',
        variant: 'destructive',
      });
      return;
    }
    // Add create mutation here with teamId
    if (!teamId) {
      toast({
        title: 'Error',
        description: 'Team ID is required',
        variant: 'destructive',
      });
      return;
    }
    // TODO: Add create project mutation
  };

  if (!teamId) {
    return (
      <Container>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground text-xs">No team selected</div>
        </div>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground text-xs">Loading projects...</div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-medium">Projects</h1>
          <Badge variant="outline" className="text-xs">
            {projects?.length || 0} total
          </Badge>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-6 text-xs rounded-sm">
              <Plus className="h-4 w-4 mr-1" />
              New Project
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      <div className="grid gap-3">
        {projects?.map((project: Project) => (
          <Card key={project.id} className="rounded-sm">
            <CardContent className="p-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Circle className="h-4 w-4 text-muted-foreground/60" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-medium">{project.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {project.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {project.members.length} members
                      </div>
                      {project.targetDate && (
                        <div className="flex items-center gap-1">
                          <ChevronRight className="h-4 w-4" />
                          {new Date(project.targetDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-32">
                    <DropdownMenuItem className="text-xs">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-xs text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px] p-0 gap-0 rounded-sm">
          <DialogHeader className="p-3 border-b">
            <DialogTitle className="text-sm">New Project</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateProject} className="space-y-3 p-3">
            <div>
              <Label htmlFor="title" className="text-xs">
                Title
              </Label>
              <Input
                id="title"
                ref={titleRef}
                value={newProject.title}
                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                className="h-6 text-xs rounded-sm mt-1"
              />
            </div>
            <div>
              <Label htmlFor="description" className="text-xs">
                Description
              </Label>
              <Textarea
                id="description"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                className="text-xs rounded-sm mt-1 min-h-[60px]"
              />
            </div>
            <div className="flex justify-end pt-3 border-t">
              <Button type="submit" size="sm" className="h-6 text-xs rounded-sm">
                Create Project
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default ProjectsPage; 