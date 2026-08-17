import React, { useState, useEffect } from 'react';
import { MessageSquare, Search, Filter, Clock, CheckCircle2, AlertCircle, User, LifeBuoy, RefreshCw } from 'lucide-react';

interface SupportTicket {
  id: string;
  clientName: string;
  email: string;
  subject: string;
  message: string;
  status: 'PENDING' | 'RESOLVED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string;
}

export const SupportManagement: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const getToken = () => localStorage.getItem('admin_token') || '';

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/support', {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (res.ok) setTickets(await res.json());
    } catch (error) {
      console.error("Error fetching support tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, []);

  const handleResolve = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/support/${id}/resolve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (res.ok) {
        setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'RESOLVED' } : t));
      }
    } catch (error) {
      console.error("Error resolving ticket:", error);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-rose-950 text-rose-400 border-rose-800/50';
      case 'RESOLVED': return 'bg-emerald-950 text-emerald-400 border-emerald-800/50';
      default: return 'bg-slate-800 text-slate-400 border-slate-700/50';
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'text-rose-500 font-bold';
      case 'MEDIUM': return 'text-amber-500';
      default: return 'text-slate-500';
    }
  };

  const filtered = tickets.filter(t =>
    t.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold font-display text-white">Support Center</h3>
          <p className="text-slate-400 text-xs mt-1">Manage customer support requests ({tickets.length} tickets)</p>
        </div>
        <button onClick={fetchTickets} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all">
          <RefreshCw className="w-3 h-3" /> Refresh
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input type="text" placeholder="Search tickets..." className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:border-purple-500" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>

        <div className="space-y-4">
          {loading ? (
            <p className="text-center text-slate-500 italic py-12">Loading support tickets...</p>
          ) : filtered.length === 0 ? (
            <p className="text-center text-slate-500 italic py-12">No support tickets found.</p>
          ) : filtered.map(ticket => (
            <div key={ticket.id} className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <LifeBuoy className="w-4 h-4 text-purple-400" />
                    <span className="font-bold text-white text-sm">{ticket.subject}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1"><User className="w-3 h-3" />{ticket.clientName}</span>
                    <span>{ticket.email}</span>
                    <span className={getPriorityStyle(ticket.priority)}>{ticket.priority} PRIORITY</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getStatusStyle(ticket.status)}`}>{ticket.status}</span>
                  {ticket.status === 'PENDING' && (
                    <button onClick={() => handleResolve(ticket.id)} className="px-3 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-[10px] font-bold rounded-lg border border-emerald-800/30 transition-all">
                      Resolve
                    </button>
                  )}
                </div>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">{ticket.message}</p>
              <div className="text-[10px] text-slate-600 font-mono flex items-center gap-1">
                <Clock className="w-3 h-3" /> {ticket.createdAt ? new Date(ticket.createdAt).toLocaleString('en-IN') : '—'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
