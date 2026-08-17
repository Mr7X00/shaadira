import { Booking, BookingStatus } from "../types";
import { Check, Clock, ShieldCheck, MapPin, Award, CheckCircle2, AlertCircle } from "lucide-react";
import LeafletMapEmbed from "./LeafletMapEmbed";

interface BookingTimelineProps {
  booking: Booking;
}

export default function BookingTimeline({ booking }: BookingTimelineProps) {
  const steps = [
    {
      status: BookingStatus.INQUIRY,
      label: "Inquiry Started",
      desc: "In-app chat opened. Discussing designs and requirements.",
      icon: Clock,
      color: "border-blue-600 bg-blue-50 text-blue-600"
    },
    {
      status: BookingStatus.QUOTE_SENT,
      label: "Quotation Received",
      desc: booking.quotedAmount 
        ? `Artist quoted ₹${booking.quotedAmount}. Platform fee is ₹${booking.platformFee}.`
        : "Waiting for artist to send quotation.",
      icon: Award,
      color: "border-amber-500 bg-amber-50 text-amber-500"
    },
    {
      status: BookingStatus.CONFIRMED,
      label: "Booking Confirmed",
      desc: booking.paymentId 
        ? `Platform Fee paid. Direct contact and location UNLOCKED.`
        : "Secure platform fee payment pending.",
      icon: ShieldCheck,
      color: "border-emerald-500 bg-emerald-50 text-emerald-500"
    },
    {
      status: BookingStatus.ARRIVED,
      label: "Artist Arrived",
      desc: booking.gpsCheckInTime 
        ? `GPS Verified arrival at ${new Date(booking.gpsCheckInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`
        : "Waiting for artist to arrive and check-in via GPS.",
      icon: MapPin,
      color: "border-indigo-500 bg-indigo-50 text-indigo-500"
    },
    {
      status: BookingStatus.COMPLETED_PROOF,
      label: "Completion Proof Uploaded",
      desc: booking.completionProofUrl 
        ? "Work finished! Review completion proof images."
        : "Service in progress. Proof of completion pending.",
      icon: CheckCircle2,
      color: "border-teal-500 bg-teal-50 text-teal-500"
    },
    {
      status: BookingStatus.CLOSED,
      label: "Closed & Reviewed",
      desc: booking.reviews 
        ? `Completed! You rated ${booking.reviews.rating}/5 stars.`
        : "Waiting for client review and final close.",
      icon: Check,
      color: "border-slate-800 bg-slate-100 text-slate-800"
    }
  ];

  // Helper to determine step states: completed, active, pending
  const getStepState = (stepStatus: BookingStatus) => {
    const order = [
      BookingStatus.INQUIRY,
      BookingStatus.QUOTE_SENT,
      BookingStatus.CONFIRMED,
      BookingStatus.ARRIVED,
      BookingStatus.COMPLETED_PROOF,
      BookingStatus.CLOSED
    ];

    const currentIndex = order.indexOf(booking.status);
    const stepIndex = order.indexOf(stepStatus);

    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "active";
    return "pending";
  };

  return (
    <div id="booking-timeline-module" className="bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-lg font-sans">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
        <div>
          <h4 className="font-display font-bold text-slate-900 text-md">Booking Tracking</h4>
          <p className="text-xs text-slate-400">ID: {booking.id} ({booking.artistName})</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
          booking.status === BookingStatus.CLOSED 
            ? "bg-emerald-100 text-emerald-800" 
            : booking.status === BookingStatus.CONFIRMED 
            ? "bg-blue-100 text-blue-800"
            : booking.status === BookingStatus.INQUIRY 
            ? "bg-slate-100 text-slate-600"
            : "bg-amber-100 text-amber-800"
        }`}>
          {booking.status.replace("_", " ")}
        </span>
      </div>

      <div className="relative pl-6 space-y-6">
        {/* Continuous Connecting Line */}
        <div className="absolute top-2 left-[11px] bottom-2 w-0.5 bg-slate-100" />

        {steps.map((step, idx) => {
          const state = getStepState(step.status);
          const StepIcon = step.icon;

          let iconClass = "";
          let textTitleClass = "";
          let lineBg = "";

          if (state === "completed") {
            iconClass = "bg-emerald-500 border-emerald-500 text-white ring-4 ring-emerald-50";
            textTitleClass = "text-slate-800 font-semibold line-through decoration-slate-300";
            lineBg = "bg-emerald-500";
          } else if (state === "active") {
            iconClass = "bg-blue-600 border-blue-600 text-white ring-4 ring-blue-50 animate-pulse";
            textTitleClass = "text-blue-600 font-bold";
            lineBg = "bg-blue-600";
          } else {
            iconClass = "bg-white border-slate-200 text-slate-400";
            textTitleClass = "text-slate-400 font-medium";
            lineBg = "bg-slate-200";
          }

          return (
            <div key={idx} className="relative flex gap-4 items-start group">
              {/* Overlap timeline bullet color indicator */}
              <div className={`absolute -left-[21px] top-1.5 w-4 h-4 rounded-full border-2 transition-all ${
                state === "completed" ? "bg-emerald-500 border-emerald-500" : state === "active" ? "bg-blue-600 border-blue-600" : "bg-white border-slate-200"
              }`} />

              <div className={`p-2.5 rounded-xl border transition-all ${iconClass}`}>
                <StepIcon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <h5 className={`text-sm tracking-tight ${textTitleClass}`}>
                  {step.label}
                </h5>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {booking.status === BookingStatus.INQUIRY && (
        <div className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-200/50 flex gap-3 items-start">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 leading-relaxed">
            <span className="font-bold">Next Step:</span> Wait for the artist to review your design preferences in the Chat, and submit a formal quotation. You can chat directly now.
          </div>
        </div>
      )}

      {/* Interactive Leaflet Map once booking is confirmed/unlocked */}
      {booking.status !== BookingStatus.INQUIRY && booking.status !== BookingStatus.QUOTE_SENT && (
        <div className="mt-6">
          <LeafletMapEmbed 
            clientAddress={booking.eventLocation}
            artistName={booking.artistName}
            bookingStatus={booking.status}
          />
        </div>
      )}
    </div>
  );
}
