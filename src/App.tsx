import { BrowserRouter } from "react-router-dom";
import Router from "@/routes";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/context/ThemeProvider";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { TrialExpiredModal } from "@/components/TrialExpiredModal";
import { useTrialStatus } from "@/hooks/useTrialStatus";

import Cookies from "js-cookie";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

const TrialModalWrapper = () => {
  const { showTrialExpiredModal, dismissTrialModal } = useTrialStatus();

  return (
    <TrialExpiredModal
      open={showTrialExpiredModal}
      onClose={dismissTrialModal}
    />
  );
};

const AppWithTrialModal = () => {
  const isLoggedIn = !!Cookies.get("accessToken");

  return (
    <>
      <Router />
      {isLoggedIn && <TrialModalWrapper />}
    </>
  );
};

const App = () => {
  return (
    <>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <Toaster />
            <QueryClientProvider client={queryClient}>
              <BrowserRouter>
                <AppWithTrialModal />
              </BrowserRouter>
            </QueryClientProvider>
          </GoogleOAuthProvider>
      </ThemeProvider>
    </>
  );
};

export default App;
