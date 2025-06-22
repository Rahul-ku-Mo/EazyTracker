import { Globe, Lock } from "lucide-react";
import { useRef } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Note } from "@/interfaces/notes";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  
  SidebarRail,
} from "@/components/ui/sidebar";

const fetchNotesByCategory = async (slug: string): Promise<Note[]> => {
  const response = await api.get(`/notes/categories/${slug}`);
  return response.data;
};

const NoteSidebar = ({
  hasUnsavedChanges,
  navigate,
  slug,
}: {
  hasUnsavedChanges: boolean;
  navigate: (path: string) => void;
  slug: string;
}) => {
  const queryClient = useQueryClient();
  const isNavigating = useRef(false);
  
  const { data: notesByCategory = [] } = useQuery({
    queryKey: ["notesByCategory", slug],
    queryFn: () => fetchNotesByCategory(slug),
  });

  const handleNoteClick = async (noteId: string) => {
    // Prevent multiple rapid clicks
    if (isNavigating.current) {
      console.log('Preventing duplicate click - already navigating');
      return;
    }
    isNavigating.current = true;
    
    console.log('=== SIDEBAR CLICK DEBUG ===');
    console.log('Clicked note ID:', noteId);
    console.log('Current slug:', slug);
    console.log('Has unsaved changes:', hasUnsavedChanges);
    console.log('Window location:', window.location.href);
    
    try {
      if (hasUnsavedChanges) {
        const confirmed = window.confirm(
          "You have unsaved changes. Are you sure you want to leave?"
        );
        if (!confirmed) {
          console.log('Navigation cancelled by user');
          isNavigating.current = false;
          return;
        }
      }
      
      const targetUrl = `/notes/${noteId}?slug=${slug}&mode=edit`;
      console.log('Target URL:', targetUrl);
      console.log('Current URL:', window.location.pathname + window.location.search);
      
      // Check if we're already on the target page
      if (window.location.pathname === `/notes/${noteId}` && 
          window.location.search.includes(`slug=${slug}`) && 
          window.location.search.includes('mode=edit')) {
        console.log('Already on target page, skipping navigation');
        isNavigating.current = false;
        return;
      }
      
      // Invalidate current note cache to ensure fresh data
      await queryClient.invalidateQueries({ queryKey: ["note"] });
      
      // Navigate immediately without delay
      console.log('Executing navigation now');
      navigate(targetUrl);
      
      // Clear the navigation lock after navigation
      setTimeout(() => {
        isNavigating.current = false;
      }, 1000);
      
    } catch (error) {
      console.error('Error during navigation:', error);
      isNavigating.current = false;
    }
  };

  return (
    <Sidebar collapsible="offcanvas" side="left" className="z-50">
   
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Notes in {slug}</SidebarGroupLabel>
          
          {notesByCategory.length > 0 ? (
            <SidebarMenu>
              {notesByCategory.map((relatedNote) => (
                <SidebarMenuItem key={relatedNote.id}>
                  <div 
                    className="w-full p-3 hover:bg-accent rounded-md cursor-pointer transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleNoteClick(relatedNote.id);
                    }}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {/* Privacy indicator */}
                      <div className="flex-shrink-0">
                        {relatedNote.isPublic ? (
                          <Globe className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Lock className="w-3 h-3 text-muted-foreground" />
                        )}
                      </div>
                      
                      {/* Emoji if present */}
                      {relatedNote.emoji && (
                        <span className="text-sm flex-shrink-0">
                          {relatedNote.emoji}
                        </span>
                      )}
                      
                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium text-sm">
                          {relatedNote.title}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {relatedNote.content || "No content"}
                        </div>
                      </div>
                    </div>
                  </div>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          ) : (
            <div className="px-2 py-4 text-center">
              <div className="text-muted-foreground text-sm">
                No other notes in this category
              </div>
            </div>
          )}
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarRail />
    </Sidebar>
  );
};

export default NoteSidebar;
