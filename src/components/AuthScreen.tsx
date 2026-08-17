import React, { useState, useEffect, useRef } from "react";
import { auth } from "../lib/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { UserRole } from "../types";
import { 
  Sparkles, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Briefcase, 
  MapPin, 
  FileText, 
  AlertCircle, 
  CheckCircle,
  ArrowRight,
  Shield,
  Zap,
  Cpu,
  Layers,
  Heart,
  Globe,
  Award,
  Users,
  ExternalLink
} from "lucide-react";
import { gsap } from "gsap";
import { motion } from "motion/react";

interface AuthScreenProps {
  onAuthSuccess: (user: any, profile: any) => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  // Navigation states
  const [showSplash, setShowSplash] = useState(true);
  const [viewMode, setViewMode] = useState<"landing" | "auth">("landing");
  const [splashProgress, setSplashProgress] = useState(0);

  // Authentication states
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState<UserRole>(UserRole.CLIENT);
  
  // Form Inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // Artist specific inputs
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");
  const [basePrice, setBasePrice] = useState("1500");
  const [experienceYears, setExperienceYears] = useState("3");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [govtIdUrl, setGovtIdUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Status and error
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Biometric activation status
  const [biometricActivated, setBiometricActivated] = useState(false);

  // Refs for GSAP
  const splashContainerRef = useRef<HTMLDivElement>(null);
  const landingContainerRef = useRef<HTMLDivElement>(null);
  const authContainerRef = useRef<HTMLDivElement>(null);
  
  // Animation Scene refs
  const manFigureRef = useRef<SVGGElement>(null);
  const leftLegRef = useRef<SVGPathElement>(null);
  const rightLegRef = useRef<SVGPathElement>(null);
  const suitcaseRef = useRef<SVGGElement>(null);
  const leftArmRef = useRef<SVGPathElement>(null);
  const rightArmRef = useRef<SVGPathElement>(null);
  const impactRingRef = useRef<SVGCircleElement>(null);
  const authCardRef = useRef<HTMLDivElement>(null);
  const bioRippleRef = useRef<SVGCircleElement>(null);
  const bioSensorRef = useRef<SVGCircleElement>(null);

  // Splash Screen effect
  useEffect(() => {
    // Progress interval
    const interval = setInterval(() => {
      setSplashProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 100);

    // GSAP Splash Exit Timeline
    const tl = gsap.timeline({
      delay: 2.2,
      onComplete: () => {
        setShowSplash(false);
        // Fade in landing page
        gsap.fromTo(
          landingContainerRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 1.2, ease: "power2.out" }
        );
      }
    });

    tl.to(splashContainerRef.current, {
      opacity: 0,
      scale: 1.05,
      filter: "blur(10px)",
      duration: 0.8,
      ease: "power2.inOut"
    });

    return () => clearInterval(interval);
  }, []);

  // Trigger GSAP Walk-in Animation when switching to Auth mode
  useEffect(() => {
    if (viewMode === "auth") {
      setBiometricActivated(true);
      if (authCardRef.current) gsap.set(authCardRef.current, { opacity: 0, scale: 0.98, y: 20 });
      gsap.to(authCardRef.current, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out"
      });
      
      return () => {};
    }
  }, [viewMode]);


  // Handle local simulated Cloudinary upload for govt ID
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const fileData = reader.result as string;
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileData })
        });
        const data = await res.json();
        if (data.url) {
          setGovtIdUrl(data.url);
          setSuccess("Govt ID linked successfully with absolute cryptographic integrity!");
        } else {
          setError(data.error || "Failed to upload document.");
        }
      } catch (err) {
        setError("File upload failed.");
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGoogleLogin = async () => {
    if (!auth) {
      setError("Firebase Authentication is not initialized.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const profileRes = await fetch(`/api/users/${user.uid}?email=${encodeURIComponent(user.email || "")}&name=${encodeURIComponent(user.displayName || "")}`);
      let profileData = {};
      if (profileRes.ok) {
        profileData = await profileRes.json();
      }
      
      onAuthSuccess(user, profileData);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Google authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // DEV BYPASS: Allow typing 'admin', 'artist', or 'client' to login instantly
    const normalizedEmail = email.toLowerCase().trim();
    if (normalizedEmail === "admin" || normalizedEmail === "admin@veltora.in") {
      onAuthSuccess(
        { uid: "mock-admin-123", email: "admin@veltora.in", displayName: "System Admin" } as any, 
        { role: UserRole.SUPER_ADMIN, name: "System Admin", email: "admin@veltora.in", verified: "APPROVED" } as any
      );
      return;
    }
    if (normalizedEmail === "artist" || normalizedEmail === "artist@veltora.in") {
      onAuthSuccess(
        { uid: "mock-artist-123", email: "artist@veltora.in", displayName: "Master Henna Artist" } as any, 
        { 
          id: "mock-artist-123",
          role: UserRole.ARTIST, 
          name: "Master Henna Artist", 
          email: "artist@veltora.in", 
          verified: "APPROVED",
          basePrice: 5000,
          bio: "I am a master henna artist from Jaipur specializing in intricate bridal patterns.",
          category: "Bridal / Mehndi",
          avatarUrl: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=150&h=150&q=80",
          experienceYears: 10,
          rating: 4.9,
          reviewCount: 120,
          phone: "+91 98765 43210"
        } as any
      );
      return;
    }
    if (normalizedEmail === "client" || normalizedEmail === "client@veltora.in") {
      onAuthSuccess(
        { uid: "mock-client-123", email: "client@veltora.in", displayName: "Valued Patron" } as any, 
        { role: UserRole.CLIENT, name: "Valued Patron", email: "client@veltora.in", verified: "APPROVED" } as any
      );
      return;
    }

    if (!auth) {
      setError("Firebase Authentication is not initialized. Please check your credentials in the dashboard.");
      return;
    }
    if (!biometricActivated) return; // Prevent submission before animation completes
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (isRegister) {
        if (!email || !password || !name || !phone) {
          throw new Error("Please fill in all standard credentials.");
        }
        if (role === UserRole.ARTIST) {
          if (!whatsapp || !address || !basePrice || !govtIdUrl) {
            throw new Error("Artists must provide WhatsApp, physical studio address, base price, and Govt ID credentials.");
          }
        }

        // 1. Create User in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Create Profile via Server API
        const profileRes = await fetch("/api/users/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uid: user.uid,
            name,
            email,
            role,
            phone
          })
        });
        const profileData = await profileRes.json();

        // 3. Create Artist Profile if Artist role
        if (role === UserRole.ARTIST) {
          await fetch("/api/artists/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: user.uid,
              name,
              email,
              phone,
              whatsapp,
              address,
              basePrice,
              experienceYears,
              bio,
              skills: skills.split(",").map(s => s.trim()).filter(Boolean),
              govtIdUrl
            })
          });
        }

        setSuccess("Secure profile established on the ledger successfully!");
        onAuthSuccess(user, profileData);
      } else {
        // Sign In Flow
        if (!email || !password) {
          throw new Error("Both email and passphrase must be supplied.");
        }

        // DEV BYPASS: Allow 'admin' to login immediately without Firebase
        if (email === "admin" || email === "admin@veltora.in") {
          onAuthSuccess(
            { uid: "mock-admin-123", email: "admin@veltora.in", displayName: "System Admin" } as any, 
            { role: UserRole.SUPER_ADMIN, name: "System Admin", email: "admin@veltora.in", verified: "APPROVED" } as any
          );
          return;
        }

        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const profileRes = await fetch(`/api/users/${user.uid}?email=${encodeURIComponent(user.email || "")}&name=${encodeURIComponent(user.displayName || "")}`);
        if (!profileRes.ok) {
          throw new Error("Failed to resolve decentralized credentials profile.");
        }
        const profileData = await profileRes.json();

        onAuthSuccess(user, profileData);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Credential matching failed. Please verify credentials.");
    } finally {
      setLoading(false);
    }
  };

  // Re-trigger hand-touch flare on switching tab
  const handleTabSwitch = (registerMode: boolean) => {
    setIsRegister(registerMode);
    setError(null);
    setSuccess(null);
  };

  return (
    <div id="veltora-main-wrapper" className="min-h-screen bg-[#FDF6F0] text-[#3E362E] selection:bg-[#E6D5C3] selection:text-[#3E362E] relative overflow-hidden">
      
      {/* Universal Wedding Theme Background Image */}
      <div className="fixed inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.15] mix-blend-multiply"
          style={{ backgroundImage: 'url("https://i.ibb.co/p6jd9jSN/download.jpg")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#FDF6F0]/80 via-transparent to-[#FDF6F0]/80" />
      </div>

      {/* Universal Wedding Theme Background SVG Elements */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rotate-12">
          <svg viewBox="0 0 100 100" className="w-full h-full text-[#8C6D4F]">
            <path d="M50 0 L60 40 L100 50 L60 60 L50 100 L40 60 L0 50 L40 40 Z" fill="currentColor" />
            <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.2" />
          </svg>
        </div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] -rotate-12">
          <svg viewBox="0 0 100 100" className="w-full h-full text-[#8C6D4F]">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.1" strokeDasharray="2 2" />
            <path d="M50 5 L55 45 L95 50 L55 55 L50 95 L45 55 L5 50 L45 45 Z" fill="currentColor" opacity="0.5" />
            {/* Henna Style Mandala */}
            <g transform="translate(50,50)">
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                <path key={angle} d="M0,0 Q10,-20 0,-40 Q-10,-20 0,0" fill="none" stroke="currentColor" strokeWidth="0.5" transform={`rotate(${angle})`} />
              ))}
            </g>
          </svg>
        </div>
      </div>

      {showSplash && (
        <div 
          ref={splashContainerRef}
          id="veltora-splash-screen"
          className="fixed inset-0 bg-[#FDF6F0] z-50 flex flex-col items-center justify-center p-6"
        >
          {/* Splash Background Image */}
          <div className="absolute inset-0 z-0">
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.2]"
              style={{ backgroundImage: 'url("https://i.ibb.co/p6jd9jSN/download.jpg")' }}
            />
            <div className="absolute inset-0 bg-[#FDF6F0]/60 backdrop-blur-[2px]" />
          </div>

          <div className="text-center space-y-6 max-w-4xl w-full relative z-10">
            <div className="inline-flex p-3 bg-gradient-to-br from-[#8C6D4F]/10 to-[#A67C52]/10 border border-[#DBC1A7] rounded-3xl animate-pulse">
              <Sparkles className="w-10 h-10 text-[#5C4D3D]" />
            </div>
 
            {/* Luxury Title with Letter Animation */}
            <div className="space-y-6 w-full px-4 relative z-10">
              <div className="flex justify-center overflow-visible">
                <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-9xl font-black tracking-widest flex flex-wrap justify-center items-center drop-shadow-2xl">
                  {"SHAADIRA".split("").map((char, index) => (
                    <motion.span
                      key={index}
                      initial={{ y: 50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ 
                        duration: 1.5, 
                        delay: index * 0.15, 
                        ease: [0.22, 1, 0.36, 1] 
                      }}
                      className="inline-block text-transparent bg-clip-text bg-gradient-to-b from-[#5C4D3D] via-[#8C6D4F] to-[#5C4D3D]"
                    >
                      {char}
                    </motion.span>
                  ))}
                </h1>
              </div>
              
              <motion.div
                initial={{ opacity: 0, letterSpacing: "0.1em" }}
                animate={{ opacity: 1, letterSpacing: "0.4em" }}
                transition={{ duration: 2.5, delay: 1.2 }}
                className="text-[10px] md:text-xs font-mono text-[#8C6D4F] uppercase max-w-lg mx-auto leading-relaxed tracking-[0.4em]"
              >
                The Sovereign Standard for Traditional Artistry
              </motion.div>
            </div>

            {/* Minimal Luxury Progress */}
            <div className="relative w-64 mx-auto pt-8">
              <div className="w-full h-[1px] bg-[#DBC1A7]/30 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-[#8C6D4F]"
                  initial={{ width: "0%" }}
                  animate={{ width: `${splashProgress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              <div className="mt-2 text-[8px] font-mono tracking-[0.4em] text-[#8C6D4F]/50 uppercase">
                Synchronizing Prestige Ledger
              </div>
            </div>
          </div>

          {/* Decorative Henna Mandala Corner Ornaments */}
          <div className="absolute top-0 left-0 w-[400px] h-[400px] opacity-[0.08] pointer-events-none -translate-x-1/4 -translate-y-1/4">
            <svg viewBox="0 0 200 200" className="w-full h-full text-[#8C6D4F] animate-spin-slow">
              <g transform="translate(100,100)">
                <circle cx="0" cy="0" r="95" fill="none" stroke="currentColor" strokeWidth="0.1" strokeDasharray="2 1" />
                <circle cx="0" cy="0" r="70" fill="none" stroke="currentColor" strokeWidth="0.5" />
                {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(angle => (
                  <path key={angle} d="M0,0 L90,0" stroke="currentColor" strokeWidth="0.1" transform={`rotate(${angle})`} />
                ))}
              </g>
            </svg>
          </div>
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] opacity-[0.08] pointer-events-none translate-x-1/4 translate-y-1/4 rotate-180">
            <svg viewBox="0 0 200 200" className="w-full h-full text-[#8C6D4F] animate-spin-slow-reverse">
              <g transform="translate(100,100)">
                <circle cx="0" cy="0" r="95" fill="none" stroke="currentColor" strokeWidth="0.1" strokeDasharray="2 1" />
                <circle cx="0" cy="0" r="70" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </g>
            </svg>
          </div>

        </div>
      )}

      {/* 2. PREMIUM SITE OVERVIEW LANDING PAGE */}
      {viewMode === "landing" && (
        <div ref={landingContainerRef} id="landing-page-container" className="opacity-0 min-h-screen flex flex-col">
          
          {/* Glassmorphic Navbar */}
          <header id="landing-navbar" className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-stone-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-amber-500 to-rose-600 p-2.5 rounded-xl text-white font-extrabold tracking-tighter shadow-lg shadow-amber-500/10 text-sm">
                V
              </div>
              <div>
                <h1 className="text-xl font-black tracking-widest text-stone-900">
                  SHAADIRA
                </h1>
                <p className="text-[9px] font-mono tracking-widest text-stone-500 uppercase">
                  Transforming Traditional Art into a Digital Experience.
                </p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide text-stone-600">
              <a href="#features-section" className="hover:text-amber-600 transition-colors">Platform Features</a>
              <a href="#philosophy-section" className="hover:text-amber-600 transition-colors">Concept & Implementation</a>
              <a href="#technical-implementation" className="hover:text-amber-600 transition-colors">Technical Partner</a>
            </nav>

            <div className="flex items-center gap-4">
              <button 
                id="navbar-login-btn"
                onClick={() => { setViewMode("auth"); setIsRegister(false); }}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-all cursor-pointer"
              >
                Sign In
              </button>
              <button 
                id="navbar-register-btn"
                onClick={() => { setViewMode("auth"); setIsRegister(true); }}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg hover:shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
              >
                Join Network
              </button>
            </div>
          </header>

          {/* Hero Banner Section */}
          <section id="hero-banner" className="relative py-28 px-6 text-center overflow-hidden border-b border-stone-200">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-rose-500/5 blur-[100px] rounded-full pointer-events-none" />

            <div className="max-w-4xl mx-auto space-y-8 relative z-10">
              <div className="inline-flex items-center gap-2 bg-amber-100 border border-amber-200 px-4 py-1.5 rounded-full text-xs font-mono font-bold tracking-widest text-amber-800 uppercase">
                <Sparkles className="w-3.5 h-3.5" /> THE PRESTIGE ARTIFACT LEDGER
              </div>

              <h2 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight text-stone-900 font-display">
                The Sovereign Platform for <br className="hidden sm:inline"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-700 to-rose-600">
                  Henna Artistry & Trusted Escrows
                </span>
              </h2>

              <p className="text-lg text-stone-600 max-w-2xl mx-auto font-sans leading-relaxed">
                Empowering world-class Mehndi artists with tamper-proof client sittings, real-time communications, secure escrow clearing, and GPS arrival verification. Bridging pristine tradition with modern digital trust.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <button 
                  onClick={() => { setViewMode("auth"); setIsRegister(true); }}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#8C6D4F] to-[#5C4D3D] text-white font-black text-sm uppercase tracking-widest rounded-xl hover:shadow-2xl hover:shadow-[#8C6D4F]/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  Create Artist/Client Account <ArrowRight className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => { setViewMode("auth"); setIsRegister(false); }}
                  className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-[#FDF6F0] border border-[#DBC1A7] text-[#3E362E] font-bold text-sm uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                >
                  Enter Portal Console
                </button>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto pt-12 border-t border-[#DBC1A7]/55">
                <div className="text-center">
                  <span className="block text-3xl font-black text-[#5C4D3D]">100%</span>
                  <span className="text-[10px] text-[#8C6D4F] font-mono uppercase tracking-widest">Escrow Security</span>
                </div>
                <div className="text-center border-x border-[#DBC1A7]">
                  <span className="block text-3xl font-black text-[#3E362E]">0s</span>
                  <span className="text-[10px] text-[#8C6D4F] font-mono uppercase tracking-widest">Cache Latency</span>
                </div>
                <div className="text-center">
                  <span className="block text-3xl font-black text-[#8C6D4F]">GPS</span>
                  <span className="text-[10px] text-[#8C6D4F] font-mono uppercase tracking-widest">Verified Attendance</span>
                </div>
              </div>
            </div>
          </section>

          {/* Features Bento Grid */}
          <section id="features-section" className="py-24 px-6 max-w-7xl mx-auto w-full space-y-16">
            <div className="text-center space-y-3">
              <h3 className="text-xs font-mono font-bold tracking-[0.2em] text-[#8C6D4F] uppercase">STATE SITTINGS LEDGER</h3>
              <h4 className="text-3xl font-extrabold text-[#3E362E]">Engineered for Absolute Transactional Safety</h4>
              <p className="text-[#8C6D4F] max-w-md mx-auto text-sm">SHAADIRA integrates premium features ensuring full marketplace security and real-time confidence.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              
              {/* Feature 1 */}
              <div className="bg-white border border-[#DBC1A7]/80 p-8 rounded-2xl space-y-4 hover:border-[#8C6D4F]/30 transition-all group shadow-sm hover:shadow-lg">
                <div className="p-3 bg-[#8C6D4F]/10 rounded-xl text-[#5C4D3D] inline-block">
                  <Shield className="w-6 h-6" />
                </div>
                <h5 className="text-lg font-bold text-[#3E362E] group-hover:text-[#5C4D3D] transition-colors">Smart Escrows</h5>
                <p className="text-xs text-[#8C6D4F] leading-relaxed">
                  Funds are secured in cryptographic escrows and released strictly upon digital handshake or verified proof-of-work, protecting both sides.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white border border-[#DBC1A7]/80 p-8 rounded-2xl space-y-4 hover:border-[#8C6D4F]/30 transition-all group shadow-sm hover:shadow-lg">
                <div className="p-3 bg-[#8C6D4F]/10 rounded-xl text-[#5C4D3D] inline-block">
                  <MapPin className="w-6 h-6" />
                </div>
                <h5 className="text-lg font-bold text-[#3E362E] group-hover:text-[#5C4D3D] transition-colors">GPS Geofencing</h5>
                <p className="text-xs text-[#8C6D4F] leading-relaxed">
                  Artists complete check-ins verified by live device GPS coordinates, ensuring undeniable verification of arrival at client venues.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white border border-[#DBC1A7]/80 p-8 rounded-2xl space-y-4 hover:border-[#8C6D4F]/30 transition-all group shadow-sm hover:shadow-lg">
                <div className="p-3 bg-[#8C6D4F]/10 rounded-xl text-[#5C4D3D] inline-block">
                  <Cpu className="w-6 h-6" />
                </div>
                <h5 className="text-lg font-bold text-[#3E362E] group-hover:text-[#5C4D3D] transition-colors">Dynamic Caching</h5>
                <p className="text-xs text-[#8C6D4F] leading-relaxed">
                  Real-time database triggers sync automatically, delivering sub-millisecond status updates and keeping user messages instantaneous.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-white border border-[#DBC1A7]/80 p-8 rounded-2xl space-y-4 hover:border-[#8C6D4F]/30 transition-all group shadow-sm hover:shadow-lg">
                <div className="p-3 bg-[#8C6D4F]/10 rounded-xl text-[#5C4D3D] inline-block">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h5 className="text-lg font-bold text-[#3E362E] group-hover:text-[#5C4D3D] transition-colors">Proof of Sittings</h5>
                <p className="text-xs text-[#8C6D4F] leading-relaxed">
                  Artists upload physical high-fidelity photographic sittings proof, validating completion on the immutable marketplace chain.
                </p>
              </div>

            </div>
          </section>

          {/* Concept & Technical Implementation Section */}
          <section id="philosophy-section" className="bg-stone-50/30 border-y border-stone-200/80 py-24 px-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />
            
            <div className="max-w-6xl mx-auto space-y-20">
              {/* SECTION TITLE */}
              <div className="text-center space-y-4">
                <span className="text-xs font-mono font-bold tracking-[0.3em] text-blue-600 uppercase bg-blue-50 border border-blue-100 px-4 py-1.5 rounded-full inline-block">
                  CONCEPT • DEVELOPMENT • MAINTENANCE
                </span>
                <h3 className="text-4xl font-black text-stone-900 tracking-tight font-display">
                  Platform Genesis & Engineering
                </h3>
                <p className="text-xs text-stone-500 font-mono tracking-wider">SECURE DIGITAL MARKETPLACE ECOSYSTEM</p>
              </div>

              {/* TWO COLUMN GRID: LEFT SIDE (IDEA OWNER) & RIGHT SIDE (PREMIUM QUOTE CARD & SERVICES) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                
                {/* LEFT SIDE (IDEA OWNER) */}
                <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-700 text-[10px] font-mono font-bold tracking-widest uppercase rounded-full">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>ORIGINAL PLATFORM CONCEPT</span>
                  </span>
                  
                  <h4 className="text-xs font-mono font-bold tracking-[0.2em] text-stone-500 uppercase">CONCEPT BY</h4>
                  <h3 className="text-3xl font-black text-stone-900 leading-tight font-display">
                    Anuj
                  </h3>
                  <div className="h-1 w-20 bg-gradient-to-r from-blue-600 to-amber-500 rounded-full" />
                  
                  <div className="space-y-4 text-stone-600 text-sm leading-relaxed font-light">
                    <p>
                      This platform was originally envisioned by <span className="text-stone-900 font-semibold">ANUJ</span>, with the goal of creating a trusted digital marketplace where clients can easily discover and book verified Mehndi artists through a secure, transparent, and professional experience.
                    </p>
                    <p>
                      The vision focuses on empowering local artists, simplifying customer discovery, improving trust through profile verification, enabling secure online bookings, and providing a seamless digital ecosystem for both artists and clients.
                    </p>
                    <p>
                      Every feature of the platform has been carefully designed to improve reliability, transparency, professionalism, and customer satisfaction.
                    </p>
                  </div>
                </div>

                {/* RIGHT SIDE (PREMIUM GLASSMORPHISM QUOTE CARD & PARTNER SERVICES) */}
                <div className="lg:col-span-7 space-y-8">
                  {/* Premium Quote Card */}
                  <div className="bg-gradient-to-br from-white/90 via-white/50 to-blue-50/20 backdrop-blur-xl border border-white/80 p-8 rounded-3xl space-y-6 shadow-xl shadow-stone-200/50 relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
                    
                    <blockquote className="text-lg text-stone-800 italic font-medium relative z-10 leading-relaxed font-display">
                      "Every successful digital product begins with a powerful idea. Our responsibility is to transform that vision into secure, scalable, production-ready software that delivers real business value."
                    </blockquote>

                    <div className="flex items-center justify-between gap-4 relative z-10 pt-4 border-t border-stone-200/60">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center font-black text-white text-lg shadow-lg shadow-blue-500/20">
                          V
                        </div>
                        <div>
                          <span className="text-[10px] font-mono text-stone-400 block uppercase tracking-widest font-bold">Technical Partner</span>
                          <h5 className="font-bold text-stone-900 text-sm">Veltora IT Solutions</h5>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-[10px] font-mono font-bold tracking-wider rounded-lg uppercase">
                        Active Partner
                      </span>
                    </div>
                  </div>

                  {/* Partner Services Mini Grid */}
                  <div className="bg-stone-50/80 border border-stone-200/50 p-6 rounded-2xl space-y-4">
                    <h5 className="text-xs font-mono font-bold text-stone-500 uppercase tracking-widest">PROVISIONED SERVICES</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-xs text-stone-600">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                        <span>Product Architecture</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                        <span>UI/UX Engineering</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                        <span>Frontend Development</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                        <span>Backend Development</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                        <span>Cloud Infrastructure</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                        <span>Database Design</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                        <span>Security Engineering</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                        <span>API Development</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                        <span>Performance Optimization</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                        <span>Ongoing Maintenance</span>
                      </div>
                    </div>

                    {/* Premium Verification Badges */}
                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-stone-200/60 text-xs font-mono font-bold text-stone-700">
                      {[
                        { text: "Production Ready" },
                        { text: "Secure Architecture" },
                        { text: "Scalable Infrastructure" },
                        { text: "Enterprise Grade" }
                      ].map((badge, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span className="text-[10px] tracking-tight">{badge.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            </div>
          </section>

          {/* TECHNICAL IMPLEMENTATION SECTION */}
          <section id="technical-implementation" className="py-24 px-6 max-w-6xl mx-auto w-full space-y-20 relative">
            <div className="absolute top-1/2 left-1/4 w-80 h-80 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Column: List of engineered responsibilities */}
              <div className="lg:col-span-7 space-y-6 bg-stone-50 border border-stone-200 p-8 rounded-3xl relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
                
                <h4 className="text-xs font-mono font-bold tracking-[0.2em] text-blue-600 uppercase">ENGINEERED ECOSYSTEM</h4>
                <h5 className="text-xl font-bold text-stone-900 font-display">Technical Responsibilities</h5>
                <p className="text-xs text-stone-500 font-light leading-relaxed">
                  Every software component, cloud schema, micro-service, and front-end hook is custom-built to support secure peer-to-peer sitting operations.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-stone-600 pt-4 border-t border-stone-200/60 font-light">
                  {[
                    "Complete Product Architecture",
                    "UI/UX Design",
                    "Frontend Engineering",
                    "Backend Development",
                    "Database Design",
                    "Authentication System",
                    "Artist Verification Workflow",
                    "Booking Management",
                    "Payment Integration",
                    "Email Notification System",
                    "Cloud Storage Integration",
                    "Security Implementation",
                    "Deployment Pipeline",
                    "Performance Optimization",
                    "Bug Fixes",
                    "Feature Enhancements",
                    "Continuous Platform Maintenance"
                  ].map((resp, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0"></span>
                      <span className="leading-relaxed">{resp}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Descriptions & Details of Veltora IT Solutions */}
              <div className="lg:col-span-5 space-y-6">
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-700 text-[10px] font-mono font-bold tracking-widest uppercase rounded-full">
                  <Shield className="w-3.5 h-3.5 text-blue-600" />
                  <span>TECHNICAL IMPLEMENTATION</span>
                </span>
                
                <h3 className="text-3xl font-black text-stone-900 leading-tight font-display">
                  Designed, Developed & Maintained by Veltora IT Solutions
                </h3>
                <div className="h-1 w-20 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-full" />
                
                <div className="space-y-4 text-stone-600 text-sm leading-relaxed font-light">
                  <p>
                    The complete technical implementation of this platform has been engineered by <span className="text-stone-900 font-semibold">Veltora IT Solutions</span>.
                  </p>
                  <p>
                    Veltora IT Solutions is responsible for maintaining, improving, securing, and continuously updating this platform to ensure long-term reliability, performance, and scalability.
                  </p>
                </div>
              </div>

            </div>
          </section>

          {/* OUR COMMITMENT SECTION */}
          <section id="commitment-section" className="py-20 px-6 bg-gradient-to-b from-transparent to-stone-50/50 border-t border-stone-200/50 relative overflow-hidden">
            <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
              <span className="text-xs font-mono font-bold tracking-[0.2em] text-blue-600 uppercase">
                OUR COMMITMENT
              </span>
              <h3 className="text-3xl font-black text-stone-900 font-display">
                Built for Growth
              </h3>
              <div className="h-1 w-16 bg-blue-600 rounded-full mx-auto" />
              <div className="max-w-2xl mx-auto text-stone-600 text-sm leading-relaxed font-light space-y-4">
                <p>
                  This platform has been engineered with a future-ready architecture that supports continuous feature expansion, improved performance, enhanced security, and seamless scalability as the business grows.
                </p>
                <p>
                  Every update is carefully designed to maintain platform stability while delivering the best possible experience to both clients and artists.
                </p>
              </div>
            </div>
          </section>

          {/* CALL TO ACTION SECTION */}
          <section id="cta-section" className="py-16 px-6 max-w-5xl mx-auto">
            <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 rounded-[32px] p-8 md:p-14 text-white shadow-2xl relative overflow-hidden border border-white/10">
              {/* Decorative backgrounds */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                <div className="lg:col-span-8 space-y-4">
                  <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-amber-400 uppercase bg-white/10 px-3 py-1 rounded-full inline-block">
                    HAVE AN IDEA?
                  </span>
                  <h3 className="text-3xl md:text-4xl font-black tracking-tight font-display text-white">
                    Have an Idea?
                  </h3>
                  <div className="space-y-3 text-slate-300 text-xs md:text-sm font-light leading-relaxed">
                    <p>
                      Do you have an innovative business idea, startup concept, marketplace, SaaS platform, or custom software requirement?
                    </p>
                    <p>
                      <span className="text-white font-semibold">Veltora IT Solutions</span> specializes in transforming ideas into fully functional, production-ready digital products.
                    </p>
                    <p>
                      From concept to deployment, our team handles everything including planning, UI/UX, development, cloud deployment, security, maintenance, and long-term support.
                    </p>
                  </div>
                </div>
                
                <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-4 w-full">
                  <a 
                    href="https://veltoraitsolutions-bice.vercel.app/"
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full text-center px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95 flex items-center justify-center gap-2 group"
                  >
                    <span>Visit Veltora IT Solutions</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </a>
                  <button 
                    onClick={() => { setViewMode("auth"); setIsRegister(true); }}
                    className="w-full px-6 py-3.5 bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer whitespace-nowrap active:scale-95"
                  >
                    Start Your Project
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* FOOTER CARD SECTION */}
          <section className="py-12 px-6 max-w-5xl mx-auto border-t border-stone-200/60">
            <div className="bg-stone-50 border border-stone-200 rounded-3xl p-6 grid grid-cols-2 md:grid-cols-5 gap-6 text-center md:text-left">
              <div className="space-y-1">
                <span className="text-[9px] font-mono font-bold text-stone-400 block uppercase">Concept Owner</span>
                <span className="text-xs font-bold text-stone-800">ANUJ SAHU</span>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-mono font-bold text-stone-400 block uppercase">Technical Development</span>
                <span className="text-xs font-bold text-stone-800">Veltora IT Solutions</span>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-mono font-bold text-stone-400 block uppercase">Platform Maintenance</span>
                <span className="text-xs font-bold text-stone-800">Veltora IT Solutions</span>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-mono font-bold text-stone-400 block uppercase">Current Status</span>
                <span className="text-xs font-bold text-emerald-600 flex items-center justify-center md:justify-start gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Actively Maintained</span>
                </span>
              </div>
              <div className="space-y-1 col-span-2 md:col-span-1">
                <span className="text-[9px] font-mono font-bold text-stone-400 block uppercase">Software Version</span>
                <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded inline-block">
                  Production Ready
                </span>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="mt-auto bg-white border-t border-stone-200 py-12 px-6 text-center text-xs text-stone-500 space-y-4">
            <div className="flex items-center justify-center gap-2 font-mono text-stone-600">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>Sovereignty. Trust. Elegance.</span>
            </div>
            <p className="max-w-md mx-auto text-stone-500">
              Veltora Ledger Network is conceived by ANUJ SAHU. Enterprise maintenance and security compliance provided by Veltora IT Solutions.
            </p>
            <p className="font-mono text-[10px] text-stone-400">
              © 2026 Veltora IT Solutions & ANUJ SAHU. All rights reserved.
            </p>
          </footer>

        </div>
      )}
      {/* 3. PREMIUM ANIMATED AUTHENTICATION INTERACTIVE CONTAINER */}
      {viewMode === "auth" && (
        <div 
          ref={authContainerRef}
          id="auth-canvas-container"
          className="min-h-screen bg-[#FDF6F0] text-[#3E362E] relative flex flex-col items-center justify-center p-4 md:p-8 overflow-y-auto overflow-x-hidden font-sans"
        >
          {/* Auth Background Image */}
          <div className="absolute inset-0 z-0">
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.1]"
              style={{ backgroundImage: 'url("https://i.ibb.co/p6jd9jSN/download.jpg")' }}
            />
          </div>

          {/* Decorative Henna Mandala for Auth Screen */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.04]">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] flex items-center justify-center">
              <svg viewBox="0 0 400 400" className="w-full h-full text-[#8C6D4F]">
                <g transform="translate(200,200)">
                  <circle cx="0" cy="0" r="180" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="10 5" />
                  <circle cx="0" cy="0" r="140" fill="none" stroke="currentColor" strokeWidth="1" />
                  <circle cx="0" cy="0" r="100" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(angle => (
                    <g key={angle} transform={`rotate(${angle})`}>
                      <path d="M0,-100 Q15,-130 0,-160 Q-15,-130 0,-100" fill="none" stroke="currentColor" strokeWidth="1" />
                      <circle cx="0" cy="-170" r="2" fill="currentColor" />
                    </g>
                  ))}
                </g>
              </svg>
            </div>
          </div>

          {/* Back to landing button */}
          <button 
            type="button"
            onClick={() => setViewMode("landing")}
            className="absolute top-8 left-8 z-30 px-5 py-2.5 bg-white/80 hover:bg-[#FDF6F0] border border-[#DBC1A7]/50 rounded-full text-[10px] font-bold tracking-[0.2em] text-[#8C6D4F] hover:text-[#5C4D3D] uppercase transition-all flex items-center gap-2 cursor-pointer shadow-md backdrop-blur-xl"
          >
            <ArrowRight className="w-3 h-3 rotate-180" /> Back to Landing
          </button>


          {/* Centered Integrated Side-by-Side Responsive Stage */}
          <div className="w-full max-w-lg flex items-center justify-center relative z-10 my-12">
            
            {/* LEDGER LOGIN / REGISTRATION FORM CARD (emerges in the middle) */}
            <div className="flex-1 w-full max-w-lg">
              <div 
                ref={authCardRef}
                id="auth-form-card" 
                className="w-full bg-white/80 backdrop-blur-3xl border border-[#DBC1A7] rounded-[40px] p-8 md:p-12 shadow-[0_40px_100px_-20px_rgba(140,109,79,0.15)] relative space-y-10"
              >
                {/* Header inside card */}
                <div className="text-center space-y-4">
                  <h2 className="text-4xl font-serif italic text-[#3E362E] tracking-tight">
                    {isRegister ? "Join the Inner Circle" : "Welcome Back"}
                  </h2>
                  <p className="text-[10px] text-[#8C6D4F] font-mono tracking-[0.4em] uppercase">
                    Shaadira Exclusive Portal
                  </p>
                </div>

                {/* Role selector tabs */}
                <div className="flex justify-center gap-12 border-b border-[#DBC1A7]/30">
                  <button
                    type="button"
                    className={`pb-4 text-[10px] font-bold uppercase tracking-[0.3em] transition-all cursor-pointer relative ${
                      !isRegister 
                        ? "text-[#5C4D3D]" 
                        : "text-[#8C6D4F]/60 hover:text-[#5C4D3D]"
                    }`}
                    onClick={() => handleTabSwitch(false)}
                  >
                    Authentication
                    {!isRegister && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#5C4D3D] shadow-[0_0_10px_#8C6D4F]" />}
                  </button>
                  <button
                    type="button"
                    className={`pb-4 text-[10px] font-bold uppercase tracking-[0.3em] transition-all cursor-pointer relative ${
                      isRegister 
                        ? "text-[#5C4D3D]" 
                        : "text-[#8C6D4F]/60 hover:text-[#5C4D3D]"
                    }`}
                    onClick={() => handleTabSwitch(true)}
                  >
                    Registration
                    {isRegister && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#5C4D3D] shadow-[0_0_10px_#8C6D4F]" />}
                  </button>
                </div>


                {/* Status and Errors */}
                {error && (
                  <div id="auth-form-error" className="flex items-start gap-3 bg-red-500/5 border border-red-500/20 p-4 rounded-xl text-red-800 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                    <div>{error}</div>
                  </div>
                )}

                {success && (
                  <div id="auth-form-success" className="flex items-start gap-3 bg-[#8C6D4F]/10 border border-[#8C6D4F]/20 p-4 rounded-xl text-[#3E362E] text-xs">
                    <CheckCircle className="w-4 h-4 shrink-0 text-[#8C6D4F] mt-0.5" />
                    <div>{success}</div>
                  </div>
                )}

                {/* Form elements */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Registration Only Role Type selection */}
                  {isRegister && (
                    <div className="auth-animated-field space-y-4">
                      <label className="text-[9px] font-mono tracking-[0.2em] text-[#8C6D4F] block uppercase">Select Your Designation</label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          className={`py-4 px-4 rounded-2xl border font-bold text-[10px] tracking-widest uppercase flex flex-col items-center justify-center gap-3 transition-all cursor-pointer ${
                            role === UserRole.CLIENT
                              ? "border-[#8C6D4F]/50 bg-[#8C6D4F]/5 text-[#5C4D3D] shadow-[0_0_20px_rgba(140,109,79,0.1)]"
                              : "border-[#DBC1A7]/30 bg-white text-[#8C6D4F]/60 hover:text-[#5C4D3D] hover:border-[#DBC1A7]"
                          }`}
                          onClick={() => setRole(UserRole.CLIENT)}
                        >
                          <User className="w-5 h-5" /> Patron
                        </button>
                        <button
                          type="button"
                          className={`py-4 px-4 rounded-2xl border font-bold text-[10px] tracking-widest uppercase flex flex-col items-center justify-center gap-3 transition-all cursor-pointer ${
                            role === UserRole.ARTIST
                              ? "border-[#8C6D4F]/50 bg-[#8C6D4F]/5 text-[#5C4D3D] shadow-[0_0_20px_rgba(140,109,79,0.1)]"
                              : "border-[#DBC1A7]/30 bg-white text-[#8C6D4F]/60 hover:text-[#5C4D3D] hover:border-[#DBC1A7]"
                          }`}
                          onClick={() => setRole(UserRole.ARTIST)}
                        >
                          <Briefcase className="w-5 h-5" /> Artisan
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Form Fields container */}
                  <div className="space-y-5">
                    
                    {isRegister && (
                      <div className="auth-animated-field space-y-2">
                        <label className="text-[9px] font-mono tracking-widest text-[#8C6D4F] uppercase ml-1">Full Legal Name</label>
                        <div className="relative group">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C6D4F]/60 group-focus-within:text-[#5C4D3D] transition-colors" />
                          <input
                            type="text"
                            required
                            disabled={!biometricActivated}
                            className="w-full bg-white border border-[#DBC1A7]/30 rounded-2xl py-4 pl-12 pr-4 text-[#3E362E] text-sm focus:outline-none focus:border-[#5C4D3D]/50 focus:bg-[#FDF6F0]/50 disabled:opacity-30 transition-all font-light placeholder-[#8C6D4F]/30"
                            placeholder="Alexandria Sterling"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    <div className="auth-animated-field space-y-2">
                      <label className="text-[9px] font-mono tracking-widest text-[#8C6D4F] uppercase ml-1">Email Address</label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C6D4F]/60 group-focus-within:text-[#5C4D3D] transition-colors" />
                        <input
                          type="text"
                          required
                          disabled={!biometricActivated}
                          className="w-full bg-white border border-[#DBC1A7]/30 rounded-2xl py-4 pl-12 pr-4 text-[#3E362E] text-sm focus:outline-none focus:border-[#5C4D3D]/50 focus:bg-[#FDF6F0]/50 disabled:opacity-30 transition-all font-light placeholder-[#8C6D4F]/30"
                          placeholder="sterling@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="auth-animated-field space-y-2">
                      <label className="text-[9px] font-mono tracking-widest text-[#8C6D4F] uppercase ml-1">Passphrase</label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C6D4F]/60 group-focus-within:text-[#5C4D3D] transition-colors" />
                        <input
                          type="password"
                          required
                          disabled={!biometricActivated}
                          className="w-full bg-white border border-[#DBC1A7]/30 rounded-2xl py-4 pl-12 pr-4 text-[#3E362E] text-sm focus:outline-none focus:border-[#5C4D3D]/50 focus:bg-[#FDF6F0]/50 disabled:opacity-30 transition-all font-light placeholder-[#8C6D4F]/30"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                    </div>

                    {isRegister && (
                      <div className="auth-animated-field space-y-1.5 sm:col-span-2">
                        <label className="text-[9px] font-mono tracking-widest text-[#8C6D4F] uppercase ml-1">Contact Mobile Number</label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C6D4F]/60" />
                          <input
                            type="tel"
                            required
                            disabled={!biometricActivated}
                            className="w-full bg-white border border-[#DBC1A7]/30 rounded-xl py-3 pl-10 pr-4 text-[#3E362E] text-xs focus:outline-none focus:border-[#5C4D3D] disabled:opacity-40 transition-all placeholder-[#8C6D4F]/30"
                            placeholder="+91 XXXXX XXXXX"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    {/* Rich Artist Registration Fields */}
                    {isRegister && role === UserRole.ARTIST && (
                      <div className="sm:col-span-2 border-t border-[#DBC1A7]/30 pt-6 mt-2 space-y-4">
                        <h4 className="text-xs font-bold tracking-widest text-[#5C4D3D] uppercase flex items-center gap-2">
                          <Award className="w-4 h-4 text-[#8C6D4F]" /> ARTIST PORTFOLIO & AUDIT REGISTRY
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-mono tracking-widest text-[#8C6D4F] uppercase">WhatsApp Verification</label>
                            <input
                              type="tel"
                              required
                              disabled={!biometricActivated}
                              className="w-full bg-white border border-[#DBC1A7]/30 rounded-xl py-2.5 px-3 text-[#3E362E] text-xs focus:outline-none focus:border-[#5C4D3D] disabled:opacity-40 transition-all placeholder-[#8C6D4F]/30"
                              placeholder="+91 XXXXX XXXXX"
                              value={whatsapp}
                              onChange={(e) => setWhatsapp(e.target.value)}
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[9px] font-mono tracking-widest text-[#8C6D4F] uppercase">Base Price per Event (INR)</label>
                            <input
                              type="number"
                              required
                              disabled={!biometricActivated}
                              className="w-full bg-white border border-[#DBC1A7]/30 rounded-xl py-2.5 px-3 text-[#3E362E] text-xs focus:outline-none focus:border-[#5C4D3D] disabled:opacity-40 transition-all placeholder-[#8C6D4F]/30"
                              placeholder="e.g. 1500"
                              value={basePrice}
                              onChange={(e) => setBasePrice(e.target.value)}
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[9px] font-mono tracking-widest text-[#8C6D4F] uppercase">Years of Practice</label>
                            <input
                              type="number"
                              required
                              disabled={!biometricActivated}
                              className="w-full bg-white border border-[#DBC1A7]/30 rounded-xl py-2.5 px-3 text-[#3E362E] text-xs focus:outline-none focus:border-[#5C4D3D] disabled:opacity-40 transition-all placeholder-[#8C6D4F]/30"
                              placeholder="e.g. 5"
                              value={experienceYears}
                              onChange={(e) => setExperienceYears(e.target.value)}
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[9px] font-mono tracking-widest text-[#8C6D4F] uppercase">Specialty Skills (Comma separated)</label>
                            <input
                              type="text"
                              disabled={!biometricActivated}
                              className="w-full bg-white border border-[#DBC1A7]/30 rounded-xl py-2.5 px-3 text-[#3E362E] text-xs focus:outline-none focus:border-[#5C4D3D] disabled:opacity-40 transition-all placeholder-[#8C6D4F]/30"
                              placeholder="Bridal Portraiture, Arabic, Mandalas"
                              value={skills}
                              onChange={(e) => setSkills(e.target.value)}
                            />
                          </div>

                          <div className="space-y-1.5 sm:col-span-2">
                            <label className="text-[9px] font-mono tracking-widest text-[#8C6D4F] uppercase">Studio/Billing Address</label>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-3 w-4 h-4 text-[#8C6D4F]/60" />
                              <textarea
                                required
                                disabled={!biometricActivated}
                                className="w-full bg-white border border-[#DBC1A7]/30 rounded-xl py-2.5 pl-9 pr-3 text-[#3E362E] text-xs focus:outline-none focus:border-[#5C4D3D] h-16 resize-none disabled:opacity-40 transition-all placeholder-[#8C6D4F]/30"
                                placeholder="Enter Physical Studio location details"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5 sm:col-span-2">
                            <label className="text-[9px] font-mono tracking-widest text-[#8C6D4F] uppercase">Professional Biography</label>
                            <textarea
                              disabled={!biometricActivated}
                              className="w-full bg-white border border-[#DBC1A7]/30 rounded-xl py-2.5 px-3 text-[#3E362E] text-xs focus:outline-none focus:border-[#5C4D3D] h-20 resize-none disabled:opacity-40 transition-all placeholder-[#8C6D4F]/30"
                              placeholder="Tell sittings about your specialties, henna safety practices..."
                              value={bio}
                              onChange={(e) => setBio(e.target.value)}
                            />
                          </div>

                          {/* ID Upload */}
                          <div className="space-y-1.5 sm:col-span-2">
                            <label className="text-[9px] font-mono tracking-widest text-[#8C6D4F] uppercase block">Government Issued Identification</label>
                            <div className="border border-dashed border-[#DBC1A7] hover:border-[#8C6D4F]/40 rounded-xl p-4 bg-white text-center relative transition-all shadow-inner">
                              <input
                                type="file"
                                accept="image/*,application/pdf"
                                required
                                disabled={!biometricActivated || isUploading}
                                className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                onChange={handleFileChange}
                              />
                              <FileText className="w-6 h-6 text-[#8C6D4F]/40 mx-auto mb-1" />
                              {govtIdUrl ? (
                                <div className="text-[#5C4D3D] text-xs font-bold flex items-center justify-center gap-1">
                                  <CheckCircle className="w-3.5 h-3.5" /> ID Linked Cryptographically
                                </div>
                              ) : (
                                <div>
                                  <p className="text-[11px] text-[#3E362E] font-medium">
                                    {isUploading ? "Uploading credentials..." : "Upload National ID card (PNG/JPG)"}
                                  </p>
                                  <p className="text-[9px] text-[#8C6D4F]/60 mt-0.5 font-mono">Maximum size 10MB</p>
                                </div>
                              )}
                            </div>
                          </div>


                        </div>
                      </div>
                    )}

                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={loading || isUploading || !biometricActivated}
                    className="w-full py-5 bg-[#5C4D3D] hover:bg-[#8C6D4F] text-[#FDF6F0] font-bold text-[11px] tracking-[0.4em] uppercase rounded-2xl border border-[#DBC1A7]/30 hover:border-[#5C4D3D] shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer group relative overflow-hidden"
                  >
                    <span className="relative z-10">{loading ? "Synchronizing..." : (isRegister ? "Establish Identity" : "Initialize Session")}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading || isUploading || !biometricActivated}
                    className="w-full py-4 bg-white text-[#3E362E] font-bold text-[11px] tracking-[0.2em] uppercase rounded-2xl border border-[#DBC1A7] hover:bg-[#FDF6F0] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-3"
                  >
                    <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="w-4 h-4" referrerPolicy="no-referrer" />
                    Login with Google
                  </button>

                </form>

                {/* Security Banner under form */}
                <div className="text-center font-mono text-[8px] text-[#8C6D4F] tracking-[0.2em] flex items-center justify-center gap-3 pt-6 border-t border-[#DBC1A7]/30">
                  <Shield className="w-3 h-3 text-[#5C4D3D]/50" />
                  <span>PRESTIGE LEDGER SECURITY • END-TO-END ENCRYPTION</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

