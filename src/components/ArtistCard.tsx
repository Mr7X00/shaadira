import React from "react";
import { ArtistProfile, VerificationStatus } from "../types";
import { Star, ShieldCheck, Heart, ArrowUpRight, Award, MapPin } from "lucide-react";

interface ArtistCardProps {
  key?: React.Key;
  artist: ArtistProfile;
  onSelect: (artist: ArtistProfile) => void;
  onInitiateInquiry: (artistId: string) => void;
  isLoggedInClient: boolean;
}

export default function ArtistCard({ artist, onSelect, onInitiateInquiry, isLoggedInClient }: ArtistCardProps) {
  const isVerified = artist.verified === VerificationStatus.APPROVED;

  return (
    <div 
      id={`artist-card-${artist.id}`}
      className="glass-card rounded-[24px] overflow-hidden border border-slate-200/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col group h-full glow-border"
    >
      {/* Upper image/banner container */}
      <div className="relative h-48 w-full overflow-hidden">
        <img 
          src={artist.bannerUrl} 
          alt={`${artist.name} Banner`} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
        
        {/* Absolute Badges */}
        <div className="absolute top-4 left-4 flex gap-1.5">
          <span className="bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
            {artist.experienceYears} Years Exp
          </span>
          {isVerified && (
            <span className="bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow">
              <ShieldCheck className="w-3 h-3" />
              <span>Verified</span>
            </span>
          )}
        </div>

        {/* Floating Heart / Favourite */}
        <button className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md hover:bg-white text-white hover:text-rose-500 rounded-full transition-all duration-300 cursor-pointer shadow-lg">
          <Heart className="w-4 h-4 fill-current" />
        </button>

        {/* Profile Avatar overlaid on banner */}
        <div className="absolute -bottom-6 left-6">
          <div className="relative">
            <img 
              src={artist.avatarUrl} 
              alt={artist.name} 
              className="w-16 h-16 rounded-full border-4 border-white object-cover shadow-lg"
              referrerPolicy="no-referrer"
            />
            {isVerified && (
              <div className="absolute bottom-0 right-0 bg-blue-600 p-1 rounded-full border border-white shadow">
                <ShieldCheck className="w-3.5 h-3.5 text-white" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6 pt-8 flex-1 flex flex-col justify-between">
        <div>
          {/* Header & Rating */}
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-display font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">
                {artist.name}
              </h4>
              <p className="text-xs text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                <Award className="w-3.5 h-3.5 text-slate-400" />
                <span>Mehndi Specialist</span>
              </p>
            </div>
            {artist.reviewCount > 0 ? (
              <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-100 rounded-lg text-amber-900 text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{artist.rating.toFixed(1)}</span>
                <span className="text-slate-400 font-normal">({artist.reviewCount})</span>
              </div>
            ) : (
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider bg-slate-100 px-2 py-1 rounded">
                New Artist
              </div>
            )}
          </div>

          {/* Bio text */}
          <p className="text-sm text-slate-600 line-clamp-2 mt-3 font-light leading-relaxed">
            {artist.bio}
          </p>

          {/* Skills / Badges */}
          <div className="flex flex-wrap gap-1 mt-4">
            {artist.skills.slice(0, 3).map((skill, index) => (
              <span key={index} className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-md font-medium">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Pricing, Booking action row */}
        <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Base Service Price</span>
            <span className="font-display font-extrabold text-lg text-slate-900">
              ₹{artist.basePrice}
            </span>
            <span className="text-xs text-slate-400 font-light"> onwards</span>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => onSelect(artist)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
            >
              Portfolio
            </button>
            <button 
              id={`book-now-${artist.id}`}
              onClick={() => {
                if (isLoggedInClient) {
                  onInitiateInquiry(artist.id);
                } else {
                  // If guest, show portfolio view first which prompts login or does registration
                  onSelect(artist);
                }
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>Book</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
