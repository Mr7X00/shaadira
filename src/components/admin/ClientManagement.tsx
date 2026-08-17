import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../../types';
import { Search, Filter, Mail, Phone, MapPin, Trash2, UserCheck, ShieldAlert } from 'lucide-react';

export const ClientManagement: React.FC = () => {
  const [clients, setClients] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const getToken = () => localStorage.getItem('admin_token') || '';

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/clients', {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (res.ok) {
        const data = await res.json();
        setClients(data);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClients(); }, []);

  const filteredClients = clients.filter(client =>
    client.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteClient = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this client? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/clients/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ status: 'BANNED' })
      });
      if (res.ok) {
        setClients(prev => prev.filter(c => c.id !== id));
      }
    } catch (error) {
      console.error("Error deleting client:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold font-display text-white">Client Management</h3>
          <p className="text-slate-400 text-xs mt-1">Manage and track customer accounts ({clients.length} registered)</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchClients} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-xl transition-all">Refresh</button>
          <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all">Export Report</button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input type="text" placeholder="Search clients by name or email..." className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:border-purple-500" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                <th className="p-4">Client</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Role</th>
                <th className="p-4">Joined</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr><td colSpan={5} className="p-12 text-center text-slate-500 italic">Loading clients from MongoDB...</td></tr>
              ) : filteredClients.length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-slate-500 italic">No clients found. Users register through the app.</td></tr>
              ) : filteredClients.map(client => (
                <tr key={client.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-900/40 border border-purple-800/30 flex items-center justify-center font-bold text-purple-300 text-sm">
                        {client.name?.[0] || '?'}
                      </div>
                      <div>
                        <div className="font-bold text-white">{client.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">ID: {client.id?.slice(0, 12)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-1.5 text-slate-400"><Mail className="w-3 h-3" />{client.email}</span>
                      {(client as any).phone && <span className="flex items-center gap-1.5 text-slate-500"><Phone className="w-3 h-3" />{(client as any).phone}</span>}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold border bg-slate-800 text-slate-400 border-slate-700/50">{client.role || 'CLIENT'}</span>
                  </td>
                  <td className="p-4 text-slate-500 text-[10px] font-mono">{(client as any).createdAt?.split('T')[0] || '—'}</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleDeleteClient(client.id)} className="p-2 bg-slate-800 hover:bg-rose-600/20 text-slate-400 hover:text-rose-400 rounded-lg transition-all">
                        <Trash2 className="w-4 h-4" />
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
