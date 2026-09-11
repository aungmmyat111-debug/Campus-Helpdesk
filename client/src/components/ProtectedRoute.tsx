import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import type { UserRole } from '../types';

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const token = localStorage.getItem('app_jwt');
  const userRole = localStorage.getItem('user_role');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const isAuthorized = 
    userRole && (
      allowedRoles.includes(userRole as UserRole) ||
      (userRole === 'ADMINISTRATOR' && allowedRoles.includes('ADMIN' as UserRole)) ||
      (userRole === 'ADMIN' && allowedRoles.includes('ADMINISTRATOR' as UserRole))
    );

  if (!isAuthorized) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};