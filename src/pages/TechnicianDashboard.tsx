import React, { useEffect, useState } from 'react';
import { X, Send, MessageSquare, MapPin, Tag, Clock } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import apiClient from '../api/client';
import type { Ticket } from '../types';

const MOCK_TECHNICIAN_TICKETS: Ticket[] = [
  {
    id: 'TICK-1001',
    title: 'Projector Not Working',
    description: 'The HDMI connection is not outputting display.',
    roomNumber: 'A-101',
    status: 'Open',
    priority: 'Medium',
    category: 'Hardware',
    eventActive: false,
    createdById: 'user-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'TICK-1002',
    title: 'Wi-Fi Drops Constantly',
    description: 'Lab 402 loses connection during active lecture.',
    roomNumber: 'Lab-402',
    status: 'In Progress',
    priority: 'Urgent',
    category: 'Network',
    eventActive: true,
    createdById: 'user-2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Inline Modal for Technician Ticket Details
const TechTicketModal: React.FC<{
  ticket: Ticket | null;
  onClose: () => void;
}> = ({ ticket, onClose }) => {
  if (!ticket) return null;

  const [comments, setComments] = useState([
    {
      id: 'c1',
      author: 'IT Dispatch',
      text: 'Assigned to Technician queue.',
      timestamp: '09:30 AM',
    },
  ]);
  const [newComment, setNewComment] = useState('');

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setComments((prev) => [
      ...prev,
      {
        id: 'c-' + Date.now(),
        author: 'Technician Staff',
        text: newComment.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setNewComment('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-5 bg-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-xs bg-slate-700 px-2.5 py-1 rounded text-slate-200">
              {ticket.id}
            </span>
            <span
              className={`text-xs px-2.5 py-1 rounded font-bold ${
                ticket.priority === 'Urgent' ? 'bg-red-500 text-white' : 'bg-slate-600 text-slate-100'
              }`}
            >
              {ticket.priority} Priority
            </span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{ticket.title}</h2>
            <div className="flex items-center space-x-4 text-xs text-slate-500 mt-2">
              <span className="flex items-center space-x-1">
                <MapPin size={14} />
                <span>Room {ticket.roomNumber}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Tag size={14} />
                <span>{ticket.category}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Clock size={14} />
                <span>Created recently</span>
              </span>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              Issue Details
            </h4>
            <p className="text-slate-700 text-sm whitespace-pre-line">{ticket.description}</p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center space-x-2">
              <MessageSquare size={16} />
              <span>Technician Notes & Updates</span>
            </h3>

            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-1">
              {comments.map((c) => (
                <div key={c.id} className="bg-slate-100 p-3 rounded-lg text-xs">
                  <div className="flex justify-between items-center text-slate-500 font-semibold mb-1">
                    <span>{c.author}</span>
                    <span>{c.timestamp}</span>
                  </div>
                  <p className="text-slate-700">{c.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                placeholder="Post technician note..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition"
              >
                <Send size={14} />
                <span>Add Note</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export const TechnicianDashboard: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>(MOCK_TECHNICIAN_TICKETS);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const fetchTickets = async () => {
    try {
      const response = await apiClient.get('/tickets/all');
      if (Array.isArray(response.data)) {
        setTickets(response.data);
      } else {
        setTickets(MOCK_TECHNICIAN_TICKETS);
      }
    } catch (err) {
      console.warn('Backend unavailable, loading mock queue:', err);
      setTickets(MOCK_TECHNICIAN_TICKETS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleClaim = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    apiClient.patch(`/tickets/${id}/claim`).catch(() => {});
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'In Progress' } : t))
    );
  };

  const handleResolve = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    apiClient.patch(`/tickets/${id}/status`, { status: 'Resolved' }).catch(() => {});
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'Resolved' } : t))
    );
  };

  const safeTickets = Array.isArray(tickets) ? tickets : [];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-5xl mx-auto mt-8 p-6 bg-white rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Technician Queue</h2>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading technician portal...</div>
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
              {safeTickets.map((t) => (
                <tr
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  className="hover:bg-slate-50 cursor-pointer transition"
                >
                  <td className="p-3">
                    <div className="font-semibold text-slate-800">{t.title}</div>
                    <div className="text-xs text-slate-500">Room: {t.roomNumber}</div>
                  </td>
                  <td className="p-3 text-slate-600">{t.category}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 text-xs rounded font-bold ${
                      t.priority === 'Urgent' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                    }`}>
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
                      onClick={(e) => handleClaim(e, t.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs transition"
                    >
                      Claim
                    </button>
                    <button
                      onClick={(e) => handleResolve(e, t.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs transition"
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