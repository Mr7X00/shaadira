import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  UserRole, 
  ArtistProfile, 
  Booking, 
  Message, 
  SystemLog, 
  VerificationStatus, 
  BookingStatus,
  ArtistCategory
} from "./types";
import HeroSection from "./components/HeroSection";
import ArtistCard from "./components/ArtistCard";
import ChatMessenger from "./components/ChatMessenger";
import BookingTimeline from "./components/BookingTimeline";
import PaymentModal from "./components/PaymentModal";
import ArtistDashboard from "./components/ArtistDashboard";
import VerificationPanel from "./components/VerificationPanel";
import AdminAnalytics from "./components/AdminAnalytics";
import CloudinaryUpload from "./components/CloudinaryUpload";
import AuthScreen from "./components/AuthScreen";
import AdminPortal from "./components/AdminPortal";
import AccountCenterLayout from "./components/account-center/AccountCenterLayout";
import { ProfileModal } from "./components/ProfileModal";
import { MaintenanceBanner } from "./components/MaintenanceBanner";
import { auth, db, OperationType, handleFirestoreError } from "./lib/firebase";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { 
  MessageSquare, 
  Sparkles, 
  Search, 
  MapPin, 
  CheckCircle, 
  ShieldCheck, 
  ArrowLeft, 
  Star, 
  Phone, 
  User, 
  LogOut, 
  Plus, 
  Smartphone,
  Navigation,
  ExternalLink,
  Award,
  Clock,
  X,
  Sun,
  Moon
} from "lucide-react";

export default function App() {
  const [activeRole, setActiveRole] = useState<UserRole>(UserRole.GUEST);
  const mockArtists: ArtistProfile[] = [
    {
      id: "mock-artist-123",
      name: "Aisha's Royal Henna",
      email: "aisha@veltora.in",
      verified: VerificationStatus.APPROVED,
      basePrice: 5500,
      bio: "10+ years of experience in heavy bridal designs. I only use 100% organic Rajasthani henna cones. Known for intricate figures and lotus motifs.",
      category: ArtistCategory.MEHNDI,
      avatarUrl: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=300&h=300&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&w=800&h=400&q=80",
      experienceYears: 12,
      rating: 4.9,
      reviewCount: 245,
      phone: "+91 98765 43210",
      state: "Maharashtra",
      city: "Mumbai",
      whatsapp: "+91 98765 43210",
      address: "Andheri West, Mumbai",
      portfolio: [],
      skills: ["Bridal Mehndi", "Figure Work", "Organic Cones"]
    },
    {
      id: "mock-artist-456",
      name: "Meher Mehndi Arts",
      email: "meher@veltora.in",
      verified: VerificationStatus.APPROVED,
      basePrice: 2000,
      bio: "Specialist in Arabic and Khafif designs. Quick, elegant, and perfect for party bookings or bridesmaids.",
      category: ArtistCategory.MEHNDI,
      avatarUrl: "https://images.unsplash.com/photo-1610030469668-93535c17b6b3?auto=format&fit=crop&w=300&h=300&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1610030469668-93535c17b6b3?auto=format&fit=crop&w=800&h=400&q=80",
      experienceYears: 5,
      rating: 4.7,
      reviewCount: 89,
      phone: "+91 91234 56789",
      state: "Delhi",
      city: "New Delhi",
      whatsapp: "+91 91234 56789",
      address: "Connaught Place, New Delhi",
      portfolio: [],
      skills: ["Arabic Patterns", "Khafif", "Quick Application"]
    },
    {
      id: "mock-artist-789",
      name: "Sonia's Classic Strokes",
      email: "sonia@veltora.in",
      verified: VerificationStatus.APPROVED,
      basePrice: 8000,
      bio: "Premium celebrity henna artist. I create bespoke love-story designs hidden within the mehndi.",
      category: ArtistCategory.MEHNDI,
      avatarUrl: "https://images.unsplash.com/photo-1605647540924-852290f6b0d5?auto=format&fit=crop&w=300&h=300&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1605647540924-852290f6b0d5?auto=format&fit=crop&w=800&h=400&q=80",
      experienceYears: 15,
      rating: 5.0,
      reviewCount: 412,
      phone: "+91 99887 76655",
      state: "Rajasthan",
      city: "Jaipur",
      whatsapp: "+91 99887 76655",
      address: "C-Scheme, Jaipur",
      portfolio: [],
      skills: ["Bespoke Stories", "Portrait Mehndi", "Celebrity Bridal"]
    }
  ];

  const mockBookings: Booking[] = [
    {
      id: "BKG-10294",
      clientId: "mock-client-123",
      clientName: "Valued Patron",
      clientEmail: "client@veltora.in",
      artistId: "mock-artist-123",
      artistName: "Aisha's Royal Henna",
      artistCategory: ArtistCategory.MEHNDI,
      eventDate: "2026-09-15",
      eventTime: "10:00 AM",
      eventLocation: "Taj Mahal Palace, Mumbai",
      status: BookingStatus.CONFIRMED,
      quotedAmount: 5500,
      platformFee: 550
    },
    {
      id: "BKG-10295",
      clientId: "mock-client-123",
      clientName: "Valued Patron",
      clientEmail: "client@veltora.in",
      artistId: "mock-artist-456",
      artistName: "Meher Mehndi Arts",
      artistCategory: ArtistCategory.MEHNDI,
      eventDate: "2026-10-02",
      eventTime: "04:00 PM",
      eventLocation: "JW Marriott, New Delhi",
      status: BookingStatus.INQUIRY,
      quotedAmount: 2000,
      platformFee: 200
    }
  ];

  const [artists, setArtists] = useState<ArtistProfile[]>(mockArtists);
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  
  // Auth state
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // UI states
  const [selectedArtist, setSelectedArtist] = useState<ArtistProfile | null>(null);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState("ALL");
  const [filterState, setFilterState] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterPriceRange, setFilterPriceRange] = useState<[number, number]>([0, 50000]);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [showAddArtistModal, setShowAddArtistModal] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // New artist form state
  const [newArtistName, setNewArtistName] = useState("");
  const [newArtistEmail, setNewArtistEmail] = useState("");
  const [newArtistPrice, setNewArtistPrice] = useState("1200");
  const [newArtistBio, setNewArtistBio] = useState("");
  const [newArtistAvatar, setNewArtistAvatar] = useState("");
  const [newArtistGovtId, setNewArtistGovtId] = useState("");

  // Coordinates for GPS simulator
  const [simulatedGpsCoords, setSimulatedGpsCoords] = useState<{lat: number, lng: number} | null>(null);

  // Live GPS Countdown timer (in seconds)
  const [gpsCountdown, setGpsCountdown] = useState<number>(600); // 10 minutes default

  useEffect(() => {
    if (!activeBooking) return;
    
    if (activeBooking.status === BookingStatus.ARRIVED) {
      setGpsCountdown(0);
      return;
    }

    if (activeBooking.status === BookingStatus.CONFIRMED) {
      // Set to 600 if it hasn't been set yet
      setGpsCountdown((prev) => (prev > 0 && prev <= 600) ? prev : 600);
      const interval = setInterval(() => {
        setGpsCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activeBooking?.id, activeBooking?.status]);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Fetch initial state from Express Server
  // For admin/ops roles, fetch all artists (including PENDING) from the authenticated endpoint.
  const fetchState = async (role?: string) => {
    try {
      const effectiveRole = role || activeRole;
      const isAdminRole = effectiveRole === UserRole.SUPER_ADMIN || effectiveRole === UserRole.OPERATIONS;
      const adminToken = localStorage.getItem("admin_token");

      // Use admin endpoint to get ALL artists (including PENDING) when admin role detected
      const artistsUrl = isAdminRole && adminToken
        ? "/api/admin/artists"
        : "/api/artists";
      const bookingsUrl = isAdminRole && adminToken
        ? "/api/admin/bookings"
        : "/api/bookings";
      const logsUrl = isAdminRole && adminToken
        ? "/api/admin/audit-logs"
        : "/api/logs";
        
      const authHeaders = isAdminRole && adminToken
        ? { Authorization: `Bearer ${adminToken}` }
        : undefined;

      const [artistsRes, bookingsRes, logsRes] = await Promise.all([
        fetch(artistsUrl, authHeaders ? { headers: authHeaders } : undefined),
        fetch(bookingsUrl, authHeaders ? { headers: authHeaders } : undefined),
        fetch(logsUrl, authHeaders ? { headers: authHeaders } : undefined)
      ]);

      if (artistsRes.ok) {
        const artistsData = await artistsRes.json();
        setArtists(artistsData);
      }
      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        setBookings(bookingsData);
        // Keep active booking reference synchronized
        if (activeBooking) {
          const updatedBk = bookingsData.find((b: Booking) => b.id === activeBooking.id);
          if (updatedBk) {
            setActiveBooking(updatedBk);
          }
        }
      }
      if (logsRes.ok) {
        setLogs(await logsRes.json());
      }
    } catch (err) {
      console.error("Failed to load full-stack state:", err);
    }
  };

  // Auth Listener
  useEffect(() => {
    if (!auth) {
      console.warn("Firebase Auth not initialized. Continuing without authentication.");
      setAuthLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const res = await fetch(`/api/users/${user.uid}?email=${encodeURIComponent(user.email || "")}&name=${encodeURIComponent(user.displayName || "")}`);
          if (res.ok) {
            const data = await res.json();
            setUserProfile(data);
            setActiveRole(data.role);
            
            if (data.adminToken) {
              localStorage.setItem("admin_token", data.adminToken);
            }
            
            await fetchState(data.role); // pass role so fetchState can choose correct API
          }
        } catch (e) {
          console.error("Failed to load user profile on auth change:", e);
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
        setActiveRole(UserRole.GUEST);
        localStorage.removeItem("admin_token");
      }
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  // Subscribe to real-time updates in Firestore (for direct live sittings updates)
  useEffect(() => {
    if (!currentUser || !db) return;

    // Real-time Artists listener - allowed for everyone
    const unsubArtists = onSnapshot(
      collection(db, "artists"),
      (snapshot) => {
        const list: ArtistProfile[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as ArtistProfile);
        });
        if (list.length > 0) {
          setArtists(list);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, "artists");
      }
    );

    // Dynamic listeners based on user role
    let unsubBookings = () => {};
    let unsubLogs = () => {};

    if (activeRole === UserRole.SUPER_ADMIN || activeRole === UserRole.OPERATIONS) {
      // Admins/Ops can subscribe to all bookings
      unsubBookings = onSnapshot(
        collection(db, "bookings"),
        (snapshot) => {
          const list: Booking[] = [];
          snapshot.forEach((doc) => {
            list.push({ id: doc.id, ...doc.data() } as Booking);
          });
          if (list.length > 0) {
            setBookings(list);
            if (activeBooking) {
              const updated = list.find((b) => b.id === activeBooking.id);
              if (updated) {
                setActiveBooking(updated);
              }
            }
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, "bookings");
        }
      );

      // Admins/Ops can subscribe to logs
      unsubLogs = onSnapshot(
        collection(db, "logs"),
        (snapshot) => {
          const list: SystemLog[] = [];
          snapshot.forEach((doc) => {
            list.push({ id: doc.id, ...doc.data() } as SystemLog);
          });
          list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          if (list.length > 0) {
            setLogs(list);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, "logs");
        }
      );
    } else if (activeRole === UserRole.CLIENT) {
      // Clients can only subscribe to their own bookings
      const clientBookingsQuery = query(collection(db, "bookings"), where("clientId", "==", currentUser.uid));
      unsubBookings = onSnapshot(
        clientBookingsQuery,
        (snapshot) => {
          const list: Booking[] = [];
          snapshot.forEach((doc) => {
            list.push({ id: doc.id, ...doc.data() } as Booking);
          });
          if (list.length > 0) {
            setBookings(list);
            if (activeBooking) {
              const updated = list.find((b) => b.id === activeBooking.id);
              if (updated) {
                setActiveBooking(updated);
              }
            }
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, "bookings");
        }
      );
    } else if (activeRole === UserRole.ARTIST) {
      // Artists can only subscribe to their own bookings
      const artistBookingsQuery = query(collection(db, "bookings"), where("artistId", "==", currentUser.uid));
      unsubBookings = onSnapshot(
        artistBookingsQuery,
        (snapshot) => {
          const list: Booking[] = [];
          snapshot.forEach((doc) => {
            list.push({ id: doc.id, ...doc.data() } as Booking);
          });
          if (list.length > 0) {
            setBookings(list);
            if (activeBooking) {
              const updated = list.find((b) => b.id === activeBooking.id);
              if (updated) {
                setActiveBooking(updated);
              }
            }
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, "bookings");
        }
      );
    }

    return () => {
      unsubArtists();
      unsubBookings();
      unsubLogs();
    };
  }, [currentUser, activeRole, activeBooking?.id]);

  // Sync chat messages from Firestore real-time when active booking updates
  useEffect(() => {
    if (!activeBooking) return;

    const messagesQuery = query(
      collection(db, "messages"),
      where("bookingId", "==", activeBooking.id)
    );

    const unsub = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const msgs: Message[] = [];
        snapshot.forEach((doc) => {
          msgs.push({ id: doc.id, ...doc.data() } as Message);
        });
        msgs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        setChatMessages(msgs);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, "messages");
      }
    );

    return () => unsub();
  }, [activeBooking?.id]);

  // Sign out helper
  const handleSignOut = async () => {
    try {
      await firebaseSignOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
      setActiveRole(UserRole.GUEST);
      setSelectedArtist(null);
    } catch (err) {
      console.error("Failed signing out user:", err);
    }
  };

  const handleProfileUpdate = async (data: { name: string, avatarUrl: string }) => {
    if (!currentUser) return;
    try {
      const res = await fetch("/api/users/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: currentUser.uid,
          email: currentUser.email,
          role: activeRole,
          ...data
        })
      });
      if (res.ok) {
        const updatedProfile = await res.json();
        setUserProfile(updatedProfile);
      }
    } catch (err) {
      console.error("Failed to update profile:", err);
    }
  };

  // Search filter handler
  const handleSearch = (query: string, category: string, state?: string, city?: string, priceRange?: [number, number]) => {
    setSearchQuery(query);
    setSearchCategory(category);
    if (state !== undefined) setFilterState(state);
    if (city !== undefined) setFilterCity(city);
    if (priceRange !== undefined) setFilterPriceRange(priceRange || [0, 50000]);
  };

  // Initiate a new booking inquiry (Client starts chat)
  const handleInitiateInquiry = async (artistId: string) => {
    try {
      const res = await fetch("/api/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artistId,
          clientId: currentUser?.uid || "usr_client_1",
          clientName: userProfile?.name || currentUser?.displayName || "Authenticated Client",
          clientEmail: currentUser?.email || "client@example.com",
          clientPhone: userProfile?.phone || "+91 99999 88888",
          eventDate: "2026-07-28",
          eventTime: "11:00",
          eventLocation: userProfile?.address || "Flat 402, Royal Residency, Juhu, Mumbai"
        })
      });

      const newBooking = await res.json();
      await fetchState();
      setActiveBooking(newBooking);
      setSelectedArtist(null);
      
      // Auto toggle to client role if they were guest
      if (activeRole === UserRole.GUEST) {
        setActiveRole(UserRole.CLIENT);
      }
    } catch (err) {
      console.error("Error creating booking inquiry:", err);
    }
  };

  // Send Chat message
  const handleSendMessage = async (text: string) => {
    if (!activeBooking) return;
    
    const senderName = activeRole === UserRole.ARTIST 
      ? activeBooking.artistName 
      : (userProfile?.name || currentUser?.displayName || "Authenticated Client");
    const senderId = activeRole === UserRole.ARTIST 
      ? activeBooking.artistId 
      : (currentUser?.uid || "usr_client_1");

    try {
      await fetch(`/api/chats/${activeBooking.id}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId,
          senderName,
          senderRole: activeRole,
          text
        })
      });
      await fetchState();
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  // Submit quote (Artist)
  const handleSubmitQuote = async (amount: number) => {
    if (!activeBooking) return;
    try {
      await fetch("/api/bookings/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: activeBooking.id,
          quotedAmount: amount
        })
      });
      await fetchState();
    } catch (err) {
      console.error("Error submitting quote:", err);
    }
  };

  // Pay Platform Fee Success Callback
  const handlePaymentSuccess = async (bookingId: string, paymentId: string) => {
    try {
      await fetch("/api/bookings/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, paymentId })
      });
      await fetchState();
    } catch (err) {
      console.error("Error logging payment:", err);
    }
  };

  // GPS Check-in simulator (Artist)
  const handleGpsCheckIn = async (bookingId: string) => {
    // Simulate coordinates around Juhu Beach, Mumbai (19.0968, 72.8264)
    const lat = 19.0968 + (Math.random() - 0.5) * 0.005;
    const lng = 72.8264 + (Math.random() - 0.5) * 0.005;
    
    setSimulatedGpsCoords({ lat, lng });

    try {
      await fetch("/api/bookings/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          latitude: lat,
          longitude: lng
        })
      });
      await fetchState();
    } catch (err) {
      console.error("Error sending GPS checkin:", err);
    }
  };

  // Upload Completion Proof (Artist)
  const handleUploadProof = async (bookingId: string, proofUrl: string, note: string) => {
    try {
      await fetch("/api/bookings/complete-proof", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          proofUrl,
          proofNote: note
        })
      });
      await fetchState();
    } catch (err) {
      console.error("Error uploading completion proof:", err);
    }
  };

  // Client Confirm completion and rate (Client)
  const handleConfirmAndReview = async (bookingId: string, rating: number, comment: string) => {
    try {
      await fetch("/api/bookings/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, rating, comment })
      });
      await fetchState();
    } catch (err) {
      console.error("Error writing review:", err);
    }
  };

  // Verify Artist (Operations Executive)
  const handleVerifyArtist = async (artistId: string, status: VerificationStatus) => {
    try {
      await fetch("/api/artists/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artistId,
          status,
          actor: "Operations Executive"
        })
      });
      await fetchState();
    } catch (err) {
      console.error("Error verifying artist:", err);
    }
  };

  // Update profile Bio and BasePrice (Artist Preeti)
  const handleUpdateBioPrice = async (bio: string, price: number) => {
    try {
      await fetch("/api/artists/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Preeti Sharma",
          email: "preeti.sharma@example.com",
          phone: "+91 98765 43210",
          whatsapp: "+91 98765 43210",
          address: "Flat 402, Royal Residency, Juhu, Mumbai",
          basePrice: price,
          experienceYears: 5,
          bio,
          skills: ["Bridal Mehndi", "Sanskrit Shloka Style"]
        })
      });
      await fetchState();
    } catch (err) {
      console.error("Error saving profile settings:", err);
    }
  };

  // Create new artist registration (Simulator helper)
  const handleCreateNewArtist = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/artists/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newArtistName,
          email: newArtistEmail,
          phone: "+91 88123 45678",
          whatsapp: "+91 88123 45678",
          address: "12, Sangeet Marg, Bandra, Mumbai",
          basePrice: Number(newArtistPrice) || 1000,
          experienceYears: 2,
          bio: newArtistBio || "Creative designer specializing in intricate bridal hand overlays.",
          skills: ["Traditional Henna", "Finger Mandalas"],
          avatarUrl: newArtistAvatar,
          govtIdUrl: newArtistGovtId
        })
      });
      await fetchState();
      setShowAddArtistModal(false);
      setNewArtistName("");
      setNewArtistEmail("");
      setNewArtistAvatar("");
      setNewArtistGovtId("");
    } catch (err) {
      console.error("Failed registering new artist:", err);
    }
  };

  // Filter approved artists that match search queries
  const filteredArtists = artists.filter(a => {
    if (!a) return false;
    const isApproved = a.verified === VerificationStatus.APPROVED;
    const name = a.name || "";
    const bio = a.bio || "";
    const skills = Array.isArray(a.skills) ? a.skills : [];
    const city = a.city || "";
    const state = a.state || "";
    const price = a.basePrice || 0;
    
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          skills.some(s => s && s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = searchCategory === "ALL" || a.category === searchCategory;
    const matchesState = !filterState || state.toLowerCase().includes(filterState.toLowerCase());
    const matchesCity = !filterCity || city.toLowerCase().includes(filterCity.toLowerCase());
    const matchesPrice = price >= filterPriceRange[0] && price <= filterPriceRange[1];
    
    // Admin/Operations can see all. Guests/Clients only see Approved.
    const isViewable = isApproved || activeRole === UserRole.OPERATIONS || activeRole === UserRole.SUPER_ADMIN;
    
    return isViewable && matchesSearch && matchesCategory && matchesState && matchesCity && matchesPrice;
  });

  const isAccountRoute = window.location.pathname.startsWith("/account");
  const isClientAccountRoute = window.location.pathname.startsWith("/account/client");
  const isArtistAccountRoute = window.location.pathname.startsWith("/account/artist");
  if (authLoading) {
    return (
      <div id="auth-loading-screen" className="min-h-screen bg-slate-900 flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
          <p className="text-slate-400 text-sm font-mono uppercase tracking-widest font-bold">Securing Ledger Credentials...</p>
        </div>
      </div>
    );
  }

  if (isClientAccountRoute && currentUser) {
    // Force role to client if accessing client account
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#1A1612] dark' : 'bg-[#FDF6F0]'} flex flex-col font-sans selection:bg-[#E6D5C3] selection:text-[#3E362E] relative overflow-hidden transition-colors duration-500`}>
        <AccountCenterLayout user={{ ...userProfile, role: 'client' }} />
      </div>
    );
  }
  
  if (isArtistAccountRoute) {
    // Force role to artist if accessing artist account
    return <AccountCenterLayout user={{ ...userProfile, role: 'artist' }} />;
  }

  // Client's sittings list
  const clientBookings = currentUser ? bookings.filter(b => b.clientId === currentUser.uid) : [];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#1A1612]' : 'bg-[#FDF6F0]'} flex flex-col font-sans selection:bg-[#E6D5C3] selection:text-[#3E362E] relative overflow-hidden transition-colors duration-500`}>
      {/* Global Wedding Theme Background */}
      <div className={`fixed inset-0 z-0 pointer-events-none ${theme === 'dark' ? 'opacity-[0.02]' : 'opacity-[0.05]'} transition-opacity duration-500`}>
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("https://i.ibb.co/p6jd9jSN/download.jpg")' }}
        />
      </div>

      <div className="relative z-10 flex-1 flex flex-col">
        {!currentUser || !userProfile ? (
          <AuthScreen 
            onAuthSuccess={(user, profile) => {
              setCurrentUser(user);
              setUserProfile(profile);
              setActiveRole(profile.role);
            }} 
          />
        ) : (
          <>
            <MaintenanceBanner />
      
      {/* Sovereign Veltora Header */}
      <header id="secured-veltora-header" className="glass-nav-dark dark:bg-black/90 text-white px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-6 sticky top-0 z-50 transition-colors duration-500">
        <div className="flex items-center gap-4">
          <div className="relative group cursor-pointer" onClick={() => setSelectedArtist(null)}>
            <div className="absolute -inset-1 bg-gradient-to-r from-[#8C6D4F] to-[#A67C52] rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-[#8C6D4F] p-2.5 rounded-xl text-white font-black text-xs shadow-2xl">S</div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-black tracking-[0.3em] uppercase drop-shadow-sm">SHAADIRA</h1>
            <span className="text-[8px] font-mono tracking-[0.4em] text-[#8C6D4F] uppercase">Prestige Artifact Ledger</span>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-10">
          {activeRole === UserRole.GUEST && ["Platform Features", "Concept & Implementation", "Technical Partner"].map((item) => (
            <a key={item} href="#" className="text-[9px] font-bold tracking-[0.2em] uppercase text-stone-400 hover:text-white transition-colors relative group">
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#8C6D4F] transition-all group-hover:w-full"></span>
            </a>
          ))}
          {activeRole !== UserRole.GUEST && (
            <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-[#8C6D4F]">Secure Client Session Active</span>
          )}
        </nav>
        
        <div className="flex items-center gap-6">
          {/* Theme Toggle */}
          <button 
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all text-stone-400 hover:text-white"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {currentUser ? (
            <div className="relative group">
              <button 
                onClick={() => setIsProfileModalOpen(true)}
                className="flex items-center gap-3 p-1 pr-4 bg-white/5 hover:bg-white/10 border border-[#FFD700]/30 rounded-full transition-all group cursor-pointer shadow-[0_0_15px_rgba(255,215,0,0.1)]"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#FFD700] shadow-[0_0_10px_rgba(255,215,0,0.4)]">
                  <img 
                    src={userProfile?.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=neutral"} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-[10px] font-black tracking-widest text-white uppercase">{userProfile?.name || 'Identity Active'}</p>
                  <p className="text-[8px] font-mono text-[#FFD700] uppercase">{activeRole.replace('_', ' ')}</p>
                </div>
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setSelectedArtist(null)}
              className="px-6 py-3 bg-gradient-to-r from-[#8C6D4F] to-[#5C4D3D] hover:from-[#5C4D3D] hover:to-[#8C6D4F] text-white font-black text-[10px] rounded-xl tracking-[0.2em] uppercase shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              Join Network
            </button>
          )}
        </div>
      </header>

      {/* Portals Routing */}
      <Routes>
        {/* 2. Client & Guest Main Workspace */}
        <Route path="/" element={
          (activeRole === UserRole.GUEST || activeRole === UserRole.CLIENT) ? (
            <div className="flex-1 flex flex-col">
          {/* Hero Header */}
          <HeroSection 
            onSearch={handleSearch} 
            artistCount={artists.filter(a => a.verified === VerificationStatus.APPROVED).length} 
            isLoggedIn={activeRole === UserRole.CLIENT}
          />

          {/* Core Body Container */}
          <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
            
            {/* Left side: Browse Artists Grid */}
            <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-xl text-slate-900">
                    Verified Henna Masters
                  </h3>
                  <p className="text-xs text-slate-400">Showing {filteredArtists.length} manual-verified artists</p>
                </div>

                <button
                  onClick={() => setShowAddArtistModal(true)}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Join as Artist</span>
                </button>
              </div>

              {filteredArtists.length === 0 ? (
                <div className="glass-card p-12 text-center rounded-[24px]">
                  <p className="text-slate-400 text-sm">No artists match your active search terms.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {filteredArtists.map((art) => (
                    <ArtistCard 
                      key={art.id} 
                      artist={art} 
                      onSelect={setSelectedArtist}
                      onInitiateInquiry={handleInitiateInquiry}
                      isLoggedInClient={activeRole === UserRole.CLIENT}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right side: Client active bookings and chats panel */}
            <div className="lg:col-span-4 space-y-6">
              <div className="glass-card p-6 rounded-[24px] border border-slate-200/50 space-y-4">
                <h4 className="font-display font-bold text-md text-slate-950 flex items-center gap-1.5">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <span>My Active Sittings</span>
                </h4>

                {clientBookings.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No active bookings. Choose an artist on the left and click "Book" to start chatting!</p>
                ) : (
                  <div className="space-y-3">
                    {clientBookings.map((bk) => (
                      <button
                        key={bk.id}
                        onClick={() => setActiveBooking(bk)}
                        className={`w-full text-left p-3.5 rounded-2xl border transition-all flex justify-between items-center cursor-pointer ${
                          activeBooking?.id === bk.id
                            ? "bg-blue-50 border-blue-200 shadow-sm text-blue-900"
                            : "bg-white border-slate-100 hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div>
                          <span className="font-bold text-xs block">{bk.artistName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{bk.eventDate} @ {bk.eventTime}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold ${
                          bk.status === BookingStatus.CONFIRMED ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
                        }`}>
                          {bk.status.replace("_", " ")}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Verified Cone banner */}
              <div className="bg-slate-900 text-white p-6 rounded-[24px] space-y-3 relative overflow-hidden shadow-lg">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl" />
                <Award className="w-8 h-8 text-amber-400" />
                <h5 className="font-display font-bold text-sm tracking-tight text-amber-300">Organically Sourced Certified</h5>
                <p className="text-xs text-slate-300 font-light leading-relaxed">
                  Every Veltora Mehndi Master uses 100% hand-filtered Henna cones mixed only with pure tea extract and clove oils. Safely enjoy beautiful bridal stains without irritation.
                </p>
              </div>
            </div>
          </div>
        </div>
        ) : <Navigate to={activeRole === UserRole.ARTIST ? "/artist" : "/admin"} />
      } />

        {/* 3. ARTIST Console Workspace */}
        <Route path="/artist/*" element={
          activeRole === UserRole.ARTIST ? (
            <ArtistDashboard 
              artist={artists.find(a => a.id === currentUser?.uid) || (userProfile as any) || {} as ArtistProfile}
              bookings={bookings}
              onUpdateBioPrice={handleUpdateBioPrice}
              onGpsCheckIn={handleGpsCheckIn}
              onUploadProof={handleUploadProof}
              onSelectBooking={(bk) => setActiveBooking(bk)}
            />
          ) : <Navigate to="/" />
        } />

        {/* 4. OPERATIONS EXECUTIVE Profile Workspace */}
        <Route path="/admin/operations" element={
          activeRole === UserRole.OPERATIONS ? (
            <VerificationPanel 
              artists={artists} 
              onVerifyArtist={handleVerifyArtist} 
            />
          ) : <Navigate to="/" />
        } />

        {/* 5. SUPER ADMIN Performance Tracking Workspace */}
        <Route path="/admin/analytics" element={
          activeRole === UserRole.SUPER_ADMIN ? (
            <AdminAnalytics 
              bookings={bookings} 
              logs={logs} 
              onRefreshLogs={fetchState} 
              artists={artists}
              onVerifyArtist={handleVerifyArtist}
            />
          ) : <Navigate to="/" />
        } />
        
        {/* Main Admin Portal Route */}
        <Route path="/admin/*" element={
          (activeRole === UserRole.SUPER_ADMIN || activeRole === UserRole.OPERATIONS || activeRole === UserRole.ACCOUNT_MANAGER) ? (
            <AdminPortal />
          ) : <Navigate to="/" />
        } />
      </Routes>

      {/* 6. Active Chat Panel Drawer overlays side-by-side (Only when activeBooking selected) */}
      {activeBooking && (
        <div className="fixed inset-x-0 bottom-0 top-[60px] z-40 bg-slate-100 flex flex-col font-sans">
          <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between shadow-sm">
            <button 
              id="back-to-browse"
              onClick={() => setActiveBooking(null)}
              className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 font-bold bg-slate-50 hover:bg-slate-100 py-1.5 px-3.5 rounded-xl cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Marketplace</span>
            </button>

            <div>
              <h4 className="font-display font-bold text-sm text-slate-900">
                Active Service Channel: {activeBooking.artistName} × {activeBooking.clientName}
              </h4>
              <p className="text-[10px] text-slate-400 font-mono">Channel ID: {activeBooking.id}</p>
            </div>

            <span className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-mono">
              Status: {activeBooking.status.replace("_", " ")}
            </span>
          </div>

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-y-auto">
            {/* Timeline Progress Column */}
            <div className="lg:col-span-4 space-y-6">
              <BookingTimeline booking={activeBooking} />

              {/* Client Confirmation and Review Form Workspace (Visible when completed proof is sent) */}
              {activeBooking.status === BookingStatus.COMPLETED_PROOF && (activeRole === UserRole.CLIENT || activeRole === UserRole.GUEST) && (
                <div id="client-review-block" className="bg-white p-5 rounded-[24px] border border-emerald-100 shadow-md space-y-4 bg-gradient-to-br from-white to-emerald-50/10">
                  <h5 className="font-display font-bold text-xs text-emerald-900 uppercase tracking-wider">Confirm Completion & Submit Review</h5>
                  <p className="text-[11px] text-slate-500">The artist has finished sittings and uploaded proof. Inspect result and close booking.</p>
                  
                  {activeBooking.completionProofUrl && (
                    <div className="rounded-xl overflow-hidden h-32 border border-slate-200">
                      <img 
                        src={activeBooking.completionProofUrl} 
                        alt="Completion Henna Design" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">My Star Rating</label>
                      <select 
                        id="review-rating-select"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none"
                      >
                        <option value="5">5 Stars (Excellent, Loved stain duration)</option>
                        <option value="4">4 Stars (Good designs & punctuality)</option>
                        <option value="3">3 Stars (Satisfactory)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Feedback Comment</label>
                      <input 
                        id="review-comment-input"
                        type="text" 
                        placeholder="e.g. Absolutely flawless traditional Marwari designs! Long stain."
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none"
                      />
                    </div>

                    <button
                      id="confirm-close-booking-btn"
                      onClick={() => {
                        const score = Number((document.getElementById("review-rating-select") as HTMLSelectElement).value);
                        const comment = (document.getElementById("review-comment-input") as HTMLInputElement).value;
                        handleConfirmAndReview(activeBooking.id, score, comment);
                      }}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow cursor-pointer transition-colors"
                    >
                      Confirm Complete & Submit Review
                    </button>
                  </div>
                </div>
              )}

              {/* Simulated GPS Tracking Visualizer (Visible once active booking is Confirmed or Arrived) */}
              {(activeBooking.status === BookingStatus.CONFIRMED || activeBooking.status === BookingStatus.ARRIVED) && (
                <div id="gps-tracking-card" className="bg-white p-5 rounded-[24px] border border-indigo-100 shadow-md space-y-4">
                  <h5 className="font-display font-bold text-xs text-indigo-950 uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Navigation className="w-4 h-4 text-indigo-600 animate-spin" />
                      <span>GPS Navigation Live Status</span>
                    </span>
                    <span className="text-[9px] font-mono bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold">
                      {activeBooking.status === BookingStatus.ARRIVED ? "ARRIVED" : "EN ROUTE"}
                    </span>
                  </h5>

                  <div className="relative h-44 bg-indigo-50 border border-indigo-100 rounded-xl overflow-hidden flex flex-col justify-between p-4">
                    {/* Simulated grid vector lines */}
                    <div className="absolute inset-0 bg-[radial-gradient(#C7D2FE_1px,transparent_1px)] [background-size:16px_16px] opacity-60" />
                    
                    {/* Route line drawing */}
                    <div className="absolute top-1/2 left-4 right-12 h-1 border-b-2 border-dashed border-indigo-400" />
                    
                    {/* GPS Coordinates overlay labels */}
                    <div className="z-10 bg-slate-900/90 text-white rounded px-2 py-1 text-[10px] font-mono inline-block self-start">
                      Target Lat: 19.0760, Lng: 72.8777
                    </div>

                    {/* Simulating Marker coordinates */}
                    <div className="z-10 flex justify-between items-center">
                      <div className="flex items-center gap-1.5 bg-white py-1 px-2.5 rounded-lg border shadow-sm">
                        <div className={`w-2.5 h-2.5 rounded-full ${activeBooking.status === BookingStatus.ARRIVED ? "bg-emerald-500 animate-none" : "bg-blue-600 animate-ping"}`} />
                        <span className="font-bold text-[10px] text-slate-800">Artist Position</span>
                      </div>

                      <div className="flex items-center gap-1.5 bg-white py-1 px-2.5 rounded-lg border shadow-sm">
                        <MapPin className="w-3.5 h-3.5 text-rose-600" />
                        <span className="font-bold text-[10px] text-slate-800">Client Venue</span>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Countdown Timer and ETA Element */}
                  <div className="p-3 bg-indigo-50/50 border border-indigo-100/60 rounded-2xl flex flex-col items-center justify-center space-y-2">
                    <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-widest">
                      Live ETA Countdown
                    </span>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-600 animate-pulse" />
                      <span className="text-xl font-mono font-extrabold text-indigo-950 tracking-tight">
                        {activeBooking.status === BookingStatus.ARRIVED ? "00:00" : formatCountdown(gpsCountdown)}
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-indigo-100 rounded-full overflow-hidden max-w-[220px]">
                      <div 
                        className="h-full bg-indigo-600 rounded-full transition-all duration-1000"
                        style={{ 
                          width: `${activeBooking.status === BookingStatus.ARRIVED ? 100 : Math.max(5, Math.min(100, ((600 - gpsCountdown) / 600) * 100))}%` 
                        }}
                      />
                    </div>

                    <span className="text-[9px] text-indigo-500 font-medium">
                      {activeBooking.status === BookingStatus.ARRIVED 
                        ? "✓ Artist has checked-in successfully!" 
                        : `Approx. ${(gpsCountdown / 600 * 2.1).toFixed(2)} km remaining to venue`
                      }
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-500 leading-relaxed text-center font-light">
                    {activeBooking.status === BookingStatus.ARRIVED 
                      ? "✓ Artist checked-in successfully. Geofence verification completed."
                      : "⏳ Artist is currently navigating towards your ballroom. Expect arrival in 10 minutes."
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Messenger Conversation Column */}
            <div className="lg:col-span-8">
              <ChatMessenger 
                booking={activeBooking}
                activeRole={activeRole}
                messages={chatMessages}
                onSendMessage={handleSendMessage}
                onSubmitQuote={handleSubmitQuote}
                onOpenPayment={() => setIsPaymentOpen(true)}
              />
            </div>
          </div>
        </div>
      )}

      {/* 7. Artist Portfolio Detail Drawer (Visible when client inspects artist profile) */}
      {selectedArtist && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex justify-end bg-slate-900/60 backdrop-blur-sm p-4 font-sans">
          <div className="bg-white w-full max-w-lg rounded-[24px] h-full overflow-y-auto shadow-2xl p-6 relative animate-slide-in flex flex-col justify-between">
            <button 
              onClick={() => setSelectedArtist(null)}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-full cursor-pointer text-slate-400 hover:text-slate-900 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div>
              {/* Profile details */}
              <div className="flex items-center gap-4 border-b border-slate-100 pb-5 mt-4">
                <img 
                  src={selectedArtist.avatarUrl} 
                  alt={selectedArtist.name} 
                  className="w-20 h-20 rounded-full object-cover border-2 border-amber-400 shadow-sm"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="font-display font-bold text-xl text-slate-900 flex items-center gap-1.5">
                    <span>{selectedArtist.name}</span>
                    {selectedArtist.verified === VerificationStatus.APPROVED && <ShieldCheck className="w-5 h-5 text-emerald-500" />}
                  </h4>
                  <p className="text-xs text-slate-400 font-mono">{selectedArtist.category} Specialist • {selectedArtist.experienceYears} Years Exp</p>
                  
                  {selectedArtist.reviewCount > 0 && (
                    <div className="flex items-center gap-1 mt-1 text-amber-500 text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{selectedArtist.rating.toFixed(1)} ({selectedArtist.reviewCount} reviews)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bio & Skills */}
              <div className="py-5 space-y-4">
                <div>
                  <h5 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-1.5">Artist Statement</h5>
                  <p className="text-xs text-slate-600 leading-relaxed font-light">{selectedArtist.bio}</p>
                </div>

                <div>
                  <h5 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-1.5">Specializations</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedArtist.skills.map((s, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-700 text-[10px] px-2.5 py-1 rounded-md font-semibold">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Portfolio Showcase Grid */}
                <div>
                  <h5 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">Design Showcase Portfolio</h5>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedArtist.portfolio.map((img, idx) => (
                      <div key={idx} className="rounded-xl overflow-hidden h-24 border border-slate-100 shadow-sm">
                        <img 
                          src={img} 
                          alt="Portfolio Work" 
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Price & Primary Action row */}
            <div className="border-t border-slate-100 pt-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Base Price</span>
                <span className="font-display font-extrabold text-lg text-slate-900">₹{selectedArtist.basePrice} onwards</span>
              </div>

              {activeRole === UserRole.CLIENT || activeRole === UserRole.GUEST ? (
                <button
                  id="drawer-initiate-chat"
                  onClick={() => handleInitiateInquiry(selectedArtist.id)}
                  className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Start Inquiry & Chat
                </button>
              ) : (
                <div className="text-[10px] text-amber-600 font-bold bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                  Switch to Client role to book Preeti
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 8. Add Artist Profile Form Modal (Guest registration simulator) */}
      {showAddArtistModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm font-sans">
          <form 
            onSubmit={handleCreateNewArtist}
            className="glass-card-dark text-white p-6 rounded-[24px] border border-white/10 shadow-2xl max-w-md w-full space-y-4"
          >
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h4 className="font-display font-bold text-base text-amber-300">Register as SHAADIRA Artist</h4>
              <button 
                type="button"
                onClick={() => setShowAddArtistModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
              <input
                type="text"
                required
                value={newArtistName}
                onChange={(e) => setNewArtistName(e.target.value)}
                placeholder="e.g. Sneha Patel"
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email Address</label>
              <input
                type="email"
                required
                value={newArtistEmail}
                onChange={(e) => setNewArtistEmail(e.target.value)}
                placeholder="sneha@example.com"
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Proposed Base Service Price (₹)</label>
              <input
                type="number"
                required
                value={newArtistPrice}
                onChange={(e) => setNewArtistPrice(e.target.value)}
                placeholder="1200"
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Biography & Credentials</label>
              <textarea
                value={newArtistBio}
                onChange={(e) => setNewArtistBio(e.target.value)}
                placeholder="e.g. Traditional Marwari artist. Expert in fresh cone preparations."
                rows={3}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <CloudinaryUpload 
                label="Profile Avatar Photo" 
                onUploadSuccess={(url) => setNewArtistAvatar(url)}
                presetUrl={newArtistAvatar}
              />
              <CloudinaryUpload 
                label="Govt Identity ID Photo" 
                onUploadSuccess={(url) => setNewArtistGovtId(url)}
                presetUrl={newArtistGovtId}
              />
            </div>

            <p className="text-[10px] text-slate-400 leading-relaxed">
              *Note: Newly registered profiles are saved as PENDING. Operational Executives must manually audit govt proofs and Organic cones before approving the profile to appear live in search feeds.
            </p>

            <button
              id="submit-register-artist-btn"
              type="submit"
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold text-xs tracking-wider uppercase transition-colors cursor-pointer"
            >
              Submit Application to Operations
            </button>
          </form>
        </div>
      )}

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={currentUser}
        profile={userProfile}
        onUpdate={handleProfileUpdate}
      />

      {/* 9. Payment Checkout Modal Trigger container */}
      {activeBooking && (
        <PaymentModal 
          booking={activeBooking}
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Floating Gold Profile Trigger for Clients */}
      {currentUser && activeRole === UserRole.CLIENT && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsProfileModalOpen(true)}
          className="fixed bottom-8 right-8 w-14 h-14 bg-[#FFD700] rounded-2xl shadow-[0_10px_30px_rgba(255,215,0,0.4)] flex items-center justify-center text-[#3E362E] z-50 border border-white/20 group cursor-pointer"
        >
          <User className="w-6 h-6 group-hover:rotate-12 transition-transform" />
          <div className="absolute -top-2 -right-2 bg-black text-white text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter shadow-lg">
            Profile
          </div>
        </motion.button>
      )}

      {/* Luxury Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-20 px-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#8C6D4F]/30 to-transparent"></div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 items-center gap-12">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-[#8C6D4F] p-3 rounded-xl text-white font-black text-xs shadow-2xl">S</div>
              <span className="text-white font-black tracking-[0.4em] text-sm uppercase">SHAADIRA</span>
            </div>
            <p className="text-[9px] font-mono tracking-widest text-slate-500 uppercase text-center md:text-left max-w-[200px] leading-relaxed">
              Curating the world's most distinguished henna experiences through digital integrity.
            </p>
          </div>

          <div className="flex justify-center gap-10">
            {["Concierge", "Privacy", "Legal"].map((item) => (
              <a key={item} href="#" className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500 hover:text-[#8C6D4F] transition-colors">{item}</a>
            ))}
          </div>
          
          <div className="text-[9px] font-mono tracking-[0.3em] text-slate-600 uppercase text-center md:text-right">
            © 2026 Veltora IT Solutions <br />
            <span className="text-[8px] opacity-50 mt-1 block">The Sovereign Standard</span>
          </div>
        </div>
      </footer>
          </>
        )}
      </div>
  </div>
  );
}
