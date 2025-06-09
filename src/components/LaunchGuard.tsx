import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { isRouteAccessible } from '@/config/launch';

interface LaunchGuardProps {
  children: React.ReactNode;
}

const LaunchGuard = ({ children }: LaunchGuardProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const currentPath = location.pathname;
    
    // Check if current route should be accessible
    if (!isRouteAccessible(currentPath)) {
      // Redirect to coming soon page
      navigate('/coming-soon', { replace: true });
    }
  }, [location.pathname, navigate]);

  // Always render children - the redirect will happen via useEffect
  return <>{children}</>;
};

export default LaunchGuard; 