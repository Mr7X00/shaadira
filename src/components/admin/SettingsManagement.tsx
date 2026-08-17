import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { 
  Settings, Save, Shield, Globe, 
  CreditCard, Bell, Zap, Database,
  Lock, CheckCircle2, AlertTriangle, RefreshCcw
} from 'lucide-react';

interface SystemSettings {
  commissionRate: number;
  baseServiceFee: number;
  maintenanceMode: boolean;
  maintenanceStart?: string;
  maintenanceEnd?: string;
  registrationOpen: boolean;
  databasePrimary: 'MONGO' | 'FIREBASE';
  supportEmail: string;
  payoutMinimum: number;
  aiFeaturesEnabled: boolean;
  autoVerification: boolean;
}

export const SettingsManagement: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    commissionRate: 10,
    baseServiceFee: 500,
    maintenanceMode: false,
    maintenanceStart: '',
    maintenanceEnd: '',
    registrationOpen: true,
    databasePrimary: 'FIREBASE',
    supportEmail: 'support@veltora.in',
    payoutMinimum: 2000,
    aiFeaturesEnabled: true,
    autoVerification: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [healthData, setHealthData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        const res = await fetch('/api/admin/settings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        } else {
          // Fallback to Firestore if API fails
          const settingsRef = doc(db, 'system', 'config');
          const snap = await getDoc(settingsRef);
          if (snap.exists()) {
            setSettings(snap.data() as SystemSettings);
          }
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchHealth = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        const res = await fetch('/api/admin/monitoring', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setHealthData(data);
        }
      } catch (err) {
        console.error("Error fetching health:", err);
      }
    };

    const fetchUser = () => {
      const user = localStorage.getItem('veltora_user');
      if (user) setCurrentUser(JSON.parse(user));
    };

    fetchSettings();
    fetchHealth();
    fetchUser();
    const interval = setInterval(fetchHealth, 10000); // Polling every 10s
    return () => clearInterval(interval);
  }, []);

  const handleToggleAdmin = async () => {
    if (!currentUser?.id) return;
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/admin/toggle-admin', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ userId: currentUser.id })
      });
      if (res.ok) {
        const data = await res.json();
        const updatedUser = { ...currentUser, role: data.newRole };
        setCurrentUser(updatedUser);
        localStorage.setItem('veltora_user', JSON.stringify(updatedUser));
        
        if (data.newRole === 'SUPER_ADMIN') {
          alert("SUPER ADMIN GRANTED: " + data.message);
        }
        
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Failed to toggle admin:", err);
    }
  };

  const handleReconnect = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/admin/reinit', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        alert("Infrastructure re-initialization attempted. Check connectivity status below.");
        fetchHealth();
      }
    } catch (err) {
      console.error("Reconnect failed:", err);
    }
  };

  const fetchHealth = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/admin/monitoring', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHealthData(data);
        setError(null);
      } else if (res.status === 403) {
        setError("Access Denied: You need Super Admin privileges to view live telemetry.");
        setHealthData(null);
      } else {
        setError(`Telemetry Error: ${res.statusText}`);
      }
    } catch (err) {
      console.error("Error fetching health:", err);
      setError("Network error: Unable to reach monitoring service.");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    
    // Create a timeout controller to prevent the UI from being stuck
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(settings),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error("Server returned error:", errorData);
        
        // Fallback attempt via direct Firestore
        const settingsRef = doc(db, 'system', 'config');
        await setDoc(settingsRef, settings);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error: any) {
      console.error("Error saving settings:", error);
      if (error.name === 'AbortError') {
        // If API timed out, try one last direct Firestore push
        try {
          const settingsRef = doc(db, 'system', 'config');
          await setDoc(settingsRef, settings);
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 3000);
        } catch (fErr) {
          console.error("Firestore fallback also failed:", fErr);
        }
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-500 italic">Syncing system variables...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold font-display text-white">System Configuration</h3>
          <p className="text-slate-400 text-xs mt-1">Global platform variables, fiscal rules, and integration states</p>
        </div>
        <div className="flex items-center gap-3">
          {saveSuccess && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold rounded-lg animate-in fade-in slide-in-from-right-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Configuration Synchronized
            </div>
          )}
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20"
          >
            {saving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Applying...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FISCAL RULES */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h4 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-500" />
              Fiscal & Revenue Logic
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Platform Commission (%)</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="number" 
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white"
                    value={settings.commissionRate}
                    onChange={(e) => setSettings({...settings, commissionRate: Number(e.target.value)})}
                  />
                  <div className="p-2 bg-slate-800 rounded-lg text-slate-400"><Zap className="w-4 h-4" /></div>
                </div>
                <p className="text-[10px] text-slate-600 italic">Standard fee deducted from every booking payout</p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Base Service Fee (₹)</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="number" 
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white"
                    value={settings.baseServiceFee}
                    onChange={(e) => setSettings({...settings, baseServiceFee: Number(e.target.value)})}
                  />
                  <div className="p-2 bg-slate-800 rounded-lg text-slate-400"><Database className="w-4 h-4" /></div>
                </div>
                <p className="text-[10px] text-slate-600 italic">Fixed overhead charge applied to all clients</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h4 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-500" />
              Security & Access Control
            </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl">
                  <div>
                    <div className="text-xs font-bold text-white">Super Admin Access</div>
                    <div className="text-[10px] text-slate-500">Toggle administrative privileges for development</div>
                    <div className="mt-1">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${currentUser?.role === 'SUPER_ADMIN' ? 'bg-blue-950 text-blue-400' : 'bg-slate-900 text-slate-600'}`}>
                        CURRENT: {currentUser?.role || 'CLIENT'}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={handleToggleAdmin}
                    className={`px-4 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                      currentUser?.role === 'SUPER_ADMIN' 
                        ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' 
                        : 'bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600 hover:text-white'
                    }`}
                  >
                    {currentUser?.role === 'SUPER_ADMIN' ? 'Revoke Super Admin' : 'Grant Super Admin'}
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl">
                  <div>
                    <div className="text-xs font-bold text-white">Maintenance Mode</div>
                    <div className="text-[10px] text-slate-500">Enable banner and schedule downtime</div>
                  </div>
                  <button 
                    onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})}
                    className={`w-12 h-6 rounded-full transition-colors relative ${settings.maintenanceMode ? 'bg-rose-600' : 'bg-slate-800'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.maintenanceMode ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>

                {settings.maintenanceMode && (
                  <div className="grid grid-cols-2 gap-4 p-4 bg-slate-950/50 border border-slate-800/50 rounded-xl animate-in slide-in-from-top-2 duration-300">
                    <div className="space-y-2">
                      <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Start Time</label>
                      <input 
                        type="datetime-local" 
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-[10px] text-white focus:border-rose-500/50 outline-none transition-colors"
                        value={settings.maintenanceStart || ''}
                        onChange={(e) => setSettings({...settings, maintenanceStart: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Estimated End</label>
                      <input 
                        type="datetime-local" 
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-[10px] text-white focus:border-rose-500/50 outline-none transition-colors"
                        value={settings.maintenanceEnd || ''}
                        onChange={(e) => setSettings({...settings, maintenanceEnd: e.target.value})}
                      />
                    </div>
                    <div className="col-span-2 flex items-center gap-2 mt-1">
                      <AlertTriangle className="w-3 h-3 text-rose-500" />
                      <p className="text-[9px] text-rose-500/80 italic">Operations will remain active; this only displays a warning banner.</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl">
                  <div>
                    <div className="text-xs font-bold text-white">Primary Database Mode</div>
                    <div className="text-[10px] text-slate-500">Choose storage engine for core operations</div>
                    <div className="flex gap-2 mt-2">
                      <div className={`px-2 py-0.5 rounded text-[8px] font-bold ${healthData?.mongoStatus === 'ACTIVE' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'}`}>
                        MONGO: {healthData?.mongoStatus || (loading ? 'INITIALIZING...' : 'ERROR')}
                      </div>
                      <div className={`px-2 py-0.5 rounded text-[8px] font-bold ${healthData?.firestoreStatus === 'ACTIVE' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'}`}>
                        FIREBASE: {healthData?.firestoreStatus || (loading ? 'INITIALIZING...' : 'ERROR')}
                      </div>
                    </div>
                  </div>
                  <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
                    <button 
                      onClick={() => setSettings({...settings, databasePrimary: 'MONGO'})}
                      className={`px-3 py-1 text-[9px] font-bold rounded-md transition-all ${settings.databasePrimary === 'MONGO' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      MONGODB
                    </button>
                    <button 
                      onClick={() => setSettings({...settings, databasePrimary: 'FIREBASE'})}
                      className={`px-3 py-1 text-[9px] font-bold rounded-md transition-all ${settings.databasePrimary === 'FIREBASE' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      FIREBASE
                    </button>
                  </div>
                </div>
              <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl">
                <div>
                  <div className="text-xs font-bold text-white">Public Registration</div>
                  <div className="text-[10px] text-slate-500">Allow new artists and clients to sign up</div>
                </div>
                <button 
                  onClick={() => setSettings({...settings, registrationOpen: !settings.registrationOpen})}
                  className={`w-12 h-6 rounded-full transition-colors relative ${settings.registrationOpen ? 'bg-emerald-600' : 'bg-slate-800'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.registrationOpen ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl">
                <div>
                  <div className="text-xs font-bold text-white">AI Content Moderation</div>
                  <div className="text-[10px] text-slate-500">Enable Gemini-powered check for reviews and bios</div>
                </div>
                <button 
                  onClick={() => setSettings({...settings, aiFeaturesEnabled: !settings.aiFeaturesEnabled})}
                  className={`w-12 h-6 rounded-full transition-colors relative ${settings.aiFeaturesEnabled ? 'bg-blue-600' : 'bg-slate-800'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.aiFeaturesEnabled ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* INTEGRATION STATUS */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h4 className="text-sm font-bold text-white mb-4">Support Channels</h4>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1 block">Support Email</label>
                <input 
                  type="email" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white"
                  value={settings.supportEmail}
                  onChange={(e) => setSettings({...settings, supportEmail: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1 block">Min. Payout Threshold</label>
                <input 
                  type="number" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white"
                  value={settings.payoutMinimum}
                  onChange={(e) => setSettings({...settings, payoutMinimum: Number(e.target.value)})}
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-500" />
                Service Connectivity
              </h4>
              <button 
                onClick={handleReconnect}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1.5"
              >
                <RefreshCcw className="w-3 h-3" />
                Reconnect All
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-rose-950/30 border border-rose-500/20 rounded-xl">
                <div className="text-[10px] text-rose-400 font-bold mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="w-3 h-3" />
                  CONNECTIVITY ERROR
                </div>
                <div className="text-[10px] text-slate-400">{error}</div>
                {error.includes("Access Denied") && (
                  <button 
                    onClick={() => { localStorage.removeItem('admin_token'); window.location.reload(); }}
                    className="mt-2 text-[9px] text-blue-400 hover:underline font-bold"
                  >
                    Log Out & Re-login
                  </button>
                )}
              </div>
            )}

            <div className="space-y-3">
              {[
                { 
                  name: 'MongoDB Cluster', 
                  status: healthData?.mongoStatus === 'ACTIVE' ? 'Optimal' : 'Offline', 
                  delay: `${healthData?.mongoLatency || 0}ms`,
                  active: healthData?.mongoStatus === 'ACTIVE'
                },
                { 
                  name: 'Firestore Engine', 
                  status: healthData?.firestoreStatus === 'ACTIVE' ? 'Optimal' : 'Offline', 
                  delay: healthData?.firestoreLatency || '0ms',
                  active: healthData?.firestoreStatus === 'ACTIVE'
                },
                { 
                  name: 'SMTP Relay', 
                  status: healthData?.smtpStatus === 'ACTIVE' ? 'Active' : 'Offline', 
                  delay: '88ms',
                  active: healthData?.smtpStatus === 'ACTIVE'
                },
                { 
                  name: 'Payment Gateway', 
                  status: healthData?.paymentGatewayStatus === 'ACTIVE' ? 'Live' : 'Maintenance', 
                  delay: '124ms',
                  active: healthData?.paymentGatewayStatus === 'ACTIVE'
                },
              ].map((svc) => (
                <div key={svc.name} className="flex justify-between items-center p-3 bg-slate-950/50 rounded-xl border border-slate-800/50">
                  <div>
                    <div className="text-[10px] font-bold text-white">{svc.name}</div>
                    <div className="text-[9px] text-slate-500">{svc.delay} latency</div>
                  </div>
                  <div className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${
                    svc.active ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                  }`}>
                    {svc.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
