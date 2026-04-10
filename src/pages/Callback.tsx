import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';

export const Callback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Processing...');

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const savedState = sessionStorage.getItem('oauth_state');
    const codeVerifier = sessionStorage.getItem('code_verifier');

    if (state !== savedState) {
      setStatus('Invalid state - possible CSRF attack');
      return;
    }

    if (code) {
      const clientId = import.meta.env.VITE_QF_CLIENT_ID;
      const redirectUri = `${window.location.origin}/oauth/callback`;
      const authUrl = import.meta.env.VITE_QF_AUTH_URL || 'https://oauth2.quran.foundation';

      fetch(`${authUrl}/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: clientId,
          code,
          redirect_uri: redirectUri,
          code_verifier: codeVerifier || '',
        }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.access_token) {
            userService.setAuth(data.access_token, clientId);
            sessionStorage.removeItem('oauth_state');
            sessionStorage.removeItem('code_verifier');
            setStatus('Authentication successful!');
            setTimeout(() => navigate('/'), 1500);
          } else {
            setStatus('Authentication failed: ' + (data.error || 'Unknown error'));
          }
        })
        .catch(err => {
          setStatus('Authentication failed: ' + err.message);
        });
    } else {
      setStatus('Authentication failed - no code received');
    }
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sada-emerald-500 mx-auto mb-4" />
        <p className="text-sada-sand-100">{status}</p>
      </div>
    </div>
  );
};