import { UserManagement } from "./admin/UserManagement";
import { ArtistManagement } from "./admin/ArtistManagement";
import { ClientManagement } from "./admin/ClientManagement";
import { BookingManagement } from "./admin/BookingManagement";
import { ReviewManagement } from "./admin/ReviewManagement";
import { PaymentManagement } from "./admin/PaymentManagement";
import { AuditLogs } from "./admin/AuditLogs";
import { SystemHealth } from "./admin/SystemHealth";
import { EmailManagement } from "./admin/EmailManagement";
import { SupportManagement } from "./admin/SupportManagement";
import { AnalyticsManagement } from "./admin/AnalyticsManagement";
import { SettingsManagement } from "./admin/SettingsManagement";
import { useState, useEffect } from "react";
import { Booking, SystemLog, BookingStatus, EmailLog, ArtistProfile, VerificationStatus } from "../types";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  CalendarCheck, 
  ShieldCheck, 
  FileSpreadsheet, 
  LifeBuoy,
  RefreshCcw, 
  Activity, 
  Mail, 
  Search, 
  Palette,
  MessageSquare,
  CreditCard,
  Cpu,
  BarChart3,
  SlidersHorizontal, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight, 
  Info,
  Calendar,
  Layers,
  Inbox,
  ShieldAlert,
  Check,
  X,
  Clock,
  User,
  Eye,
  FileText
} from "lucide-react";

interface AdminAnalyticsProps {
  bookings: Booking[];
  logs: SystemLog[];
  onRefreshLogs: () => void;
  artists?: ArtistProfile[];
  onVerifyArtist?: (artistId: string, status: VerificationStatus) => void;
}

export default function AdminAnalytics({ 
  bookings, 
  logs, 
  onRefreshLogs,
  artists = [],
  onVerifyArtist
}: AdminAnalyticsProps) {
  const [activeTab, setActiveTab] = useState<"operations" | "verification" | "emails" | "users" | "artists" | "clients" | "bookings" | "reviews" | "payments" | "audit" | "health" | "support" | "analytics" | "settings">("operations");
  
  // Safe Array Fallbacks to prevent rendering crashes
  const safeBookings = Array.isArray(bookings) ? bookings : [];
  const safeLogs = Array.isArray(logs) ? logs : [];
  const safeArtists = Array.isArray(artists) ? artists : [];

  // Email Logs State
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [isEmailsLoading, setIsEmailsLoading] = useState(false);
  const [emailSearch, setEmailSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "SENT" | "FAILED">("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [logsError, setLogsError] = useState<string | null>(null);

  const itemsPerPage = 10;

  // Statistics Calculations
  const totalBookings = safeBookings.length;
  const activeBookings = safeBookings.filter(b => b && b.status !== BookingStatus.CLOSED && b.status !== BookingStatus.CANCELLED).length;
  const totalGrossQuoted = Number(safeBookings.reduce((sum, b) => sum + (b && b.quotedAmount || 0), 0)) || 0;
  const totalPlatformFees = Number(safeBookings.reduce((sum, b) => sum + (b && b.paymentId ? (b.platformFee || 0) : 0), 0)) || 0;

  // Verification lists — normalize to uppercase to handle any DB casing
  const normalizeStatus = (s: any) => (typeof s === 'string' ? s.toUpperCase() : '');
  const pendingArtists = safeArtists.filter(a => a && normalizeStatus(a.verified) === VerificationStatus.PENDING);
  const verifiedArtists = safeArtists.filter(a => a && normalizeStatus(a.verified) === VerificationStatus.APPROVED);
  const rejectedArtists = safeArtists.filter(a => a && normalizeStatus(a.verified) === VerificationStatus.REJECTED);
  const otherArtists = safeArtists.filter(a => a && normalizeStatus(a.verified) !== VerificationStatus.PENDING);


  // Generate dynamic chart data based on active bookings
  const getRevenueData = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const now = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(now.getDate() - (6 - i));
      return { 
        day: days[d.getDay()], 
        dateStr: d.toISOString().split('T')[0],
        fee: 0 
      };
    });

    safeBookings.forEach(b => {
      if ((b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.CLOSED) && b.paidAt) {
        const paidDate = b.paidAt.split('T')[0];
        const dayMatch = last7Days.find(d => d.dateStr === paidDate);
        if (dayMatch) {
          dayMatch.fee += (b.platformFee || 0);
        }
      }
    });

    return last7Days.map(({ day, fee }) => ({ day, fee }));
  };

  const revenueData = getRevenueData();

  // Fetch email logs from API
  const fetchEmailLogs = async () => {
    setIsEmailsLoading(true);
    setLogsError(null);
    try {
      const response = await fetch("/api/email/logs");
      if (!response.ok) {
        throw new Error(`Failed to fetch email logs (Status: ${response.status})`);
      }
      const data = await response.json();
      setEmailLogs(data);
    } catch (err: any) {
      console.error("Error fetching email logs:", err);
      setLogsError(err.message || "Unknown error occurred while accessing email system records.");
    } finally {
      setIsEmailsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "emails") {
      fetchEmailLogs();
    }
  }, [activeTab]);

  // Extract unique email types for filter list
  const emailTypes: string[] = ["ALL", ...(Array.from(new Set(emailLogs.filter(log => log && log.type).map(log => log.type))) as string[])];

  // Filter & Search Logic
  const filteredEmailLogs = emailLogs.filter(log => {
    if (!log) return false;
    const recipient = log.recipient || "";
    const subject = log.subject || "";
    const type = log.type || "";
    
    const matchesSearch = 
      recipient.toLowerCase().includes(emailSearch.toLowerCase()) ||
      subject.toLowerCase().includes(emailSearch.toLowerCase()) ||
      (log.failureReason && log.failureReason.toLowerCase().includes(emailSearch.toLowerCase())) ||
      (log.smtpResponse && log.smtpResponse.toLowerCase().includes(emailSearch.toLowerCase())) ||
      type.toLowerCase().includes(emailSearch.toLowerCase());
      
    const matchesStatus = statusFilter === "ALL" || log.deliveryStatus === statusFilter;
    const matchesType = typeFilter === "ALL" || log.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredEmailLogs.length / itemsPerPage);
  const paginatedEmailLogs = filteredEmailLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div id="admin-analytics-module" className="max-w-7xl mx-auto px-4 py-8 space-y-8 font-sans">
      
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h3 className="font-display font-bold text-2xl text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <span>Super Admin Command Center</span>
          </h3>
          <p className="text-xs text-slate-500">Track platform volume, secured platform commission streams, audit traces, and dispatch logs.</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab Selector buttons */}
          <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex flex-wrap gap-1">
            <button
              onClick={() => setActiveTab("operations")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "operations" 
                  ? "bg-white text-blue-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Operations Trace
            </button>
            <button
              onClick={() => setActiveTab("verification")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "verification" 
                  ? "bg-white text-blue-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />
              <span>Verify Artists ({pendingArtists.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("emails")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "emails" 
                  ? "bg-white text-blue-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email Logs</span>
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "users" 
                  ? "bg-white text-blue-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>User Management</span>
            </button>
            <button
              onClick={() => setActiveTab("artists")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "artists" 
                  ? "bg-white text-blue-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Artist Management</span>
            </button>
            <button
              onClick={() => setActiveTab("clients")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "clients" 
                  ? "bg-white text-blue-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Client Management</span>
            </button>
            <button
              onClick={() => setActiveTab("bookings")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "bookings" 
                  ? "bg-white text-blue-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Booking Center</span>
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "reviews" 
                  ? "bg-white text-blue-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Reviews</span>
            </button>
            <button
              onClick={() => setActiveTab("payments")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "payments" 
                  ? "bg-white text-blue-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Payment Center</span>
            </button>
            <button
              onClick={() => setActiveTab("audit")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "audit" 
                  ? "bg-white text-blue-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Audit Logs</span>
            </button>
            <button
              onClick={() => setActiveTab("health")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "health" 
                  ? "bg-white text-blue-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Health</span>
            </button>
            <button
              onClick={() => setActiveTab("support")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "support" 
                  ? "bg-white text-blue-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <LifeBuoy className="w-3.5 h-3.5" />
              <span>Support</span>
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "analytics" 
                  ? "bg-white text-blue-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Reporting</span>
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "settings" 
                  ? "bg-white text-blue-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Config</span>
            </button>
          </div>

          <button
            id="refresh-logs-btn"
            onClick={activeTab === "operations" ? onRefreshLogs : fetchEmailLogs}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <RefreshCcw className={`w-3.5 h-3.5 ${isEmailsLoading ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Metrics Dashboard Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Bookings", value: totalBookings, icon: CalendarCheck, color: "text-blue-600 bg-blue-50", desc: "Across all categories" },
          { label: "Active Pipelines", value: activeBookings, icon: Users, color: "text-amber-600 bg-amber-50", desc: "Awaiting sittings/closing" },
          { label: "Gross Quotation Vol.", value: `₹${totalGrossQuoted.toLocaleString()}`, icon: FileSpreadsheet, color: "text-purple-600 bg-purple-50", desc: "Self-priced by artists" },
          { label: "Secured Platform Fee", value: `₹${totalPlatformFees.toLocaleString()}`, icon: DollarSign, color: "text-emerald-600 bg-emerald-50", desc: "Completed fee settlements" }
        ].map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="glass-card rounded-[24px] p-5 border border-slate-200/50 flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">{metric.label}</span>
                <span className="font-display font-extrabold text-2xl text-slate-900 block mt-1">{metric.value}</span>
                <span className="text-[10px] text-slate-400 font-light mt-1 block">{metric.desc}</span>
              </div>
              <div className={`p-3 rounded-2xl ${metric.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {activeTab === "operations" && (
        <>
          {/* Interactive Charts and Transaction Logs row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Side: Chart representation of platform fees */}
            <div className="lg:col-span-7 glass-card p-6 rounded-[24px] border border-slate-200/50 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-display font-bold text-md text-slate-900">Platform Income Performance</h4>
                  <p className="text-xs text-slate-400">Secured commission streams (5% & 10% blocks)</p>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorFee" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="day" tickLine={false} style={{ fontSize: '10px', fontFamily: 'Inter', fill: '#94A3B8' }} />
                    <YAxis tickLine={false} axisLine={false} style={{ fontSize: '10px', fontFamily: 'Inter', fill: '#94A3B8' }} />
                    <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', fontFamily: 'Inter' }} />
                    <Area type="monotone" dataKey="fee" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#colorFee)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right Side: platform commission rules recap */}
            <div className="lg:col-span-5 glass-card p-6 rounded-[24px] border border-slate-200/50 flex flex-col justify-between">
              <div className="space-y-4">
                <h4 className="font-display font-bold text-md text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Platform Fee Policies (Audit-ready)</span>
                </h4>
                
                <div className="p-4 bg-slate-50 rounded-2xl space-y-4 text-xs text-slate-600 font-light">
                  <div className="pb-3 border-b border-slate-200">
                    <span className="font-bold text-slate-800 block text-[11px]">Quotations under ₹1,000</span>
                    <p className="mt-1 leading-relaxed">Platform Fee is capped at <span className="font-bold text-blue-600">5%</span>. Secured online at checkout. Direct to artist is 95% of total quote.</p>
                  </div>

                  <div>
                    <span className="font-bold text-slate-800 block text-[11px]">Quotations of ₹1,000 or above</span>
                    <p className="mt-1 leading-relaxed">Platform Fee is set at <span className="font-bold text-blue-600">10%</span>. Secured online at checkout. Direct to artist is 90% of total quote.</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-3 mt-4">
                <Activity className="w-5 h-5 text-blue-600 shrink-0" />
                <span className="text-[10px] text-blue-800 leading-relaxed font-semibold uppercase tracking-wider">
                  Automatic fee verification is executed on server side during each transaction.
                </span>
              </div>
            </div>
          </div>

          {/* Operations Activity Trace List */}
          <div className="glass-card p-6 rounded-[24px] border border-slate-200/50 space-y-4">
            <h4 className="font-display font-bold text-md text-slate-900">Operations Activity Audit Logs</h4>
            <p className="text-xs text-slate-400">Chronological list of all system actions (registration, verification, payment, and sittings)</p>

            <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 bg-slate-50/50">
              {safeLogs.map((log) => (
                <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs hover:bg-white transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                        log.type === "success" 
                          ? "bg-emerald-100 text-emerald-800" 
                          : log.type === "danger" 
                          ? "bg-rose-100 text-rose-800"
                          : "bg-blue-100 text-blue-800"
                      }`}>
                        {log.action}
                      </span>
                      <span className="text-slate-400 font-mono text-[10px]">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-700 font-light leading-relaxed">{log.details}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">Initiated By</span>
                    <span className="font-semibold text-slate-800">{log.actor}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === "verification" && (
        <div id="operations-verification-module" className="space-y-8">
          {/* Overview stats block */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <h4 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-purple-600 animate-pulse" />
                <span>Super Admin Verification Board</span>
              </h4>
              <p className="text-xs text-slate-500">Perform direct manual verification of Mehndi artist profiles, identity credentials, and henna safety compliance.</p>
            </div>

            <div className="flex gap-2">
              <span className="px-3 py-1.5 bg-purple-50 text-purple-700 text-xs font-bold rounded-xl border border-purple-100">
                {pendingArtists.length} Awaiting Verification
              </span>
              <span className="px-3 py-1.5 bg-slate-50 text-slate-600 text-xs font-bold rounded-xl border border-slate-100">
                {safeArtists.length} Total Registered
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left main: Pending applications list */}
            <div className="lg:col-span-8 space-y-6">
              <h5 className="font-display font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-purple-600" />
                <span>Pending Applications ({pendingArtists.length})</span>
              </h5>

              {pendingArtists.length === 0 ? (
                <div className="glass-card p-12 text-center rounded-[24px] border border-dashed border-slate-300">
                  <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                  <h5 className="font-display font-bold text-slate-700 text-sm">All Clear!</h5>
                  <p className="text-xs text-slate-400 mt-1">There are no pending Mehndi Artist applications awaiting verification today.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {pendingArtists.map((art) => (
                    <div 
                      id={`pending-artist-row-${art.id}`}
                      key={art.id} 
                      className="glass-card rounded-[24px] p-6 border border-purple-200/50 bg-gradient-to-br from-white to-purple-50/20 shadow-lg space-y-6"
                    >
                      {/* Artist Header */}
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b border-slate-100">
                        <div className="flex gap-4">
                          <img 
                            src={art.avatarUrl} 
                            alt={art.name} 
                            className="w-16 h-16 rounded-full object-cover border border-slate-200"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <h5 className="font-bold text-base text-slate-900">{art.name}</h5>
                            <p className="text-xs text-slate-500">{art.email} • {art.phone}</p>
                            <p className="text-[11px] text-purple-600 font-mono font-bold mt-1 uppercase tracking-wider">{art.category} Specialist • {art.experienceYears} Yrs Exp</p>
                          </div>
                        </div>

                        <div className="text-right font-mono text-xs">
                          <span className="text-slate-400 block font-sans text-[10px] uppercase font-bold tracking-wider mb-0.5">Proposed Price</span>
                          <span className="text-base font-bold text-slate-800">₹{art.basePrice}</span>
                        </div>
                      </div>

                      {/* Portfolio & Details review */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600">
                        <div className="space-y-3">
                          <p className="leading-relaxed">
                            <span className="font-bold text-slate-700">Statement:</span> {art.bio}
                          </p>
                          <div>
                            <span className="font-bold text-slate-700 block mb-1">Declared Competencies:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {art.skills.map((s, idx) => (
                                <span key={idx} className="bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded font-medium">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Government ID Preview box */}
                        <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="font-bold text-slate-700 block text-[11px]">Government Identity Proof</span>
                              <span className="text-[10px] text-slate-400">AADHAAR / Voter Card</span>
                            </div>
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold text-[9px] rounded">PENDING AUDIT</span>
                          </div>
                          
                          <div className="relative mt-2 h-24 overflow-hidden rounded-lg border border-slate-300">
                            <img 
                              src={art.govtIdUrl} 
                              alt="Government Identification Card" 
                              className="w-full h-full object-cover brightness-95 filter"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                              <Eye className="w-5 h-5 text-white" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Verification action row */}
                      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                          id={`verify-reject-btn-${art.id}`}
                          onClick={() => onVerifyArtist && onVerifyArtist(art.id, VerificationStatus.REJECTED)}
                          className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl border border-rose-100 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <X className="w-4 h-4" />
                          <span>Reject Application</span>
                        </button>
                        <button
                          id={`verify-approve-btn-${art.id}`}
                          onClick={() => onVerifyArtist && onVerifyArtist(art.id, VerificationStatus.APPROVED)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1 cursor-pointer shadow transition-colors"
                        >
                          <Check className="w-4 h-4" />
                          <span>Approve Profile</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right column: Non-pending registry */}
            <div className="lg:col-span-4 space-y-6">
              <h5 className="font-display font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-500" />
                <span>Audit Registry ({otherArtists.length})</span>
              </h5>

              <div className="glass-card rounded-[24px] overflow-hidden border border-slate-200/50 p-4 divide-y divide-slate-100 bg-white shadow-sm">
                {otherArtists.map((art) => (
                  <div key={art.id} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <img 
                        src={art.avatarUrl} 
                        alt={art.name} 
                        className="w-8 h-8 rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <span className="font-semibold text-slate-800 block">{art.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{art.category}</span>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      art.verified === VerificationStatus.APPROVED 
                        ? "bg-emerald-100 text-emerald-800" 
                        : "bg-rose-100 text-rose-800"
                    }`}>
                      {art.verified}
                    </span>
                  </div>
                ))}
              </div>

              <div className="glass-card p-5 rounded-[24px] border border-slate-200/50 space-y-3 bg-white shadow-sm">
                <h6 className="font-display font-bold text-xs text-slate-800 uppercase tracking-wider">Henna Quality Mandate</h6>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Every Mehndi Artist listed on Shaadira must prepare 100% hand-made organic henna cones. Operational Executives and Super Admins have joint authority to conduct manual quality verification checks.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "emails" && (
        /* Email Logs View */
        <div className="glass-card p-6 rounded-[24px] border border-slate-200/50 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h4 className="font-display font-bold text-md text-slate-900 flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                <span>Production Email Delivery Audit</span>
              </h4>
              <p className="text-xs text-slate-400">Track Nodemailer SMTP transactions, delivery receipts, failure warnings, and message IDs.</p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-lg uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                <span>Gmail SMTP Client Connected</span>
              </span>
            </div>
          </div>

          {/* Search and Filters panel */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/40">
            {/* Search */}
            <div className="sm:col-span-5 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={emailSearch}
                onChange={(e) => { setEmailSearch(e.target.value); setCurrentPage(1); }}
                placeholder="Search recipient, subject, errors..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-blue-600 font-sans"
              />
            </div>

            {/* Delivery Status Filter */}
            <div className="sm:col-span-3 relative">
              <SlidersHorizontal className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value as any); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-600 focus:outline-none focus:border-blue-600 appearance-none cursor-pointer"
              >
                <option value="ALL">All Delivery Statuses</option>
                <option value="SENT">Sent Successfully</option>
                <option value="FAILED">Delivery Failed</option>
              </select>
            </div>

            {/* Email Type Filter */}
            <div className="sm:col-span-4 relative">
              <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={typeFilter}
                onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-600 focus:outline-none focus:border-blue-600 appearance-none cursor-pointer"
              >
                <option value="ALL">All Email Triggers</option>
                {emailTypes.filter(t => t !== "ALL").map(t => (
                  <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Loader and Error handler */}
          {isEmailsLoading && emailLogs.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <RefreshCcw className="w-8 h-8 text-blue-600 animate-spin" />
              <span className="text-xs text-slate-500 font-medium">Synchronizing live SMTP trace logs from system...</span>
            </div>
          ) : logsError ? (
            <div className="p-5 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-rose-800 block">Failed to Fetch Logs</span>
                <p className="text-xs text-rose-600 leading-relaxed mt-1">{logsError}</p>
                <button 
                  onClick={fetchEmailLogs}
                  className="mt-3 px-3 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 text-[10px] font-bold rounded-lg cursor-pointer transition-colors"
                >
                  Retry Synchronization
                </button>
              </div>
            </div>
          ) : filteredEmailLogs.length === 0 ? (
            <div className="py-20 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2">
              <Inbox className="w-10 h-10 text-slate-300" />
              <span className="text-xs text-slate-500 font-bold">No Email Logs Found</span>
              <p className="text-[10px] text-slate-400">Try loosening your active search phrase or category filters.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Logs Table-like structure */}
              <div className="border border-slate-200/80 rounded-2xl overflow-hidden divide-y divide-slate-100 bg-white">
                <div className="bg-slate-50/50 p-4 grid grid-cols-12 gap-2 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <div className="col-span-4">Recipient & Trigger</div>
                  <div className="col-span-5">Subject Line</div>
                  <div className="col-span-2">Delivery Status</div>
                  <div className="col-span-1 text-right">Details</div>
                </div>

                {paginatedEmailLogs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  const isFailed = log.deliveryStatus === "FAILED";
                  
                  return (
                    <div key={log.id} className={`hover:bg-slate-50/30 transition-colors ${isExpanded ? "bg-slate-50/40" : ""}`}>
                      <div 
                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                        className="p-4 grid grid-cols-12 gap-2 text-xs items-center cursor-pointer select-none"
                      >
                        {/* Recipient & Trigger Type */}
                        <div className="col-span-4 space-y-0.5">
                          <span className="font-bold text-slate-800 block truncate">{log.recipient}</span>
                          <span className="text-[9px] font-mono bg-slate-100 border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded uppercase font-semibold">
                            {log.type.replace(/_/g, " ")}
                          </span>
                        </div>

                        {/* Subject */}
                        <div className="col-span-5 truncate text-slate-600 font-medium">
                          {log.subject}
                        </div>

                        {/* Status Badge */}
                        <div className="col-span-2 flex items-center">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold inline-flex items-center gap-1 tracking-wide ${
                            isFailed 
                              ? "bg-rose-100 text-rose-800" 
                              : "bg-emerald-100 text-emerald-800"
                          }`}>
                            {isFailed ? (
                              <>
                                <AlertTriangle className="w-2.5 h-2.5" />
                                <span>FAILED</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                <span>DELIVERED</span>
                              </>
                            )}
                          </span>
                        </div>

                        {/* Expand Button */}
                        <div className="col-span-1 text-right">
                          <button className="text-blue-600 hover:text-blue-800 text-[10px] font-bold font-mono">
                            {isExpanded ? "[ HIDE ]" : "[ SHOW ]"}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Section */}
                      {isExpanded && (
                        <div className="px-6 pb-5 pt-1 border-t border-slate-100 bg-slate-50/70 text-[11px] text-slate-600 font-sans space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                <span>Dispatch Timestamp</span>
                              </span>
                              <span className="font-semibold text-slate-800 block">
                                {new Date(log.sentTime).toLocaleString()}
                              </span>
                            </div>

                            <div className="space-y-1.5">
                              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider flex items-center gap-1">
                                <Info className="w-3.5 h-3.5 text-slate-400" />
                                <span>Secure Message ID</span>
                              </span>
                              <span className="font-mono text-slate-500 font-semibold block truncate">
                                {log.messageId || "N/A — Generated on local dispatch failure"}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-4">
                            {/* SMTP Server Response */}
                            <div className="space-y-1.5">
                              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                                SMTP Server response
                              </span>
                              <div className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-[10px] overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner">
                                {log.smtpResponse || "No response received from SMTP server."}
                              </div>
                            </div>

                            {/* Failure reason block if failed */}
                            {isFailed && (
                              <div className="space-y-1.5">
                                <span className="text-[10px] uppercase font-bold text-rose-400 block tracking-wider">
                                  Failure Stack Trace / Reason
                                </span>
                                <div className="p-3 bg-rose-950 text-rose-100 rounded-xl font-mono text-[10px] overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner">
                                  {log.failureReason || "Connection timeout or authentication error."}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
                  <span className="text-slate-400 font-medium">
                    Showing page <span className="text-slate-800 font-semibold">{currentPage}</span> of{" "}
                    <span className="text-slate-800 font-semibold">{totalPages}</span> (
                    <span className="text-slate-600">{filteredEmailLogs.length}</span> total logs)
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-all border border-slate-200"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Prev</span>
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-all border border-slate-200"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "users" && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <UserManagement />
        </div>
      )}

      {activeTab === "artists" && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <ArtistManagement />
        </div>
      )}

      {activeTab === "clients" && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <ClientManagement />
        </div>
      )}

      {activeTab === "bookings" && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <BookingManagement />
        </div>
      )}

      {activeTab === "reviews" && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <ReviewManagement />
        </div>
      )}

      {activeTab === "payments" && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <PaymentManagement />
        </div>
      )}

      {activeTab === "audit" && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <AuditLogs />
        </div>
      )}

      {activeTab === "health" && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <SystemHealth />
        </div>
      )}

      {activeTab === "emails" && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <EmailManagement />
        </div>
      )}

      {activeTab === "support" && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <SupportManagement />
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <AnalyticsManagement />
        </div>
      )}

      {activeTab === "settings" && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <SettingsManagement />
        </div>
      )}
    </div>
  );
}
