import { createContext } from "react";
import Cookies from "js-cookie";

import { useParams } from "react-router-dom";
import { useColumns } from "../hooks/useQueries"
import LoadingScreen from "../_components/LoadingScreen";

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

  const { data: columns, isPending } = useColumns(accessToken, workspaceId);

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
