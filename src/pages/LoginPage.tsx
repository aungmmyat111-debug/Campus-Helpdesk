import React from 'react';
import { useMsal } from '@azure/msal-react';
import { useNavigate } from 'react-router-dom';
import { loginRequest } from '../auth/msalConfig';
import apiClient from '../api/client';

export const LoginPage: React.FC = () => {
  const { instance } = useMsal();
  const navigate = useNavigate();

  // REAL MSAL LOGIN
  const handleLogin = async () => {
    try {
      const loginResponse = await instance.loginPopup(loginRequest);
      const adToken = loginResponse.accessToken;

      const response = await apiClient.post('/auth/login', { token: adToken });
      
      localStorage.setItem('app_jwt', response.data.jwt);
      localStorage.setItem('user_role', response.data.user.role);
      localStorage.setItem('user_name', response.data.user.name);

      navigate('/submit');
    } catch (err) {
      console.error('Authentication failed:', err);
    }
  };

  // DEV MOCK LOGIN (Use this until real Azure keys arrive)
  const handleDevLogin = (role: 'Student' | 'Technician' | 'Administrator') => {
    localStorage.setItem('app_jwt', 'mock_dev_jwt_token');
    localStorage.setItem('user_role', role);
    localStorage.setItem('user_name', `Dev ${role}`);
    navigate('/submit');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Campus IT HelpDesk</h1>
        <p className="text-slate-600 text-sm mb-6">Sign in with your University Active Directory account</p>
        
        <button
          onClick={handleLogin}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg shadow transition flex items-center justify-center mb-4"
        >
          <span>Sign in with Microsoft AD</span>
        </button>

        <div className="border-t border-slate-200 pt-4 mt-4">
          <p className="text-xs text-slate-400 font-semibold mb-2 uppercase">Dev Quick Switch</p>
          <div className="flex justify-center space-x-2">
            <button onClick={() => handleDevLogin('Student')} className="text-xs bg-slate-200 hover:bg-slate-300 px-2 py-1 rounded">
              Student
            </button>
            <button onClick={() => handleDevLogin('Technician')} className="text-xs bg-slate-200 hover:bg-slate-300 px-2 py-1 rounded">
              Technician
            </button>
            <button onClick={() => handleDevLogin('Administrator')} className="text-xs bg-slate-200 hover:bg-slate-300 px-2 py-1 rounded">
              Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};