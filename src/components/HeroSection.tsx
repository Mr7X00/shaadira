import React, { useState } from "react";
import { Search, MapPin, Sparkles, ShieldCheck, Heart, ArrowRight } from "lucide-react";
import { ArtistCategory } from "../types";
import { motion } from "motion/react";

interface HeroSectionProps {
  onSearch: (query: string, category: string, state?: string, city?: string, priceRange?: [number, number]) => void;
  artistCount: number;
  isLoggedIn: boolean;
}

export default function HeroSection({ onSearch, artistCount, isLoggedIn }: HeroSectionProps) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [filterState, setFilterState] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [priceMin, setPriceMin] = useState("0");
  const [priceMax, setPriceMax] = useState("50000");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, selectedCategory, filterState, filterCity, [Number(priceMin), Number(priceMax)]);
  };

  const categories = [
    { code: "ALL", label: "All Categories", count: `${artistCount}+` },
    { code: ArtistCategory.MEHNDI, label: "Mehndi Artists", count: artistCount.toString() },
    { code: "MAKEUP", label: "Makeup (Soon)", count: "Coming Soon" },
    { code: "HAIR", label: "Hair Stylists (Soon)", count: "Coming Soon" },
    { code: "DECORATOR", label: "Decorators (Soon)", count: "Coming Soon" },
  ];

  return (
    <div id="hero-showcase" className={`relative overflow-hidden ${isLoggedIn ? 'pt-12 pb-12' : 'pt-24 pb-20'} px-6 border-b border-[#DBC1A7]/30 transition-all duration-500`}>
      {/* Wedding Background Image */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.12]"
          style={{ backgroundImage: 'url("https://i.ibb.co/p6jd9jSN/download.jpg")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#FDF6F0] via-[#FDF6F0]/20 to-[#FDF6F0]" />
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10">
        {/* Left Side: Elegant Text & Branding */}
        {!isLoggedIn && (
          <div className="lg:col-span-7 space-y-10 text-center lg:text-left">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-2 bg-[#8C6D4F]/5 border border-[#DBC1A7]/30 text-[#5C4D3D] px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.4em]"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#8C6D4F]" />
              <span>The Prestige Artifact Ledger</span>
            </motion.div>

            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="font-display text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-[#3E362E] leading-[0.95]"
            >
              The Sovereign <br />
              <span className="bg-gradient-to-r from-[#5C4D3D] via-[#8C6D4F] to-[#D01B3B] bg-clip-text text-transparent italic font-serif">
                Henna Artistry
              </span>
            </motion.h2>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="text-[#8C6D4F] text-xl max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light tracking-wide"
            >
              Empowering world-class Mehndi masters with tamper-proof client sittings, real-time communications, and secure escrow clearing. Bridging pristine tradition with modern digital trust.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-4"
            >
              <button className="px-10 py-5 bg-[#5C4D3D] hover:bg-[#3E362E] text-white font-bold text-[11px] rounded-2xl shadow-2xl transition-all hover:-translate-y-1 tracking-[0.2em] uppercase cursor-pointer">
                Create Artist Profile →
              </button>
              <button className="px-10 py-5 bg-white/40 backdrop-blur-md border border-[#DBC1A7] text-[#3E362E] font-bold text-[11px] rounded-2xl transition-all hover:bg-white tracking-[0.2em] uppercase cursor-pointer">
                Enter Portal
              </button>
            </motion.div>

            {/* Luxury Floating Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-12 max-w-2xl">
              {[
                { label: "Elite Artists", value: `${artistCount}+`, sub: "Invitation Only" },
                { label: "Audit Rank", value: "4.9★", sub: "Verified Sittings" },
                { label: "Stain Integrity", value: "100%", sub: "Organic Audits" },
                { label: "Platform Fee", value: "5%", sub: "Global Flat" }
              ].map((stat, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 + (idx * 0.1) }}
                  className="group text-center lg:text-left"
                >
                  <div className="font-display font-black text-2xl text-[#3E362E] group-hover:text-[#8C6D4F] transition-colors">{stat.value}</div>
                  <div className="text-[9px] font-bold text-[#8C6D4F] uppercase tracking-[0.2em] mt-1">{stat.label}</div>
                  <div className="text-[8px] text-[#8C6D4F]/50 font-mono italic mt-0.5">{stat.sub}</div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {isLoggedIn && (
          <div className="lg:col-span-7 space-y-6">
            <h2 className="font-display text-4xl lg:text-6xl font-black tracking-tight text-[#3E362E] leading-tight">
              Welcome to your <br />
              <span className="text-[#8C6D4F] italic font-serif">Registry Dashboard</span>
            </h2>
            <p className="text-[#8C6D4F] text-lg max-w-xl leading-relaxed">
              Discover verified artists, manage your sittings, and coordinate your wedding vision with precision.
            </p>
            <div className="flex items-center gap-6 pt-2">
              <div className="bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-[#DBC1A7]/30 flex items-center gap-4">
                <div className="w-12 h-12 bg-[#8C6D4F] rounded-xl flex items-center justify-center text-white font-black text-xl">
                  {artistCount}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#8C6D4F] uppercase tracking-[0.2em]">Artists Online</p>
                  <p className="text-xs text-[#3E362E]">Available in your network</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Right Side: Interactive Search Box & Preview Card */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="lg:col-span-5"
        >
          <div className="bg-white/90 backdrop-blur-2xl p-6 sm:p-8 rounded-[40px] border border-[#DBC1A7] shadow-[0_50px_100px_-20px_rgba(140,109,79,0.15)] relative">
            <div className="absolute -top-4 -right-4 bg-[#FFD700] text-[#3E362E] text-[10px] px-4 py-2 rounded-full flex items-center gap-2 shadow-xl font-black tracking-[0.2em] uppercase">
              <ShieldCheck className="w-4 h-4" />
              <span>Secured Hub</span>
            </div>

            <h3 className="font-display text-xl font-black text-[#3E362E] mb-2 uppercase tracking-tighter">Discovery Engine</h3>
            <p className="text-[10px] text-[#8C6D4F] mb-6 font-medium uppercase tracking-widest leading-relaxed">Advanced Filter Module</p>

            {/* Floating Search Form */}
            <form onSubmit={handleSearchSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-[9px] font-black text-[#8C6D4F] uppercase tracking-[0.2em] mb-1.5 ml-1">Search Context</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C6D4F]/50 w-4 h-4" />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Name, style, or skill..."
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-[#DBC1A7]/50 focus:outline-none focus:ring-2 focus:ring-[#8C6D4F]/20 focus:border-[#8C6D4F] transition-all text-sm text-[#3E362E] placeholder-[#8C6D4F]/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-black text-[#8C6D4F] uppercase tracking-[0.2em] mb-1.5 ml-1">State Filter</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C6D4F]/50 w-4 h-4" />
                      <input
                        type="text"
                        value={filterState}
                        onChange={(e) => setFilterState(e.target.value)}
                        placeholder="e.g. Maharashtra"
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-[#DBC1A7]/50 focus:outline-none focus:ring-2 focus:ring-[#8C6D4F]/20 focus:border-[#8C6D4F] transition-all text-xs text-[#3E362E] placeholder-[#8C6D4F]/30"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-[#8C6D4F] uppercase tracking-[0.2em] mb-1.5 ml-1">City Filter</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C6D4F]/50 w-4 h-4" />
                      <input
                        type="text"
                        value={filterCity}
                        onChange={(e) => setFilterCity(e.target.value)}
                        placeholder="e.g. Mumbai"
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-[#DBC1A7]/50 focus:outline-none focus:ring-2 focus:ring-[#8C6D4F]/20 focus:border-[#8C6D4F] transition-all text-xs text-[#3E362E] placeholder-[#8C6D4F]/30"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-black text-[#8C6D4F] uppercase tracking-[0.2em] mb-1.5 ml-1">Price Range (₹)</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                      placeholder="Min"
                      className="w-full px-4 py-3 rounded-xl bg-white border border-[#DBC1A7]/50 focus:outline-none focus:ring-2 focus:ring-[#8C6D4F]/20 focus:border-[#8C6D4F] transition-all text-xs text-[#3E362E]"
                    />
                    <span className="text-[#8C6D4F]">-</span>
                    <input
                      type="number"
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                      placeholder="Max"
                      className="w-full px-4 py-3 rounded-xl bg-white border border-[#DBC1A7]/50 focus:outline-none focus:ring-2 focus:ring-[#8C6D4F]/20 focus:border-[#8C6D4F] transition-all text-xs text-[#3E362E]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-black text-[#8C6D4F] uppercase tracking-[0.2em] mb-2 ml-1">Specialization</label>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.slice(0, 4).map((cat) => (
                      <button
                        key={cat.code}
                        type="button"
                        disabled={cat.count === "Coming Soon"}
                        onClick={() => setSelectedCategory(cat.code)}
                        className={`px-3 py-2.5 rounded-xl text-[10px] font-black text-left transition-all border flex flex-col justify-between cursor-pointer uppercase tracking-wider ${
                          selectedCategory === cat.code
                            ? "bg-[#5C4D3D] text-white border-[#5C4D3D] shadow-md"
                            : "bg-[#FDF6F0] text-[#3E362E] border-[#DBC1A7]/50 hover:bg-[#E6D5C3]/30 disabled:opacity-50"
                        }`}
                      >
                        <span>{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                id="search-artists-submit"
                type="submit"
                className="w-full py-4 bg-[#5C4D3D] hover:bg-[#3E362E] text-white font-black text-[10px] rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer uppercase tracking-[0.2em]"
              >
                <span>Execute Search</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
