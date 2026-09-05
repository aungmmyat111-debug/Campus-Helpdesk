import React, { useState } from 'react';
import apiClient from '../api/client';
import { Navbar } from '../components/Navbar';
import type { Ticket } from '../types';

export const TicketSubmission: React.FC = () => {
  const [form, setForm] = useState({ title: '', description: '', roomNumber: '' });
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiClient.post('/tickets', form);
      setTicket(res.data);
    } catch (err) {
      console.error('Failed to create ticket', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Report an IT Issue</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Issue Title</label>
            <input
              required
              type="text"
              className="w-full border rounded-lg p-2.5 text-sm"
              placeholder="e.g., Projector not displaying in Room 402"
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Room Number</label>
            <input
              required
              type="text"
              className="w-full border rounded-lg p-2.5 text-sm"
              placeholder="Room 402"
              onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              required
              rows={4}
              className="w-full border rounded-lg p-2.5 text-sm"
              placeholder="Describe the issue in detail..."
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
          >
            {loading ? 'Submitting...' : 'Submit Ticket'}
          </button>
        </form>

        {ticket && (
          <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <h3 className="font-bold text-slate-800 text-sm">Ticket Created Successfully!</h3>
            <p className="text-xs text-slate-600">ID: {ticket.id}</p>
            <p className="text-sm"><strong>AI Auto-Category:</strong> {ticket.category}</p>
            <p className="text-sm">
              <strong>Priority Level:</strong>{' '}
              <span className={`font-semibold ${ticket.priority === 'Urgent' ? 'text-red-600' : 'text-slate-800'}`}>
                {ticket.priority}
              </span>
              {ticket.eventActive && ' ⚠️ (Active Event Detected in Room)'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};