import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Globe, Lock, Edit, MoreHorizontal, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/context/ThemeProvider";
import { getNote } from "@/apis/notes";

// Icon mapping to match the main notes page
const iconMap = {
  RotateCcw: () => <div className="w-6 h-6 rounded-full bg-blue-500" />,
  Star: () => <div className="w-6 h-6 rounded-full bg-yellow-500" />,
  Calendar: () => <div className="w-6 h-6 rounded-full bg-green-500" />,
  Users: () => <div className="w-6 h-6 rounded-full bg-red-500" />,
  FileText: () => <div className="w-6 h-6 rounded-full bg-purple-500" />,
  Plus: () => <div className="w-6 h-6 rounded-full bg-gray-500" />,
};



const NoteViewPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const { data: note, isLoading, error } = useQuery({
    queryKey: ["note", id],
    queryFn: () => getNote(id as string),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading note...</div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-destructive mb-4">Failed to load note</div>
        <Button onClick={() => navigate('/notes')} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Notes
        </Button>
      </div>
    );
  }

  const IconComponent = iconMap[note.icon as keyof typeof iconMap] || iconMap.FileText;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-zinc-900' : 'bg-white'}`}>
      {/* Header */}
      <div className={`sticky top-0 z-10 border-b ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/notes')}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Notes
              </Button>
              
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="gap-2">
                  <IconComponent />
                  {note.category.name}
                </Badge>
                
                <div className="flex items-center" title={note.isPublic ? "Public" : "Private"}>
                  {note.isPublic ? (
                    <Globe className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Lock className="w-4 h-4 text-zinc-400" />
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => navigate(`/notes/${id}/edit`)}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Calendar className="w-4 h-4 mr-2" />
                    Created {new Date(note.createdAt).toLocaleDateString()}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <User className="w-4 h-4 mr-2" />
                    Last updated {new Date(note.updatedAt).toLocaleDateString()}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            {note.title}
          </h1>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Created {new Date(note.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              Updated {new Date(note.updatedAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className={`prose prose-lg max-w-none ${isDark ? 'prose-invert' : ''}`}>
          <div className={`whitespace-pre-wrap leading-relaxed ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
            {note.content}
          </div>
        </div>

        {/* Empty state if no content */}
        {!note.content && (
          <div className="text-center py-16">
            <div className="text-muted-foreground mb-4">This note is empty</div>
            <Button
              onClick={() => navigate(`/notes/${id}/edit`)}
              variant="outline"
              className="gap-2"
            >
              <Edit className="w-4 h-4" />
              Add content
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteViewPage;