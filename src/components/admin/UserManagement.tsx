import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../../types';
import { Search, Filter, UserX, Trash2, Key, UserPlus, Shield, Check, X } from 'lucide-react';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<UserRole>(UserRole.CLIENT);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '', role: UserRole.OPERATIONS });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getToken = () => localStorage.getItem('admin_token') || '';

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleUpdateRole = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        setEditingUserId(null);
      }
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdmin.name || !newAdmin.email || !newAdmin.password) {
      alert("Please fill in all fields including password.");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(newAdmin)
      });
      const result = await response.json();
      if (response.ok) {
        setUsers(prev => [...prev, result.user]);
        setShowAddAdmin(false);
        setNewAdmin({ name: '', email: '', password: '', role: UserRole.OPERATIONS });
      } else {
        alert(result.error || "Failed to create user");
      }
    } catch (error) {
      console.error("Error adding admin:", error);
      alert("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold font-display text-white">System Access Control</h3>
          <p className="text-slate-400 text-xs mt-1">Manage user permissions and administrative roles ({users.length} total)</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchUsers} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-xl transition-all">Refresh</button>
          <button
            onClick={() => setShowAddAdmin(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            Add Team Member
          </button>
        </div>
      </div>

      {showAddAdmin && (
        <div className="bg-slate-900 border border-blue-500/30 p-6 rounded-2xl animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" />
              Provision New Admin/Staff
            </h4>
            <button onClick={() => setShowAddAdmin(false)} className="text-slate-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input type="text" placeholder="Full Name" className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white" value={newAdmin.name} onChange={(e) => setNewAdmin(prev => ({ ...prev, name: e.target.value }))} />
            <input type="email" placeholder="Email Address" className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white" value={newAdmin.email} onChange={(e) => setNewAdmin(prev => ({ ...prev, email: e.target.value }))} />
            <input type="password" placeholder="Set Password" className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white" value={newAdmin.password} onChange={(e) => setNewAdmin(prev => ({ ...prev, password: e.target.value }))} />
            <select className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white" value={newAdmin.role} onChange={(e) => setNewAdmin(prev => ({ ...prev, role: e.target.value as UserRole }))}>
              <option value={UserRole.OPERATIONS}>Operations</option>
              <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
            </select>
          </div>
          <div className="mt-4 flex justify-end">
            <button onClick={handleAddAdmin} disabled={isSubmitting} className={`px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {isSubmitting ? 'Provisioning...' : 'Create Account'}
            </button>
          </div>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6">
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input type="text" placeholder="Search users by name, email..." className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:border-blue-500" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl flex items-center gap-2">
            <Filter className="w-4 h-4" /> Roles
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                <th className="p-4">Identity</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Access Level</th>
                <th className="p-4">Joined</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr><td colSpan={5} className="p-12 text-center text-slate-500 italic">Loading users from MongoDB...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-slate-500 italic">No users found.</td></tr>
              ) : filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-white border border-slate-700">
                        {user.name?.[0] || '?'}
                      </div>
                      <div>
                        <div className="font-bold text-white">{user.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">ID: {user.id?.slice(0, 12)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-slate-400">{user.email}</td>
                  <td className="p-4">
                    {editingUserId === user.id ? (
                      <div className="flex items-center gap-2">
                        <select className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[10px] text-white" value={newRole} onChange={(e) => setNewRole(e.target.value as UserRole)}>
                          <option value={UserRole.CLIENT}>Client</option>
                          <option value={UserRole.ARTIST}>Artist</option>
                          <option value={UserRole.OPERATIONS}>Operations Staff</option>
                          <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
                        </select>
                        <button onClick={() => handleUpdateRole(user.id)} className="p-1 bg-emerald-500/10 text-emerald-400 rounded-md hover:bg-emerald-500/20"><Check className="w-3 h-3" /></button>
                        <button onClick={() => setEditingUserId(null)} className="p-1 bg-rose-500/10 text-rose-400 rounded-md hover:bg-rose-500/20"><X className="w-3 h-3" /></button>
                      </div>
                    ) : (
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                        user.role === UserRole.SUPER_ADMIN ? 'bg-purple-950 text-purple-400 border-purple-800/50' :
                        user.role === UserRole.OPERATIONS ? 'bg-blue-950 text-blue-400 border-blue-800/50' :
                        user.role === UserRole.ARTIST ? 'bg-amber-950 text-amber-400 border-amber-800/50' :
                        'bg-slate-800 text-slate-400 border-slate-700/50'
                      }`}>{user.role}</span>
                    )}
                  </td>
                  <td className="p-4 text-slate-500 text-[10px] font-mono">{(user as any).createdAt?.split('T')[0] || '—'}</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingUserId(user.id); setNewRole(user.role); }} className="p-2 bg-slate-800 hover:bg-blue-600/20 text-slate-400 hover:text-blue-400 rounded-lg transition-all">
                        <Key className="w-4 h-4" />
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
};
