import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { Loader2 } from "lucide-react";
import axios from "axios";

interface AuthResponse {
  access_token: string;
  refresh_token: string;
}

const GoogleCallback = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const storedState = window.localStorage.getItem('oauth_state');

        // Verify state to prevent CSRF attacks
        if (!state || state !== storedState) {
          throw new Error('Invalid state parameter. Authentication failed.');
        }
      
        if (!code) {
          throw new Error('No authorization code received from Google.');
        }

        const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/google`, {
          code,
        });


        if (response.status !== 200) {
          throw new Error(response.data.message || 'Authentication failed');
        }

        const data: AuthResponse = response.data;

        // Store tokens in cookies
        Cookies.set('accessToken', data.access_token);

        window.localStorage.removeItem('oauth_state');
       
        navigate('/boards');
      } catch (err) {
        console.error('Authentication error:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        // Optional: Redirect to login page after a delay
        setTimeout(() => navigate('/auth'), 3000);
      } finally {
        setLoading(false);
      }
    };

    handleGoogleCallback();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-center text-lg">Processing your login, please wait...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
          <p>Error: {error}</p>
        </div>
        <p>Redirecting to login page...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="p-4 mb-4 text-green-700 bg-green-100 rounded-lg">
        <p>Login successful! Redirecting...</p>
      </div>
    </div>
  );
};

export default GoogleCallback;