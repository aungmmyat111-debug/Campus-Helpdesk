import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { Navbar } from '../components/Navbar';
import apiClient from '../api/client';

export const TicketSubmission: React.FC = () => {
  const [title, setTitle] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [category, setCategory] = useState('GENERAL');
  const [description, setDescription] = useState('');
  const [hasActiveEvent, setHasActiveEvent] = useState(false);
  const [eventName, setEventName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Peer API Integration: Automatically sets priority based on Peer API
  useEffect(() => {
    const checkPeerRoomEvent = async () => {
      if (!roomNumber.trim()) {
        setHasActiveEvent(false);
        setEventName('');
        return;
      }

      try {
        // Calls Peer's Event Booking API running on port 5002
        const response = await axios.get('http://localhost:5002/api/events/check-room', {
          params: { roomNumber: roomNumber.trim() },
          timeout: 2000,
        });

        if (response.data && response.data.hasActiveEvent) {
          setHasActiveEvent(true);
          setEventName(response.data.eventName || 'Ongoing Event');
        } else {
          setHasActiveEvent(false);
          setEventName('');
        }
      } catch (err) {
        setHasActiveEvent(false);
        setEventName('');
      }
    };

    const timer = setTimeout(checkPeerRoomEvent, 500);
    return () => clearTimeout(timer);
  }, [roomNumber]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Automatically assign priority: URGENT if active event detected, else LOW
    const computedPriority = hasActiveEvent ? 'URGENT' : 'LOW';

    try {
      await apiClient.post('/tickets', {
        title: title.trim(),
        roomNumber: roomNumber.trim(),
        category,
        priority: computedPriority,
        description: description.trim(),
      });

      navigate('/my-tickets');
    } catch (err: any) {
      console.error('Failed to create ticket:', err);
      setError(err.response?.data?.error || 'Failed to submit ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center space-x-4 mb-6">
          <button
            type="button"
            onClick={() => navigate('/my-tickets')}
            className="flex items-center space-x-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1.5 rounded-lg font-medium text-sm transition"
          >
            <ArrowLeft size={16} />
            <span>My Tickets</span>
          </button>
          <h1 className="text-2xl font-bold text-slate-800">Submit New Ticket</h1>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
              {error}
            </div>
          )}

          {/* Peer API Dynamic Priority Notification */}
          {hasActiveEvent && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-300 text-amber-800 text-xs rounded-lg flex items-center space-x-2">
              <AlertTriangle size={18} className="text-amber-600 shrink-0" />
              <span>
                <strong>Peer API Alert:</strong> Room {roomNumber} currently has an active event (
                <em>{eventName}</em>). Priority is automatically flagged as <strong>URGENT</strong>.
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Issue Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Projector not turning on"
                className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Room Number *
                </label>
                <input
                  type="text"
                  required
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="e.g., 402"
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="GENERAL">GENERAL</option>
                  <option value="HARDWARE">HARDWARE</option>
                  <option value="SOFTWARE">SOFTWARE</option>
                  <option value="NETWORK">NETWORK</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Description *
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue in detail..."
                className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-5 py-2.5 rounded-lg flex items-center space-x-2 transition"
              >
                <Send size={16} />
                <span>{loading ? 'Submitting...' : 'Submit Ticket'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};