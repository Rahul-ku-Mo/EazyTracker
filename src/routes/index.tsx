import { useRoutes, Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import {
  LandingPage,
  KanbanPage,
  AuthPage,
  AccountPage,
  BoardPage,
  NotFoundPage,
  ConversationPage,
  AccountForm,
  ProfileForm,
  LocationForm,
  RoleForm,
  IntegrationsForm,
  BoardSettingsPage,
} from "./element";

import { KanbanProvider } from "../context/KanbanProvider";
import { UserContextProvider } from "../context/UserContext";
import { NotificationContextProvider } from "../context/NotificationContext";
import { AuthContext, AuthContextProvider } from "../context/AuthContext";

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
      <NotificationContextProvider>
        {includeKanban ? (
          <KanbanProvider>
            <Component {...props} />
          </KanbanProvider>
        ) : (
          <Component {...props} />
        )}
      </NotificationContextProvider>
    </UserContextProvider>
  );
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isLoggedIn } = useContext(AuthContext);
  if (!isLoggedIn) {
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
};

const AuthRoute = ({ children }: ProtectedRouteProps) => {
  const { isLoggedIn } = useContext(AuthContext);
  if (isLoggedIn) {
    return <Navigate to="/boards" replace />;
  }
  return <>{children}</>;
};

const settingRoutes = [
  { path: "profile", element: <ProfileForm /> },
  { path: "account", element: <AccountForm /> },
  { path: "location", element: <LocationForm /> },
  { path: "role", element: <RoleForm /> },
  { path: "integrations", element: <IntegrationsForm /> },
];

const authenticatedRoutes = [
  {
    path: "/kanban/:id",
    element: <WithContexts Component={KanbanPage} includeKanban={true} />,
  },
  {
    path: "/boards",
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
          <ProtectedRoute>
            <Outlet />
          </ProtectedRoute>
        </AuthContextProvider>
      ),
      children: authenticatedRoutes,
    },
    { path: "*", element: <NotFoundPage /> },
  ];

  return useRoutes(routes);
};

export default Router;
