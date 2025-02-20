import { BrowserRouter } from "react-router-dom";
import Router from "./routes";
import { Toaster } from "./components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./context/ThemeProvider";
import { GoogleOAuthProvider } from "@react-oauth/google";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

const App = () => {
  return (
    <>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <Toaster />
          <QueryClientProvider client={queryClient}>
            <BrowserRouter>
              <Router />
            </BrowserRouter>
          </QueryClientProvider>
        </ThemeProvider>
      </GoogleOAuthProvider>
    </>
  );
};

export default App;
