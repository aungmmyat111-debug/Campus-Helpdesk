import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, X, Send, MessageSquare, MapPin, Tag, Clock } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import apiClient from '../api/client';
import type { Ticket } from '../types';

const MOCK_TICKETS: Ticket[] = [
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
    createdById: 'user-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Inline Ticket Detail Modal Component
const InlineTicketModal: React.FC<{
  ticket: Ticket | null;
  onClose: () => void;
}> = ({ ticket, onClose }) => {
  if (!ticket) return null;

  const [comments, setComments] = useState([
    {
      id: 'c1',
      author: 'IT Support Bot',
      text: 'Ticket created and routed to queue.',
      timestamp: '10:00 AM',
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
        author: 'Dev User',
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
              Description
            </h4>
            <p className="text-slate-700 text-sm whitespace-pre-line">{ticket.description}</p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center space-x-2">
              <MessageSquare size={16} />
              <span>Activity & Comments</span>
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
                placeholder="Add a comment or update..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition"
              >
                <Send size={14} />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export const MyTickets: React.FC = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await apiClient.get('/tickets/my-tickets');
        if (Array.isArray(response.data)) {
          setTickets(response.data);
        } else {
          setTickets(MOCK_TICKETS);
        }
      } catch (err) {
        console.warn('Backend unavailable, rendering mock tickets:', err);
        setTickets(MOCK_TICKETS);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this ticket?')) return;

    try {
      await apiClient.delete(`/tickets/${id}`);
    } catch (err) {
      console.warn('Backend unavailable, removing ticket locally.');
    } finally {
      setTickets((prev) => prev.filter((ticket) => ticket.id !== id));
      if (selectedTicket?.id === id) {
        setSelectedTicket(null);
      }
    }
  };

  const safeTickets = Array.isArray(tickets) ? tickets : [];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => navigate('/submit')}
            className="flex items-center space-x-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1.5 rounded-lg font-medium text-sm transition"
          >
            <ArrowLeft size={16} />
            <span>Back to Submit Ticket</span>
          </button>
          <h1 className="text-2xl font-bold text-slate-800">My Tickets</h1>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading tickets...</div>
        ) : (
          <div className="space-y-4">
            {safeTickets.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No tickets found.</p>
            ) : (
              safeTickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  className="bg-white p-5 rounded-xl shadow border border-slate-200 flex justify-between items-center cursor-pointer hover:border-indigo-400 hover:shadow-md transition"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {t.id}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-semibold ${
                          t.priority === 'Urgent' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {t.priority}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-800 mt-1">{t.title}</h3>
                    <p className="text-sm text-slate-500 mt-0.5">
                      Room: {t.roomNumber} • Category: {t.category}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        t.status === 'Open' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {t.status}
                    </span>
                    <button
                      onClick={(e) => handleDelete(e, t.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete Ticket"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <InlineTicketModal
        ticket={selectedTicket}
        onClose={() => setSelectedTicket(null)}
      />
    </div>
  );
};