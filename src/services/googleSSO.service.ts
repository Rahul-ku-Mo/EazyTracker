const signInWithGoogle = () => {
    // Google OAuth parameters
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = encodeURIComponent(import.meta.env.VITE_GOOGLE_REDIRECT_URI);
    const scope = encodeURIComponent('email profile');
    const state = generateRandomString(16);

    // Store state in localStorage to verify when Google redirects back
    window.localStorage.setItem('oauth_state', state);

    // Redirect to Google's OAuth 2.0 server
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}`;
};

// Helper function to generate random string for state parameter
const generateRandomString = (length: number) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};

export default signInWithGoogle;