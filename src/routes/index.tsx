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
  AccountForm,
 
  LocationForm,

  //IntegrationsForm,
  BoardSettingsPage,
  OnboardingPage,
  TeamMembersPage,
} from "@/routes/element";

import { KanbanProvider } from "@/context/KanbanProvider";
import { UserContextProvider } from "@/context/UserContext";
import { AuthContext, AuthContextProvider } from "@/context/AuthContext";
import GoogleCallback from "@/pages/callback/GoogleCallback";
import RequireAuth from "@/_components/shared/RequireAuth";

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
    path: "/team/members",
    element: <WithContexts Component={TeamMembersPage} />,
  },
];

const Router = () => {
  const routes = [
    { path: "/", element: <LandingPage /> },
    {
      path: "/auth",
      element: (
        <AuthContextProvider>
          <AuthRoute>
            <AuthPage />
          </AuthRoute>
        </AuthContextProvider>
      ),
    },
    {
      element: (
        <AuthContextProvider>
          <RequireAuth />
        </AuthContextProvider>
      ),
      children: authenticatedRoutes,
    },
    {
      path: "/auth/google/callback",
      element: <GoogleCallback />,
    },
    { path: "*", element: <NotFoundPage /> },
  ];

  return useRoutes(routes);
};

export default Router;
