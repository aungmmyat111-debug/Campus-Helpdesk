import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import apiClient from '../api/client';
import type { UserRole } from '../types';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await apiClient.get('/users');
        if (Array.isArray(response.data)) {
          setUsers(response.data);
        } else if (Array.isArray(response.data.users)) {
          setUsers(response.data.users);
        } else {
          setUsers([]);
        }
      } catch (err: any) {
        console.error('Failed to load users:', err);
        const serverMsg = err.response?.data?.error || err.response?.data?.message;
        setError(serverMsg || 'Failed to retrieve user directory from backend.');
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleRoleChange = async (id: string, newRole: string) => {
    // Send uppercase string format to align with backend enum validation
    const formattedRole = newRole.toUpperCase() as UserRole;

    try {
      await apiClient.patch(`/users/${id}/role`, { role: formattedRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role: formattedRole } : u))
      );
    } catch (err: any) {
      console.error('Failed to update user role on server:', err);
      const message = err.response?.data?.error || 'Could not update role on backend.';
      alert(message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-5xl mx-auto mt-8 p-6 bg-white rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-2">System Administration</h2>
        <p className="text-sm text-slate-500 mb-6">Manage user roles and Active Directory permissions.</p>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading user directory...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500 font-semibold">{error}</div>
        ) : users.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No users found in database.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Email</th>
                <th className="p-3">Current Role</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="p-3 font-semibold text-slate-800">{u.name}</td>
                  <td className="p-3 text-slate-600">{u.email}</td>
                  <td className="p-3">
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-700">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3">
                    <select
                      value={u.role?.toUpperCase()}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="text-xs border border-slate-300 rounded p-1 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="STUDENT">Student</option>
                      <option value="FACULTY">Faculty</option>
                      <option value="TECHNICIAN">Technician</option>
                      <option value="ADMINISTRATOR">Administrator</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};