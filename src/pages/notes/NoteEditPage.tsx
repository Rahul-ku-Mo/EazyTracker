import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, X, Globe, Lock, Calendar, User, FileText,Rocket, Pencil, Laugh } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/context/ThemeProvider";
import { getNote, updateNote } from "@/apis/notes";
import { api } from "@/lib/api";


// Icon mapping to match the main notes page
const iconMap = {
  RotateCcw: () => <div className="w-6 h-6 rounded-full bg-blue-500" />,
  Star: () => <div className="w-6 h-6 rounded-full bg-yellow-500" />,
  Calendar: () => <div className="w-6 h-6 rounded-full bg-green-500" />,
  Users: () => <div className="w-6 h-6 rounded-full bg-red-500" />,
  FileText: () => <div className="w-6 h-6 rounded-full bg-purple-500" />,
  Plus: () => <div className="w-6 h-6 rounded-full bg-gray-500" />,
};

interface Note {
  id: string;
  title: string;
  content: string;
  icon: string;
  iconColor: string;
  isCompleted: boolean;
  isPublic: boolean;
  priority?: number;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  hoverColor: string;
  isDefault: boolean;
  notes: Note[];
  createdAt: string;
  updatedAt: string;
}

// API functions for categories
const fetchCategories = async (): Promise<Category[]> => {
  const response = await api.get('/notes/categories');
  return response.data;
};

const NoteEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { data: note, isLoading, error } = useQuery<Note>({
    queryKey: ["note", id],
    queryFn: () => getNote(id as string),
    enabled: !!id,
  });

  // Fetch categories for sidebar
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const updateNoteMutation = useMutation({
    mutationFn: (data: { title: string; content: string; isPublic: boolean }) =>
      updateNote(id as string, data),
    onSuccess: (updatedNote) => {
      queryClient.setQueryData(["note", id], updatedNote);
      setHasUnsavedChanges(false);
    },
  });

  // Initialize form with note data
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setIsPublic(note.isPublic);
    }
  }, [note]);

  // Track unsaved changes
  useEffect(() => {
    if (note) {
      const hasChanges = 
        title !== note.title || 
        content !== note.content || 
        isPublic !== note.isPublic;
      setHasUnsavedChanges(hasChanges);
    }
  }, [title, content, isPublic, note]);

  const handleSave = () => {
    updateNoteMutation.mutate({ title, content, isPublic });
  };

  const handleDiscard = () => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setIsPublic(note.isPublic);
      setHasUnsavedChanges(false);
    }
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm("You have unsaved changes. Are you sure you want to leave?");
      if (!confirmed) return;
    }
    navigate(`/notes/view/${id}`);
  };

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
        <div className="w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="gap-2">
                  <IconComponent />
                  {note.category?.name || 'Unknown Category'}
                </Badge>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsPublic(!isPublic)}
                  className="gap-2"
                  title={isPublic ? "Make Private" : "Make Public"}
                >
                  {isPublic ? (
                    <>
                      <Globe className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm">Public</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-zinc-400" />
                      <span className="text-sm">Private</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleDiscard}
                variant="ghost"
                size="sm"
                disabled={!hasUnsavedChanges}
                className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-4 h-4" />
                Discard
              </Button>

              <Button
                onClick={() => navigate(`/notes/view/${note.id}`)}
                variant="ghost"
                size="sm"
                className="gap-2"
              >
                <FileText className="w-4 h-4" />
                View
              </Button>

              <Button
                onClick={handleSave}
                disabled={!hasUnsavedChanges || updateNoteMutation.isPending}
                size="sm"
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                {updateNoteMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>

          {/* Unsaved changes indicator - Fixed position to prevent layout shift */}
       
        </div>
      </div>

      {/* Content with Sidebar */}
      <div className="w-full flex">
        {/* Left Sidebar - Fixed */}
        <div className={`w-80 flex-shrink-0 h-screen sticky top-0 ${isDark ? 'bg-zinc-900/95 border-zinc-800' : 'bg-zinc-50 border-zinc-200'} border-r overflow-y-auto`}>
          <div className="p-6 space-y-6">
         {(() => {
              if (!note.category?.slug) return null;
              
              const currentCategory = categories.find(cat => cat.slug === note.category.slug);
              const otherNotes = currentCategory?.notes?.filter(n => n.id !== note.id) || [];
              
              return otherNotes.length > 0 && (
                <div className="space-y-1">
                {otherNotes.slice(0, 5).map((relatedNote) => (
                  <button
                    key={relatedNote.id}
                    onClick={() => {
                      if (hasUnsavedChanges) {
                        const confirmed = window.confirm("You have unsaved changes. Are you sure you want to leave?");
                        if (!confirmed) return;
                      }
                      navigate(`/notes/${relatedNote.id}/edit`);
                    }}
                    className={`w-full text-left p-3 rounded-md text-sm transition-colors ${
                      isDark 
                        ? 'hover:bg-zinc-800/50 text-zinc-300 hover:text-zinc-100' 
                        : 'hover:bg-white text-zinc-600 hover:text-zinc-900'
                    }`}
                    title={relatedNote.title}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex-shrink-0">
                        {relatedNote.isPublic ? (
                          <Globe className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Lock className="w-3 h-3 text-zinc-400" />
                        )}
                      </div>
                      <span className="truncate">{relatedNote.title}</span>
                    </div>
                    <div className="text-xs text-zinc-500 truncate">
                      {relatedNote.content.slice(0, 100)}
                    </div>
                  </button>
                ))}
              </div>
              );
            })()}

        

            <div className="space-y-3">
              <h4 className={`text-sm font-semibold ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                Details
              </h4>
              <div className="space-y-3 text-xs">
                <div className={`flex items-center gap-2 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  <Calendar className="w-3 h-3" />
                  <span>Created {new Date(note.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}</span>
                </div>
                <div className={`flex items-center gap-2 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  <User className="w-3 h-3" />
                  <span>Modified {new Date(note.updatedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 px-8 py-8">
          {/* Title Editor */}
          <div className="flex items-center gap-2 text-sm text-zinc-500 ">
            <span className="inline-flex items-center gap-2 cursor-pointer px-2 py-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 opacity-0 hover:opacity-100 transition-opacity duration-200">
              <Laugh className="w-4 h-4" />
              Add Icon</span>
            <span className="inline-flex items-center gap-2 cursor-pointer px-2 py-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 opacity-0 hover:opacity-100 transition-opacity duration-200">
              <Pencil className="w-4 h-4" />
              Add Comment</span>
            <span className="inline-flex items-center gap-2 cursor-pointer px-2 py-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 opacity-0 hover:opacity-100 transition-opacity duration-200">
              <Rocket className="w-4 h-4" />
              Add Cover Image</span>
          </div>

          <div className="py-2">
            <Input
              value={title}
              name="title"
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled"
              className={`!text-4xl font-bold border-none p-0 h-auto bg-transparent resize-none
                ${isDark ? 'text-white placeholder:text-zinc-500' : 'text-zinc-900 placeholder:text-zinc-400'}
                focus-visible:ring-0 focus-visible:ring-offset-0`}
              style={{ boxShadow: 'none' }}
            />
          </div>

          {/* Content Editor */}
          <div className="prose prose-lg max-w-none">
            <Textarea
              value={content}
              name="content"
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing..."
              className={`min-h-[400px] border-none p-0 bg-transparent resize-none text-base leading-relaxed
                ${isDark ? 'text-zinc-200 placeholder:text-zinc-500' : 'text-zinc-700 placeholder:text-zinc-400'}
                focus-visible:ring-0 focus-visible:ring-offset-0`}
              style={{ boxShadow: 'none' }}
            />
          </div>
        </div>
      </div>

      {/* Auto-save indicator */}
      {updateNoteMutation.isPending && (
        <div className="fixed bottom-4 right-4">
          <div className={`px-3 py-1 rounded-full text-xs ${isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-600'}`}>
            Saving...
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteEditPage; 