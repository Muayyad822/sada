import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';

export const Callback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Processing...');

  useEffect(() => {
    const token = searchParams.get('token');
    const clientId = searchParams.get('client_id');
    
    if (token) {
      userService.setAuth(token, clientId || undefined);
      setStatus('Authentication successful!');
      setTimeout(() => navigate('/'), 1500);
    } else {
      setStatus('Authentication failed');
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
