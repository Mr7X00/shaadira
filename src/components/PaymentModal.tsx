import { useState, useEffect } from "react";
import { Booking } from "../types";
import { X, CreditCard, Shield, Landmark, Sparkles, CheckCircle2 } from "lucide-react";

interface PaymentModalProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (bookingId: string, transactionId: string) => void;
}

export default function PaymentModal({ booking, isOpen, onClose, onPaymentSuccess }: PaymentModalProps) {
  const [activeTab, setActiveTab] = useState<"card" | "upi">("card");
  const [cardNumber, setCardNumber] = useState("4582 •••• •••• 8920");
  const [expiry, setExpiry] = useState("09/29");
  const [cvv, setCvv] = useState("•••");
  const [upiId, setUpiId] = useState("rohan@okaxis");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [razorpayConfig, setRazorpayConfig] = useState<{ enabled: boolean; keyId: string } | null>(null);

  useEffect(() => {
    // Fetch configuration
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => {
        setRazorpayConfig({
          enabled: data.razorpayEnabled,
          keyId: data.razorpayKeyId,
        });
      })
      .catch((err) => console.error("Failed fetching payment configuration:", err));

    // Load Razorpay Script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  if (!isOpen) return null;

  const handlePay = async () => {
    setIsProcessing(true);

    try {
      const calculatedFee = booking.platformFee || 0;
      
      // Request Razorpay Order from Backend
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: calculatedFee, bookingId: booking.id })
      });
      const orderData = await orderRes.json();

      if (orderData.real && razorpayConfig?.enabled && (window as any).Razorpay) {
        setIsProcessing(false);
        const options = {
          key: razorpayConfig.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "Veltora Services",
          description: `Veltora Platform Fee for Booking ${booking.id}`,
          order_id: orderData.orderId,
          handler: async function (response: any) {
            setIsProcessing(true);
            try {
              const verifyRes = await fetch("/api/bookings/pay", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  bookingId: booking.id,
                  paymentId: response.razorpay_payment_id,
                  signature: response.razorpay_signature,
                  orderId: response.razorpay_order_id
                })
              });
              if (verifyRes.ok) {
                setPaymentDone(true);
                setTimeout(() => {
                  onPaymentSuccess(booking.id, response.razorpay_payment_id);
                  setPaymentDone(false);
                  onClose();
                }, 1500);
              } else {
                alert("Payment validation failed. Please check your network.");
              }
            } catch (err) {
              console.error("Signature verification endpoint failed:", err);
            } finally {
              setIsProcessing(false);
            }
          },
          prefill: {
            name: booking.clientName,
            email: booking.clientEmail,
            contact: booking.clientPhone
          },
          theme: {
            color: "#2563EB"
          }
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        // Fallback to fully simulated checkout
        setTimeout(() => {
          setIsProcessing(false);
          setPaymentDone(true);
          setTimeout(() => {
            // Confirm mock payment on backend
            fetch("/api/bookings/pay", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ bookingId: booking.id })
            }).then(() => {
              onPaymentSuccess(booking.id, "pay_rzp_mock_" + Math.floor(Math.random() * 900000 + 100000));
              setPaymentDone(false);
              onClose();
            });
          }, 1500);
        }, 2000);
      }
    } catch (err) {
      console.error("Payment initiation failed:", err);
      setIsProcessing(false);
    }
  };

  const calculatedFee = booking.platformFee || 0;
  const directToArtist = booking.directToArtistAmount || 0;
  const quoteTotal = booking.quotedAmount || 0;
  const feePercent = quoteTotal < 1000 ? 5 : 10;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md font-sans">
      <div 
        id="payment-modal-container"
        className="glass-card-dark text-white rounded-[24px] max-w-md w-full overflow-hidden border border-white/10 shadow-2xl relative"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-full cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {paymentDone ? (
          /* Successful state screen */
          <div className="p-8 text-center space-y-4">
            <div className="inline-flex p-4 bg-emerald-500/10 text-emerald-400 rounded-full animate-bounce">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h4 className="font-display font-bold text-2xl text-emerald-400">Payment Confirmed!</h4>
            <p className="text-slate-300 text-sm">
              Platform Fee of ₹{calculatedFee} has been successfully secured.
            </p>
            <div className="text-[11px] font-mono text-slate-400 bg-slate-900 py-2 px-3 rounded-lg inline-block">
              Txn Reference: pay_rzp_mock_582910
            </div>
            <p className="text-xs text-amber-300 font-light pt-2">
              Unlocking contact details and location...
            </p>
          </div>
        ) : (
          /* Standard Payment details Form */
          <div>
            {/* Header branding */}
            <div className="bg-gradient-to-r from-blue-900/60 to-slate-900 p-6 border-b border-white/10 flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-xl text-white">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-display font-bold text-md tracking-tight">Veltora Secure Checkout</h4>
                <p className="text-[10px] text-blue-300 tracking-wider font-semibold uppercase">Powered by Razorpay Sandbox</p>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Payment Bill Summary */}
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-3">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Artist Quote Total</span>
                  <span className="font-semibold text-slate-200">₹{quoteTotal}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Platform Fee ({feePercent}%)</span>
                  <span className="font-semibold text-amber-400">₹{calculatedFee}</span>
                </div>
                <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-200">Payable Online Now</span>
                  <span className="text-lg font-display font-extrabold text-blue-400">₹{calculatedFee}</span>
                </div>
                <div className="bg-amber-500/10 text-amber-300 text-[10px] p-2.5 rounded-xl border border-amber-500/10 leading-relaxed font-light">
                  <span className="font-bold uppercase">Cash on Delivery:</span> You will pay the remaining <span className="font-bold">₹{directToArtist}</span> directly to artist {booking.artistName} in cash or UPI at the event venue.
                </div>
              </div>

              {/* Payment options Tabs */}
              <div className="grid grid-cols-2 gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
                <button
                  type="button"
                  onClick={() => setActiveTab("card")}
                  className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === "card" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Debit/Credit Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("upi")}
                  className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === "upi" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Landmark className="w-3.5 h-3.5" />
                  <span>UPI Payment</span>
                </button>
              </div>

              {/* Payment details content */}
              {activeTab === "card" ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-blue-500 text-slate-200"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Expiry Date</label>
                      <input
                        type="text"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-blue-500 text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">CVV Code</label>
                      <input
                        type="password"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        placeholder="•••"
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-blue-500 text-slate-200"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">UPI Address (VPA)</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. name@upi"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-blue-500 text-slate-200"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">Submit to trigger a prompt on your phone's payment app</span>
                </div>
              )}

              {/* Secure Trust info */}
              <div className="flex gap-2 items-center justify-center text-[10px] text-slate-400">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>SSL Encrypted • Fully Traceable Platform Fees</span>
              </div>

              {/* Pay Button */}
              <button
                id="payment-pay-btn"
                onClick={handlePay}
                disabled={isProcessing}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-semibold text-xs tracking-wider uppercase transition-all shadow-lg hover:shadow-xl cursor-pointer"
              >
                {isProcessing ? "Processing Security Clearance..." : `Securely Pay ₹${calculatedFee}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
