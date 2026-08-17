import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { 
  TrendingUp, Users, Calendar, Award, 
  BarChart3, PieChart, Download, Filter, 
  ChevronUp, ChevronDown, Percent
} from 'lucide-react';

interface GrowthMetric {
  date: string;
  bookings: number;
  revenue: number;
  users: number;
}

export const AnalyticsManagement: React.FC = () => {
  const [data, setData] = useState<GrowthMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');

  const getToken = () => localStorage.getItem('admin_token') || '';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [analyticsRes, bookingsRes] = await Promise.all([
          fetch('/api/admin/analytics', { headers: { Authorization: `Bearer ${getToken()}` } }),
          fetch('/api/admin/bookings', { headers: { Authorization: `Bearer ${getToken()}` } })
        ]);

        const analytics = analyticsRes.ok ? await analyticsRes.json() : {};
        const bookings = bookingsRes.ok ? await bookingsRes.json() : [];

        const totalUsers = analytics.totalUsers || 0;

        // Aggregate bookings by date
        const bookingDates: Record<string, { bookings: number, revenue: number }> = {};
        bookings.forEach((b: any) => {
          const date = b.createdAt ? b.createdAt.split('T')[0] : (b.eventDate || '');
          if (date) {
            if (!bookingDates[date]) bookingDates[date] = { bookings: 0, revenue: 0 };
            bookingDates[date].bookings += 1;
            bookingDates[date].revenue += (b.quotedAmount || 0);
          }
        });

        // Generate time series
        const timeSeries: GrowthMetric[] = [];
        const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;

        for (let i = days; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          const displayDate = date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
          const dayData = bookingDates[dateStr] || { bookings: 0, revenue: 0 };
          timeSeries.push({
            date: displayDate,
            bookings: dayData.bookings,
            revenue: dayData.revenue,
            users: Math.floor(totalUsers / days)
          });
        }
        setData(timeSeries);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeframe]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold font-display text-white">Advanced Analytics</h3>
          <p className="text-slate-400 text-xs mt-1">Strategic performance metrics and growth projections</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-1 flex">
            {(['7d', '30d', '90d'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                  timeframe === t 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>
          <button className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="w-12 h-12 text-emerald-500" />
          </div>
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Conversion Rate</div>
          <div className="text-2xl font-bold text-white">12.4%</div>
          <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold mt-2">
            <ChevronUp className="w-3 h-3" /> 2.1% vs last period
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users className="w-12 h-12 text-blue-500" />
          </div>
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Artist Retention</div>
          <div className="text-2xl font-bold text-white">88.2%</div>
          <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold mt-2">
            <ChevronUp className="w-3 h-3" /> 0.4% improvement
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Calendar className="w-12 h-12 text-purple-500" />
          </div>
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Booking Velocity</div>
          <div className="text-2xl font-bold text-white">4.2/hr</div>
          <div className="flex items-center gap-1 text-[10px] text-rose-500 font-bold mt-2">
            <ChevronDown className="w-3 h-3" /> 0.2% decrease
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Percent className="w-12 h-12 text-amber-500" />
          </div>
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Avg. Margin</div>
          <div className="text-2xl font-bold text-white">9.4%</div>
          <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold mt-2">
             Consistent with target
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-500" />
              Revenue & GMV Trend
            </h4>
            <div className="flex items-center gap-4 text-[10px] text-slate-500">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"/> Revenue</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-700"/> Volume</div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '10px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-purple-500" />
              Category Performance
            </h4>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '10px' }}
                />
                <Bar dataKey="bookings" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={timeframe === '90d' ? 4 : 12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-850 flex justify-between items-center">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Regional Market Share</h4>
            <button className="text-[10px] text-blue-500 font-bold hover:underline">View Map</button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
                { name: 'Mumbai Metro', share: 42, growth: '+12%', color: 'bg-blue-500' },
                { name: 'Delhi NCR', share: 28, growth: '+8%', color: 'bg-emerald-500' },
                { name: 'Bangalore Hub', share: 30, growth: '+15%', color: 'bg-purple-500' }
            ].map(region => (
                <div key={region.name} className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-white">{region.name}</span>
                        <span className="text-[10px] font-bold text-emerald-400">{region.growth}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full ${region.color}`} style={{ width: `${region.share}%` }} />
                    </div>
                    <div className="text-[10px] text-slate-500">Market coverage: {region.share}%</div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};
