import { createContext, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useColumns, useWorkspace } from "../hooks/useQueries";
import LoadingScreen from "../_components/LoadingScreen";

import { useQueryClient } from "@tanstack/react-query";
import pusherClient from "../services/pusherClient.service";
import { useContext as useReactContext } from "react";
import { UserContext } from "./UserContext";
import useProjectSlugStore from "@/store/projectSlugStore";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";

interface KanbanContextType {
  workspaceId: string;
  columns: any;
  workspace: any;
  project: any;
}

// Create the context
const KanbanContext = createContext<KanbanContextType>({} as KanbanContextType);

// Create a provider component
const KanbanProvider = ({ children }: { children: React.ReactNode }) => {
  const { slug } = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { updateCurrentProjectSlug } = useProjectSlugStore();
  
  const teamId = localStorage.getItem("teamId") as string;
  const teamName = localStorage.getItem("teamName") as string;

  const workspaceId = teamId && slug && `${teamId}/${slug}`;
  const workspaceIdentifier = teamId && slug ? `${teamId}/${slug}` : slug || "";

  const { user } = useReactContext(UserContext);

  // Fetch both columns and workspace data
  const { data: columns, isPending: isColumnsPending } = useColumns(workspaceId);
  const {
    data: workspace,
    isPending: isWorkspacePending,
    isError: isWorkspaceError,
  } = useWorkspace(workspaceIdentifier);

  // Update project slug when workspace data is available
  useEffect(() => {
    if (workspace?.project) {
      updateCurrentProjectSlug(workspace.project.slug);
    }
  }, [workspace, updateCurrentProjectSlug]);

  const isPending = isColumnsPending || isWorkspacePending;

  // Set up real-time workspace subscriptions
  useEffect(() => {
    if (!workspaceId || !user?.id) return;

    // Subscribe to workspace channel for real-time updates
    const channel = pusherClient.subscribe(`workspace-${slug}`);

    const handleCardQueryInvalidation = () => {
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({
        queryKey: ["columns", "workspaces", teamId],
      });
    };

    const handleColumnQueryInvalidation = () => {
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({
        queryKey: ["columns", "workspaces", teamId],
      });
    };

    // Bind event handlers
    channel.bind("card-created", handleCardQueryInvalidation);
    channel.bind("card-updated", handleCardQueryInvalidation);
    channel.bind("card-deleted", handleCardQueryInvalidation);
    channel.bind("column-created", handleColumnQueryInvalidation);
    channel.bind("column-deleted", handleColumnQueryInvalidation);

    // Cleanup on unmount
    return () => {
      channel.unbind("card-created", handleCardQueryInvalidation);
      channel.unbind("card-updated", handleCardQueryInvalidation);
      channel.unbind("card-deleted", handleCardQueryInvalidation);
      channel.unbind("column-created", handleColumnQueryInvalidation);
      channel.unbind("column-deleted", handleColumnQueryInvalidation);
      pusherClient.unsubscribe(`workspace-${slug}`);
    };
  }, [user?.id, queryClient, slug, teamId, workspaceId]);

  // Handle loading state
  if (isPending) {
    return <LoadingScreen />;
  }

  // Handle error state
  if (isWorkspaceError) {
    const handleGoBack = () => {
      navigate(`/workspace/${teamName}`);
    };

    return (
      <motion.div
        className="absolute inset-0 w-full h-full flex flex-col items-center justify-center gap-4 bg-background"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <h2 className="text-lg font-medium text-destructive">Access Error</h2>
        <p className="text-sm text-muted-foreground text-center">
          The board you're trying to access either doesn't exist or you don't
          have permission to view it.
        </p>
        <button
          onClick={handleGoBack}
          className="mt-4 px-6 py-2 flex items-center gap-2 text-sm font-medium text-white bg-destructive rounded-md hover:bg-destructive/90 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Go Back to Workspaces
        </button>
      </motion.div>
    );
  }

  return (
    <KanbanContext.Provider
      value={{
        workspaceId: workspaceId as string,
        columns: columns || [],
        workspace: workspace,
        project: workspace?.project,
      }}
    >
      {children}
    </KanbanContext.Provider>
  );
};

// Custom hook to use Kanban context
export const useKanban = () => {
  const context = useReactContext(KanbanContext);
  if (!context) {
    throw new Error("useKanban must be used within a KanbanProvider");
  }
  return context;
};

export { KanbanProvider, KanbanContext };
