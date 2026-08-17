import nodemailer from "nodemailer";

export interface SendMailResult {
  success: boolean;
  messageId?: string;
  response?: string;
  error?: string;
}

// Function to send a real email using Gmail SMTP and Nodemailer
export async function sendMail(to: string, subject: string, html: string): Promise<SendMailResult> {
  const user = process.env.GMAIL_SMTP_USER;
  const pass = process.env.GMAIL_SMTP_PASS;
  const fromName = process.env.SMTP_FROM_NAME || "SHAADIRA";

  if (!user || !pass) {
    console.error("[Mailer] SMTP Credentials not configured in environment variables.");
    return {
      success: false,
      error: "SMTP Credentials (GMAIL_SMTP_USER / GMAIL_SMTP_PASS) not configured in .env",
    };
  }

  // Create transporter dynamically on send to reflect runtime environment secret updates
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: user,
      pass: pass,
    },
  });

  const mailOptions = {
    from: `"${fromName}" <${user}>`,
    to: to,
    subject: subject,
    html: html,
  };

  let lastError: any = null;
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`[Mailer] Attempt ${attempt} to send email to ${to} for subject "${subject}"`);
      const info = await transporter.sendMail(mailOptions);
      console.log(`[Mailer] Email sent successfully to ${to}. Message ID: ${info.messageId}`);
      return {
        success: true,
        messageId: info.messageId,
        response: info.response,
      };
    } catch (err: any) {
      lastError = err;
      console.error(`[Mailer] Attempt ${attempt} failed:`, err.message || err);
      if (attempt < maxAttempts) {
        const delay = 1000 * attempt; // Exponential backoff: 1s, then 2s
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  return {
    success: false,
    error: lastError?.message || String(lastError || "Unknown transport failure"),
  };
}
