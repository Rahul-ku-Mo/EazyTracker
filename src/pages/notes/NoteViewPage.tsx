import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

import { getNote } from "@/apis/notes";

import NoteSidebar from "@/_components/Notes/edit-note/Sidebar";
import NoteHeader from "@/_components/Notes/edit-note/Header";
import { Note } from "@/interfaces/notes";
import NoteMainContent from "@/_components/Notes/edit-note/Main";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

const NoteViewPage = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get slug from query parameters
  const slug = searchParams.get('slug') || 'plan';
  

  const {
    data: note,
    isLoading,
    error,
  } = useQuery<Note>({
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
        <div className="flex h-full w-full">
          <NoteSidebar 
            hasUnsavedChanges={false} 
            navigate={navigate} 
            slug={slug as string}
          />
          
          <SidebarInset className="flex-1 flex flex-col overflow-hidden">
            <NoteHeader
              isPublic={note.isPublic}
              onPrivacyToggle={() => {}}
              isEditMode={false}
              hasUnsavedChanges={false}
              lastEditedBy="You"
              lastEditedTime={note.updatedAt ? new Date(note.updatedAt).toLocaleDateString() : "just now"}
              showBackButton={true}
              onBack={() => navigate(`/notes/${slug}`)}
            />

            {/* Content Area */}
            <NoteMainContent 
              currentTitle={note?.title || ""} 
              currentContent={note?.content || ""}
              currentEmoji={note?.emoji || ""}
              currentCover={note?.cover || null}
              readOnly={true}
            />
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default NoteViewPage;
