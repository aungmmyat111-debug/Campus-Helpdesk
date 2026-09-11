import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { TicketSubmission } from './pages/TicketSubmission';
import { AdminPanel } from './pages/AdminPanel';
import { TechnicianDashboard } from './pages/TechnicianDashboard';
import { MyTickets } from './pages/MyTickets';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes for All Users */}
        <Route element={<ProtectedRoute allowedRoles={['STUDENT', 'FACULTY', 'TECHNICIAN', 'ADMINISTRATOR', 'ADMIN', 'Student', 'Faculty', 'Technician', 'Administrator']} />}>
          <Route path="/submit" element={<TicketSubmission />} />
          <Route path="/my-tickets" element={<MyTickets />} />
        </Route>

        {/* Protected Routes for Technicians */}
        <Route element={<ProtectedRoute allowedRoles={['TECHNICIAN', 'ADMINISTRATOR', 'ADMIN', 'Technician', 'Administrator']} />}>
          <Route path="/dashboard" element={<TechnicianDashboard />} />
        </Route>

        {/* Protected Routes for Administrators */}
        <Route element={<ProtectedRoute allowedRoles={['ADMINISTRATOR', 'ADMIN', 'Administrator']} />}>
          <Route path="/admin" element={<AdminPanel />} />
        </Route>

        {/* Fallback Routes */}
        <Route path="/unauthorized" element={
          <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100">
            <h1 className="text-3xl font-bold text-red-600 mb-2">403 - Unauthorized</h1>
            <p className="text-slate-600 mb-4">You do not have permission to view this page.</p>
            <button 
              onClick={() => {
                localStorage.clear();
                window.location.href = '/login';
              }} 
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Return to Login
            </button>
          </div>
        } />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;