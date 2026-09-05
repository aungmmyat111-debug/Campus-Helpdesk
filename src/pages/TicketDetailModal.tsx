import React, { useState } from 'react';
import { X, Send, MessageSquare, MapPin, Tag, Clock } from 'lucide-react';
import type { Ticket } from '../types';

interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

interface TicketDetailModalProps {
  ticket: Ticket | null;
  onClose: () => void;
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({ ticket, onClose }) => {
  if (!ticket) return null;

  const [comments, setComments] = useState<Comment[]>([
    {
      id: 'c1',
      author: 'IT Support Bot',
      text: 'Ticket created and routed to hardware queue.',
      timestamp: new Date(Date.now() - 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [newComment, setNewComment] = useState('');

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const userRole = localStorage.getItem('user_role') || 'User';
    const userName = localStorage.getItem('user_name') || 'Dev User';

    setComments((prev) => [
      ...prev,
      {
        id: 'c-' + Date.now(),
        author: `${userName} (${userRole})`,
        text: newComment.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setNewComment('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
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
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
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
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Description</h4>
            <p className="text-slate-700 text-sm whitespace-pre-line">{ticket.description}</p>
          </div>

          {/* Comments / Activity Stream */}
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