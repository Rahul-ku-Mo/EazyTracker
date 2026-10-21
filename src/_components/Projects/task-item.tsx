
import { CheckCircle2, Circle, MoreVertical, MessageSquare, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TaskItemProps {
  task: {
    id: string;
    title: string;
    status: 'todo' | 'in_progress' | 'done';
    priority?: 'low' | 'medium' | 'high';
    dueDate?: string;
    assignee?: {
      name: string;
      avatar?: string;
    };
    commentsCount?: number;
  };
  onStatusChange?: (id: string, status: 'todo' | 'in_progress' | 'done') => void;
}

export const TaskItem = ({ task, onStatusChange }: TaskItemProps) => {
  return (
    <div className="flex items-start gap-3 p-2 hover:bg-muted/50 rounded-sm group">
      <button
        onClick={() => onStatusChange?.(task.id, task.status === 'done' ? 'todo' : 'done')}
        className="mt-1"
      >
        {task.status === 'done' ? (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        ) : (
          <Circle className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm truncate">{task.title}</span>
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100">
            {task.assignee && (
              <Avatar className="h-5 w-5">
                <AvatarImage src={task.assignee.avatar} />
                <AvatarFallback>{task.assignee.name[0]}</AvatarFallback>
              </Avatar>
            )}
            {task.priority && (
              <Badge variant="outline" className="text-xs h-5">
                {task.priority}
              </Badge>
            )}
            {task.commentsCount && task.commentsCount > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MessageSquare className="h-3 w-3" />
                {task.commentsCount}
              </div>
            )}
            {task.dueDate && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {new Date(task.dueDate).toLocaleDateString()}
              </div>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-6 w-6 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem className="text-xs">Edit</DropdownMenuItem>
                <DropdownMenuItem className="text-xs">Duplicate</DropdownMenuItem>
                <DropdownMenuItem className="text-xs text-destructive">
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskItem; 