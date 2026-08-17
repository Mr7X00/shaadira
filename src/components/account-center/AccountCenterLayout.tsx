import React, { useState } from 'react';
import { User, Package, Heart, CreditCard, Shield, Settings as SettingsIcon, HelpCircle, LogOut, Camera, MapPin, Calendar, FileText, Bell, Lock, Activity, Percent, Briefcase, BarChart3, Clock, CheckSquare } from 'lucide-react';
import Dashboard from './Dashboard';
import PersonalInformation from './PersonalInformation';
import ProfilePhoto from './ProfilePhoto';
import AddressManagement from './AddressManagement';
import OrderHistory from './OrderHistory';
import BookingDetails from './BookingDetails';
import UpcomingBookingsCalendar from './UpcomingBookingsCalendar';
import Wishlist from './Wishlist';
import LoyaltyRewards from './LoyaltyRewards';
import PaymentHistory from './PaymentHistory';
import InvoiceReceipt from './InvoiceReceipt';
import Notifications from './Notifications';
import SecurityCenter from './SecurityCenter';
import LoginActivity from './LoginActivity';
import ProfileCompletion from './ProfileCompletion';
import Settings from './Settings';
import HelpSupport from './HelpSupport';
import Logout from './Logout';

export default function AccountCenterLayout({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const role = user?.role || 'client'; // Assume default role or derived from user

  const clientNav = [
    { label: 'Dashboard', icon: User },
    { label: 'Personal Information', icon: User },
    { label: 'Profile Photo', icon: Camera },
    { label: 'Address Management', icon: MapPin },
    { label: 'Orders & Bookings', icon: Package },
    { label: 'Booking Details', icon: FileText },
    { label: 'Upcoming Bookings Calendar', icon: Calendar },
    { label: 'Wishlist', icon: Heart },
    { label: 'Loyalty & Rewards', icon: Percent },
    { label: 'Payments', icon: CreditCard },
    { label: 'Invoice & Receipt', icon: FileText },
    { label: 'Notifications', icon: Bell },
    { label: 'Security', icon: Shield },
    { label: 'Login Activity', icon: Activity },
    { label: 'Profile Completion', icon: User },
    { label: 'Settings', icon: SettingsIcon },
    { label: 'Help & Support', icon: HelpCircle },
    { label: 'Logout', icon: LogOut },
  ];

  const artistNav = [
    { label: 'Dashboard', icon: User },
    { label: 'Artist Profile', icon: User },
    { label: 'Portfolio', icon: Camera },
    { label: 'Verification', icon: Shield },
    { label: 'Booking Management', icon: Package },
    { label: 'Availability Manager', icon: Calendar },
    { label: 'Service Areas', icon: MapPin },
    { label: 'Business Analytics', icon: BarChart3 },
    { label: 'Reviews', icon: FileText },
    { label: 'Wallet & Earnings', icon: CreditCard },
    { label: 'Invoices', icon: FileText },
    { label: 'Realtime Chat', icon: Bell },
    { label: 'Notifications', icon: Bell },
    { label: 'GPS Check-In', icon: MapPin },
    { label: 'Security', icon: Shield },
    { label: 'Settings', icon: SettingsIcon },
    { label: 'Help & Support', icon: HelpCircle },
    { label: 'Logout', icon: LogOut },
  ];

  const managerNav = [
    { label: 'Dashboard', icon: BarChart3 },
    { label: 'Artist Registry', icon: User },
    { label: 'Booking Ledger', icon: Package },
    { label: 'Financial Audit', icon: CreditCard },
    { label: 'System Logs', icon: Activity },
    { label: 'Settings', icon: SettingsIcon },
    { label: 'Logout', icon: LogOut },
  ];

  const navItems = role === 'artist' ? artistNav : (role === 'ACCOUNT_MANAGER' ? managerNav : clientNav);

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard': return <Dashboard user={user} role={role} />;
      case 'Artist Registry': return <OrderHistory user={user} />; // Reusing components for now
      case 'Booking Ledger': return <OrderHistory user={user} />;
      case 'Financial Audit': return <PaymentHistory user={user} />;
      case 'System Logs': return <LoginActivity user={user} />;
      case 'Personal Information': return <PersonalInformation user={user} />;
      case 'Profile Photo': return <ProfilePhoto user={user} />;
      case 'Address Management': return <AddressManagement user={user} />;
      case 'Orders & Bookings': 
      case 'Booking Management': return <OrderHistory user={user} />;
      case 'Booking Details': return <BookingDetails user={user} />;
      case 'Upcoming Bookings Calendar': 
      case 'Availability Manager': return <UpcomingBookingsCalendar user={user} />;
      case 'Wishlist': return <Wishlist user={user} />;
      case 'Loyalty & Rewards': return <LoyaltyRewards user={user} />;
      case 'Payments': 
      case 'Wallet & Earnings': return <PaymentHistory user={user} />;
      case 'Invoice & Receipt': 
      case 'Invoices': return <InvoiceReceipt user={user} />;
      case 'Notifications': 
      case 'Realtime Chat': return <Notifications user={user} />;
      case 'Security': return <SecurityCenter user={user} />;
      case 'Login Activity': return <LoginActivity user={user} />;
      case 'Profile Completion': return <ProfileCompletion user={user} />;
      case 'Settings': return <Settings user={user} />;
      case 'Help & Support': return <HelpSupport user={user} />;
      case 'Logout': return <Logout user={user} />;
      case 'Artist Profile': return <PersonalInformation user={user} />;
      case 'Portfolio': return <ProfilePhoto user={user} />;
      case 'Verification': return <SecurityCenter user={user} />;
      case 'Service Areas': return <AddressManagement user={user} />;
      case 'Business Analytics': return <Dashboard user={user} role={role} />;
      case 'Reviews': return <OrderHistory user={user} />;
      case 'GPS Check-In': return <Notifications user={user} />;
      default: return <div className="text-slate-400">Section {activeTab} coming soon.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      <div className="max-w-7xl mx-auto p-6">
        <header className="flex justify-between items-center mb-8 border-b border-slate-800 pb-6">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-amber-200">
            {role === 'artist' ? 'Artist' : (role === 'ACCOUNT_MANAGER' ? 'Manager' : 'Client')} Account Center
          </h1>
          <a href="/" className="text-sm text-slate-400 hover:text-white">← Back to Dashboard</a>
        </header>

        <div className="grid grid-cols-12 gap-8">
          <aside className="col-span-3 space-y-2">
            {navItems.map((item) => (
              <button 
                key={item.label} 
                onClick={() => setActiveTab(item.label)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === item.label ? 'bg-amber-500/10 text-amber-400' : 'hover:bg-slate-900'}`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </aside>

          <main className="col-span-9 bg-slate-900/50 p-8 rounded-3xl border border-slate-800">
            <h2 className="text-xl font-bold mb-6">{activeTab}</h2>
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
}
