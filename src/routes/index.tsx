import { useContext } from "react";
import { useRoutes, Navigate } from "react-router-dom";
import {
  LandingPage,
  KanbanPage,
  AuthPage,
  AccountPage,
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
  OnboardingPage,
  TeamManagementPage,
  ComingSoonPage,
  TermsPage,
  PrivacyPage,
  NotePage,
  NoteViewPage,
  NoteEditPage,
  ProjectsPage,
  DashboardPage,
} from "@/routes/element";
import WorkspaceSelectionPage from "@/pages/WorkspaceSelectionPage";
import WorkspaceSettingsPage from "@/pages/WorkspaceSettingsPage";

import { KanbanProvider } from "@/context/KanbanProvider";
import { UserContextProvider } from "@/context/UserContext";
import { AuthContext, AuthContextProvider } from "@/context/AuthContext";
import { SubscriptionContextProvider } from "@/context/SubscriptionContext";
import { TeamProvider } from "@/context/TeamContext";
import GoogleCallback from "@/pages/callback/GoogleCallback";
import RequireAuth from "@/_components/shared/RequireAuth";
import JoinTeamPage from "@/pages/JoinTeamPage";
import LaunchGuard from "@/components/LaunchGuard";
import AdminRouteGuard from "@/_components/shared/AdminRouteGuard";
import { PaddleProvider } from "@/context/PaddleProvider";
import AccessControlGuard from "@/components/AccessControlGuard";
import ProjectDetailPage from '@/pages/ProjectDetailPage';

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
    <SubscriptionContextProvider>
      <UserContextProvider>
        <TeamProvider>
          {includeKanban ? (
            <KanbanProvider>
              <AccessControlGuard>
                <Component {...props} />
              </AccessControlGuard>
            </KanbanProvider>
          ) : (
            <AccessControlGuard>
              <Component {...props} />
            </AccessControlGuard>
          )}
        </TeamProvider>
      </UserContextProvider>
    </SubscriptionContextProvider>
  );
};

const AuthRoute = ({ children }: ProtectedRouteProps) => {
  const { isLoggedIn } = useContext(AuthContext);

  // For auth route, we'll redirect to dashboard which will handle team data fetching
  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
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
    path: "/dashboard",
    element: <WithContexts Component={DashboardPage} />,
  },
  {
    path: "/onboarding",
    element: <WithContexts Component={OnboardingPage} />,
  },
  {
    path: "/workspace/:teamName",
    children: [
      {
        index: true,
        element: <WithContexts Component={WorkspaceSelectionPage} />,
      },
      {
        path: ":slug",
        element: <WithContexts Component={KanbanPage} includeKanban={true} />,
      },
      {
        path: "settings/:slug",
        element: <WithContexts Component={WorkspaceSettingsPage} />,
      },
      {
        path: "analytics",
        element: <WithContexts Component={AnalyticsPage} />,
      },
    ],
  },
  {
    path: "/projects",
    element: <WithContexts Component={ProjectsPage} />,
  },
  {
    path: "/projects/:projectSlug",
    element: <ProjectDetailPage />,
  },
  {
    path: "billing",
    element: (
      <>
        <AdminRouteGuard>
          <PaddleProvider>
            <SubscriptionContextProvider>
              <UserContextProvider>
                <BillingPage />
              </UserContextProvider>
            </SubscriptionContextProvider>
          </PaddleProvider>
        </AdminRouteGuard>
      </>
    ),
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
  {
    path: "/notes",
    element: <WithContexts Component={NotePage} />,
  },
  {
    path: "/notes/view/:id",
    element: <WithContexts Component={NoteViewPage} />,
  },
  {
    path: "/notes/edit/:id",
    element: <WithContexts Component={NoteEditPage} />,
  },
  {
    path: "/notes/:slug",
    element: <WithContexts Component={NotePage} />,
  },
];

const Router = () => {
  const routes = [
    { path: "/", element: <LandingPage /> },
    {
      path: "/pricing",
      element: (
        <AuthContextProvider>
          <AdminRouteGuard>
            <WithContexts Component={PricingPage} />
          </AdminRouteGuard>
        </AuthContextProvider>
      ),
    },
    {
      path: "/coming-soon",
      element: <ComingSoonPage />,
    },
    {
      path: "/terms",
      element: <TermsPage />,
    },
    {
      path: "/privacy",
      element: <PrivacyPage />,
    },
    {
      path: "/feedback",
      element: (
        <LaunchGuard>
          <AuthContextProvider>
            <WithContexts Component={FeedbackPage} />
          </AuthContextProvider>
        </LaunchGuard>
      ),
    },
    {
      path: "/support",
      element: (
        <LaunchGuard>
          <AuthContextProvider>
            <WithContexts Component={SupportPage} />
          </AuthContextProvider>
        </LaunchGuard>
      ),
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
    {
      path: "*",
      element: (
        <LaunchGuard>
          <NotFoundPage />
        </LaunchGuard>
      ),
    },
  ];

  return useRoutes(routes);
};

export default Router;
