import React, { useEffect, useRef, useState } from 'react';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { useNavigate } from 'react-router-dom';
import { loginRequest } from '../auth/msalConfig';
import apiClient from '../api/client';

export const LoginPage: React.FC = () => {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const navigate = useNavigate();
  const isSyncing = useRef(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const syncUserWithBackend = async () => {
      if (isAuthenticated && accounts.length > 0 && !isSyncing.current) {
        isSyncing.current = true;
        setErrorMessage(null);

        try {
          const activeAccount = accounts[0];
          const userEmail = 
            activeAccount.username || 
            (activeAccount.idTokenClaims as any)?.email || 
            (activeAccount.idTokenClaims as any)?.preferred_username;

          // Extract Azure AD Object ID (oid or sub)
          const adObjectId = 
            (activeAccount.idTokenClaims as any)?.oid || 
            (activeAccount.idTokenClaims as any)?.sub || 
            activeAccount.localAccountId || 
            activeAccount.homeAccountId;

          const tokenResponse = await instance.acquireTokenSilent({
            ...loginRequest,
            account: activeAccount,
          });

          // Posts to: http://localhost:5001/api/auth/login
          const response = await apiClient.post('/auth/login', { 
            email: userEmail,
            name: activeAccount.name || userEmail?.split('@')[0] || 'User',
            adObjectId, // Added required Prisma field
            idToken: tokenResponse.idToken,
            token: tokenResponse.idToken || tokenResponse.accessToken,
            accessToken: tokenResponse.accessToken,
          });

          const jwtToken = 
            response.data.jwt || 
            response.data.token || 
            response.data.accessToken || 
            tokenResponse.idToken;

          if (!jwtToken) {
            console.error('No valid token received from backend API:', response.data);
            setErrorMessage('Failed to receive authentication token from server.');
            isSyncing.current = false;
            return;
          }

          const userRole = response.data.user?.role || 'STUDENT';
          const userName = response.data.user?.name || activeAccount.name || 'User';

          localStorage.setItem('app_jwt', jwtToken);
          localStorage.setItem('user_role', userRole);
          localStorage.setItem('user_name', userName);

          // Route navigation based on RBAC
          if (['ADMINISTRATOR', 'ADMIN', 'Administrator'].includes(userRole)) {
            navigate('/admin');
          } else if (['TECHNICIAN', 'Technician'].includes(userRole)) {
            navigate('/dashboard');
          } else {
            navigate('/submit');
          }
        } catch (err) {
          console.error('Failed to exchange token with backend:', err);
          setErrorMessage('Unable to log in. Please check backend connections.');
          isSyncing.current = false;
        }
      }
    };

    syncUserWithBackend();
  }, [isAuthenticated, accounts, instance, navigate]);

  const handleLogin = () => {
    localStorage.clear();
    sessionStorage.clear();

    instance.loginRedirect({
      ...loginRequest,
      prompt: 'select_account',
    }).catch((err) => {
      console.error('Redirect authentication failed:', err);
      setErrorMessage('Failed to initiate login redirect.');
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Campus IT HelpDesk</h1>
        <p className="text-slate-600 text-sm mb-6">
          Sign in with your University Active Directory account
        </p>

        {errorMessage && (
          <div className="mb-4 p-3 text-xs text-red-700 bg-red-100 rounded-lg text-left">
            {errorMessage}
          </div>
        )}

        <button
          type="button"
          onClick={handleLogin}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg shadow transition flex items-center justify-center cursor-pointer"
        >
          <span>Sign in with Microsoft AD</span>
        </button>
      </div>
    </div>
  );
};