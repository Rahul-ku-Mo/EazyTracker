import { createContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useColumns } from "../hooks/useQueries";
import LoadingScreen from "../_components/LoadingScreen";
import Cookies from "js-cookie";
import { useQueryClient } from "@tanstack/react-query";
import pusherClient from "../services/pusherClient.service";
import { useContext as useReactContext } from "react";
import { UserContext } from "./UserContext";

interface KanbanContextType {
  workspaceId: string;
  columns: any;
}

// Create the context
 const KanbanContext = createContext<KanbanContextType>({} as KanbanContextType);

// Create a provider component
const KanbanProvider = ({ children }: { children: React.ReactNode }) => {
  const { teamId, slug } = useParams();
  // Handle both new teamId + slug pattern and legacy slug pattern
  const workspaceId = teamId && slug ? `${teamId}/${slug}` : slug || "";

  const accessToken = Cookies.get("accessToken") as string;
  const queryClient = useQueryClient();
  const { user } = useReactContext(UserContext);

  const { data: columns, isPending } = useColumns(accessToken, workspaceId);

  // Set up real-time workspace subscriptions
  useEffect(() => {
    if (!workspaceId || !user?.id) return;

    // Subscribe to workspace channel for real-time updates
    const channel = pusherClient.subscribe(`workspace-${workspaceId}`);

    // Handle card creation
    const handleCardCreated = () => {
    
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({
        queryKey: ["columns", "workspaces", workspaceId],
      });
    };

    // Handle card updates
    const handleCardUpdated = () => {
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({
        queryKey: ["columns", "workspaces", workspaceId],
      });
    };

    // Handle card deletion
    const handleCardDeleted = () => {
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({
        queryKey: ["columns", "workspaces", workspaceId],
      });
    };

    // Bind event handlers
    channel.bind('card-created', handleCardCreated);
    channel.bind('card-updated', handleCardUpdated);
    channel.bind('card-deleted', handleCardDeleted);

    // Cleanup on unmount
    return () => {
      channel.unbind('card-created', handleCardCreated);
      channel.unbind('card-updated', handleCardUpdated);
      channel.unbind('card-deleted', handleCardDeleted);
      pusherClient.unsubscribe(`workspace-${workspaceId}`);
    };
  }, [workspaceId, user?.id, queryClient]);

  if(isPending) return <LoadingScreen />

  return (
    <KanbanContext.Provider
      value={{
        workspaceId: workspaceId,
        columns: columns || [],
      }}
    >
      {children}
    </KanbanContext.Provider>
  );
};

export { KanbanProvider, KanbanContext };
