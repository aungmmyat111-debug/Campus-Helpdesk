import React, { useEffect, useState } from 'react';
import { X, MapPin, Tag, Clock, AlertCircle } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import apiClient from '../api/client';
import type { Ticket } from '../types';

// Inline Modal for Technician Ticket Details (Without Comments/Notes)
const TechTicketModal: React.FC<{
  ticket: Ticket | null;
  onClose: () => void;
}> = ({ ticket, onClose }) => {
  if (!ticket) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 bg-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-xs bg-slate-700 px-2.5 py-1 rounded text-slate-200">
              {ticket.id}
            </span>
            <span
              className={`text-xs px-2.5 py-1 rounded font-bold ${
                ticket.priority === 'Urgent' || ticket.priority === 'URGENT'
                  ? 'bg-red-500 text-white'
                  : 'bg-slate-600 text-slate-100'
              }`}
            >
              {ticket.priority} Priority
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{ticket.title}</h2>
            <div className="flex items-center space-x-4 text-xs text-slate-500 mt-2">
              <span className="flex items-center space-x-1">
                <MapPin size={14} />
                <span>Room {ticket.roomNumber}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Tag size={14} />
                <span>{ticket.category || 'General'}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Clock size={14} />
                <span>Created {new Date(ticket.createdAt).toLocaleDateString()}</span>
              </span>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              Issue Details
            </h4>
            <p className="text-slate-700 text-sm whitespace-pre-line">{ticket.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const TechnicianDashboard: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const userRole = localStorage.getItem('user_role');

  const fetchTickets = async () => {
    try {
      const response = await apiClient.get('/tickets');
      
      if (Array.isArray(response.data)) {
        setTickets(response.data);
      } else if (Array.isArray(response.data.tickets)) {
        setTickets(response.data.tickets);
      } else {
        setTickets([]);
      }
    } catch (err) {
      console.error('Failed to load technician queue:', err);
      setError('Unable to retrieve tickets from database.');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleClaim = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActionError(null);

    if (userRole === 'ADMINISTRATOR' || userRole === 'ADMIN') {
      setActionError('Access Denied: Only designated Technicians can claim or update ticket statuses.');
      return;
    }

    try {
      await apiClient.patch(`/tickets/${id}`, { status: 'IN_PROGRESS' });
      setTickets((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: 'IN_PROGRESS' } : t))
      );
    } catch (err: any) {
      console.error('Failed to claim ticket:', err);
      const serverMsg = err.response?.data?.error || err.response?.data?.message;
      setActionError(serverMsg || 'Access Denied: Action restricted to Technicians.');
    }
  };

  const handleResolve = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActionError(null);

    if (userRole === 'ADMINISTRATOR' || userRole === 'ADMIN') {
      setActionError('Access Denied: Only designated Technicians can claim or update ticket statuses.');
      return;
    }

    try {
      await apiClient.patch(`/tickets/${id}`, { status: 'RESOLVED' });
      setTickets((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: 'RESOLVED' } : t))
      );
    } catch (err: any) {
      console.error('Failed to resolve ticket:', err);
      const serverMsg = err.response?.data?.error || err.response?.data?.message;
      setActionError(serverMsg || 'Access Denied: Action restricted to Technicians.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-5xl mx-auto mt-8 p-6 bg-white rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Technician Queue</h2>

        {actionError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle size={16} className="shrink-0 text-red-600" />
              <span>{actionError}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionError(null)}
              className="text-red-500 hover:text-red-700 font-bold ml-4 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading technician portal...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500 font-semibold">{error}</div>
        ) : tickets.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No open tickets in queue.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="p-3">Title / Room</th>
                <th className="p-3">Category</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {tickets.map((t) => (
                <tr
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  className="hover:bg-slate-50 cursor-pointer transition"
                >
                  <td className="p-3">
                    <div className="font-semibold text-slate-800">{t.title}</div>
                    <div className="text-xs text-slate-500">Room: {t.roomNumber}</div>
                  </td>
                  <td className="p-3 text-slate-600">{t.category || 'General'}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 text-xs rounded font-bold ${
                        t.priority === 'Urgent' || t.priority === 'URGENT'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {t.priority}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-700">
                      {t.status}
                    </span>
                  </td>
                  <td className="p-3 space-x-2">
                    <button
                      type="button"
                      onClick={(e) => handleClaim(e, t.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs transition cursor-pointer"
                    >
                      Claim
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleResolve(e, t.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs transition cursor-pointer"
                    >
                      Resolve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <TechTicketModal
        ticket={selectedTicket}
        onClose={() => setSelectedTicket(null)}
      />
    </div>
  );
};