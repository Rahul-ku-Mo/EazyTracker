import { createContext, } from "react";
import { useUser } from "../hooks/useQueries";
import Cookies from "js-cookie";

interface UserContextType {
  user: any;
  isPending: boolean;
}

const UserContext = createContext<UserContextType>({} as UserContextType);

const UserContextProvider = ({ children }: { children: React.ReactNode }) => {
  const accessToken = Cookies.get("accessToken");

  const { data: user, isPending } = useUser(accessToken || "");

  return (
    <UserContext.Provider
      value={{
        user,
        isPending,
      }}
    >
        {children}
     
    </UserContext.Provider>
  );
};

export { UserContextProvider, UserContext };
