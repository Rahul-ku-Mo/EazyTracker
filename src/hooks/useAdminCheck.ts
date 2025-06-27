import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';

/**
 * Custom hook to check if the current user is an admin
 * @returns Object with admin status and role information
 */
export const useAdminCheck = () => {
  const { role } = useContext(AuthContext);
  
  const isAdmin = role === 'ADMIN';
  const isUser = role === 'USER';
  
  return {
    isAdmin,
    isUser,
    role,
    canAccessBilling: isAdmin,
    canAccessPricing: isAdmin,
    canManageTeam: isAdmin,
  };
};

export default useAdminCheck; 