import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Lock, ArrowLeft } from 'lucide-react';

interface AdminRouteGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const AdminRouteGuard: React.FC<AdminRouteGuardProps> = ({ 
  children, 
  requireAdmin = true 
}) => {
  const { role } = useContext(AuthContext);
  const navigate = useNavigate();

  const isAdmin = role === 'ADMIN';

  useEffect(() => {
    // Redirect non-admin users after a brief delay to show the message
    if (requireAdmin && !isAdmin && role) {
      const timer = setTimeout(() => {
        navigate('/workspace');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [requireAdmin, isAdmin, role, navigate]);

  // Show loading state while role is being determined
  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show access denied for non-admin users
  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <Lock className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-xl text-red-600 dark:text-red-400">Access Restricted</CardTitle>
            <CardDescription className="text-center">
              This page is restricted to administrators only. Only team admins can access billing and pricing information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <Shield className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-300">
                Contact your team administrator for assistance with billing matters.
              </p>
            </div>
            <Button 
              onClick={() => navigate('/workspace')} 
              className="w-full"
              variant="outline"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Workspace
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Allow access for admin users
  return <>{children}</>;
};

export default AdminRouteGuard; 