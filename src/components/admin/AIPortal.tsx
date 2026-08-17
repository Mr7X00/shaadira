import React, { useState, useEffect } from 'react';
import { 
  Sparkles, MessageSquare, Shield, 
  Settings as SettingsIcon, Save, RefreshCw,
  Search, Filter, CheckCircle2, AlertTriangle,
  History, Cpu, Zap, Activity
} from 'lucide-react';
import { UserRole } from '../../types';

interface AIConfig {
  model: string;
  systemInstruction: string;
  temperature: number;
  maxOutputTokens: number;
}

interface AIInteraction {
  id: string;
  timestamp: string;
  bookingId: string;
  userMessage: string;
  aiResponse: string;
  latency: number;
  status: 'SUCCESS' | 'ERROR';
  model: string;
}

export const AIPortal: React.FC = () => {
  const [config, setConfig] = useState<AIConfig>({
    model: 'gemini-3.5-flash',
    systemInstruction: '',
    temperature: 0.7,
    maxOutputTokens: 1000
  });
  const [interactions, setInteractions] = useState<AIInteraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const [settingsRes, logsRes] = await Promise.all([
        fetch('/api/admin/settings', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/ai-logs', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (settingsRes.ok) {
        const settings = await settingsRes.json();
        // Extract AI specific settings or use defaults
        setConfig({
          model: settings.aiModel || 'gemini-3.5-flash',
          systemInstruction: settings.aiSystemInstruction || '',
          temperature: settings.aiTemperature || 0.7,
          maxOutputTokens: settings.aiMaxTokens || 1000
        });
      }

      if (logsRes.ok) {
        setInteractions(await logsRes.json());
      }
    } catch (err) {
      console.error("Failed to fetch AI data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          aiModel: config.model,
          aiSystemInstruction: config.systemInstruction,
          aiTemperature: config.temperature,
          aiMaxTokens: config.maxOutputTokens
        })
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Failed to save AI config:", err);
    } finally {
      setSaving(false);
    }
  };

  const filteredInteractions = interactions.filter(i => 
    i.userMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.aiResponse.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.bookingId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold font-display text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-400" />
            Phase 14: AI Interaction Engine
          </h3>
          <p className="text-slate-400 text-xs mt-1">Management and monitoring of Gemini-powered automated artist responses</p>
        </div>
        <div className="flex items-center gap-3">
          {saveSuccess && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5" />
              AI Protocol Updated
            </div>
          )}
          <button 
            onClick={handleSaveConfig}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Updating Engine...' : 'Save AI Protocol'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CONFIGURATION PANEL */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 space-y-6">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <SettingsIcon className="w-4 h-4 text-slate-400" />
              Engine Configuration
            </h4>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Target Model</label>
                <select 
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-xs text-white focus:border-blue-500 outline-none"
                  value={config.model}
                  onChange={(e) => setConfig({...config, model: e.target.value})}
                >
                  <option value="gemini-3.5-flash">Gemini 3.5 Flash (Fastest)</option>
                  <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Advanced Reasoning)</option>
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash (Legacy)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Temperature ({config.temperature})</label>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.1"
                  className="w-full accent-blue-500"
                  value={config.temperature}
                  onChange={(e) => setConfig({...config, temperature: parseFloat(e.target.value)})}
                />
                <div className="flex justify-between text-[8px] text-slate-600 uppercase font-mono">
                  <span>Precise</span>
                  <span>Creative</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Core System Instruction</label>
                <textarea 
                  rows={8}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-[11px] text-white leading-relaxed focus:border-blue-500 outline-none resize-none"
                  placeholder="Define the AI persona and constraints..."
                  value={config.systemInstruction}
                  onChange={(e) => setConfig({...config, systemInstruction: e.target.value})}
                />
                <p className="text-[9px] text-slate-600 italic">This base prompt is injected into all AI response requests.</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-850">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  <span className="text-slate-400">Token Limit</span>
                </div>
                <input 
                  type="number"
                  className="w-20 bg-slate-950 border border-slate-850 rounded-lg px-2 py-1 text-center font-mono text-white"
                  value={config.maxOutputTokens}
                  onChange={(e) => setConfig({...config, maxOutputTokens: parseInt(e.target.value)})}
                />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border border-blue-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-5 h-5 text-blue-400" />
              <h4 className="text-sm font-bold text-white">Live AI Status</h4>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">API Connection</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  Optimal
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Avg. Latency</span>
                <span className="text-white font-mono">1.42s</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Successful Replies (24h)</span>
                <span className="text-white font-mono">{interactions.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* INTERACTION LOGS */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden flex flex-col h-full max-h-[800px]">
            <div className="p-6 border-b border-slate-850 flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-slate-400" />
                Audit: Real-time AI Log
              </h4>
              <div className="relative">
                <Search className="absolute left-3 top-2 w-3.5 h-3.5 text-slate-500" />
                <input 
                  type="text"
                  placeholder="Filter logs..."
                  className="pl-9 pr-4 py-1.5 bg-slate-950 border border-slate-850 rounded-xl text-[10px] text-white focus:outline-none focus:border-blue-500 w-48"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
              {loading ? (
                <div className="py-20 text-center space-y-4">
                  <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
                  <p className="text-slate-500 text-xs italic">Decrypting neural activity logs...</p>
                </div>
              ) : filteredInteractions.length === 0 ? (
                <div className="py-20 text-center space-y-4">
                  <div className="w-12 h-12 bg-slate-950 rounded-full flex items-center justify-center mx-auto">
                    <MessageSquare className="w-6 h-6 text-slate-700" />
                  </div>
                  <p className="text-slate-500 text-xs italic">No AI interactions recorded yet.</p>
                </div>
              ) : (
                filteredInteractions.map((log) => (
                  <div key={log.id} className="bg-slate-950 border border-slate-850 rounded-xl p-4 space-y-3 hover:border-slate-800 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-900/30 rounded-lg flex items-center justify-center">
                          <Cpu className="w-4 h-4 text-blue-400" />
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-white flex items-center gap-2">
                            Booking: {log.bookingId}
                            <span className="px-1.5 py-0.5 bg-slate-900 text-[8px] rounded font-mono text-slate-500">
                              {log.latency}ms
                            </span>
                          </div>
                          <div className="text-[9px] text-slate-500 font-mono">
                            {new Date(log.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black tracking-widest ${
                        log.status === 'SUCCESS' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' : 'bg-rose-950 text-rose-400 border border-rose-900'
                      }`}>
                        {log.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <span className="text-[9px] text-slate-600 font-bold uppercase tracking-wider block">User Input</span>
                        <div className="p-3 bg-slate-900/50 rounded-lg text-xs text-slate-300 leading-relaxed border border-slate-850/50 italic">
                          "{log.userMessage}"
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[9px] text-blue-400/70 font-bold uppercase tracking-wider block">AI Inference</span>
                        <div className="p-3 bg-blue-950/20 rounded-lg text-xs text-white leading-relaxed border border-blue-500/10">
                          {log.aiResponse}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
