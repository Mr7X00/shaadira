import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, User, Mail, Shield, Save, LogOut, Check, Phone, MapPin, Globe, Sparkles } from "lucide-react";
import { auth } from "../lib/firebase";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  profile: any;
  onUpdate: (data: any) => Promise<void>;
}

const AVATARS = {
  MEN: [
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Jack",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Leo",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Milo"
  ],
  WOMEN: [
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Sasha",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Willow"
  ]
};

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user, profile, onUpdate }) => {
  const [name, setName] = useState(profile?.name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [state, setState] = useState(profile?.state || "");
  const [city, setCity] = useState(profile?.city || "");
  const [gender, setGender] = useState<'MALE' | 'FEMALE'>(profile?.gender || 'FEMALE');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl || AVATARS.WOMEN[0]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setPhone(profile.phone || "");
      setState(profile.state || "");
      setCity(profile.city || "");
      setGender(profile.gender || 'FEMALE');
      setAvatarUrl(profile.avatarUrl || (profile.gender === 'MALE' ? AVATARS.MEN[0] : AVATARS.WOMEN[0]));
    }
  }, [profile]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate({ name, phone, state, city, gender, avatarUrl });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    auth.signOut();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#3E362E]/60 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-[#FDF6F0] dark:bg-[#1A1612] rounded-[40px] shadow-2xl overflow-hidden border border-[#DBC1A7]/30 transition-colors duration-500"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-[#DBC1A7]/20 flex items-center justify-between bg-gradient-to-r from-[#FDF6F0] to-[#F5E6DA] dark:from-[#1A1612] dark:to-[#2A241E]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#FFD700] rounded-2xl flex items-center justify-center text-[#3E362E] shadow-lg">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black tracking-tight text-[#3E362E] dark:text-[#FDF6F0]">Sovereign Identity</h2>
                  <p className="text-[10px] font-mono text-[#8C6D4F] uppercase tracking-widest">Profile Registry</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-[#8C6D4F]/10 rounded-full transition-colors text-[#3E362E] dark:text-[#FDF6F0]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto premium-scrollbar">
              {/* Profile Picture & Gender Selection */}
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-[#3E362E] shadow-2xl transition-transform group-hover:scale-105 duration-500">
                      <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-[#FFD700] p-2 rounded-xl shadow-lg text-[#3E362E]">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-[#8C6D4F] uppercase tracking-[0.2em] block text-center">Identity Archetype</label>
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => {
                        setGender('MALE');
                        setAvatarUrl(AVATARS.MEN[0]);
                      }}
                      className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${gender === 'MALE' ? 'bg-[#8C6D4F] text-white shadow-lg' : 'bg-[#DBC1A7]/20 text-[#8C6D4F]'}`}
                    >
                      Male
                    </button>
                    <button
                      onClick={() => {
                        setGender('FEMALE');
                        setAvatarUrl(AVATARS.WOMEN[0]);
                      }}
                      className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${gender === 'FEMALE' ? 'bg-[#8C6D4F] text-white shadow-lg' : 'bg-[#DBC1A7]/20 text-[#8C6D4F]'}`}
                    >
                      Female
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[9px] font-bold text-[#8C6D4F]/60 uppercase tracking-widest text-center">Select Manifestation</p>
                  <div className="flex justify-center gap-3 flex-wrap">
                    {(gender === 'MALE' ? AVATARS.MEN : AVATARS.WOMEN).map((url) => (
                      <button
                        key={url}
                        onClick={() => setAvatarUrl(url)}
                        className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all hover:scale-110 ${avatarUrl === url ? 'border-[#FFD700] scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                      >
                        <img src={url} alt="Avatar" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-[#8C6D4F] uppercase tracking-[0.2em] ml-1">Full Nomenclature</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C6D4F]/50" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your Full Name"
                      className="w-full pl-12 pr-4 py-4 bg-white dark:bg-[#2A241E] border border-[#DBC1A7]/30 rounded-2xl text-sm focus:ring-2 focus:ring-[#8C6D4F]/20 focus:border-[#8C6D4F] transition-all outline-none text-[#3E362E] dark:text-[#FDF6F0]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#8C6D4F] uppercase tracking-[0.2em] ml-1">Phone Nexus</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C6D4F]/50" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 00000 00000"
                      className="w-full pl-12 pr-4 py-4 bg-white dark:bg-[#2A241E] border border-[#DBC1A7]/30 rounded-2xl text-sm focus:ring-2 focus:ring-[#8C6D4F]/20 focus:border-[#8C6D4F] transition-all outline-none text-[#3E362E] dark:text-[#FDF6F0]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#8C6D4F] uppercase tracking-[0.2em] ml-1">Current State</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C6D4F]/50" />
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g. Maharashtra"
                      className="w-full pl-12 pr-4 py-4 bg-white dark:bg-[#2A241E] border border-[#DBC1A7]/30 rounded-2xl text-sm focus:ring-2 focus:ring-[#8C6D4F]/20 focus:border-[#8C6D4F] transition-all outline-none text-[#3E362E] dark:text-[#FDF6F0]"
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-[#8C6D4F] uppercase tracking-[0.2em] ml-1">City Residence</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C6D4F]/50" />
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Mumbai"
                      className="w-full pl-12 pr-4 py-4 bg-white dark:bg-[#2A241E] border border-[#DBC1A7]/30 rounded-2xl text-sm focus:ring-2 focus:ring-[#8C6D4F]/20 focus:border-[#8C6D4F] transition-all outline-none text-[#3E362E] dark:text-[#FDF6F0]"
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-[#8C6D4F] uppercase tracking-[0.2em] ml-1">Secured Email (Read Only)</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C6D4F]/50" />
                    <input
                      type="text"
                      value={user?.email || ""}
                      readOnly
                      className="w-full pl-12 pr-4 py-4 bg-[#F5E6DA]/50 dark:bg-[#1A1612] border border-[#DBC1A7]/20 rounded-2xl text-sm text-[#8C6D4F] cursor-not-allowed outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-8 bg-[#F5E6DA]/30 dark:bg-[#2A241E]/30 flex items-center justify-between gap-4">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-6 py-4 text-rose-600 dark:text-rose-400 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-rose-500/10 rounded-2xl transition-all"
              >
                <LogOut className="w-4 h-4" />
                Sever Session
              </button>

              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-8 py-4 bg-[#5C4D3D] text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:bg-[#3E362E] transition-all disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
