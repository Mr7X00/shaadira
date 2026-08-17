import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Trash2, CheckCircle2, XCircle, Search, Filter, RefreshCw } from 'lucide-react';

interface Review {
  id: string;
  bookingId: string;
  clientName: string;
  artistName: string;
  rating: number;
  comment: string;
  createdAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export const ReviewManagement: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const getToken = () => localStorage.getItem('admin_token') || '';

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/reviews', {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (res.ok) setReviews(await res.json());
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  const filteredReviews = reviews.filter(r =>
    r.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.artistName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.comment?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`w-3 h-3 ${i <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold font-display text-white">Review Management</h3>
          <p className="text-slate-400 text-xs mt-1">Monitor and moderate customer reviews ({reviews.length} total)</p>
        </div>
        <button onClick={fetchReviews} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all">
          <RefreshCw className="w-3 h-3" /> Refresh
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input type="text" placeholder="Search by client, artist, or comment..." className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl flex items-center gap-2"><Filter className="w-4 h-4" /> Rating</button>
        </div>

        <div className="space-y-4">
          {loading ? (
            <p className="text-center text-slate-500 italic py-12">Loading reviews from MongoDB...</p>
          ) : filteredReviews.length === 0 ? (
            <p className="text-center text-slate-500 italic py-12">No reviews yet. Reviews appear after bookings are closed.</p>
          ) : filteredReviews.map(review => (
            <div key={review.id} className="bg-slate-950 border border-slate-800 rounded-xl p-5">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-900/40 flex items-center justify-center text-purple-300 font-bold text-xs">
                      {review.clientName?.[0] || '?'}
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">{review.clientName}</div>
                      <div className="text-[10px] text-slate-500">→ {review.artistName}</div>
                    </div>
                  </div>
                  {renderStars(review.rating)}
                  <p className="text-slate-400 text-xs">{review.comment}</p>
                  <div className="text-[10px] text-slate-600 font-mono">{review.createdAt?.split('T')[0]}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                    review.status === 'APPROVED' ? 'bg-emerald-950 text-emerald-400 border-emerald-800/50' :
                    review.status === 'REJECTED' ? 'bg-rose-950 text-rose-400 border-rose-800/50' :
                    'bg-amber-950 text-amber-400 border-amber-800/50'
                  }`}>{review.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
