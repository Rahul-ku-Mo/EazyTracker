import { createContext } from "react";
import { TCardContext } from "../types/cardTypes";

type CardProviderProps = {
  cardDetails: TCardContext;
  children: React.ReactNode;
};

const CardContext = createContext<TCardContext | null>(null);

const CardProvider = ({ cardDetails, children }: CardProviderProps) => {
  return (
    <CardContext.Provider value={cardDetails}>{children}</CardContext.Provider>
  );
};

export { CardProvider, CardContext };

