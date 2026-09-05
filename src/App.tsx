import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MsalProvider } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from './auth/msalConfig';

import { LoginPage } from './pages/LoginPage';
import { TicketSubmission } from './pages/TicketSubmission';
import { MyTickets } from './pages/MyTickets';
import { TechnicianDashboard } from './pages/TechnicianDashboard';
import { AdminPanel } from './pages/AdminPanel';
import { ProtectedRoute } from './components/ProtectedRoute';

const msalInstance = new PublicClientApplication(msalConfig);

export function App() {
  return (
    <MsalProvider instance={msalInstance}>
      <BrowserRouter basename="/helpdesk">
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute allowedRoles={['Student', 'Faculty', 'Technician', 'Administrator']} />}>
            <Route path="/submit" element={<TicketSubmission />} />
            <Route path="/my-tickets" element={<MyTickets />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['Technician', 'Administrator']} />}>
            <Route path="/technician" element={<TechnicianDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['Administrator']} />}>
            <Route path="/admin" element={<AdminPanel />} />
          </Route>

          <Route path="*" element={<Navigate to="/submit" replace />} />
        </Routes>
      </BrowserRouter>
    </MsalProvider>
  );
}

export default App;