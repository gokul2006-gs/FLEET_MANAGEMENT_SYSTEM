import React, { useContext } from 'react';
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext';

// Use Environment Variable or Fallback
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "959585878695-avvrj1vl6lvru7kvsmv0kmv2jtms3j88.apps.googleusercontent.com";

createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId={clientId}>
    <AuthProvider>
      <App />
    </AuthProvider>
  </GoogleOAuthProvider>,
)
