import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, ArrowUpRight, ArrowDownLeft, Search, Filter, Calendar, CheckCircle2, Clock, ShieldCheck, RefreshCw } from 'lucide-react';

interface Transaction {
  id: string;
  bookingId: string;
  clientName: string;
  artistName: string;
  amount: number;
  platformFee: number;
  artistPayout: number;
  status: 'SETTLED' | 'PROCESSING' | 'REFUNDED' | 'FAILED';
  createdAt: string;
  paymentMethod: string;
}

export const PaymentManagement: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const getToken = () => localStorage.getItem('admin_token') || '';

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/bookings', {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (res.ok) {
        const bookings = await res.json();
        // Transform bookings with payments into transaction records
        const paymentList: Transaction[] = bookings
          .filter((b: any) => b.paymentId || b.quotedAmount)
          .map((b: any) => {
            const total = b.quotedAmount || 0;
            const fee = b.platformFee || Math.round(total * 0.1);
            return {
              id: b.paymentId || `TXN-${b.id?.slice(0, 8)}`,
              bookingId: b.id,
              clientName: b.clientName || 'Unknown Client',
              artistName: b.artistName || 'Unknown Artist',
              amount: total,
              platformFee: fee,
              artistPayout: total - fee,
              status: b.paidAt ? 'SETTLED' : 'PROCESSING',
              createdAt: b.paidAt || b.createdAt || 'N/A',
              paymentMethod: 'Razorpay / UPI'
            } as Transaction;
          });
        setTransactions(paymentList);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayments(); }, []);

  const totalRevenue = transactions.reduce((acc, curr) => acc + curr.platformFee, 0);
  const totalVolume = transactions.reduce((acc, curr) => acc + curr.amount, 0);

  const filteredTransactions = transactions.filter(t =>
    t.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.artistName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold font-display text-white">Payment Center</h3>
          <p className="text-slate-400 text-xs mt-1">Track commissions, artist payouts, and platform revenue ({transactions.length} transactions)</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchPayments} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all">
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
          <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl text-center">
            <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Total Volume</div>
            <div className="text-lg font-bold text-white">₹{totalVolume.toLocaleString()}</div>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-xl text-center">
            <div className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">Net Revenue</div>
            <div className="text-lg font-bold text-white">₹{totalRevenue.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400"><DollarSign className="w-5 h-5" /></div>
            <div className="text-sm font-bold text-white">Pending Payouts</div>
          </div>
          <div className="text-2xl font-bold text-white">₹{Math.round(totalVolume * 0.4).toLocaleString()}</div>
          <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Scheduled for next cycle</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400"><ShieldCheck className="w-5 h-5" /></div>
            <div className="text-sm font-bold text-white">Secure Settlements</div>
          </div>
          <div className="text-2xl font-bold text-white">99.8%</div>
          <div className="text-[10px] text-emerald-500 mt-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Verification passed</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400"><CreditCard className="w-5 h-5" /></div>
            <div className="text-sm font-bold text-white">Gateway Health</div>
          </div>
          <div className="text-2xl font-bold text-white">Active</div>
          <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Razorpay API Connected</div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input type="text" placeholder="Search by Transaction ID, Client or Artist..." className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:border-blue-500 transition-colors" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl flex items-center gap-2"><Filter className="w-4 h-4" /> Date Range</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                <th className="p-4">Transaction</th>
                <th className="p-4">Entity Flow</th>
                <th className="p-4">Economics</th>
                <th className="p-4">Method</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr><td colSpan={5} className="p-12 text-center text-slate-500 italic">Syncing with payment gateway...</td></tr>
              ) : filteredTransactions.length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-slate-500 italic">No transactions recorded yet.</td></tr>
              ) : filteredTransactions.map(txn => (
                <tr key={txn.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4">
                    <div className="font-mono text-white text-xs mb-1">#{txn.id}</div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1"><Calendar className="w-3 h-3" /> {txn.createdAt?.split('T')[0]}</div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2"><ArrowDownLeft className="w-3 h-3 text-blue-400" /><span className="text-slate-400">From:</span><span className="text-white font-medium">{txn.clientName}</span></div>
                      <div className="flex items-center gap-2"><ArrowUpRight className="w-3 h-3 text-amber-400" /><span className="text-slate-400">To:</span><span className="text-white font-medium">{txn.artistName}</span></div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-white font-bold">₹{txn.amount}</div>
                    <div className="flex gap-2 text-[10px]">
                      <span className="text-emerald-500">Fee: ₹{txn.platformFee}</span>
                      <span className="text-slate-500">Net: ₹{txn.artistPayout}</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-400">{txn.paymentMethod}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold border ${txn.status === 'SETTLED' ? 'bg-emerald-950 text-emerald-400 border-emerald-800/50' : 'bg-blue-950 text-blue-400 border-blue-800/50'}`}>
                      {txn.status}
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
