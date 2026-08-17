import React from 'react';

export default function Dashboard({ user, role }: { user: any; role?: string }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
        <h3 className="text-slate-400 text-sm mb-1">Upcoming Bookings</h3>
        <p className="text-3xl font-bold">2</p>
      </div>
      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
        <h3 className="text-slate-400 text-sm mb-1">Loyalty Points</h3>
        <p className="text-3xl font-bold text-amber-400">1,250</p>
      </div>
      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
        <h3 className="text-slate-400 text-sm mb-1">Recent Payments</h3>
        <p className="text-3xl font-bold">₹5,400</p>
      </div>
    </div>
  );
}
