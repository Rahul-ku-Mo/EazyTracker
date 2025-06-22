import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft,Edit, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

import { useTheme } from "@/context/ThemeProvider";
import { getNote, updateNote } from "@/apis/notes";

import NoteSidebar from "@/_components/Notes/edit-note/Sidebar";

import NoteHeader from "@/_components/Notes/edit-note/Header";
import { Note } from "@/interfaces/notes";
import NoteMainContent from "@/_components/Notes/edit-note/main";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";


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



  // Save functionality is now working properly

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
      <div className="h-screen w-screen overflow-hidden">
        <SidebarProvider defaultOpen={false}>
          <div className="flex h-full w-full">
            <NoteSidebar 
              hasUnsavedChanges={hasUnsavedChanges} 
              navigate={navigate} 
              slug={slug as string}
            />
            
            <SidebarInset className="flex-1 flex flex-col overflow-hidden">
            
              <NoteHeader
                  isPublic={isPublic}
                  onPrivacyToggle={() => setIsPublic(!isPublic)}
                  onShare={handleModeToggle}
                  shareButtonText="View"
                  isEditMode={true}
                  hasUnsavedChanges={hasUnsavedChanges}
                  onSave={handleSave}
                  onDiscard={handleDiscard}
                  isSaving={updateNoteMutation.isPending}
                  lastEditedBy="You"
                  lastEditedTime={note.updatedAt ? new Date(note.updatedAt).toLocaleDateString() : "just now"}
                />

              {/* Content Area */}
              <NoteMainContent 
                  currentTitle={note?.title || ""} 
                  currentContent={note?.content || ""}
                  currentEmoji={note?.emoji || ""}
                  onTitleChange={setTitle}
                  onContentChange={setContent}
                  onEmojiChange={setEmoji}
                />
            </SidebarInset>
          </div>
        </SidebarProvider>
      </div>
    );
  }

  // View Mode Layout
  return (
    <div className={`min-h-screen ${isDark ? "bg-zinc-900" : "bg-white"}`}>
      {/* Header */}
      <NoteHeader
        isPublic={note.isPublic}
        onPrivacyToggle={() => {}}
        onShare={handleModeToggle}
        shareButtonText="Edit"
        isEditMode={false}
        hasUnsavedChanges={false}
        lastEditedBy="You"
        lastEditedTime={note.updatedAt ? new Date(note.updatedAt).toLocaleDateString() : "just now"}
      />

      {/* Content */}
      <div className="max-w-4xl mx-auto px-8 py-8">
        {/* Emoji Display */}
        {note.emoji && (
          <div className="py-6">
            <span className="text-6xl">{note.emoji}</span>
          </div>
        )}

        {/* Title */}
        <div className="mb-8">
          <h1
            className={`text-5xl font-bold mb-6 ${
              isDark ? "text-white" : "text-zinc-900"
            }`}
          >
            {note.title}
          </h1>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Created {new Date(note.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2">
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
            className={`whitespace-pre-wrap leading-relaxed text-lg ${
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
