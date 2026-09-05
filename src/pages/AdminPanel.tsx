import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import type { UserRole } from '../types';

interface UserMock {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

const INITIAL_USERS: UserMock[] = [
  { id: 'usr-1', name: 'Alex Johnson', email: 'alex@university.edu', role: 'Student' },
  { id: 'usr-2', name: 'Dev Technician', email: 'tech@university.edu', role: 'Technician' },
  { id: 'usr-3', name: 'Sarah Admin', email: 'admin@university.edu', role: 'Administrator' },
];

export const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<UserMock[]>(INITIAL_USERS);

  const handleRoleChange = (id: string, newRole: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, role: newRole } : u))
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-5xl mx-auto mt-8 p-6 bg-white rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-2">System Administration</h2>
        <p className="text-sm text-slate-500 mb-6">Manage user roles and Active Directory permissions.</p>

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
                    className="text-xs border border-slate-300 rounded p-1 bg-white"
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
      </div>
    </div>
  );
};