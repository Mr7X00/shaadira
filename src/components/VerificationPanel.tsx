import { ArtistProfile, VerificationStatus } from "../types";
import { ShieldAlert, FileText, Check, X, ShieldCheck, Clock, User, Eye } from "lucide-react";

interface VerificationPanelProps {
  artists: ArtistProfile[];
  onVerifyArtist: (artistId: string, status: VerificationStatus) => void;
}

export default function VerificationPanel({ artists, onVerifyArtist }: VerificationPanelProps) {
  const pendingArtists = artists.filter(a => a.verified === VerificationStatus.PENDING);
  const otherArtists = artists.filter(a => a.verified !== VerificationStatus.PENDING);

  return (
    <div id="operations-verification-module" className="max-w-7xl mx-auto px-4 py-8 space-y-8 font-sans">
      
      {/* Overview stats block */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h3 className="font-display font-bold text-2xl text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-purple-600 animate-pulse" />
            <span>Operations Executive Board</span>
          </h3>
          <p className="text-xs text-slate-500">Perform manual verification of artist applications, govt credentials, and henna safety compliance.</p>
        </div>

        <div className="flex gap-2">
          <span className="px-3.5 py-1.5 bg-purple-50 text-purple-700 text-xs font-bold rounded-xl border border-purple-100">
            {pendingArtists.length} Awaiting Verification
          </span>
          <span className="px-3.5 py-1.5 bg-slate-50 text-slate-600 text-xs font-bold rounded-xl border border-slate-100">
            {artists.length} Total Registered
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left main: Pending applications list */}
        <div className="lg:col-span-8 space-y-6">
          <h4 className="font-display font-bold text-md text-slate-900 flex items-center gap-1.5">
            <FileText className="w-5 h-5 text-purple-600" />
            <span>Pending Applications ({pendingArtists.length})</span>
          </h4>

          {pendingArtists.length === 0 ? (
            <div className="glass-card p-12 text-center rounded-[24px] border border-dashed border-slate-300">
              <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h5 className="font-display font-bold text-slate-700">All Clear!</h5>
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
                      onClick={() => onVerifyArtist(art.id, VerificationStatus.REJECTED)}
                      className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl border border-rose-100 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>Reject Application</span>
                    </button>
                    <button
                      id={`verify-approve-btn-${art.id}`}
                      onClick={() => onVerifyArtist(art.id, VerificationStatus.APPROVED)}
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
          <h4 className="font-display font-bold text-md text-slate-900 flex items-center gap-1.5">
            <Clock className="w-5 h-5 text-slate-500" />
            <span>Audit Registry ({otherArtists.length})</span>
          </h4>

          <div className="glass-card rounded-[24px] overflow-hidden border border-slate-200/50 p-4 divide-y divide-slate-100">
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

          <div className="glass-card p-5 rounded-[24px] border border-slate-200/50 space-y-3">
            <h5 className="font-display font-bold text-xs text-slate-800 uppercase tracking-wider">Henna Quality Mandate</h5>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Every Mehndi Artist listed on Veltora must provide photographs or certificates showing they prepare hand-made organic henna cones. Operational Executives must conduct random quality calls periodically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
