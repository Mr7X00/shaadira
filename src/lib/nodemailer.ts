import nodemailer from "nodemailer";

interface EmailParams {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export async function sendEmail({ to, subject, text, html }: EmailParams): Promise<boolean> {
  const user = process.env.GMAIL_SMTP_USER || process.env.GMAIL_USER;
  const pass = process.env.GMAIL_SMTP_PASS || process.env.GMAIL_PASS;

  if (!user || !pass) {
    console.log(`[SMTP SIMULATED] Email to: ${to}\nSubject: ${subject}\nBody: ${text}`);
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass,
      },
    });

    const info = await transporter.sendMail({
      from: `"SHAADIRA Operations" <${user}>`,
      to,
      subject,
      text,
      html,
    });

    console.log(`[SMTP SENT] Real email successfully sent to ${to}. MessageId: ${info.messageId}`);
    return true;
  } catch (err) {
    console.error("Nodemailer SMTP email dispatch failed:", err);
    return false;
  }
}
