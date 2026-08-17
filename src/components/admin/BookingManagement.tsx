import React, { useState, useEffect } from 'react';
import { Booking, BookingStatus } from '../../types';
import { Search, Filter, Calendar, MapPin, Clock, RefreshCw } from 'lucide-react';

export const BookingManagement: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const getToken = () => localStorage.getItem('admin_token') || '';

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/bookings', {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (res.ok) setBookings(await res.json());
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const filteredBookings = bookings.filter(b =>
    b.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.artistName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusStyle = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.CONFIRMED: return 'bg-emerald-950 text-emerald-400 border-emerald-800/50';
      case BookingStatus.QUOTE_SENT: return 'bg-blue-950 text-blue-400 border-blue-800/50';
      case BookingStatus.CLOSED: return 'bg-slate-800 text-slate-400 border-slate-700/50';
      case BookingStatus.CANCELLED: return 'bg-rose-950 text-rose-400 border-rose-800/50';
      case BookingStatus.ARRIVED: return 'bg-purple-950 text-purple-400 border-purple-800/50';
      default: return 'bg-amber-950 text-amber-400 border-amber-800/50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold font-display text-white">Booking Center</h3>
          <p className="text-slate-400 text-xs mt-1">Monitor all service requests and platform commissions ({bookings.length} total)</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchBookings} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all">
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input type="text" placeholder="Search by booking ID, client, or artist..." className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:border-purple-500" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl flex items-center gap-2">
            <Filter className="w-4 h-4" /> Status
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                <th className="p-4">Booking ID</th>
                <th className="p-4">Client</th>
                <th className="p-4">Artist</th>
                <th className="p-4">Event Date</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Platform Fee</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr><td colSpan={7} className="p-12 text-center text-slate-500 italic">Loading bookings from MongoDB...</td></tr>
              ) : filteredBookings.length === 0 ? (
                <tr><td colSpan={7} className="p-12 text-center text-slate-500 italic">No bookings found.</td></tr>
              ) : filteredBookings.map(b => (
                <tr key={b.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 font-mono text-slate-500 text-[10px]">{b.id?.slice(0, 12)}</td>
                  <td className="p-4 font-bold text-white">{b.clientName}</td>
                  <td className="p-4 text-slate-400">{b.artistName}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Calendar className="w-3 h-3" /> {b.eventDate}
                    </div>
                  </td>
                  <td className="p-4 text-emerald-400 font-bold">₹{b.quotedAmount || '—'}</td>
                  <td className="p-4 text-indigo-400">₹{b.platformFee || '—'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getStatusStyle(b.status)}`}>
                      {b.status}
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
