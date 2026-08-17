import Razorpay from "razorpay";
import crypto from "crypto";

let razorpayClient: Razorpay | null = null;

export function getRazorpayClient(): Razorpay | null {
  if (razorpayClient) return razorpayClient;

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.warn("Razorpay keys not fully configured. Using automated checkout simulator.");
    return null;
  }

  try {
    razorpayClient = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
    return razorpayClient;
  } catch (err) {
    console.error("Failed to initialize Razorpay SDK:", err);
    return null;
  }
}

export async function createRazorpayOrder(amountRupees: number, bookingId: string) {
  const client = getRazorpayClient();
  if (!client) return null;

  try {
    const options = {
      amount: Math.round(amountRupees * 100), // Amount in paise
      currency: "INR",
      receipt: bookingId,
      payment_capture: 1
    };
    
    const order = await client.orders.create(options);
    return order;
  } catch (err) {
    console.error("Failed to create Razorpay Order:", err);
    return null;
  }
}

export function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) return true; // Fail-safe during dev

  try {
    const text = `${orderId}|${paymentId}`;
    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(text)
      .digest("hex");
      
    return generatedSignature === signature;
  } catch (err) {
    console.error("Failed to verify Razorpay payment signature:", err);
    return false;
  }
}
