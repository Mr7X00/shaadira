import React, { useState, useEffect } from 'react';
import { ArtistProfile, VerificationStatus } from '../../types';
import { Search, Filter, Trash2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

export const ArtistManagement: React.FC = () => {
  const [artists, setArtists] = useState<ArtistProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const getToken = () => localStorage.getItem('admin_token') || '';

  const fetchArtists = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/artists', {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (res.ok) setArtists(await res.json());
    } catch (error) {
      console.error("Error fetching artists:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchArtists(); }, []);

  const handleUpdateStatus = async (id: string, status: VerificationStatus) => {
    try {
      const res = await fetch('/api/artists/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ artistId: id, status, actor: 'Super Admin' })
      });
      if (res.ok) {
        setArtists(prev => prev.map(a => a.id === id ? { ...a, verified: status } : a));
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this artist?")) return;
    try {
      const res = await fetch(`/api/admin/artists/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (res.ok) setArtists(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error("Error deleting artist:", error);
    }
  };

  const filtered = artists.filter(a =>
    a.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold font-display text-white">Artist Management</h3>
          <p className="text-slate-400 text-xs mt-1">{artists.length} artists registered · {artists.filter(a => a.verified === VerificationStatus.APPROVED).length} approved</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchArtists} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all">
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input type="text" placeholder="Search artists..." className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:border-purple-500" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl flex items-center gap-2"><Filter className="w-4 h-4" /> Filter</button>
        </div>

        <table className="w-full text-left text-xs text-slate-300">
          <thead>
            <tr className="text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
              <th className="p-4">Artist</th>
              <th className="p-4">Category</th>
              <th className="p-4">Exp</th>
              <th className="p-4">Base Price</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              <tr><td colSpan={6} className="p-12 text-center text-slate-500 italic">Loading artists from MongoDB...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="p-12 text-center text-slate-500 italic">No artists found.</td></tr>
            ) : filtered.map(artist => (
              <tr key={artist.id} className="hover:bg-slate-800/30 group">
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <img src={artist.avatarUrl} className="w-8 h-8 rounded-full object-cover" alt={artist.name} onError={e => { (e.target as any).src = `https://api.dicebear.com/7.x/adventurer/svg?seed=${artist.name}`; }} />
                    <div>
                      <div className="font-bold text-white">{artist.name}</div>
                      <div className="text-[10px] text-slate-500">{artist.email}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-slate-400">{artist.category}</td>
                <td className="p-4 text-slate-400">{artist.experienceYears} yrs</td>
                <td className="p-4 text-slate-400">₹{artist.basePrice}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-[9px] font-bold border ${
                    artist.verified === VerificationStatus.APPROVED ? 'bg-emerald-950 text-emerald-400 border-emerald-800/50' :
                    artist.verified === VerificationStatus.PENDING ? 'bg-amber-950 text-amber-400 border-amber-800/50' :
                    'bg-rose-950 text-rose-400 border-rose-800/50'
                  }`}>{artist.verified}</span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleUpdateStatus(artist.id, VerificationStatus.APPROVED)} title="Approve" className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20"><CheckCircle className="w-4 h-4" /></button>
                    <button onClick={() => handleUpdateStatus(artist.id, VerificationStatus.REJECTED)} title="Reject" className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg hover:bg-amber-500/20"><XCircle className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(artist.id)} title="Delete" className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg hover:bg-rose-500/20"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
