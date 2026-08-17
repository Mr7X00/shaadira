import React, { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AlertTriangle, Clock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SystemSettings {
  maintenanceMode: boolean;
  maintenanceStart?: string;
  maintenanceEnd?: string;
}

export const MaintenanceBanner: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Real-time listener for settings
    if (!db) return;
    
    try {
      const unsub = onSnapshot(doc(db, 'system', 'config'), (snap) => {
        if (snap.exists()) {
          setSettings(snap.data() as SystemSettings);
        }
      });
      return () => unsub();
    } catch (err) {
      console.warn("MaintenanceBanner Firebase Error:", err);
    }
  }, []);

  if (!settings || !settings.maintenanceMode || !isVisible) return null;

  const formatDateTime = (dtStr: string) => {
    try {
      return new Date(dtStr).toLocaleString('en-IN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dtStr;
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="bg-[#3E362E] text-[#FDF6F0] overflow-hidden relative z-[9999] border-b border-[#8C6D4F]/20"
      >
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-[#8C6D4F]/20 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-[#8C6D4F]" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em]">Prestige System Advisory</p>
              <div className="flex items-center gap-3 mt-1">
                <Clock className="w-3 h-3 text-[#8C6D4F]" />
                <p className="text-[9px] font-mono tracking-widest text-[#8C6D4F] uppercase">
                  {settings.maintenanceStart ? formatDateTime(settings.maintenanceStart) : 'TBD'} 
                  {' — '} 
                  {settings.maintenanceEnd ? formatDateTime(settings.maintenanceEnd) : 'Ongoing'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <p className="hidden md:block text-[9px] font-bold tracking-[0.15em] uppercase text-[#8C6D4F]/80">
              Integrity protocols operational during scheduled clearing
            </p>
            <button 
              onClick={() => setIsVisible(false)}
              className="p-1.5 hover:bg-[#8C6D4F]/10 rounded-lg transition-all text-[#8C6D4F] hover:text-[#FDF6F0]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
