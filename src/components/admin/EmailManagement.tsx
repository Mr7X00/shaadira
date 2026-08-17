import React, { useState, useEffect } from 'react';
import { EmailLog } from '../../types';
import { Mail, Search, Filter, CheckCircle2, AlertCircle, Clock, Send, RefreshCw } from 'lucide-react';

export const EmailManagement: React.FC = () => {
  const [emails, setEmails] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const getToken = () => localStorage.getItem('admin_token') || '';

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/email-logs', {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (res.ok) setEmails(await res.json());
    } catch (error) {
      console.error("Error fetching email logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmails(); }, []);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'SENT': return 'bg-emerald-950 text-emerald-400 border-emerald-800/50';
      case 'FAILED': return 'bg-rose-950 text-rose-400 border-rose-800/50';
      default: return 'bg-slate-800 text-slate-400 border-slate-700/50';
    }
  };

  const filteredEmails = emails.filter(e =>
    e.recipient?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold font-display text-white">Email Center</h3>
          <p className="text-slate-400 text-xs mt-1">Audit automated system communications ({emails.length} entries)</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchEmails} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all">
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
          <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl flex items-center gap-2 transition-all">
            <Send className="w-4 h-4" /> Test Mailer
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input type="text" placeholder="Search by recipient, subject, type..." className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:border-blue-500" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl flex items-center gap-2">
              <Filter className="w-4 h-4" /> Status
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800 bg-slate-950/30">
                <th className="p-4">Recipient</th>
                <th className="p-4">Subject</th>
                <th className="p-4">Type</th>
                <th className="p-4">Sent At</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr><td colSpan={5} className="p-12 text-center text-slate-500 italic">Loading email logs from MongoDB...</td></tr>
              ) : filteredEmails.length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-slate-500 italic">No email logs found. Emails will appear here when sent.</td></tr>
              ) : filteredEmails.map(email => (
                <tr key={email.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3 h-3 text-slate-500" />
                      <span className="text-white">{email.recipient}</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-400 max-w-xs truncate">{email.subject}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded text-[10px] font-mono">{email.type}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-mono">
                      <Clock className="w-3 h-3" />
                      {email.sentTime ? new Date(email.sentTime).toLocaleString('en-IN') : '—'}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getStatusStyle(email.deliveryStatus)}`}>
                      {email.deliveryStatus}
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
