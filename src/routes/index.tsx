import { useContext } from "react";
import { useRoutes, Navigate } from "react-router-dom";
import {
  LandingPage,
  KanbanPage,
  AuthPage,
  AccountPage,
  BoardPage,
  NotFoundPage,
  ConversationPage,
  InboxPage,
  AccountForm,
  AnalyticsPage,
  LocationForm,
  BillingPage,
  PricingPage,
  FeedbackPage,
  SupportPage,
  IntegrationsForm,
  BoardSettingsPage,
  OnboardingPage,
  TeamManagementPage,
  ComingSoonPage,
  TermsPage,
  PrivacyPage,
} from "@/routes/element";

import { KanbanProvider } from "@/context/KanbanProvider";
import { UserContextProvider } from "@/context/UserContext";
import { AuthContext, AuthContextProvider } from "@/context/AuthContext";
import GoogleCallback from "@/pages/callback/GoogleCallback";
import RequireAuth from "@/_components/shared/RequireAuth";
import JoinTeamPage from "@/pages/JoinTeamPage";
import LaunchGuard from "@/components/LaunchGuard";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

interface WithContextsProps {
  Component: React.ComponentType<any>;
  includeKanban?: boolean;
  props?: Record<string, any>;
}

const WithContexts = ({
  Component,
  includeKanban = false,
  props = {},
}: WithContextsProps) => {
  return (
    <UserContextProvider>
      {includeKanban ? (
        <KanbanProvider>
          <Component {...props} />
        </KanbanProvider>
      ) : (
        <Component {...props} />
      )}
    </UserContextProvider>
  );
};

const AuthRoute = ({ children }: ProtectedRouteProps) => {
  const { isLoggedIn } = useContext(AuthContext);
  if (isLoggedIn) {
    return <Navigate to="/workspace" replace />;
  }
  return <>{children}</>;
};

const settingRoutes = [
  { path: "account", element: <AccountForm /> },
  { path: "location", element: <LocationForm /> },
  { path: "integrations", element: <IntegrationsForm /> },
];

const authenticatedRoutes = [
  {
    path: "/onboarding",
    element: <WithContexts Component={OnboardingPage} />,
  },
  {
    path: "/workspace/board/:id",
    element: <WithContexts Component={KanbanPage} includeKanban={true} />,
  },
  {
    path: "/workspace",
    children: [
      {
        index: true,
        element: <WithContexts Component={BoardPage} />,
      },
      {
        path: "settings/:id",
        element: <WithContexts Component={BoardSettingsPage} />,
      },
      {
        path: "analytics",
        element: <WithContexts Component={AnalyticsPage} />,
      },
      {
        path: "billing",
        element: <WithContexts Component={BillingPage} />,
      },
    ],
  },
  {
    path: "/setting",
    element: <WithContexts Component={AccountPage} />,
    children: settingRoutes,
  },
  {
    path: "/conversation/inbox",
    element: <WithContexts Component={ConversationPage} />,
  },
  {
    path: "/inbox",
    element: <WithContexts Component={InboxPage} />,
  },
  {
    path: "/team/management",
    element: <WithContexts Component={TeamManagementPage} />,
  },
];

const Router = () => {
  const routes = [
    { path: "/", element: <LandingPage /> },
    { 
      path: "/pricing", 
      element: (
        <AuthContextProvider>
          <WithContexts Component={PricingPage} />
        </AuthContextProvider>
      ) 
    },
    { 
      path: "/coming-soon", 
      element: <ComingSoonPage />
    },
    { 
      path: "/terms", 
      element: <TermsPage />
    },
    { 
      path: "/privacy", 
      element: <PrivacyPage />
    },
    { 
      path: "/feedback", 
      element: (
        <LaunchGuard>
          <AuthContextProvider>
            <WithContexts Component={FeedbackPage} />
          </AuthContextProvider>
        </LaunchGuard>
      ) 
    },
    { 
      path: "/support", 
      element: (
        <LaunchGuard>
          <AuthContextProvider>
            <WithContexts Component={SupportPage} />
          </AuthContextProvider>
        </LaunchGuard>
      ) 
    },
    {
      path: "/auth",
      element: (
        <LaunchGuard>
          <AuthContextProvider>
            <AuthRoute>
              <AuthPage />
            </AuthRoute>
          </AuthContextProvider>
        </LaunchGuard>
      ),
    },
    {
      path: "/join",
      element: (
        <LaunchGuard>
          <AuthContextProvider>
            <JoinTeamPage />
          </AuthContextProvider>
        </LaunchGuard>
      ),
    },
    {
      element: (
        <LaunchGuard>
          <AuthContextProvider>
            <RequireAuth />
          </AuthContextProvider>
        </LaunchGuard>
      ),
      children: authenticatedRoutes,
    },
    {
      path: "/auth/google/callback",
      element: (
        <LaunchGuard>
          <GoogleCallback />
        </LaunchGuard>
      ),
    },
    { path: "*", element: <LaunchGuard><NotFoundPage /></LaunchGuard> },
  ];

  return useRoutes(routes);
};

export default Router;
