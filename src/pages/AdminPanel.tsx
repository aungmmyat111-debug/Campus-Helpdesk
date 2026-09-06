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
      } catch (err) {
        console.error('Failed to load users:', err);
        setError('Backend route missing: Ask your teammate to add router.get("/users") in Express.');
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleRoleChange = async (id: string, newRole: UserRole) => {
    try {
      await apiClient.patch(`/users/${id}/role`, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      console.error('Failed to update user role on server:', err);
      alert('Could not update role on backend.');
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
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                      className="text-xs border border-slate-300 rounded p-1 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Student">Student</option>
                      <option value="Faculty">Faculty</option>
                      <option value="Technician">Technician</option>
                      <option value="Administrator">Administrator</option>
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