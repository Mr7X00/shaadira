export enum UserRole {
  GUEST = "GUEST",
  CLIENT = "CLIENT",
  ARTIST = "ARTIST",
  OPERATIONS = "OPERATIONS",
  SUPER_ADMIN = "SUPER_ADMIN",
  ACCOUNT_MANAGER = "ACCOUNT_MANAGER",
}

export enum ArtistCategory {
  MEHNDI = "MEHNDI",
  MAKEUP = "MAKEUP",
  HAIR = "HAIR",
  NAIL = "NAIL",
  DECORATOR = "DECORATOR",
  PHOTOGRAPHER = "PHOTOGRAPHER",
}

export enum VerificationStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum BookingStatus {
  INQUIRY = "INQUIRY",       // Chatting, quote not yet received or pending
  QUOTE_SENT = "QUOTE_SENT", // Quote received, platform fee payment pending
  CONFIRMED = "CONFIRMED",   // Platform fee paid, contact details unlocked
  ARRIVED = "ARRIVED",       // Artist has checked-in via GPS
  COMPLETED_PROOF = "COMPLETED_PROOF", // Artist finished & uploaded proof, client approval pending
  CLOSED = "CLOSED",         // Client approved, review submitted or final
  CANCELLED = "CANCELLED",
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl: string;
  role: UserRole;
  city?: string;
  state?: string;
  gender?: 'MALE' | 'FEMALE';
}

export interface ArtistProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  city: string; // NEW
  state: string; // NEW
  category: ArtistCategory;
  experienceYears: number;
  basePrice: number; // base price in ₹
  rating: number;
  reviewCount: number;
  verified: VerificationStatus;
  avatarUrl: string;
  bannerUrl: string;
  portfolio: string[]; // array of image URLs
  govtIdUrl?: string; // identity proof
  bio: string;
  skills: string[];
}

export interface Booking {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string; // hidden until paid
  artistId: string;
  artistName: string;
  artistCategory: ArtistCategory;
  eventDate: string;
  eventTime: string;
  eventLocation: string; // hidden until paid
  status: BookingStatus;
  quotedAmount?: number; // total amount set by artist
  platformFee?: number; // 5% if < 1000, 10% if >= 1000
  directToArtistAmount?: number; // quotedAmount - platformFee
  paymentId?: string; // Razorpay payment reference
  paidAt?: string;
  gpsCheckInTime?: string;
  gpsCoordinates?: {
    latitude: number;
    longitude: number;
  };
  completionProofUrl?: string;
  completionProofNote?: string;
  completedAt?: string;
  reviews?: {
    rating: number;
    comment: string;
    createdAt: string;
  };
}

export interface Message {
  id: string;
  bookingId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  timestamp: string;
  isSystem?: boolean;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  details: string;
  type: "info" | "warning" | "success" | "danger";
}

export interface EmailLog {
  id: string;
  recipient: string;
  type: string;
  subject: string;
  deliveryStatus: "SENT" | "FAILED";
  sentTime: string;
  failureReason?: string;
  smtpResponse?: string;
  messageId?: string;
}

export interface CityAvailability {
  id: string; // cityName + state
  cityName: string;
  state: string;
  country: string;
  artistCount: number;
  clientCount: number;
  isServiceAvailable: boolean;
  lastUpdated: string;
}

