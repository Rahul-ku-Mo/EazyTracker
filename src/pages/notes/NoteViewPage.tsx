import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Save, X, Globe, Lock, FileText, Rocket, Pencil, Edit, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect, useCallback } from "react";

import { useTheme } from "@/context/ThemeProvider";
import { getNote, updateNote } from "@/apis/notes";
import EmojiPicker from "@/_components/Notes/emojiPicker";
import NoteSidebar from "@/_components/Notes/edit-note/Sidebar";

interface Note {
  id: string;
  title: string;
  content: string;
  icon: string;
  iconColor: string;
  isCompleted: boolean;
  isPublic: boolean;
  priority?: number;
  emoji?: string;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

const NoteViewPage = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const queryClient = useQueryClient();
  
  // Get mode and slug from query parameters
  const mode = searchParams.get('mode') || 'view';
  const slug = searchParams.get('slug') || 'plan';
  const isEditMode = mode === 'edit';

  // Edit mode state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [emoji, setEmoji] = useState<string>("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Memoized emoji handlers to prevent unnecessary re-renders
  const handleEmojiSelect = useCallback((selectedEmoji: string) => {
    setEmoji(selectedEmoji);
  }, []);

  const handleEmojiRemove = useCallback(() => {
    setEmoji("");
  }, []);

  const {
    data: note,
    isLoading,
    error,
  } = useQuery<Note>({
    queryKey: ["note", id],
    queryFn: () => getNote(id as string),
    enabled: !!id,
  });

  const updateNoteMutation = useMutation({
    mutationFn: (data: { title: string; content: string; isPublic: boolean; emoji?: string }) =>
      updateNote({ id: id as string, ...data }),
    onSuccess: (updatedNote) => {
      // Update the current note data
      queryClient.setQueryData(["note", id], updatedNote);
      
      // Update categories cache to reflect the updated note without invalidating
      queryClient.invalidateQueries({ queryKey: ["notesByCategory", slug] });
      
      setHasUnsavedChanges(false);
    },
    onError: (error) => {
      console.error('Error updating note:', error);
    },
  });

  // Initialize form with note data (for edit mode)
  useEffect(() => {
    if (note && isEditMode) {
      setTitle(note.title);
      setContent(note.content);
      setIsPublic(note.isPublic);
      setEmoji(note.emoji || "");
    }
  }, [note, isEditMode]);

  // Track unsaved changes (for edit mode)
  useEffect(() => {
    if (note && isEditMode) {
      const hasChanges = 
        title !== note.title || 
        content !== note.content || 
        isPublic !== note.isPublic ||
        emoji !== (note.emoji || "");
      setHasUnsavedChanges(hasChanges);
    }
  }, [title, content, isPublic, emoji, note, isEditMode]);

  const handleSave = () => {
    updateNoteMutation.mutate({ title, content, isPublic, emoji });
  };

  const handleDiscard = () => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setIsPublic(note.isPublic);
      setEmoji(note.emoji || "");
      setHasUnsavedChanges(false);
    }
  };

  const handleBack = () => {
    if (isEditMode && hasUnsavedChanges) {
      const confirmed = window.confirm("You have unsaved changes. Are you sure you want to leave?");
      if (!confirmed) return;
    }
    // Use the note's category slug or fallback to the current slug
    const categorySlug = note?.category?.slug || slug;
    navigate(`/notes/${categorySlug}`);
  };

  const handleModeToggle = () => {
    if (isEditMode && hasUnsavedChanges) {
      const confirmed = window.confirm("You have unsaved changes. Are you sure you want to leave?");
      if (!confirmed) return;
    }
    
    const categorySlug = note?.category?.slug || slug;
    const newMode = isEditMode ? 'view' : 'edit';
    navigate(`/notes/${id}?slug=${categorySlug}&mode=${newMode}`);
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
        <Button onClick={() => navigate("/notes")} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Notes
        </Button>
      </div>
    );
  }

  // Edit Mode Layout
  if (isEditMode) {
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
                  onClick={handleModeToggle}
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
          </div>
        </div>

        {/* Content with Sidebar */}
        <div className="w-full flex">
                     <NoteSidebar hasUnsavedChanges={hasUnsavedChanges} navigate={navigate} slug={slug as string} />
          
          {/* Main Content Area */}
          <div className="flex-1 px-8 py-8 dark:bg-black/50 bg-white">
            {/* Emoji Picker */}
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <div className="emoji-picker-container">
                <EmojiPicker 
                  currentEmoji={emoji}
                  onEmojiSelect={handleEmojiSelect}
                  onEmojiRemove={handleEmojiRemove}
                />
              </div>
              <span className="inline-flex items-center gap-2 cursor-pointer px-2 py-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 opacity-0 hover:opacity-100 transition-opacity duration-200">
                <Pencil className="w-4 h-4" />
                Add Comment
              </span>
              <span className="inline-flex items-center gap-2 cursor-pointer px-2 py-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 opacity-0 hover:opacity-100 transition-opacity duration-200">
                <Rocket className="w-4 h-4" />
                Add Cover Image
              </span>
            </div>

            {/* Emoji Display */}
            {emoji && (
              <div className="py-4">
                <span 
                  className="text-6xl cursor-pointer hover:scale-110 transition-transform duration-200"
                  onClick={() => {
                    const trigger = document.querySelector('.emoji-picker-trigger') as HTMLElement;
                    trigger?.click();
                  }}
                  title="Click to change or remove emoji"
                >
                  {emoji}
                </span>
              </div>
            )}

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
  }

  // View Mode Layout
  return (
    <div className={`min-h-screen ${isDark ? "bg-zinc-900" : "bg-white"}`}>
      {/* Header */}
      <div
        className={`sticky top-0 z-10 border-b ${
          isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
        }`}
      >
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const categorySlug = note.category?.slug || slug || 'plan';
                  navigate(`/notes/${categorySlug}`);
                }}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Notes
              </Button>

              <div className="flex items-center gap-2">
                <div
                  className="flex items-center"
                  title={note.isPublic ? "Public" : "Private"}
                >
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
                onClick={handleModeToggle}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Emoji Display */}
        {note.emoji && (
          <div className="py-4">
            <span className="text-6xl">{note.emoji}</span>
          </div>
        )}

        {/* Title */}
        <div className="mb-8">
          <h1
            className={`text-4xl font-bold mb-4 ${
              isDark ? "text-white" : "text-zinc-900"
            }`}
          >
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
        <div
          className={`prose prose-lg max-w-none ${
            isDark ? "prose-invert" : ""
          }`}
        >
          <div
            className={`whitespace-pre-wrap leading-relaxed ${
              isDark ? "text-zinc-300" : "text-zinc-700"
            }`}
          >
            {note.content}
          </div>
        </div>

        {/* Empty state if no content */}
        {!note.content && (
          <div className="text-center py-16">
            <div className="text-muted-foreground mb-4">This note is empty</div>
            <Button
              onClick={handleModeToggle}
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
