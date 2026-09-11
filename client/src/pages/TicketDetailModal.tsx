import React from 'react';
import { X, MapPin, Tag, Clock } from 'lucide-react';
import type { Ticket } from '../types';

interface TicketDetailModalProps {
  ticket: Ticket | null;
  onClose: () => void;
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({ ticket, onClose }) => {
  if (!ticket) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col">
        
        {/* Modal Header */}
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
            className="text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
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
                <span>Created {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : 'recently'}</span>
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