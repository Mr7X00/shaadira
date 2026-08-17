import * as templates from "./email.templates.js";
import { sendMail, SendMailResult } from "./mailer.js";
import { logEmail } from "./email.logger.js";

// Main high-level transactional email service
export const emailService = {
  // EMAIL 1: CLIENT REGISTRATION
  async sendClientRegistration(clientEmail: string, clientName: string, actionUrl?: string): Promise<SendMailResult> {
    const subject = "Welcome to SHAADIRA 🎉";
    const html = templates.getClientRegistrationTemplate(clientName, actionUrl);
    
    const result = await sendMail(clientEmail, subject, html);
    await logEmail({
      recipient: clientEmail,
      type: "CLIENT_REGISTRATION",
      subject: subject,
      deliveryStatus: result.success ? "SENT" : "FAILED",
      failureReason: result.error,
      smtpResponse: result.response,
      messageId: result.messageId,
    });
    
    return result;
  },

  // EMAIL 2: ARTIST REGISTRATION
  async sendArtistRegistration(artistEmail: string, artistName: string): Promise<SendMailResult> {
    const subject = "Welcome to SHAADIRA — Profile Under Verification";
    const html = templates.getArtistRegistrationTemplate(artistName);
    
    const result = await sendMail(artistEmail, subject, html);
    await logEmail({
      recipient: artistEmail,
      type: "ARTIST_REGISTRATION",
      subject: subject,
      deliveryStatus: result.success ? "SENT" : "FAILED",
      failureReason: result.error,
      smtpResponse: result.response,
      messageId: result.messageId,
    });
    
    return result;
  },

  // EMAIL 3: ARTIST PROFILE APPROVED
  async sendArtistApproved(artistEmail: string, artistName: string, dashboardUrl?: string): Promise<SendMailResult> {
    const subject = "Congratulations! Your Artist Profile Has Been Approved 🎉";
    const html = templates.getArtistApprovedTemplate(artistName, dashboardUrl);
    
    const result = await sendMail(artistEmail, subject, html);
    await logEmail({
      recipient: artistEmail,
      type: "ARTIST_PROFILE_APPROVED",
      subject: subject,
      deliveryStatus: result.success ? "SENT" : "FAILED",
      failureReason: result.error,
      smtpResponse: result.response,
      messageId: result.messageId,
    });
    
    return result;
  },

  // EMAIL 4: ARTIST PROFILE REJECTED
  async sendArtistRejected(artistEmail: string, artistName: string, adminRemark: string, updateUrl?: string): Promise<SendMailResult> {
    const subject = "Profile Verification Update";
    const html = templates.getArtistRejectedTemplate(artistName, adminRemark, updateUrl);
    
    const result = await sendMail(artistEmail, subject, html);
    await logEmail({
      recipient: artistEmail,
      type: "ARTIST_PROFILE_REJECTED",
      subject: subject,
      deliveryStatus: result.success ? "SENT" : "FAILED",
      failureReason: result.error,
      smtpResponse: result.response,
      messageId: result.messageId,
    });
    
    return result;
  },

  // EMAIL 5: BOOKING RECEIVED (to Artist)
  async sendBookingReceived(artistEmail: string, artistName: string, data: templates.TemplateData): Promise<SendMailResult> {
    const subject = "You Have Received a New Booking";
    const html = templates.getBookingReceivedTemplate(artistName, data);
    
    const result = await sendMail(artistEmail, subject, html);
    await logEmail({
      recipient: artistEmail,
      type: "BOOKING_RECEIVED",
      subject: subject,
      deliveryStatus: result.success ? "SENT" : "FAILED",
      failureReason: result.error,
      smtpResponse: result.response,
      messageId: result.messageId,
    });
    
    return result;
  },

  // EMAIL 6: BOOKING CONFIRMATION (to Client)
  async sendBookingConfirmation(clientEmail: string, clientName: string, data: templates.TemplateData): Promise<SendMailResult> {
    const subject = "Booking Confirmed";
    const html = templates.getBookingConfirmationTemplate(clientName, data);
    
    const result = await sendMail(clientEmail, subject, html);
    await logEmail({
      recipient: clientEmail,
      type: "BOOKING_CONFIRMATION",
      subject: subject,
      deliveryStatus: result.success ? "SENT" : "FAILED",
      failureReason: result.error,
      smtpResponse: result.response,
      messageId: result.messageId,
    });
    
    return result;
  },

  // EMAIL 7: EVENT REMINDER (24h before event)
  async sendEventReminder(recipientEmail: string, recipientName: string, data: templates.TemplateData, isArtist: boolean): Promise<SendMailResult> {
    const subject = "Reminder: Upcoming Booking Tomorrow";
    const html = templates.getEventReminderTemplate(recipientName, data, isArtist);
    
    const result = await sendMail(recipientEmail, subject, html);
    await logEmail({
      recipient: recipientEmail,
      type: `EVENT_REMINDER_${isArtist ? "ARTIST" : "CLIENT"}`,
      subject: subject,
      deliveryStatus: result.success ? "SENT" : "FAILED",
      failureReason: result.error,
      smtpResponse: result.response,
      messageId: result.messageId,
    });
    
    return result;
  },

  // EMAIL 8: EVENT START REMINDER (2h before event to Artist)
  async sendEventStartReminder(artistEmail: string, artistName: string, data: templates.TemplateData): Promise<SendMailResult> {
    const subject = "Your Event Starts Soon";
    const html = templates.getEventStartReminderTemplate(artistName, data);
    
    const result = await sendMail(artistEmail, subject, html);
    await logEmail({
      recipient: artistEmail,
      type: "EVENT_START_REMINDER",
      subject: subject,
      deliveryStatus: result.success ? "SENT" : "FAILED",
      failureReason: result.error,
      smtpResponse: result.response,
      messageId: result.messageId,
    });
    
    return result;
  },

  // EMAIL 9: BOOKING COMPLETED (to Client)
  async sendBookingCompleted(clientEmail: string, clientName: string, data: templates.TemplateData, actionUrl?: string): Promise<SendMailResult> {
    const subject = "Booking Completed";
    const html = templates.getBookingCompletedTemplate(clientName, data, actionUrl);
    
    const result = await sendMail(clientEmail, subject, html);
    await logEmail({
      recipient: clientEmail,
      type: "BOOKING_COMPLETED",
      subject: subject,
      deliveryStatus: result.success ? "SENT" : "FAILED",
      failureReason: result.error,
      smtpResponse: result.response,
      messageId: result.messageId,
    });
    
    return result;
  },

  // EMAIL 10: PASSWORD RESET
  async sendPasswordReset(recipientEmail: string, resetLink: string): Promise<SendMailResult> {
    const subject = "Reset Your Password";
    const html = templates.getPasswordResetTemplate(recipientEmail, resetLink);
    
    const result = await sendMail(recipientEmail, subject, html);
    await logEmail({
      recipient: recipientEmail,
      type: "PASSWORD_RESET",
      subject: subject,
      deliveryStatus: result.success ? "SENT" : "FAILED",
      failureReason: result.error,
      smtpResponse: result.response,
      messageId: result.messageId,
    });
    
    return result;
  },

  // EMAIL 11: EMAIL VERIFICATION
  async sendEmailVerification(recipientEmail: string, verificationLink: string): Promise<SendMailResult> {
    const subject = "Verify Your Email Address";
    const html = templates.getEmailVerificationTemplate(recipientEmail, verificationLink);
    
    const result = await sendMail(recipientEmail, subject, html);
    await logEmail({
      recipient: recipientEmail,
      type: "EMAIL_VERIFICATION",
      subject: subject,
      deliveryStatus: result.success ? "SENT" : "FAILED",
      failureReason: result.error,
      smtpResponse: result.response,
      messageId: result.messageId,
    });
    
    return result;
  },

  // EMAIL EXTRA: BOOKING INQUIRY
  async sendBookingInquiry(artistEmail: string, artistName: string, clientName: string, eventDate: string, eventTime: string): Promise<SendMailResult> {
    const subject = "New Veltora Inquiry Received!";
    const html = templates.getInquiryReceivedTemplate(artistName, clientName, eventDate, eventTime);
    
    const result = await sendMail(artistEmail, subject, html);
    await logEmail({
      recipient: artistEmail,
      type: "BOOKING_INQUIRY",
      subject: subject,
      deliveryStatus: result.success ? "SENT" : "FAILED",
      failureReason: result.error,
      smtpResponse: result.response,
      messageId: result.messageId,
    });
    
    return result;
  },

  // EMAIL EXTRA: QUOTATION RECEIVED
  async sendQuoteSubmitted(clientEmail: string, clientName: string, artistName: string, amount: number, platformFee: number, eventDate: string): Promise<SendMailResult> {
    const subject = "Quotation Received from SHAADIRA Artist!";
    const html = templates.getQuoteSubmittedTemplate(clientName, artistName, amount, platformFee, eventDate);
    
    const result = await sendMail(clientEmail, subject, html);
    await logEmail({
      recipient: clientEmail,
      type: "QUOTE_SUBMITTED",
      subject: subject,
      deliveryStatus: result.success ? "SENT" : "FAILED",
      failureReason: result.error,
      smtpResponse: result.response,
      messageId: result.messageId,
    });
    
    return result;
  },

  async sendCityAvailable(clientEmail: string, clientName: string, cityName: string): Promise<SendMailResult> {
    const subject = "🎉 SHAADIRA is Now Available in Your City!";
    const html = templates.getCityAvailableTemplate(clientName, cityName);
    
    const result = await sendMail(clientEmail, subject, html);
    await logEmail({
      recipient: clientEmail,
      type: "CITY_AVAILABLE",
      subject: subject,
      deliveryStatus: result.success ? "SENT" : "FAILED",
      failureReason: result.error,
      smtpResponse: result.response,
      messageId: result.messageId,
    });
    
    return result;
  },

  async sendClientAvailable(artistEmail: string, artistName: string, cityName: string): Promise<SendMailResult> {
    const subject = "🎉 Clients are Now Looking for Artists in Your City!";
    const html = templates.getClientAvailableTemplate(artistName, cityName);
    
    const result = await sendMail(artistEmail, subject, html);
    await logEmail({
      recipient: artistEmail,
      type: "CLIENT_AVAILABLE",
      subject: subject,
      deliveryStatus: result.success ? "SENT" : "FAILED",
      failureReason: result.error,
      smtpResponse: result.response,
      messageId: result.messageId,
    });
    
    return result;
  },
};

