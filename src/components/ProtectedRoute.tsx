import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import type { UserRole } from '../types';

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const token = localStorage.getItem('app_jwt');
  const userRole = localStorage.getItem('user_role') as UserRole;

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};