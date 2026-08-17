import React, { useState } from "react";
import { Booking, BookingStatus, ArtistProfile, VerificationStatus } from "../types";
import { MapPin, Navigation, Upload, CheckCircle, HelpCircle, DollarSign, Edit, Sparkles, Star, Calendar } from "lucide-react";
import CloudinaryUpload from "./CloudinaryUpload";
import ArtistVerificationPending from "./ArtistVerificationPending";

interface ArtistDashboardProps {
  artist: ArtistProfile;
  bookings: Booking[];
  onUpdateBioPrice: (bio: string, price: number) => void;
  onGpsCheckIn: (bookingId: string) => void;
  onUploadProof: (bookingId: string, proofUrl: string, note: string) => void;
  onSelectBooking: (booking: Booking) => void;
}

export default function ArtistDashboard({
  artist,
  bookings,
  onUpdateBioPrice,
  onGpsCheckIn,
  onUploadProof,
  onSelectBooking,
}: ArtistDashboardProps) {
  if (artist.verified !== VerificationStatus.APPROVED) {
    return <ArtistVerificationPending artist={artist} />;
  }

  const [isEditing, setIsEditing] = useState(false);
  const [bioInput, setBioInput] = useState(artist.bio);
  const [priceInput, setPriceInput] = useState(artist.basePrice.toString());
  const [proofNote, setProofNote] = useState("");
  const [selectedProofImg, setSelectedProofImg] = useState("https://images.unsplash.com/photo-1610030469668-93535c17b6b3?auto=format&fit=crop&w=600&h=600&q=80");

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateBioPrice(bioInput, Number(priceInput) || 1000);
    setIsEditing(false);
  };

  const proofPresets = [
    { label: "Intricate Royal Design", url: "https://images.unsplash.com/photo-1610030469668-93535c17b6b3?auto=format&fit=crop&w=600&h=600&q=80" },
    { label: "Palms & Fingers Lacey Style", url: "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&w=600&h=600&q=80" },
    { label: "Heavy Floral Bridal Stain", url: "https://images.unsplash.com/photo-1605647540924-852290f6b0d5?auto=format&fit=crop&w=600&h=600&q=80" }
  ];

  const artistBookings = bookings.filter(b => b.artistId === artist.id);

  return (
    <div id="artist-dashboard-module" className="max-w-7xl mx-auto px-4 py-8 space-y-8 font-sans">
      
      {/* Upper Artist Profile Banner */}
      <div className="glass-card rounded-[24px] overflow-hidden border border-slate-200/50 shadow-xl">
        <div className="h-40 bg-gradient-to-r from-blue-700 to-indigo-900 relative">
          <div className="absolute inset-0 bg-slate-950/20" />
          <div className="absolute top-4 right-4 bg-emerald-500 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Profile Active & Verified</span>
          </div>
        </div>

        <div className="px-6 pb-6 relative">
          {/* Avatar overlaid */}
          <div className="absolute -top-12 left-6">
            <img 
              src={artist.avatarUrl} 
              alt={artist.name} 
              className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-lg"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="pt-16 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-display font-bold text-2xl text-slate-900">{artist.name}</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{artist.category} SPECIALIST • ID: {artist.id}</p>
              
              <div className="flex items-center gap-3 mt-2 text-xs">
                <span className="flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{artist.rating} ({artist.reviewCount} reviews)</span>
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-500 font-medium">{artist.experienceYears} Years On-Field Experience</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="artist-edit-profile-btn"
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>{isEditing ? "Close Editor" : "Edit Profile Settings"}</span>
              </button>
            </div>
          </div>

          {/* Profile Editor form */}
          {isEditing ? (
            <form onSubmit={handleProfileSave} className="mt-6 p-5 bg-slate-50 rounded-2xl border border-slate-200/60 grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-8">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">My Biography & Henna Quality</label>
                <textarea
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  rows={3}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-800"
                />
              </div>
              <div className="md:col-span-4">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">My Base Price (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">₹</span>
                  <input
                    type="number"
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl pl-7 pr-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  id="artist-save-profile-btn"
                  type="submit"
                  className="w-full mt-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-all"
                >
                  Save Profile Settings
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-1 md:grid-cols-12 gap-4 text-xs text-slate-600">
              <div className="md:col-span-9 leading-relaxed">
                <span className="font-bold text-slate-700">My Bio:</span> {artist.bio}
              </div>
              <div className="md:col-span-3 font-mono font-bold text-right self-center text-slate-800">
                <span className="text-slate-400 block font-sans text-[10px] uppercase font-bold tracking-wider">Base Price Structure</span>
                <span className="text-xl">₹{artist.basePrice}</span> <span className="text-[10px] font-normal text-slate-400">onwards</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: My Booking Orders */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span>Active Bookings ({artistBookings.length})</span>
            </h4>
            <span className="text-xs text-slate-400">Self-determined pricing pipeline</span>
          </div>

          {artistBookings.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 text-center text-slate-400 text-xs">
              No bookings assigned yet. Approved artists automatically receive client requests.
            </div>
          ) : (
            <div className="space-y-4">
              {artistBookings.map((bk) => (
                <div 
                  id={`artist-booking-row-${bk.id}`}
                  key={bk.id}
                  className="glass-card rounded-2xl p-5 border border-slate-200/50 hover:shadow-md transition-all flex flex-col justify-between gap-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-bold text-sm text-slate-800">Client: {bk.clientName}</h5>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">Event Date: {bk.eventDate} @ {bk.eventTime}</p>
                      
                      {bk.status !== BookingStatus.INQUIRY && bk.status !== BookingStatus.QUOTE_SENT && (
                        <p className="text-xs text-emerald-700 font-bold flex items-center gap-1 mt-2">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>Venue: {bk.eventLocation}</span>
                        </p>
                      )}
                    </div>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                      bk.status === BookingStatus.CLOSED 
                        ? "bg-slate-100 text-slate-600" 
                        : bk.status === BookingStatus.CONFIRMED 
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-blue-100 text-blue-800"
                    }`}>
                      {bk.status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 items-center justify-between pt-3 border-t border-slate-100 text-xs">
                    <div className="font-semibold text-slate-700 font-mono">
                      {bk.quotedAmount ? `Quoted: ₹${bk.quotedAmount}` : "Awaiting price quote"}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectBooking(bk)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-medium"
                      >
                        Open In Chat
                      </button>

                      {/* Action trigger: GPS Check-in */}
                      {bk.status === BookingStatus.CONFIRMED && (
                        <button
                          id={`gps-checkin-btn-${bk.id}`}
                          onClick={() => onGpsCheckIn(bk.id)}
                          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-1 cursor-pointer transition-all animate-bounce shadow-md"
                        >
                          <Navigation className="w-3.5 h-3.5 animate-spin" />
                          <span>GPS Check-in Arrival</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Upload Completion Proof Workspace (Visible after check-in / arrival) */}
                  {bk.status === BookingStatus.ARRIVED && (
                    <div className="p-4 bg-teal-50/60 rounded-xl border border-teal-100 space-y-4">
                      <h6 className="text-xs font-bold text-teal-900 flex items-center gap-1">
                        <Upload className="w-4 h-4" />
                        <span>Completion Proof Workspace</span>
                      </h6>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div>
                          <CloudinaryUpload 
                            label="Upload Design Output Photo" 
                            onUploadSuccess={(url) => setSelectedProofImg(url)} 
                            presetUrl={selectedProofImg}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Completion Note</label>
                          <input
                            type="text"
                            value={proofNote}
                            onChange={(e) => setProofNote(e.target.value)}
                            placeholder="e.g. Completed hand henna with thick organic stain"
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 focus:outline-none text-slate-800"
                          />
                        </div>
                      </div>

                      <button
                        id={`submit-proof-btn-${bk.id}`}
                        onClick={() => onUploadProof(bk.id, selectedProofImg, proofNote)}
                        className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold transition-all shadow cursor-pointer flex items-center justify-center gap-1.5 text-xs"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Upload Proof & Complete Service</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column: Artist Instructions & Policies */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card p-6 rounded-[24px] border border-slate-200/50 space-y-4">
            <h4 className="font-display font-bold text-md text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>Artist Business Guidelines</span>
            </h4>
            
            <ul className="text-xs text-slate-600 space-y-3 leading-relaxed font-light">
              <li className="flex gap-2">
                <span className="text-amber-500 font-bold shrink-0">•</span>
                <span>You decide your <span className="font-bold">own service prices</span>. The platform never alters your base or quoted rates.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-500 font-bold shrink-0">•</span>
                <span>The platform earns strictly through a minor <span className="font-bold">Platform Fee</span>. The client pays this fee online.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-500 font-bold shrink-0">•</span>
                <span>The remaining service balance <span className="font-bold">₹{artist.basePrice}</span> is paid <span className="font-bold text-emerald-600">directly to you</span> on-site via cash or UPI.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-500 font-bold shrink-0">•</span>
                <span>Client contact details remain <span className="font-bold text-amber-700">hidden</span> until the online platform fee is successfully cleared.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-500 font-bold shrink-0">•</span>
                <span>GPS check-in is <span className="font-bold">mandatory</span> upon arrival at the client venue to verify prompt service.</span>
              </li>
            </ul>
          </div>

          <div className="glass-card p-6 rounded-[24px] border border-slate-200/50 space-y-3 text-center">
            <h5 className="font-display font-bold text-xs text-slate-700 uppercase tracking-wider">Henna Stain Protection Policy</h5>
            <p className="text-xs text-slate-500 leading-relaxed">
              Veltora complies strictly with natural health standards. Only approved, verified, 100% pure organic hand-coned Henna leaves can be applied. Chemical "Black Henna" is strictly prohibited.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
