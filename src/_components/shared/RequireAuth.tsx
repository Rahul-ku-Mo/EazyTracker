import { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import LoadingScreen from "../LoadingScreen";
import Cookies from "js-cookie";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const RequireAuth = () => {
  const { isLoggedIn } = useContext(AuthContext);
  const location = useLocation();
  
  const { data, isLoading } = useQuery({
    queryKey: ['onboarding'],
    queryFn: async () => {
      if (!isLoggedIn || location.pathname === "/onboarding") {
        return { needsOnboarding: false };
      }
      
      const token = Cookies.get('accessToken');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth/onboarding`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data;
    },
    enabled: isLoggedIn && location.pathname !== "/onboarding",
  });
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  if (!isLoggedIn) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  
  if (data?.needsOnboarding && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }
  
  return <Outlet />;
};

export default RequireAuth;