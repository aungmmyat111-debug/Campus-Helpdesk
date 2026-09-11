import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Ticket, PlusCircle, Shield, LayoutDashboard } from 'lucide-react';
import { useMsal } from '@azure/msal-react';
import type { UserRole } from '../types';

export const Navbar: React.FC = () => {
  const { instance } = useMsal();
  const navigate = useNavigate();
  const userRole = localStorage.getItem('user_role') as UserRole;
  const userName = localStorage.getItem('user_name') || 'User';

  const isTechnician = 
    userRole === 'TECHNICIAN' || 
    userRole === 'Technician' || 
    userRole === 'ADMINISTRATOR' || 
    userRole === 'Administrator' || 
    userRole === 'ADMIN';

  const isAdmin = 
    userRole === 'ADMINISTRATOR' || 
    userRole === 'Administrator' || 
    userRole === 'ADMIN';

  const handleLogout = () => {
    // 1. Wipe local application storage & tokens
    localStorage.clear();
    sessionStorage.clear();

    // 2. Clear active account state from MSAL memory
    instance.setActiveAccount(null);

    // 3. Redirect directly back to login page without calling MS global logout page
    navigate('/login');
  };

  return (
    <nav className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
      <div className="flex items-center space-x-6">
        <span className="font-bold text-xl text-indigo-400">Campus HelpDesk</span>
        <div className="flex space-x-4">
          <Link to="/submit" className="flex items-center space-x-1 hover:text-indigo-300 text-sm">
            <PlusCircle size={16} /> <span>Submit Ticket</span>
          </Link>
          <Link to="/my-tickets" className="flex items-center space-x-1 hover:text-indigo-300 text-sm">
            <Ticket size={16} /> <span>My Tickets</span>
          </Link>

          {isTechnician && (
            <Link to="/dashboard" className="flex items-center space-x-1 hover:text-indigo-300 text-sm">
              <LayoutDashboard size={16} /> <span>Technician Portal</span>
            </Link>
          )}

          {isAdmin && (
            <Link to="/admin" className="flex items-center space-x-1 hover:text-indigo-300 text-sm">
              <Shield size={16} /> <span>Admin Panel</span>
            </Link>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-4 text-sm">
        <span className="bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
          {userName} ({userRole})
        </span>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded transition cursor-pointer"
        >
          <LogOut size={16} /> <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};