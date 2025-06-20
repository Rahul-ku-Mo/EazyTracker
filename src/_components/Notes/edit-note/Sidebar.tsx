import { useTheme } from "@/context/ThemeProvider";
import { Globe, Lock } from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Note } from "@/interfaces/notes";

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
  const { isDark } = useTheme();
  const { data: notesByCategory = [] } = useQuery({
    queryKey: ["notesByCategory", slug],
    queryFn: () => fetchNotesByCategory(slug),
  });

  return (
    <div
      className={`w-80 flex-shrink-0 h-screen sticky top-0 ${
        isDark ? "bg-zinc-900/95 border-zinc-800" : "bg-zinc-50 border-zinc-200"
      } border-r overflow-y-auto`}
    >
      <div className="space-y-4 p-4">
        {notesByCategory.length > 0 ? (
          <div className="space-y-3">
            {notesByCategory.map((relatedNote) => (
              <div
                key={relatedNote.id}
                className="group relative overflow-hidden transition-all duration-300 group-hover:mb-2 rounded-md"
              >
                <button
                  onClick={() => {
                    if (hasUnsavedChanges) {
                      const confirmed = window.confirm(
                        "You have unsaved changes. Are you sure you want to leave?"
                      );
                      if (!confirmed) return;
                    }
                    navigate(`/notes/${relatedNote.id}?slug=${slug}&mode=edit`);
                  }}
                  className={`w-full text-left p-3 rounded-md text-sm transition-all duration-300 ease-in-out transform border
                              group-hover:scale-y-110 group-hover:shadow-lg group-hover:-translate-y-1 group-hover:py-4
                              ${
                                isDark
                                  ? "border-transparent hover:bg-zinc-800/50 text-zinc-300 hover:text-zinc-100 group-hover:bg-zinc-700/60 group-hover:border-zinc-600/50"
                                  : "border-transparent hover:bg-white text-zinc-600 hover:text-zinc-900 group-hover:bg-zinc-50 group-hover:shadow-md group-hover:border-zinc-200"
                              }`}
                  title={relatedNote.title}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex-shrink-0">
                      {relatedNote.isPublic ? (
                        <Globe className="w-3 h-3 text-emerald-500 transition-transform duration-300 group-hover:scale-110" />
                      ) : (
                        <Lock className="w-3 h-3 text-zinc-400 transition-transform duration-300 group-hover:scale-110" />
                      )}
                    </div>
                    {relatedNote.emoji && (
                      <span className="text-sm transition-transform duration-300 group-hover:scale-110">
                        {relatedNote.emoji}
                      </span>
                    )}
                    <span className="truncate group-hover:font-medium transition-all duration-300">
                      {relatedNote.title}
                    </span>
                  </div>
                  <div
                    className={`text-xs mt-1 transition-all duration-300 overflow-hidden
                              ${
                                isDark
                                  ? "text-zinc-500 group-hover:text-zinc-400"
                                  : "text-zinc-500 group-hover:text-zinc-600"
                              }
                              group-hover:max-h-24 max-h-4 group-hover:pb-12`}
                  >
                    <div className="group-hover:whitespace-normal whitespace-nowrap overflow-hidden text-ellipsis group-hover:line-clamp-3">
                      {relatedNote.content || "No content"}
                    </div>
                  </div>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div
            className={`text-xs ${
              isDark ? "text-zinc-500" : "text-zinc-400"
            } text-center py-8`}
          >
            No other notes in this category
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteSidebar;
