import { Suspense, lazy, ComponentType } from "react";
import LoadingScreen from "../_components/LoadingScreen";

interface LoadableProps {
  [key: string]: never;
}

const Loadable = <P extends LoadableProps>(Component: ComponentType<P>) => {
  return function LoadableComponent(props: P) {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <Component {...props} />
      </Suspense>
    );
  };
};

// Pages
export const LandingPage = Loadable(lazy(() => import("../pages/LandingPage")));

export const KanbanPage = Loadable(lazy(() => import("../pages/KanbanPage")));

export const AuthPage = Loadable(lazy(() => import("../pages/AuthPage")));

export const AccountPage = Loadable(lazy(() => import("../pages/AccountPage")));

export const BoardPage = Loadable(
  lazy(() => import("../pages/boards/BoardPage"))
);

export const BoardSettingsPage = Loadable(
  lazy(() => import("../pages/boards/BoardSettingsPage"))
);

export const NotFoundPage = Loadable(
  lazy(() => import("../pages/NotFoundPage"))
);


export const ConversationPage = Loadable(
  lazy(() => import("../pages/ConversationPage"))
);

// Forms
export const ProfileForm = Loadable(
  lazy(() => import("../_components/Account/ProfileForm"))
);

export const AccountForm = Loadable(
  lazy(() => import("../_components/Account/AccountForm"))
);

export const LocationForm = Loadable(
  lazy(() => import("../_components/Account/LocationForm"))
);

export const RoleForm = Loadable(
  lazy(() => import("../_components/Account/RoleForm"))
);

export const IntegrationsForm = Loadable(
  lazy(() => import("../_components/Account/IntegrationsForm"))
);

export const OnboardingPage = Loadable(lazy(() => import("../pages/OnboardingPage")));

export const TeamMembersPage = Loadable(lazy(() => import("../pages/members/TeamMembersPage")));
