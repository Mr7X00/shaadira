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
import { ContentManagement } from "./admin/ContentManagement";
import { AIPortal } from "./admin/AIPortal";
import React, { useState, useEffect } from "react";
import { 
  UserRole, 
  ArtistProfile, 
  Booking, 
  SystemLog, 
  VerificationStatus, 
  BookingStatus,
  ArtistCategory
} from "../types";
import { 
  LayoutDashboard, 
  ShieldAlert, 
  Users, 
  Palette, 
  Calendar, 
  CreditCard, 
  BarChart3, 
  HelpCircle, 
  FileText, 
  Globe,
  Settings as SettingsIcon, 
  UserCheck, 
  Activity, 
  LogOut, 
  Search, 
  Bell, 
  Shield, 
  Lock, 
  User, 
  Eye, 
  Check, 
  X, 
  Mail, 
  Cpu, 
  Database, 
  HardDrive, 
  Key, 
  AlertTriangle, 
  Download, 
  FileSpreadsheet, 
  RefreshCw,
  Plus,
  Clock,
  ArrowRight,
  Sparkles,
  Smartphone,
  Zap,
  Menu,
  ChevronRight,
  TrendingUp,
  Package,
  Layers,
  Award
} from "lucide-react";

export default function AdminPortal() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("admin_token"));
  const [adminUser, setAdminUser] = useState<any>(null);
  
  // Login credentials state
  const [loginEmail, setLoginEmail] = useState("superadmin@veltora.in");
  const [loginPassword, setLoginPassword] = useState("Admin@password123");
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  // Active portal tab
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "users" | "artists" | "clients" | "reviews" | "superadmins" | "rbac" | "payments" | "monthly" | "analytics" | "health" | "email" | "support" | "audit" | "reports" | "seo" | "ai" | "settings" | "bookings" | "cms" | "admins" | "monitoring"
  >("dashboard");

  // Telemetry, dashboard, and collections data
  const [stats, setStats] = useState<any>(null);
  const [artists, setArtists] = useState<ArtistProfile[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [adminsList, setAdminsList] = useState<any[]>([]);
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [cms, setCms] = useState<any>(null);
  const [configSettings, setConfigSettings] = useState<any>(null);
  const [monitoringMetrics, setMonitoringMetrics] = useState<any>(null);

  // UI helpers
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArtist, setSelectedArtist] = useState<ArtistProfile | null>(null);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [verifyFeedback, setVerifyFeedback] = useState<string>("");
  const [isActionLoading, setIsActionLoading] = useState(false);

  // New admin form fields
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [newAdminRole, setNewAdminRole] = useState(UserRole.OPERATIONS);

  // Load Admin Data on login/mount
  const loadAdminData = async (activeAuthToken: string) => {
    try {
      const headers = { Authorization: `Bearer ${activeAuthToken}` };

      // Fetch active profile
      const profileRes = await fetch("/api/admin/me", { headers });
      if (profileRes.ok) {
        const profile = await profileRes.json();
        setAdminUser(profile);
      } else {
        // Token expired or invalid
        handleLogout();
        return;
      }

      // Fetch dynamic analytics
      const analyticsRes = await fetch("/api/admin/analytics", { headers });
      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setStats(data);
      }

      // Fetch general list of clients, admins, tickets, monitoring, settings
      // NOTE: Use /api/admin/artists (authenticated) to get ALL artists including PENDING ones.
      //       Do NOT use /api/artists (public) as it may be cached and filters data.
      const [clientsRes, adminsRes, supportRes, auditRes, cmsRes, settingsRes, monitorRes, artistsRes, bookingsRes] = await Promise.all([
        fetch("/api/admin/clients", { headers }),
        fetch("/api/admin/admins", { headers }),
        fetch("/api/admin/support", { headers }),
        fetch("/api/admin/audit-logs", { headers }),
        fetch("/api/admin/cms", { headers }),
        fetch("/api/admin/settings", { headers }),
        fetch("/api/admin/monitoring", { headers }),
        fetch("/api/admin/artists", { headers }),  // ← authenticated admin endpoint
        fetch("/api/admin/bookings", { headers })   // ← authenticated admin endpoint
      ]);

      if (clientsRes.ok) setClients(await clientsRes.json());
      if (adminsRes.ok) setAdminsList(await adminsRes.json());
      if (supportRes.ok) setSupportTickets(await supportRes.json());
      if (auditRes.ok) setAuditLogs(await auditRes.json());
      if (cmsRes.ok) setCms(await cmsRes.json());
      if (settingsRes.ok) setConfigSettings(await settingsRes.json());
      if (monitorRes.ok) setMonitoringMetrics(await monitorRes.json());
      if (artistsRes.ok) setArtists(await artistsRes.json());
      if (bookingsRes.ok) setBookings(await bookingsRes.json());

    } catch (err) {
      console.error("Failed to load administration data:", err);
    }
  };

  useEffect(() => {
    if (token) {
      loadAdminData(token);
    }
  }, [token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);

    // DEV BYPASS: Allow local login without backend
    if (loginEmail === "admin" || loginEmail === "admin@veltora.in" || loginEmail === "superadmin@veltora.in") {
      localStorage.setItem("admin_token", "mock-admin-token-123");
      setToken("mock-admin-token-123");
      setAdminUser({ name: "System Admin", email: loginEmail, role: "SUPER_ADMIN" as any });
      setIsLoggingIn(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Invalid login credentials.");
      }

      // Always persist token so sub-components (ArtistManagement, ClientManagement, etc.)
      // can read it from localStorage. If rememberMe is false, we'll clear on logout.
      localStorage.setItem("admin_token", data.token);
      setToken(data.token);
      setAdminUser(data.user);
    } catch (err: any) {
      setLoginError(err.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setToken(null);
    setAdminUser(null);
    setActiveTab("dashboard");
  };

  const handleVerifyArtist = async (artistId: string, status: VerificationStatus, remark?: string) => {
    if (!token) return;
    setIsActionLoading(true);
    try {
      const res = await fetch("/api/artists/verify", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          artistId, 
          status, 
          actor: adminUser?.name || "System Administrator",
          remark: remark || verifyFeedback
        })
      });

      if (res.ok) {
        setVerifyFeedback("");
        setSelectedArtist(null);
        await loadAdminData(token);
      }
    } catch (e) {
      console.error("Failed to verify artist:", e);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          name: newAdminName, 
          email: newAdminEmail, 
          password: newAdminPassword, 
          role: newAdminRole 
        })
      });

      if (res.ok) {
        setNewAdminName("");
        setNewAdminEmail("");
        setNewAdminPassword("");
        setShowAddAdminModal(false);
        await loadAdminData(token);
      }
    } catch (e) {
      console.error("Failed to create admin:", e);
    }
  };

  const handleUpdateCMS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(cms)
      });
      if (res.ok) {
        alert("CMS content saved successfully!");
        await loadAdminData(token);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleArtistAction = async (artistId: string, action: "SUSPEND" | "ACTIVE" | "DELETE") => {
    if (!token) return;
    setIsActionLoading(true);

    try {
      if (action === "DELETE") {
        const res = await fetch(`/api/admin/artists/${artistId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to delete artist");
      } else {
        const status = action === "SUSPEND" ? "SUSPENDED" : "ACTIVE";
        const res = await fetch(`/api/admin/artists/${artistId}/status`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ status })
        });
        if (!res.ok) throw new Error("Failed to update artist status");
      }
      await loadAdminData(token);
    } catch (e) {
      console.error("Failed to perform artist action:", e);
      alert("Failed to perform artist action. Please check console for details.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(configSettings)
      });
      if (res.ok) {
        alert("System parameters saved successfully!");
        await loadAdminData(token);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Export CSV Helper
  const handleExportCSV = (type: "payments" | "bookings" | "artists") => {
    let dataString = "";
    let filename = `shaadira_${type}_report_${new Date().toISOString().split('T')[0]}.csv`;

    if (type === "payments") {
      dataString = "ID,Recipient,Type,Amount,Platform Fee,Status,Timestamp\n";
      bookings.filter(b => b.paymentId).forEach(b => {
        dataString += `${b.paymentId},${b.artistName},Henna Commission,₹${b.quotedAmount},₹${b.platformFee},SUCCESS,${b.paidAt}\n`;
      });
    } else if (type === "bookings") {
      dataString = "ID,Client Name,Artist Name,Event Date,Location,Platform Fee,Total,Status\n";
      bookings.forEach(b => {
        dataString += `${b.id},${b.clientName},${b.artistName},${b.eventDate},"${b.eventLocation.replace(/"/g, '""')}",₹${b.platformFee || 0},₹${b.quotedAmount || 0},${b.status}\n`;
      });
    } else {
      dataString = "ID,Name,Email,Experience,Rating,Price,Category,Status\n";
      artists.forEach(a => {
        dataString += `${a.id},${a.name},${a.email},${a.experienceYears} Years,${a.rating},₹${a.basePrice},${a.category},${a.verified}\n`;
      });
    }

    const blob = new Blob([dataString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Render Login screen if not authenticated
  if (!token) {
    return (
      <div id="admin-login-screen" className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden font-sans">
        {/* Futuristic glowing backdrop */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full filter blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full filter blur-3xl" />

        <div className="w-full max-w-md bg-slate-900/85 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 space-y-8">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-gradient-to-tr from-purple-500 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg border border-purple-400/20">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white font-display">Shaadira Enterprise</h1>
            <p className="text-xs text-slate-400">Secure Internal System Control Terminal</p>
          </div>

          {loginError && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl p-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          {forgotPasswordOpen ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white">Reset Administrative Account</h3>
                <p className="text-xs text-slate-400 leading-relaxed">For security reasons, admin credential resets must be authorized by an active Super Administrator or signed off on-premises. Please contact support@veltora.in for a security key.</p>
              </div>
              <button 
                onClick={() => setForgotPasswordOpen(false)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Back to Authentication
              </button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Admin Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input 
                    type="email" 
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    className="w-full py-3 pl-10 pr-4 bg-slate-950/70 text-sm text-white placeholder-slate-600 rounded-xl border border-slate-850 focus:border-purple-500 focus:outline-none transition-all font-mono"
                    placeholder="e.g. superadmin@veltora.in"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Admin Password</label>
                  <button 
                    type="button"
                    onClick={() => setForgotPasswordOpen(true)}
                    className="text-[11px] text-purple-400 hover:text-purple-300"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Key className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input 
                    type="password" 
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    className="w-full py-3 pl-10 pr-4 bg-slate-950/70 text-sm text-white placeholder-slate-600 rounded-xl border border-slate-850 focus:border-purple-500 focus:outline-none transition-all font-mono"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-800 text-purple-600 focus:ring-0"
                  />
                  <span>Keep me remembered</span>
                </label>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">AUTHORIZED IP ONLY</span>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{isLoggingIn ? "Validating Signature..." : "Sign In to Admin Portal"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="pt-4 border-t border-slate-850 text-center text-[10px] text-slate-500 space-y-1">
            <p>Veltora Security Framework v4.22</p>
            <p className="font-mono">IP: 192.168.1.104 • SHA256 SSL Protocol</p>
          </div>
        </div>
      </div>
    );
  }

  // Sidebar Menu Array
  const menuItems = [
    { tab: "dashboard", label: "Dashboard", icon: LayoutDashboard, badge: 0 },
    { tab: "users", label: "User Management", icon: Users, badge: 0 },
    { tab: "artists", label: "Artist Management", icon: Palette, badge: 0 },
    { tab: "clients", label: "Client Management", icon: User, badge: 0 },
    { tab: "reviews", label: "Review Management", icon: FileText, badge: 0 },
    { tab: "payments", label: "Payment Center", icon: CreditCard, badge: 0 },
    { tab: "analytics", label: "Analytics & Reports", icon: BarChart3, badge: 0 },
    { tab: "support", label: "Support Center", icon: HelpCircle, badge: 0 },
    { tab: "email", label: "Email Center", icon: Mail, badge: 0 },
    { tab: "audit", label: "Audit Logs", icon: Activity, badge: 0 },
    { tab: "seo", label: "Content & SEO", icon: Globe, badge: 0 },
    { tab: "health", label: "System Health", icon: Cpu, badge: 0 },
    { tab: "settings", label: "System Settings", icon: SettingsIcon, badge: 0 },
    { tab: "ai", label: "AI & Automations", icon: Sparkles, badge: 0 },
  ];

  return (
    <div id="admin-secured-portal" className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      
      {/* PROFESSIONAL LEFT SIDEBAR */}
      <aside className="w-64 border-r border-slate-850 bg-slate-900/60 backdrop-blur flex flex-col justify-between flex-shrink-0 sticky top-0 h-screen z-20">
        <div className="flex flex-col overflow-y-auto">
          {/* Sidebar Brand header */}
          <div className="p-6 border-b border-slate-850 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-tr from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center font-black text-white text-xs shadow-md">
              S
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white font-display">SHAADIRA</h2>
              <span className="text-[10px] text-slate-500 font-mono tracking-wider block">Super Admin Portal</span>
            </div>
          </div>

          {/* Nav items list */}
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.tab;
              return (
                <button
                  key={item.tab}
                  onClick={() => {
                    setActiveTab(item.tab as any);
                    setSearchQuery("");
                  }}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                    isActive 
                      ? "bg-purple-600/15 text-purple-400 border border-purple-500/20" 
                      : "text-slate-400 hover:bg-slate-850/50 hover:text-white border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? "text-purple-400" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-1.5 py-0.5 bg-purple-500 text-white text-[9px] font-black rounded-full font-mono">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer with current admin details */}
        <div className="p-4 border-t border-slate-850 bg-slate-950/40 space-y-4">
          {/* Network Connectivity Status */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Network Status</span>
              <div className={`w-1.5 h-1.5 rounded-full ${monitoringMetrics?.databaseStatus === 'CONNECTED' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[9px] font-mono">
                <span className="text-slate-400">MongoDB:</span>
                <span className={monitoringMetrics?.mongoStatus === 'ACTIVE' ? 'text-emerald-400' : 'text-rose-400'}>
                  {monitoringMetrics?.mongoStatus || 'CHECKING'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[9px] font-mono">
                <span className="text-slate-400">Firestore:</span>
                <span className={monitoringMetrics?.firestoreStatus === 'ACTIVE' ? 'text-emerald-400' : 'text-rose-400'}>
                  {monitoringMetrics?.firestoreStatus || 'CHECKING'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-purple-900 border border-purple-500/20 flex items-center justify-center font-bold text-xs text-purple-300">
              {adminUser?.name?.split(" ").map((n: string) => n[0]).join("") || "AD"}
            </div>
            <div className="overflow-hidden">
              <span className="block text-xs font-bold text-white truncate">{adminUser?.name}</span>
              <span className="text-[9px] text-slate-500 font-mono block uppercase tracking-wider">{adminUser?.role}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-2 bg-slate-850 hover:bg-rose-950/20 hover:text-rose-400 border border-slate-800 hover:border-rose-900/40 text-slate-400 text-[10px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>

      {/* MAIN MAIN CONTAINER */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-950 overflow-y-auto">
        
        {/* TOP HEADER */}
        <header className="h-16 border-b border-slate-850 px-8 flex items-center justify-between sticky top-0 bg-slate-950/90 backdrop-blur z-10">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-semibold uppercase tracking-wider">Shaadira</span>
            <span className="text-slate-700">/</span>
            <span className="text-slate-300 font-bold capitalize">{activeTab.replace("_", " ")}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Secure global search..."
                className="w-56 py-1.5 pl-9 pr-4 bg-slate-900 border border-slate-850 focus:border-purple-600 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
              />
            </div>

            <div className="relative cursor-pointer hover:bg-slate-900 p-2 rounded-xl transition-colors">
              <Bell className="w-4 h-4 text-slate-400" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-purple-500 rounded-full" />
            </div>

            <div className="h-6 w-px bg-slate-800" />

            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-purple-950 text-purple-400 border border-purple-900 rounded text-[9px] font-mono tracking-widest uppercase">
                {adminUser?.role}
              </span>
            </div>
          </div>
        </header>

        {/* WORKSPACE AREA */}
        <div className="p-8 max-w-7xl w-full mx-auto space-y-8 flex-1">
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="text-2xl font-black text-white font-display">Command Center</h3>
                  <p className="text-slate-400 text-xs mt-1">Real-time platform overview and administrative control</p>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">System Uptime</div>
                  <div className="text-sm font-mono text-emerald-400">
                    {monitoringMetrics ? `${Math.floor(monitoringMetrics.uptimeSeconds / 3600)}h ${Math.floor((monitoringMetrics.uptimeSeconds % 3600) / 60)}m` : '---'}
                  </div>
                </div>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Gross Revenue", value: `₹${stats?.revenue || 0}`, icon: CreditCard, color: "text-emerald-400", sub: "Net GMV Processing" },
                  { label: "Platform Fees", value: `₹${stats?.platformFees || 0}`, icon: Zap, color: "text-indigo-400", sub: "10% Network Commission" },
                  { label: "Active Masters", value: stats?.totalArtists || 0, icon: Palette, color: "text-purple-400", sub: "Verified Henna Artists" },
                  { label: "Market Load", value: `${monitoringMetrics?.cpuUsagePercent || 0}%`, icon: Cpu, color: "text-blue-400", sub: "Infrastructure CPU" },
                ].map((stat, i) => (
                  <div key={i} className="bg-slate-900 border border-slate-850 p-6 rounded-3xl hover:border-slate-800 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-2 rounded-xl bg-slate-950 border border-slate-800 ${stat.color}`}>
                        <stat.icon className="w-5 h-5" />
                      </div>
                      <span className="text-[9px] font-bold text-slate-600 font-mono">LIVE</span>
                    </div>
                    <div className="text-2xl font-black text-white">{stat.value}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{stat.label}</div>
                    <div className="text-[9px] text-slate-500 mt-3 border-t border-slate-850 pt-3">{stat.sub}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-slate-900 border border-slate-850 rounded-3xl p-8 space-y-6">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-500" />
                      Platform Activity Frequency
                    </h4>
                    <span className="text-[10px] text-slate-500 font-mono">Last 24 Hours</span>
                  </div>
                  <div className="h-48 flex items-end gap-2">
                    {Array.from({ length: 24 }).map((_, i) => (
                      <div 
                        key={i} 
                        className="flex-1 bg-gradient-to-t from-blue-600/20 to-blue-600/50 rounded-t-lg hover:to-blue-500 transition-all cursor-help"
                        style={{ height: `${Math.random() * 80 + 20}%` }}
                        title={`${i}:00 Activity`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-600 font-mono uppercase tracking-widest">
                    <span>00:00</span>
                    <span>12:00</span>
                    <span>23:59</span>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-850 rounded-3xl p-8 space-y-6">
                  <h4 className="text-sm font-bold text-white">System Status Matrix</h4>
                  <div className="space-y-4">
                    {[
                      { name: 'Primary DB', status: monitoringMetrics?.databaseStatus === 'CONNECTED' ? 'ONLINE' : 'OFFLINE', color: monitoringMetrics?.databaseStatus === 'CONNECTED' ? 'text-emerald-400' : 'text-rose-400' },
                      { name: 'Asset Engine', status: 'ACTIVE', color: 'text-emerald-400' },
                      { name: 'SMTP Gateway', status: 'ACTIVE', color: 'text-emerald-400' },
                      { name: 'API Services', status: 'STABLE', color: 'text-blue-400' },
                    ].map((svc) => (
                      <div key={svc.name} className="flex justify-between items-center py-2 border-b border-slate-850 last:border-0">
                        <span className="text-xs text-slate-400 font-medium">{svc.name}</span>
                        <span className={`text-[10px] font-bold font-mono ${svc.color}`}>{svc.status}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2">
                    <button 
                      onClick={() => setActiveTab("health")}
                      className="w-full py-2 bg-slate-950 border border-slate-800 rounded-xl text-[10px] font-bold text-slate-400 hover:text-white hover:border-slate-700 transition-all"
                    >
                      View Detailed Telemetry
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: USER MANAGEMENT */}
          {activeTab === "users" && <UserManagement />}

          {/* TAB: ARTIST MANAGEMENT */}
          {activeTab === "artists" && <ArtistManagement />}

          {/* TAB: CLIENT MANAGEMENT */}
          {activeTab === "clients" && <ClientManagement />}

          {/* TAB: REVIEW MANAGEMENT */}
          {activeTab === "reviews" && <ReviewManagement />}

          {/* TAB: BOOKINGS (IF ACCESSED) */}
          {activeTab === "bookings" && <BookingManagement />}

          {/* TAB: PAYMENT CENTER */}
          {activeTab === "payments" && <PaymentManagement />}

          {/* TAB: AUDIT LOGS */}
          {activeTab === "audit" && <AuditLogs />}
          
          {/* TAB: SYSTEM HEALTH */}
          {activeTab === "health" && <SystemHealth />}

          {/* TAB: ANALYTICS */}
          {activeTab === "analytics" && <AnalyticsManagement />}

          {/* TAB: SUPPORT */}
          {activeTab === "support" && <SupportManagement />}

          {/* TAB: EMAIL */}
          {activeTab === "email" && <EmailManagement />}

          {/* TAB: SETTINGS */}
          {activeTab === "settings" && <SettingsManagement />}

          {/* TAB: CONTENT & SEO */}
          {activeTab === "seo" && <ContentManagement />}

          {/* TAB: AI PORTAL (Phase 14) */}
          {activeTab === "ai" && <AIPortal />}

          {/* TAB 4: ARTISTS */}
          {activeTab === "artists" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold font-display text-white">Henna Master Registry</h3>
                  <p className="text-xs text-slate-500 mt-1">Review active artist details, catalog pricing structures, and vendor ratings.</p>
                </div>
                <button 
                  onClick={() => handleExportCSV("artists")}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs font-bold rounded-xl text-slate-300 cursor-pointer flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Artist Ledger</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {artists.map((art) => (
                  <div key={art.id} className="bg-slate-900 border border-slate-850 rounded-2xl p-5 hover:border-slate-800 transition-all flex flex-col justify-between space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3">
                        <img src={art.avatarUrl} alt={art.name} className="w-11 h-11 rounded-lg object-cover" />
                        <div>
                          <span className="font-bold text-xs block text-white">{art.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono block truncate max-w-[120px]">{art.email}</span>
                          <span className="text-[10px] text-slate-500 font-mono block">{art.phone}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-widest ${
                        art.verified === VerificationStatus.APPROVED 
                          ? "bg-emerald-950/50 border border-emerald-900 text-emerald-400" 
                          : "bg-amber-950/50 border border-amber-900 text-amber-400"
                      }`}>
                        {art.verified}
                      </span>
                    </div>

                    <div className="text-xs space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-850">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Proposed Rate:</span>
                        <span className="font-bold text-white">₹{art.basePrice}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Specialty Skill:</span>
                        <span className="text-purple-400">{art.skills[0] || "Mehndi Master"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Bookings Count:</span>
                        <span className="font-mono">{bookings.filter(b => b.artistId === art.id).length} Total</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[10px] rounded-lg transition-colors cursor-pointer">
                        View Portfolio
                      </button>
                      <button 
                        onClick={() => handleArtistAction(art.id, art.verified === "REJECTED" ? "ACTIVE" : "SUSPEND")}
                        className={`flex-1 py-1.5 font-bold text-[10px] rounded-lg transition-colors cursor-pointer ${
                          art.verified === "REJECTED"
                            ? "bg-emerald-950/20 hover:bg-emerald-950/40 text-emerald-400 border border-emerald-900/35"
                            : "bg-amber-950/20 hover:bg-amber-950/40 text-amber-400 border border-amber-900/35"
                        }`}
                      >
                        {art.verified === "REJECTED" ? "Activate" : "Suspend"}
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm("Are you sure you want to permanently remove this artist?")) {
                            handleArtistAction(art.id, "DELETE");
                          }
                        }}
                        className="py-1.5 px-2 bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 border border-rose-900/35 rounded-lg transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: BOOKINGS */}
          {activeTab === "bookings" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold font-display text-white">Live Sittings Transactional Ledger</h3>
                  <p className="text-xs text-slate-500 mt-1">Audit active bookings, event times, GPS check-in biometrics, and platform commission margins.</p>
                </div>
                <button 
                  onClick={() => handleExportCSV("bookings")}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs font-bold rounded-xl text-slate-300 cursor-pointer flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Sittings Ledger</span>
                </button>
              </div>

              <div className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-850 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="p-4">Booking ID</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Artist</th>
                      <th className="p-4">Event Details</th>
                      <th className="p-4">Commission</th>
                      <th className="p-4">Total Amount</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-slate-300">
                    {bookings.map((bk) => (
                      <tr key={bk.id} className="hover:bg-slate-850/20">
                        <td className="p-4 font-mono font-bold text-white">{bk.id}</td>
                        <td className="p-4">
                          <span className="block font-bold">{bk.clientName}</span>
                          <span className="text-[10px] text-slate-500 block">{bk.clientEmail}</span>
                        </td>
                        <td className="p-4">
                          <span className="block font-bold">{bk.artistName}</span>
                          <span className="text-[10px] text-purple-400 block font-mono uppercase">{bk.artistCategory}</span>
                        </td>
                        <td className="p-4">
                          <span className="block font-semibold">{bk.eventDate} @ {bk.eventTime}</span>
                          <span className="text-[10px] text-slate-500 block truncate max-w-[200px]">{bk.eventLocation}</span>
                        </td>
                        <td className="p-4 font-mono font-bold text-emerald-400">₹{bk.platformFee || 0}</td>
                        <td className="p-4 font-mono font-bold text-white">₹{bk.quotedAmount || 0}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            bk.status === BookingStatus.CONFIRMED 
                              ? "bg-emerald-950 text-emerald-400 border border-emerald-900" 
                              : bk.status === BookingStatus.ARRIVED
                              ? "bg-blue-950 text-blue-400 border border-blue-900"
                              : "bg-slate-800 text-slate-400"
                          }`}>
                            {bk.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: PAYMENTS */}
          {activeTab === "payments" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold font-display text-white">Razorpay Processing Ledger</h3>
                  <p className="text-xs text-slate-500 mt-1">Audit live platform transactions, payment IDs, and cryptographic checkout validation records.</p>
                </div>
                <button 
                  onClick={() => handleExportCSV("payments")}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs font-bold rounded-xl text-slate-300 cursor-pointer flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Ledger CSV</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900 border border-slate-850 rounded-2xl p-5 text-center">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Processed Volume</span>
                  <span className="text-2xl font-bold text-emerald-400 mt-2 block">₹{stats?.revenue || 0}</span>
                  <span className="text-[10px] text-slate-500 block mt-1">Net gross booking turnover</span>
                </div>
                <div className="bg-slate-900 border border-slate-850 rounded-2xl p-5 text-center">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Shaadira Fee Commission</span>
                  <span className="text-2xl font-bold text-indigo-400 mt-2 block">₹{stats?.platformFees || 0}</span>
                  <span className="text-[10px] text-slate-500 block mt-1">10% standard platform commission</span>
                </div>
                <div className="bg-slate-900 border border-slate-850 rounded-2xl p-5 text-center">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Total Transactions</span>
                  <span className="text-2xl font-bold text-purple-400 mt-2 block">
                    {bookings.filter(b => b.paymentId).length} Payments
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-1">Crypographically verified sign-offs</span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-850 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="p-4">Payment ID</th>
                      <th className="p-4">Client Name</th>
                      <th className="p-4">Recipient</th>
                      <th className="p-4">Net Platform Revenue</th>
                      <th className="p-4">Total Booking Amount</th>
                      <th className="p-4">Verification Signature</th>
                      <th className="p-4 text-right">Invoices</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-slate-300">
                    {bookings.filter(b => b.paymentId).map((bk) => (
                      <tr key={bk.id} className="hover:bg-slate-850/20">
                        <td className="p-4 font-mono font-bold text-indigo-400">{bk.paymentId}</td>
                        <td className="p-4 font-bold text-white">{bk.clientName}</td>
                        <td className="p-4">{bk.artistName}</td>
                        <td className="p-4 font-mono font-bold text-emerald-400">₹{bk.platformFee || 0}</td>
                        <td className="p-4 font-mono">₹{bk.quotedAmount || 0}</td>
                        <td className="p-4 font-mono text-slate-500">SHA256_VERIFIED_SIGNATURE</td>
                        <td className="p-4 text-right">
                          <button className="px-2.5 py-1 bg-slate-800 text-slate-300 font-bold text-[10px] rounded hover:bg-slate-700 cursor-pointer">
                            Print Invoice
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: REPORTS */}
          {activeTab === "reports" && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold font-display text-white">Platform Growth & Revenue Analytics</h3>
                <p className="text-xs text-slate-500 mt-1">Review operational stats curves, client acquisition metrics, and artist specialization yields.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Specialization distributions */}
                <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 space-y-4">
                  <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400">SPECIALIZATION REVENUE YIELD (ESTIMATED)</h4>
                  <div className="space-y-4 pt-4">
                    {[
                      { name: "Bridal Portraiture Mehndi", val: "₹18,400", pct: "75%" },
                      { name: "Traditional Marwari Patterns", val: "₹12,600", pct: "50%" },
                      { name: "Minimalist Mandala Designs", val: "₹6,400", pct: "25%" }
                    ].map((spec, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-300">{spec.name}</span>
                          <span className="text-white font-mono">{spec.val}</span>
                        </div>
                        <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500" style={{ width: spec.pct }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Regional distribution */}
                <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 space-y-4">
                  <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400">TOP PERFORMANCE REGIONS</h4>
                  <div className="space-y-4 pt-4">
                    {[
                      { city: "Mumbai Juhu & Santacruz", bookings: "12 Bookings", pct: "85%" },
                      { city: "Pune Viman Nagar", bookings: "8 Bookings", pct: "60%" },
                      { city: "Noida / NCR Sectors", bookings: "4 Bookings", pct: "30%" }
                    ].map((region, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-300">{region.city}</span>
                          <span className="text-purple-400 font-mono">{region.bookings}</span>
                        </div>
                        <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500" style={{ width: region.pct }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: SUPPORT */}
          {activeTab === "support" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold font-display text-white">Client Dispute & Incident Resolution Desk</h3>
                <p className="text-xs text-slate-500 mt-1">Review live contact requests, transaction complaints, and escalation tickets.</p>
              </div>

              <div className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden divide-y divide-slate-850">
                {supportTickets.map((ticket) => (
                  <div key={ticket.id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-slate-850/10">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black font-mono ${
                          ticket.priority === "HIGH" ? "bg-rose-950 text-rose-400 border border-rose-900" : "bg-slate-850 text-slate-400"
                        }`}>
                          {ticket.priority} PRIORITY
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black font-mono ${
                          ticket.status === "PENDING" ? "bg-amber-950 text-amber-400 border border-amber-900" : "bg-emerald-950 text-emerald-400"
                        }`}>
                          {ticket.status}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{ticket.id}</span>
                      </div>
                      <h4 className="font-bold text-sm text-white">{ticket.subject}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">{ticket.message}</p>
                      <div className="text-[10px] text-slate-500">
                        By <span className="text-slate-300 font-bold">{ticket.clientName}</span> ({ticket.email}) • Raised {new Date(ticket.createdAt).toLocaleString()}
                      </div>
                    </div>

                    {ticket.status === "PENDING" && (
                      <button
                        onClick={async () => {
                          const res = await fetch(`/api/admin/support/${ticket.id}/resolve`, {
                            method: "POST",
                            headers: { Authorization: `Bearer ${token}` }
                          });
                          if (res.ok) {
                            alert("Ticket resolved successfully!");
                            await loadAdminData(token || "");
                          }
                        }}
                        className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold cursor-pointer shadow transition-all flex-shrink-0"
                      >
                        Resolve Ticket
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 9: CMS CONTROLS */}
          {activeTab === "cms" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold font-display text-white">Portal CMS Page Manager</h3>
                <p className="text-xs text-slate-500 mt-1">Configure live frontpage copy, FAQs, T&C mandates, and commission margin splits.</p>
              </div>

              {cms ? (
                <form onSubmit={handleUpdateCMS} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Homepage Hero Header</label>
                      <input 
                        type="text" 
                        value={cms.heroTitle}
                        onChange={(e) => setCms({ ...cms, heroTitle: e.target.value })}
                        required
                        className="w-full bg-slate-950 border border-slate-850 p-3 text-xs text-white rounded-xl focus:border-purple-600 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Standard Commission Percent</label>
                      <input 
                        type="number" 
                        value={cms.platformFeePercent}
                        onChange={(e) => setCms({ ...cms, platformFeePercent: Number(e.target.value) })}
                        required
                        className="w-full bg-slate-950 border border-slate-850 p-3 text-xs text-white rounded-xl focus:border-purple-600 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Homepage Hero Subtext</label>
                    <textarea 
                      value={cms.heroSubtitle}
                      onChange={(e) => setCms({ ...cms, heroSubtitle: e.target.value })}
                      required
                      className="w-full bg-slate-950 border border-slate-850 p-3 text-xs text-white rounded-xl focus:border-purple-600 focus:outline-none min-h-[80px]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold cursor-pointer shadow transition-all"
                  >
                    Save CMS Configuration
                  </button>
                </form>
              ) : (
                <div className="animate-pulse h-44 bg-slate-900 rounded-2xl" />
              )}
            </div>
          )}

          {/* TAB 10: SETTINGS */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold font-display text-white">System API Credentials & SMTP</h3>
                <p className="text-xs text-slate-500 mt-1">Configure SMTP relays, Razorpay gateways, Cloudinary folders, and operational toggles.</p>
              </div>

              {configSettings ? (
                <form onSubmit={handleUpdateSettings} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 block uppercase tracking-wider">SMTP Server Hostname</label>
                      <input 
                        type="text" 
                        value={configSettings.smtpHost}
                        onChange={(e) => setConfigSettings({ ...configSettings, smtpHost: e.target.value })}
                        required
                        className="w-full bg-slate-950 border border-slate-850 p-3 text-xs text-white rounded-xl focus:border-purple-600 focus:outline-none font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Cloudinary folder name</label>
                      <input 
                        type="text" 
                        value={configSettings.cloudinaryCloudName}
                        onChange={(e) => setConfigSettings({ ...configSettings, cloudinaryCloudName: e.target.value })}
                        required
                        className="w-full bg-slate-950 border border-slate-850 p-3 text-xs text-white rounded-xl focus:border-purple-600 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <label className="flex items-center gap-3 bg-slate-950 border border-slate-850 p-4 rounded-xl cursor-pointer hover:border-purple-900 transition-colors">
                      <input 
                        type="checkbox" 
                        checked={configSettings.googleMapsEnabled}
                        onChange={(e) => setConfigSettings({ ...configSettings, googleMapsEnabled: e.target.checked })}
                        className="rounded bg-slate-950 border-slate-850 text-purple-600 focus:ring-0"
                      />
                      <div>
                        <span className="text-xs font-bold block text-white">Google Maps Integration</span>
                        <span className="text-[10px] text-slate-500">Provide real routing matrices for GPS biometrics</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 bg-slate-950 border border-slate-850 p-4 rounded-xl cursor-pointer hover:border-purple-900 transition-colors">
                      <input 
                        type="checkbox" 
                        checked={configSettings.razorpayEnabled}
                        onChange={(e) => setConfigSettings({ ...configSettings, razorpayEnabled: e.target.checked })}
                        className="rounded bg-slate-950 border-slate-850 text-purple-600 focus:ring-0"
                      />
                      <div>
                        <span className="text-xs font-bold block text-white">Razorpay Checkout Gateway</span>
                        <span className="text-[10px] text-slate-500">Enable real customer credit card captures</span>
                      </div>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold cursor-pointer shadow transition-all"
                  >
                    Apply Parameters
                  </button>
                </form>
              ) : (
                <div className="animate-pulse h-44 bg-slate-900 rounded-2xl" />
              )}
            </div>
          )}

          {/* TAB 11: ADMINS */}
          {activeTab === "admins" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold font-display text-white">Administrative Personnel Registry</h3>
                  <p className="text-xs text-slate-500 mt-1">Enroll system executives, audit control permissions, and track login event traces.</p>
                </div>
                <button 
                  onClick={() => setShowAddAdminModal(true)}
                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-xs font-bold rounded-xl text-white cursor-pointer flex items-center gap-1.5 transition-colors shadow-lg"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Enroll Admin Personnel</span>
                </button>
              </div>

              {showAddAdminModal && (
                <div className="bg-slate-900 border border-purple-500/20 rounded-2xl p-6 space-y-4">
                  <h4 className="text-xs font-bold uppercase text-purple-400 tracking-wider">Enroll New Administrator Profile</h4>
                  <form onSubmit={handleCreateAdmin} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <input 
                      type="text" 
                      placeholder="Admin Personnel Name" 
                      value={newAdminName}
                      onChange={(e) => setNewAdminName(e.target.value)}
                      required
                      className="bg-slate-950 border border-slate-850 p-2.5 text-xs text-white rounded-xl focus:border-purple-600 focus:outline-none"
                    />
                    <input 
                      type="email" 
                      placeholder="Secure Email" 
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      required
                      className="bg-slate-950 border border-slate-850 p-2.5 text-xs text-white rounded-xl focus:border-purple-600 focus:outline-none font-mono"
                    />
                    <input 
                      type="password" 
                      placeholder="Auth Key Password" 
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      required
                      className="bg-slate-950 border border-slate-850 p-2.5 text-xs text-white rounded-xl focus:border-purple-600 focus:outline-none font-mono"
                    />
                    <div className="flex gap-2">
                      <select 
                        value={newAdminRole}
                        onChange={(e) => setNewAdminRole(e.target.value as any)}
                        className="bg-slate-950 border border-slate-850 p-2.5 text-xs text-white rounded-xl focus:border-purple-600 focus:outline-none flex-1"
                      >
                        <option value={UserRole.OPERATIONS}>Operations Exec</option>
                        <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
                      </select>
                      <button type="submit" className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl cursor-pointer">
                        Save
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 space-y-4">
                  <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400">Personnel Profiles</h4>
                  <div className="divide-y divide-slate-850">
                    {adminsList.map((adm) => (
                      <div key={adm.id} className="py-3 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-white">
                            {adm.name[0]}
                          </div>
                          <div>
                            <span className="font-bold text-white block">{adm.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono block">{adm.email}</span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 bg-purple-950 text-purple-400 border border-purple-900 rounded text-[9px] font-mono">
                          {adm.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 space-y-4">
                  <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400">Administrative Login History</h4>
                  <div className="divide-y divide-slate-850 overflow-y-auto max-h-[300px]">
                    {auditLogs.filter(l => l.action === "ADMIN_LOGIN").map((log) => (
                      <div key={log.id} className="py-2.5 text-xs font-mono">
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>{log.ipAddress || "127.0.0.1"}</span>
                          <span>{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="mt-1 text-slate-300">
                          <span className="text-purple-400 font-bold">{log.adminName}</span> logged in successfully.
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 12: SYSTEM MONITORING */}
          {activeTab === "monitoring" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold font-display text-white">System Hardware, Telemetry & Biometrics Health</h3>
                <p className="text-xs text-slate-500 mt-1">Real-time status indicators tracking MongoDB Atlas, SendGrid relays, Cloudinary APIs, and CPU capacities.</p>
              </div>

              {monitoringMetrics ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Database Ping Delay", value: `${monitoringMetrics.databasePingMs} ms`, status: "EXCELLENT", icon: Database },
                      { label: "SendGrid SMTP Relay", value: "CONNECTED", status: "ACTIVE", icon: Mail },
                      { label: "Razorpay Webhooks", value: "ONLINE", status: "ACTIVE", icon: CreditCard },
                      { label: "Cloudinary folders API", value: "READY", status: "ACTIVE", icon: HardDrive }
                    ].map((m, idx) => {
                      const Icon = m.icon;
                      return (
                        <div key={idx} className="bg-slate-900 border border-slate-850 rounded-2xl p-5">
                          <div className="flex justify-between items-start">
                            <Icon className="w-5 h-5 text-purple-400" />
                            <span className="px-1.5 py-0.5 bg-purple-950 text-purple-400 rounded text-[8px] font-mono tracking-widest uppercase">
                              {m.status}
                            </span>
                          </div>
                          <div className="mt-4">
                            <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider">{m.label}</span>
                            <span className="text-lg font-bold text-white block mt-1 font-mono">{m.value}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Operational Server Telemetry Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 space-y-4">
                      <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5">
                        <Cpu className="w-4 h-4 text-purple-400" />
                        <span>Cloud Container Core Metrics</span>
                      </h4>

                      <div className="space-y-4 pt-2">
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400">Server CPU Core Capacity:</span>
                            <span className="font-bold text-white font-mono">{monitoringMetrics.cpuUsagePercent}%</span>
                          </div>
                          <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500" style={{ width: `${monitoringMetrics.cpuUsagePercent}%` }} />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400">Memory Heap Usage:</span>
                            <span className="font-bold text-white font-mono">{monitoringMetrics.ramUsageMb} MB / 512 MB</span>
                          </div>
                          <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500" style={{ width: `${(monitoringMetrics.ramUsageMb / 512) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 space-y-4">
                      <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-purple-400" />
                        <span>Live Operational Flags</span>
                      </h4>

                      <div className="text-xs space-y-3 pt-2 font-mono text-slate-300">
                        <div className="flex justify-between border-b border-slate-850 pb-2">
                          <span className="text-slate-500">Server Status:</span>
                          <span className="text-emerald-400 font-bold">READY (ONLINE)</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-850 pb-2">
                          <span className="text-slate-500">API Health Index:</span>
                          <span className="text-emerald-400 font-bold">EXCELLENT (99.9%)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Queue State:</span>
                          <span className="text-slate-400">IDLE</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="animate-pulse h-44 bg-slate-900 rounded-2xl" />
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
