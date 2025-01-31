import { createContext } from "react";

const ColumnContext = createContext<string>("");

const ColumnProvider = ({
  columnId,
  children,
}: {
  columnId: string;
  children: React.ReactNode;
}) => {
  return (
    <ColumnContext.Provider value={columnId}>{children}</ColumnContext.Provider>
  );
};

export { ColumnProvider, ColumnContext };
