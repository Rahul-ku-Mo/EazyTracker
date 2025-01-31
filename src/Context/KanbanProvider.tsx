import { createContext } from "react";
import Cookies from "js-cookie";

import { useParams } from "react-router-dom";
import { useColumns } from "../hooks/useQueries"
import LoadingScreen from "../_components/LoadingScreen";

interface KanbanContextType {
  boardId: string;
  columns: any;
}

// Create the context
 const KanbanContext = createContext<KanbanContextType>({} as KanbanContextType);

// Create a provider component
const KanbanProvider = ({ children }: { children: React.ReactNode }) => {
  const { id: boardId } = useParams();

  const accessToken = Cookies.get("accessToken") as string;

  const { data: columns, isPending } = useColumns(accessToken, boardId as string);

  if(isPending) return <LoadingScreen />

  return (
    <KanbanContext.Provider
      value={{
        boardId: boardId || "",
        columns: columns || [],
      }}
    >
      {children}
    </KanbanContext.Provider>
  );
};

export { KanbanProvider, KanbanContext };
