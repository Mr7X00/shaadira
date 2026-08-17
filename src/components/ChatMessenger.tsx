import React, { useState, useEffect, useRef } from "react";
import { Booking, BookingStatus, Message, UserRole, VerificationStatus } from "../types";
import { Send, Sparkles, MessageCircle, DollarSign, ShieldCheck, Phone, Mail, MapPin, CheckCircle, Smartphone } from "lucide-react";

interface ChatMessengerProps {
  booking: Booking;
  activeRole: UserRole;
  messages: Message[];
  onSendMessage: (text: string) => void;
  onSubmitQuote: (amount: number) => void;
  onOpenPayment: () => void;
}

export default function ChatMessenger({ 
  booking, 
  activeRole, 
  messages, 
  onSendMessage, 
  onSubmitQuote, 
  onOpenPayment 
}: ChatMessengerProps) {
  const [inputText, setInputText] = useState("");
  const [quoteInput, setQuoteInput] = useState("");
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText("");
  };

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(quoteInput);
    if (!val || val <= 0) return;
    onSubmitQuote(val);
    setQuoteInput("");
    setShowQuoteForm(false);
  };

  const isClient = activeRole === UserRole.CLIENT || activeRole === UserRole.GUEST;
  const isArtist = activeRole === UserRole.ARTIST;
  const isPaid = booking.status !== BookingStatus.INQUIRY && booking.status !== BookingStatus.QUOTE_SENT && booking.status !== BookingStatus.CANCELLED;

  return (
    <div id="chat-messenger-module" className="bg-white rounded-[24px] border border-slate-200/60 shadow-lg flex flex-col h-[600px] overflow-hidden font-sans">
      {/* Messenger Header */}
      <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-amber-500 rounded-full flex items-center justify-center font-display font-bold text-sm">
              {isClient ? booking.artistName[0] : booking.clientName[0]}
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" />
          </div>
          <div>
            <h4 className="font-semibold text-sm">
              {isClient ? booking.artistName : booking.clientName}
            </h4>
            <p className="text-[10px] text-slate-400 flex items-center gap-1">
              <MessageCircle className="w-3 h-3 text-emerald-400" />
              <span>In-App Chat Active</span>
            </p>
          </div>
        </div>

        {/* Security badge */}
        <div className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-full text-[10px]">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-slate-300 font-medium">Privacy Protection Active</span>
        </div>
      </div>

      {/* Contact Unlock Ribbon (Visible once platform fee is paid) */}
      {isPaid ? (
        <div className="bg-emerald-50 text-emerald-900 px-4 py-3 border-b border-emerald-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span><span className="font-bold">Contact Unlocked:</span> Directly communicate with your match now.</span>
          </div>
          
          <div className="flex flex-wrap gap-3 font-mono font-bold text-[11px] text-emerald-800">
            <a href="tel:+919876543210" className="flex items-center gap-1 hover:underline">
              <Phone className="w-3 h-3" />
              <span>+91 98765 43210</span>
            </a>
            <a href="mailto:contact@example.com" className="flex items-center gap-1 hover:underline">
              <Mail className="w-3 h-3" />
              <span>{isClient ? "preeti@veltora.in" : booking.clientEmail}</span>
            </a>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 text-slate-500 px-4 py-2.5 border-b border-slate-200/50 text-center text-[10px] font-medium uppercase tracking-wider flex items-center justify-center gap-1.5">
          <Smartphone className="w-3.5 h-3.5 text-slate-400" />
          <span>Phone numbers & locations are automatically unlocked after Platform Fee is paid</span>
        </div>
      )}

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 premium-scrollbar">
        {messages.map((msg) => {
          if (msg.isSystem) {
            return (
              <div key={msg.id} className="flex justify-center my-4">
                <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2 text-[11px] text-blue-700 max-w-md text-center shadow-sm leading-relaxed">
                  {msg.text}
                </div>
              </div>
            );
          }

          const isMe = (isClient && msg.senderRole === UserRole.CLIENT) || 
                       (isArtist && msg.senderRole === UserRole.ARTIST) || 
                       (activeRole === UserRole.SUPER_ADMIN && msg.senderId === "system");

          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-sm rounded-[18px] px-4 py-3 text-sm shadow-sm ${
                isMe 
                  ? "bg-blue-600 text-white rounded-br-none" 
                  : "bg-white text-slate-800 border border-slate-200/50 rounded-bl-none"
              }`}>
                <div className="text-[9px] font-bold uppercase tracking-wider mb-0.5 opacity-60">
                  {msg.senderName}
                </div>
                <div className="leading-relaxed whitespace-pre-wrap">{msg.text}</div>
                <div className="text-[9px] text-right mt-1.5 opacity-50">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Interactive Context Action Drawer (Pending actions based on status & role) */}
      <div className="border-t border-slate-100 bg-slate-50/50 p-3">
        {/* Step 1: Booking is INQUIRY & Active user is ARTIST -> Build Quote Button */}
        {booking.status === BookingStatus.INQUIRY && isArtist && (
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/50">
            {showQuoteForm ? (
              <form onSubmit={handleQuoteSubmit} className="flex items-center gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                  <input
                    type="number"
                    value={quoteInput}
                    onChange={(e) => setQuoteInput(e.target.value)}
                    placeholder="Enter full quoted amount (e.g. 1500)"
                    className="w-full bg-white border border-slate-200 rounded-xl pl-7 pr-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 font-bold text-slate-800"
                  />
                </div>
                <button
                  id="submit-quote-action"
                  type="submit"
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold rounded-xl shadow cursor-pointer transition-colors"
                >
                  Submit Quote
                </button>
                <button
                  type="button"
                  onClick={() => setShowQuoteForm(false)}
                  className="text-slate-400 text-xs hover:text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-slate-800">Send Price Proposal</h5>
                  <p className="text-[10px] text-slate-500">Provide an exact quotation based on Rohan's request.</p>
                </div>
                <button
                  id="show-quote-builder"
                  onClick={() => setShowQuoteForm(true)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow cursor-pointer"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Send Quotation</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Booking is QUOTE_SENT & Active user is CLIENT -> Call to Pay Fee */}
        {booking.status === BookingStatus.QUOTE_SENT && isClient && (
          <div className="p-3.5 bg-gradient-to-r from-blue-50 to-amber-50 rounded-2xl border border-blue-200/50 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
            <div>
              <h5 className="text-xs font-bold text-blue-900 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Quotation of ₹{booking.quotedAmount} Ready!</span>
              </h5>
              <p className="text-[10px] text-slate-500">Pay a platform fee of <span className="font-bold text-blue-600">₹{booking.platformFee}</span> to unlock contact info & confirm slot.</p>
            </div>
            <button
              id="checkout-trigger"
              onClick={onOpenPayment}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all hover:scale-103"
            >
              Pay Platform Fee (₹{booking.platformFee})
            </button>
          </div>
        )}

        {/* Step 3: Booking is CONFIRMED & Active user is CLIENT -> Waiting for arrival */}
        {booking.status === BookingStatus.CONFIRMED && isClient && (
          <div className="p-2.5 bg-blue-50 rounded-xl text-[11px] text-blue-800 text-center font-medium">
            ⏳ Waiting for artist {booking.artistName} to travel to your venue and check-in via GPS. Complete address unlocked!
          </div>
        )}
      </div>

      {/* Messenger Footer Input Form */}
      <form onSubmit={handleSend} className="p-4 border-t border-slate-100 flex gap-2 bg-white">
        <input
          id="chat-text-input"
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask about design preferences, stains, availability..."
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-blue-500"
        />
        <button
          id="chat-send-btn"
          type="submit"
          className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow transition-colors cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
