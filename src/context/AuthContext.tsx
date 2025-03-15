import { createContext, useState } from "react";

import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

interface AuthContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  accessToken: string;  
  role: string;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const accessToken = Cookies.get("accessToken") || "";
  const [isLoggedIn, setIsLoggedIn] = useState(!!accessToken);

  /**1. verify user logged in is Authorized or not */
  const { data  : role } = useQuery({
    queryKey: ["auth-verify"],
    queryFn: async () => {
      try {
        const response = await axios.get<{ success: boolean; data: string }>(
          `${import.meta.env.VITE_API_URL}/auth/verify`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        return response?.data?.data;
      } catch (error) {
        if (error instanceof AxiosError) {
          const status = error.response?.status;
          if (status === 401 || status === 403) {
            Cookies.remove("accessToken");
            setIsLoggedIn(false);
            navigate("/auth");
          }
        }
        throw error;
      }
    },
    enabled: !!accessToken,
    retry: false,
  });


  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        accessToken, 
        role: role || ""
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContextProvider, AuthContext };
