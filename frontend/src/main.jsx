import React, { useContext } from 'react';
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext';

// REPLACE WITH YOUR ACTUAL GOOGLE CLIENT ID
const clientId = "959585878695-avvrj1vl6lvru7kvsmv0kmv2jtms3j88.apps.googleusercontent.com";

createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId={clientId}>
    <AuthProvider>
      <App />
    </AuthProvider>
  </GoogleOAuthProvider>,
)
