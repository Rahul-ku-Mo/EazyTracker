import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeam } from '@/context/TeamContext';

import LoadingScreen from '@/_components/LoadingScreen';
import { AuthContext } from '@/context/AuthContext';

const DashboardPage: React.FC = () => {
  const { currentTeam, isLoading, error } = useTeam();
  const { isLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // If user is not logged in, redirect to auth
    if (!isLoggedIn) {
      navigate('/auth');
      return;
    }

    // If team data is loaded and we have a current team, redirect to projects
    if (!isLoading && currentTeam) {
      navigate("/projects");
      return;
    }

    // If team data is loaded but no team found, redirect to onboarding
    if (!isLoading && !currentTeam && !error) {
      navigate('/onboarding');
      return;
    }
  }, [isLoggedIn, currentTeam, isLoading, error, navigate]);

  // Show loading while determining where to redirect
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Team Data</h2>
          <p className="text-muted-foreground mb-4">
            There was an error loading your team information. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // This should not be reached, but just in case
  return <LoadingScreen />;
};

export default DashboardPage; 