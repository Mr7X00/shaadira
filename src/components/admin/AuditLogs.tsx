import React, { useState, useEffect } from 'react';
import { SystemLog } from '../../types';
import { Activity, Shield, User, Globe, Clock, Search, Filter, AlertTriangle, Info, RefreshCw } from 'lucide-react';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const getToken = () => localStorage.getItem('admin_token') || '';

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/logs', {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (res.ok) setLogs(await res.json());
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'danger': return <Shield className="w-4 h-4 text-rose-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'success': return <User className="w-4 h-4 text-emerald-400" />;
      default: return <Info className="w-4 h-4 text-slate-400" />;
    }
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'danger': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'warning': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'success': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  const filteredLogs = logs.filter(log =>
    log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.actor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.details?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold font-display text-white">System Audit Logs</h3>
          <p className="text-slate-400 text-xs mt-1">Immutable record of all platform events ({logs.length} entries)</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchLogs} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl flex items-center gap-2 transition-all">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 bg-slate-900/50">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input type="text" placeholder="Filter by action, actor, or details..." className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:border-blue-500 transition-colors" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl flex items-center gap-2">
              <Filter className="w-4 h-4" /> All Types
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800 bg-slate-950/30">
                <th className="p-4 w-12 text-center">Type</th>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Actor</th>
                <th className="p-4">Action</th>
                <th className="p-4">Details</th>
                <th className="p-4">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr><td colSpan={6} className="p-12 text-center text-slate-500 italic">Loading audit trail from MongoDB...</td></tr>
              ) : filteredLogs.length === 0 ? (
                <tr><td colSpan={6} className="p-12 text-center text-slate-500 italic">No log entries found.</td></tr>
              ) : filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-center"><div className="flex justify-center">{getLogIcon(log.type)}</div></td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span className="font-mono text-[10px]">{log.timestamp ? new Date(log.timestamp).toLocaleString('en-IN') : '—'}</span>
                    </div>
                  </td>
                  <td className="p-4 text-white font-medium">{log.actor || 'System'}</td>
                  <td className="p-4 font-bold text-slate-200 uppercase tracking-tighter text-[10px]">{log.action}</td>
                  <td className="p-4 text-slate-400 max-w-xs truncate">{log.details}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getTypeStyle(log.type)}`}>
                      {log.type?.toUpperCase()}
                    </span>
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
