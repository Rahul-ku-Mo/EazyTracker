import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef, useCallback } from "react";

import { getNote, updateNote } from "@/apis/notes";

import NoteSidebar from "@/_components/Notes/edit-note/Sidebar";
import NoteHeader from "@/_components/Notes/edit-note/Header";
import { Note, Cover } from "@/interfaces/notes";
import NoteMainContent from "@/_components/Notes/edit-note/Main";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import RightPanel from "@/_components/Notes/RightPanel";


const NoteEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Get slug from query parameters
  const slug = searchParams.get('slug') || 'plan';

  // Edit mode state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [emoji, setEmoji] = useState<string>("");
  const [cover, setCover] = useState<Cover | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [showSavedIndicator, setShowSavedIndicator] = useState(false);
  const [showCommentsPanel, setShowCommentsPanel] = useState(false);
  
  // Refs for autosave debouncing
  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<{
    title: string;
    content: string;
    isPublic: boolean;
    emoji: string;
    cover: Cover | null;
  } | null>(null);


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
    mutationFn: (data: { title: string; content: string; isPublic: boolean; emoji?: string; cover?: Cover | null }) =>
      updateNote({ id: id as string, ...data }),
    onSuccess: (updatedNote) => {
      // Update the current note data
      queryClient.setQueryData(["note", id], updatedNote);
      
      // Update categories cache optimistically without invalidating to prevent portal closures
      queryClient.setQueryData(["notesByCategory", slug], (oldData: any) => {
        if (!oldData) return oldData;
        
        // Update the specific note in the categories data
        const updatedData = { ...oldData };
        if (updatedData.notes) {
          updatedData.notes = updatedData.notes.map((note: any) => 
            note.id === updatedNote.id ? updatedNote : note
          );
        }
        return updatedData;
      });
      
      setHasUnsavedChanges(false);
      setIsAutoSaving(false);
      
      // Show saved indicator briefly
      setShowSavedIndicator(true);
      setTimeout(() => setShowSavedIndicator(false), 2000); // Hide after 2 seconds
      
      // Update last saved data reference
      lastSavedDataRef.current = {
        title: updatedNote.title,
        content: updatedNote.content,
        isPublic: updatedNote.isPublic,
        emoji: updatedNote.emoji || "",
        cover: updatedNote.cover || null,
      };
    },
    onError: (error) => {
      console.error('Error updating note:', error);
      setIsAutoSaving(false);
    },
  });

  // Initialize form with note data
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setIsPublic(note.isPublic);
      setEmoji(note.emoji || "");
      setCover(note.cover || null);
      
      // Initialize last saved data reference
      lastSavedDataRef.current = {
        title: note.title,
        content: note.content,
        isPublic: note.isPublic,
        emoji: note.emoji || "",
        cover: note.cover || null,
      };
    }
  }, [note]);

  // Autosave function with debouncing
  const triggerAutosave = useCallback(() => {
    if (!note || updateNoteMutation.isPending) return;
    
    const currentData = {
      title,
      content,
      isPublic,
      emoji,
      cover,
    };
    
    // Check if data has actually changed compared to last saved state
    const lastSaved = lastSavedDataRef.current;
    if (lastSaved && 
        currentData.title === lastSaved.title &&
        currentData.content === lastSaved.content &&
        currentData.isPublic === lastSaved.isPublic &&
        currentData.emoji === lastSaved.emoji &&
        JSON.stringify(currentData.cover) === JSON.stringify(lastSaved.cover)) {
      return; // No changes to save
    }
    
    setIsAutoSaving(true);
    updateNoteMutation.mutate(currentData);
  }, [title, content, isPublic, emoji, cover, note, updateNoteMutation]);

  // Track unsaved changes and trigger autosave
  useEffect(() => {
    if (note) {
      const hasChanges = 
        title !== note.title || 
        content !== note.content || 
        isPublic !== note.isPublic ||
        emoji !== (note.emoji || "") ||
        JSON.stringify(cover) !== JSON.stringify(note.cover || null);
      setHasUnsavedChanges(hasChanges);
      
      // Clear existing timeout
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
      
      // Set new timeout for autosave (3 seconds after last change)
      if (hasChanges && !updateNoteMutation.isPending) {
        autosaveTimeoutRef.current = setTimeout(() => {
          triggerAutosave();
        }, 2000); // 2 seconds debounce
      }
    }
    
    // Cleanup timeout on unmount
    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
    };
  }, [title, content, isPublic, emoji, cover, note, triggerAutosave, updateNoteMutation.isPending]);

  const handleToggleComments = () => {
    setShowCommentsPanel(!showCommentsPanel);
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

  return (
    <div className="h-screen w-screen overflow-hidden">
      <SidebarProvider defaultOpen={false}>
        <div className="flex h-full w-full relative">
          <NoteSidebar 
            hasUnsavedChanges={hasUnsavedChanges} 
            navigate={navigate} 
            slug={slug as string}
          />
          
          <SidebarInset className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
            showCommentsPanel ? 'mr-80' : ''
          }`}>
            <NoteHeader
              isPublic={isPublic}
              onPrivacyToggle={() => setIsPublic(!isPublic)}
              isEditMode={true}
              hasUnsavedChanges={hasUnsavedChanges}
              isAutoSaving={isAutoSaving}
              showSavedIndicator={showSavedIndicator}
              onToggleComments={handleToggleComments}
              lastEditedBy="You"
              lastEditedTime={note.updatedAt ? new Date(note.updatedAt).toLocaleDateString() : "just now"}
              showBackButton={true}
              onBack={() => {
                if (hasUnsavedChanges) {
                  const confirmed = window.confirm("You have unsaved changes. Are you sure you want to leave?");
                  if (!confirmed) return;
                }
                navigate(`/notes/${slug}`);
              }}
            />

            {/* Content Area */}
            <NoteMainContent 
              currentTitle={note?.title || ""} 
              currentContent={note?.content || ""}
              currentEmoji={note?.emoji || ""}
              currentCover={note?.cover || null}
              onTitleChange={setTitle}
              onContentChange={setContent}
              onEmojiChange={setEmoji}
              onCoverChange={setCover}
              readOnly={false}
            />
          </SidebarInset>

          {/* Right Panel - Comments Only */}
          <RightPanel
            isOpen={showCommentsPanel}
            onClose={() => {
              setShowCommentsPanel(false);
            }}
          />


        </div>
      </SidebarProvider>
    </div>
  );
};

export default NoteEditPage; 