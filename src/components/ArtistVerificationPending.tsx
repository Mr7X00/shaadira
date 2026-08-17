import React, { useState, useEffect } from "react";
import { ArtistProfile, VerificationStatus } from "../types";
import { db, auth } from "../lib/firebase";
import { signOut } from "firebase/auth";
import { collection, addDoc, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { 
  Clock, 
  ShieldAlert, 
  Award, 
  MessageSquare, 
  Lightbulb, 
  CheckCircle, 
  ThumbsUp, 
  Send,
  Sparkles,
  Phone,
  MapPin,
  Lock
} from "lucide-react";

interface ArtistVerificationPendingProps {
  artist: ArtistProfile;
  onLogout?: () => void;
}

interface FeedbackItem {
  id: string;
  name: string;
  role: string;
  rating: number;
  category: string;
  suggestion: string;
  timestamp: string;
}

export default function ArtistVerificationPending({ artist, onLogout }: ArtistVerificationPendingProps) {
  const [feedbackCategory, setFeedbackCategory] = useState("Feature Idea");
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [suggestion, setSuggestion] = useState("");
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Live query for existing feedback
  useEffect(() => {
    if (!db) return;
    try {
      const q = query(
        collection(db, "feedback"),
        orderBy("timestamp", "desc"),
        limit(10)
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list: FeedbackItem[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as FeedbackItem);
        });
        setFeedbacks(list);
      }, (err) => {
        console.error("Failed to stream network feedback:", err);
      });
      return () => unsubscribe();
    } catch (err) {
      console.warn("ArtistVerificationPending Firebase Error:", err);
    }
  }, []);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestion.trim()) return;

    setIsSubmitting(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      await addDoc(collection(db, "feedback"), {
        name: artist.name,
        role: "ARTIST",
        rating: Number(feedbackRating),
        category: feedbackCategory,
        suggestion: suggestion.trim(),
        timestamp: new Date().toISOString()
      });
      setSuccessMsg("Your proposal has been securely logged on the Veltora feedback ledger!");
      setSuggestion("");
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch (err: any) {
      console.error("Feedback creation failed:", err);
      setErrorMsg("Failed to sync feedback with Firestore: " + (err.message || "Insufficient permissions"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans relative overflow-x-hidden py-10 px-4 md:px-8">
      {/* Background glow flares */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-blue-600/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-indigo-600/5 blur-[150px] rounded-full pointer-events-none" />

      {/* Header Bar */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between pb-6 border-b border-slate-800 relative z-10">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center font-display font-black text-white text-lg tracking-wider">
            S
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wider text-white">SHAADIRA NEXUS</h1>
            <p className="text-[9px] font-mono text-slate-500 tracking-widest uppercase">Artist Workspace</p>
          </div>
        </div>

        <button 
          onClick={() => {
            if (onLogout) {
              onLogout();
            } else {
              signOut(auth);
            }
          }}
          className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-md"
        >
          Sign Out Session
        </button>
      </div>

      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 mt-10 relative z-10">
        
        {/* LEFT COLUMN: Verification Pending Status Panel */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Main Status card */}
          <div className="bg-slate-950/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-[0_0_50px_rgba(59,130,246,0.05)] space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-[10px] font-mono uppercase tracking-wider animate-pulse">
              <Clock className="w-3.5 h-3.5" />
              <span>Identity Audit In Progress</span>
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white leading-tight">
                WELCOME, <span className="text-blue-400">{(artist?.name || "ARTIST").toUpperCase()}</span>
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed font-light">
                Your application has been securely transmitted and logged. Our global operations team is currently validating your portfolio, professional billing coordinates, and uploaded national identification credentials.
              </p>
            </div>

            {/* Profile specifications list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900/40 border border-slate-800 p-4 rounded-2xl text-xs font-mono text-slate-300">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="text-slate-500">Status:</span>
                <span className="text-amber-400 font-bold">AUDIT_PENDING</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="text-slate-500">Specialty:</span>
                <span className="text-slate-100 font-bold">{artist?.category || "Bridal / Mehndi"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="text-slate-500">Mobile:</span>
                <span className="text-slate-100 font-bold">{artist?.phone || "Linked"}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="text-slate-500">Base Rate:</span>
                <span className="text-slate-100 font-bold">₹{artist?.basePrice || "1000"}</span>
              </div>
            </div>

            {/* Support notification banner */}
            <div className="border border-blue-500/10 bg-blue-500/5 p-4 rounded-2xl text-xs text-blue-300 leading-relaxed flex gap-3">
              <ShieldAlert className="w-5 h-5 shrink-0 text-blue-400 mt-0.5" />
              <p>
                Our verification process typically takes up to <strong>12 to 24 hours</strong>. Once approved, your profile will immediately go live on the SHAADIRA marketplace and you can negotiate directly with clients!
              </p>
            </div>
          </div>

          {/* Golden Rules / Best practices section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 font-mono">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span>Steps & Best Practices to Become a Top Artist</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <div className="bg-slate-950/20 border border-slate-800 p-5 rounded-2xl space-y-3 hover:border-slate-700 transition-all">
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg inline-block text-xs font-mono font-bold">01</div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Certified Cones</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed font-light">
                  SHAADIRA has a zero-tolerance policy for chemical dyes. Only apply verified, 100% organic hand-coned Henna.
                </p>
              </div>

              <div className="bg-slate-950/20 border border-slate-800 p-5 rounded-2xl space-y-3 hover:border-slate-700 transition-all">
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg inline-block text-xs font-mono font-bold">02</div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Define Coordinates</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed font-light">
                  Input detailed coordinates of your billing and studio locations to double your local matching rate.
                </p>
              </div>

              <div className="bg-slate-950/20 border border-slate-800 p-5 rounded-2xl space-y-3 hover:border-slate-700 transition-all">
                <div className="p-2 bg-violet-500/10 text-violet-400 rounded-lg inline-block text-xs font-mono font-bold">03</div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Upload Crisp Stain Proofs</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed font-light">
                  Taking clean, well-lit close up shots of completed stains speeds up client escrow fee releases.
                </p>
              </div>

            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Feedback, Roadmap & Upgrades */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Feedback input form */}
          <div className="bg-slate-950/45 backdrop-blur-3xl border border-white/10 rounded-3xl p-6 shadow-[0_0_50px_rgba(59,130,246,0.05)] space-y-5">
            <div className="space-y-1.5">
              <h3 className="text-md font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb className="w-5 h-5 text-amber-500 animate-pulse" />
                <span>CO-BUILD SHAADIRA ROADMAP</span>
              </h3>
              <p className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">
                Submit Customer Reviews, Suggestions & Upgrade Ideas
              </p>
            </div>

            {successMsg && (
              <div className="bg-blue-500/10 border border-blue-500/20 text-blue-300 p-3 rounded-xl text-xs flex gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 text-blue-400 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-3 rounded-xl text-xs flex gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono text-slate-500 tracking-wider block uppercase">FEEDBACK CATEGORY</label>
                <div className="grid grid-cols-2 gap-2">
                  {["Feature Idea", "Client Review", "UI Upgrade", "Operational"].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      className={`py-2 px-3 border rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer text-center ${
                        feedbackCategory === cat
                          ? "border-blue-500 bg-blue-950/30 text-blue-300"
                          : "border-slate-850 bg-slate-900/30 text-slate-500 hover:text-slate-300"
                      }`}
                      onClick={() => setFeedbackCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-mono text-slate-500 tracking-wider block uppercase">SATISFACTION RATING ({feedbackRating}/5)</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`text-xl transition-all cursor-pointer ${
                        star <= feedbackRating ? "text-amber-500 scale-110" : "text-slate-700"
                      }`}
                      onClick={() => setFeedbackRating(star)}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-mono text-slate-500 tracking-wider block uppercase">YOUR PROPOSAL & UPGRADE IDEA</label>
                <textarea
                  required
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-blue-500 h-24 resize-none transition-all placeholder:text-slate-600"
                  placeholder="e.g. Include instant offline secure UPI routing on-site..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !suggestion.trim()}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-extrabold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(37,99,235,0.2)] cursor-pointer"
              >
                {isSubmitting ? (
                  <span>TRANSMITTING KEYS...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>TRANSMIT PROPOSAL</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Live scrolling network activity logs */}
          <div className="bg-slate-950/20 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-blue-500" />
              <span>LIVE ROADMAP LEDGER ({feedbacks.length})</span>
            </h4>

            {feedbacks.length === 0 ? (
              <p className="text-[10px] text-slate-600 font-mono italic">Synchronizing roadmap stream...</p>
            ) : (
              <div className="space-y-3.5 max-h-56 overflow-y-auto pr-1">
                {feedbacks.map((f) => (
                  <div key={f.id} className="p-3 bg-slate-900/30 border border-slate-850 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-[9px] font-mono text-slate-500">
                      <span className="text-slate-300 font-bold">{f.name}</span>
                      <span className="px-1.5 py-0.5 bg-blue-950/40 text-blue-400 rounded uppercase">{f.category}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-light leading-relaxed">
                      "{f.suggestion}"
                    </p>
                    <div className="flex items-center gap-2 text-[9px] font-mono text-slate-600">
                      <span>★ {f.rating}/5</span>
                      <span>•</span>
                      <span>{f.timestamp ? new Date(f.timestamp).toLocaleDateString() : ""}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
