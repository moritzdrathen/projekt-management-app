import { useEffect, useState } from 'react';
import api from '../api/axios';
import { User } from '../types';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('EMPLOYEE');

  useEffect(() => {
    api.get('/users').then(res => setUsers(res.data));
  }, []);

  const resetForm = () => {
    setUsername(''); setEmail(''); setPassword(''); setRole('EMPLOYEE');
    setEditUser(null); setShowForm(false);
  };

  const startEdit = (user: User) => {
    setEditUser(user); setUsername(user.username); setEmail(user.email ?? '');
    setPassword(''); setRole(user.role); setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editUser) {
      const res = await api.put(`/users/${editUser.id}`, { email: email || null, password: password || undefined, role });
      setUsers(prev => prev.map(u => u.id === editUser.id ? res.data : u));
    } else {
      const res = await api.post('/users', { username, email, password, role });
      setUsers(prev => [...prev, res.data]);
    }
    resetForm();
  };

  const deleteUser = async (id: number) => {
    if (!confirm('Benutzer wirklich löschen?')) return;
    await api.delete(`/users/${id}`);
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const roleBadge = (r: string) => {
    const styles: Record<string, string> = {
      ADMIN: 'bg-purple-100 text-purple-700',
      PROJECT_MANAGER: 'bg-blue-100 text-blue-700',
      EMPLOYEE: 'bg-green-100 text-green-700',
    };
    return (
      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${styles[r] ?? 'bg-gray-100 text-gray-600'}`}>
        {r}
      </span>
    );
  };

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent";

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#1e3a5f]">Benutzerverwaltung</h1>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="bg-[#1e3a5f] hover:bg-[#254a78] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + Neuer Benutzer
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h3 className="text-base font-semibold text-gray-800 mb-4">
              {editUser ? 'Benutzer bearbeiten' : 'Neuer Benutzer'}
            </h3>
            <div className="flex flex-col gap-3 max-w-md">
              {!editUser && (
                <input placeholder="Benutzername" value={username} onChange={e => setUsername(e.target.value)} required className={inputClass} />
              )}
              <input placeholder="E-Mail" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
              <input
                type="password"
                placeholder={editUser ? 'Neues Passwort (leer = unverändert)' : 'Passwort'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required={!editUser}
                className={inputClass}
              />
              <select value={role} onChange={e => setRole(e.target.value)} className={inputClass}>
                <option value="EMPLOYEE">Mitarbeiter (EMPLOYEE)</option>
                <option value="PROJECT_MANAGER">Projektleiter (PROJECT_MANAGER)</option>
                <option value="ADMIN">Administrator (ADMIN)</option>
              </select>
              <div className="flex gap-3 mt-1">
                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                  Speichern
                </button>
                <button type="button" onClick={resetForm} className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                  Abbrechen
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#1e3a5f] text-white text-sm">
                <th className="text-left px-5 py-3 font-medium">Benutzername</th>
                <th className="text-left px-5 py-3 font-medium">E-Mail</th>
                <th className="text-left px-5 py-3 font-medium">Rolle</th>
                <th className="text-left px-5 py-3 font-medium">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <tr key={user.id} className={`border-t border-gray-50 text-sm ${i % 2 === 1 ? 'bg-gray-50' : ''}`}>
                  <td className="px-5 py-3 font-medium text-gray-800">{user.username}</td>
                  <td className="px-5 py-3 text-gray-500">{user.email}</td>
                  <td className="px-5 py-3">{roleBadge(user.role)}</td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(user)} className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors">
                        Bearbeiten
                      </button>
                      <button onClick={() => deleteUser(user.id)} className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors">
                        Löschen
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
