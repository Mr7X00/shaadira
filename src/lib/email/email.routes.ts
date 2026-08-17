import express from "express";
import { emailService } from "./email.service.js";
import { getEmailLogs } from "./email.logger.js";

const router = express.Router();

// Retrieve all transactional email logs for Super Admins
router.get("/logs", async (req, res) => {
  try {
    const logs = await getEmailLogs();
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to retrieve transactional email logs" });
  }
});

// Send a secure password reset email
router.post("/send-reset", async (req, res) => {
  const { email, link } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Missing required parameter 'email'" });
  }
  const resetLink = link || `https://veltora.com/reset-password?email=${encodeURIComponent(email)}&token=t_${Date.now()}`;
  
  try {
    const result = await emailService.sendPasswordReset(email, resetLink);
    if (result.success) {
      res.json({ message: "Password reset email sent successfully", result });
    } else {
      res.status(500).json({ error: result.error || "Failed to send password reset email" });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to dispatch password reset request" });
  }
});

// Send a secure email verification email
router.post("/send-verification", async (req, res) => {
  const { email, link } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Missing required parameter 'email'" });
  }
  const verifyLink = link || `https://veltora.com/verify-email?email=${encodeURIComponent(email)}&token=t_${Date.now()}`;
  
  try {
    const result = await emailService.sendEmailVerification(email, verifyLink);
    if (result.success) {
      res.json({ message: "Verification email sent successfully", result });
    } else {
      res.status(500).json({ error: result.error || "Failed to send email verification" });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to dispatch email verification request" });
  }
});

export default router;
