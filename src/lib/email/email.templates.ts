// Premium Responsive HTML Email Templates for SHAADIRA Artist Connect
// Colors: Royal Blue (#1E3A8A), Premium Gold (#D4AF37), Text Dark (#1E293B)

export interface TemplateData {
  clientName?: string;
  artistName?: string;
  bookingId?: string;
  eventDate?: string;
  eventTime?: string;
  eventLocation?: string;
  quotedAmount?: number;
  platformFee?: number;
  remainingAmount?: number;
  adminRemark?: string;
  token?: string;
  actionUrl?: string;
}

// Simple HTML escaping helper for user input security
export function escapeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getBaseTemplate(title: string, contentHtml: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F1F5F9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #F1F5F9; padding: 20px 0;">
    <tr>
      <td align="center">
        <!-- Main Email Card -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); border: 1px solid #E2E8F0;">
          
          <!-- Header (Royal Blue + Gold Border) -->
          <tr>
            <td align="center" style="background-color: #1E3A8A; padding: 35px 20px; border-bottom: 4px solid #D4AF37;">
              <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="background-color: #ffffff; width: 44px; height: 44px; border-radius: 10px; font-weight: 900; font-size: 24px; color: #1E3A8A; line-height: 44px; text-align: center;">V</td>
                  <td style="padding-left: 12px; text-align: left;">
                    <div style="margin: 0; font-size: 18px; font-weight: 900; letter-spacing: 2px; color: #ffffff; text-transform: uppercase; line-height: 1;">VELTORA</div>
                    <div style="margin: 3px 0 0; font-size: 8px; font-weight: bold; text-transform: uppercase; letter-spacing: 3px; color: #D4AF37; line-height: 1;">Artist Connect</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 40px 30px; color: #1E293B;">
              ${contentHtml}
            </td>
          </tr>

          <!-- Footer Area -->
          <tr>
            <td style="background-color: #F8FAFC; padding: 30px; border-top: 1px solid #E2E8F0; text-align: center;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="font-size: 12px; font-weight: bold; color: #1E3A8A; margin-bottom: 4px;">
                    SHAADIRA Artist Connect
                  </td>
                </tr>
                <tr>
                  <td align="center" style="font-size: 11px; color: #64748B; padding: 4px 0 12px;">
                    Connecting Clients with Verified Artists
                  </td>
                </tr>
                <tr>
                  <td align="center" style="font-size: 11px; color: #64748B; padding-bottom: 15px;">
                    <a href="https://veltora.com" style="color: #1E3A8A; text-decoration: none; font-weight: bold; margin-right: 8px;">Website</a> | 
                    <a href="mailto:support@veltora.com" style="color: #1E3A8A; text-decoration: none; font-weight: bold; margin-left: 8px;">Support Email</a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="font-size: 10px; color: #94A3B8; line-height: 1.4;">
                    © 2026 SHAADIRA Artist Connect. All rights reserved.<br>
                    You are receiving this transactional email as a registered member of the SHAADIRA ecosystem.
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 15px;">
                    <!-- Future Ready Social Icons placeholder -->
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 0 6px;"><span style="display: inline-block; width: 26px; height: 26px; line-height: 26px; background-color: #E2E8F0; border-radius: 50%; color: #1E3A8A; font-weight: bold; font-size: 11px;">f</span></td>
                        <td style="padding: 0 6px;"><span style="display: inline-block; width: 26px; height: 26px; line-height: 26px; background-color: #E2E8F0; border-radius: 50%; color: #1E3A8A; font-weight: bold; font-size: 11px;">t</span></td>
                        <td style="padding: 0 6px;"><span style="display: inline-block; width: 26px; height: 26px; line-height: 26px; background-color: #E2E8F0; border-radius: 50%; color: #1E3A8A; font-weight: bold; font-size: 11px;">in</span></td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// EMAIL 1: CLIENT REGISTRATION
export function getClientRegistrationTemplate(clientName: string, actionUrl: string = "https://veltora.com/explore"): string {
  const escName = escapeHtml(clientName);
  const escUrl = escapeHtml(actionUrl);
  
  const content = `
    <h2 style="margin-top: 0; font-size: 20px; font-weight: bold; color: #1E3A8A; border-bottom: 2px solid #F1F5F9; padding-bottom: 12px;">Welcome to SHAADIRA Artist Connect 🎉</h2>
    <p style="font-size: 14px; line-height: 1.6; margin-top: 15px;">Welcome <strong>${escName}</strong>,</p>
    <p style="font-size: 14px; line-height: 1.6;">Thank you for creating your account. Your account has been successfully created on our trusted professional matching platform.</p>
    <p style="font-size: 14px; line-height: 1.6; font-weight: bold; color: #1E3A8A; margin-top: 20px;">You can now:</p>
    <ul style="font-size: 14px; line-height: 1.8; padding-left: 20px; color: #334155;">
      <li>🔍 Search verified premium artists in your vicinity</li>
      <li>💬 Chat securely before booking and detail your specific designs</li>
      <li>📄 Receive customized, upfront formal price quotes</li>
      <li>💳 Pay platform fees securely through integrated Razorpay escrow</li>
      <li>✨ Book trusted, organic certified hand-crafted mehndi professionals</li>
    </ul>
    
    <table border="0" cellpadding="0" cellspacing="0" style="margin: 30px 0 10px; width: 100%;">
      <tr>
        <td align="center">
          <table border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" bgcolor="#1E3A8A" style="border-radius: 8px;">
                <a href="${escUrl}" target="_blank" style="display: inline-block; padding: 14px 28px; font-size: 14px; font-weight: bold; color: #ffffff; text-decoration: none; text-transform: uppercase; letter-spacing: 1px;">Explore Artists Now</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <p style="font-size: 12px; color: #64748B; line-height: 1.5; text-align: center; margin-top: 10px;">
      Need any setup help? Get in touch with our operations desk anytime via the Support Contact options below.
    </p>
  `;
  return getBaseTemplate("Welcome to SHAADIRA Artist Connect 🎉", content);
}

// EMAIL 2: ARTIST REGISTRATION
export function getArtistRegistrationTemplate(artistName: string): string {
  const escName = escapeHtml(artistName);
  
  const content = `
    <h2 style="margin-top: 0; font-size: 20px; font-weight: bold; color: #1E3A8A; border-bottom: 2px solid #F1F5F9; padding-bottom: 12px;">Registration Received!</h2>
    <p style="font-size: 14px; line-height: 1.6; margin-top: 15px;">Hello <strong>${escName}</strong>,</p>
    <p style="font-size: 14px; line-height: 1.6;">Thank you for joining SHAADIRA Artist Connect as an elite artist. We have successfully received your registration application and professional portfolio credentials.</p>
    
    <!-- Status Card -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FFFDF5; border: 1px solid #FCD34D; border-radius: 12px; margin: 25px 0; padding: 20px;">
      <tr>
        <td>
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #B45309; letter-spacing: 1px;">
                CURRENT AUDIT STATUS
              </td>
            </tr>
            <tr>
              <td style="padding-top: 8px;">
                <span style="display: inline-block; background-color: #FEF3C7; color: #D97706; border: 1px solid #FCD34D; border-radius: 20px; padding: 4px 12px; font-size: 12px; font-weight: bold; text-transform: uppercase;">
                  🟡 Pending Verification
                </span>
              </td>
            </tr>
            <tr>
              <td style="font-size: 13px; line-height: 1.6; color: #78350F; padding-top: 12px;">
                Our manual verification team is currently reviewing your:
                <ul style="margin: 5px 0; padding-left: 20px;">
                  <li>National Government Identification proof</li>
                  <li>Portfolio showcase high-resolution image proofs</li>
                  <li>Studio address coordinates</li>
                  <li>Verified contact details & organic chemical-free certifications</li>
                </ul>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px;">
      <tr>
        <td style="font-size: 13px; line-height: 1.5; color: #475569;">
          <strong>Estimated Review Time:</strong> 24–48 Hours<br>
          <span style="color: #94A3B8;">Until formal approval is confirmed, your profile will remain locked and hidden from clients. You will not receive custom chat requests or bookings.</span>
        </td>
      </tr>
    </table>
    
    <p style="font-size: 13px; line-height: 1.6;">You can log in and update your bio, pricing coordinates, or upload clearer portfolio images while waiting.</p>
  `;
  return getBaseTemplate("Welcome to SHAADIRA — Profile Under Verification", content);
}

// EMAIL 3: ARTIST PROFILE APPROVED
export function getArtistApprovedTemplate(artistName: string, dashboardUrl: string = "https://veltora.com/dashboard"): string {
  const escName = escapeHtml(artistName);
  const escUrl = escapeHtml(dashboardUrl);
  
  const content = `
    <!-- Congratulations Banner -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 12px; margin-bottom: 25px; padding: 20px; text-align: center;">
      <tr>
        <td style="font-size: 32px;">🎉</td>
      </tr>
      <tr>
        <td style="font-size: 18px; font-weight: bold; color: #15803D; padding-top: 10px; text-transform: uppercase; letter-spacing: 1px;">
          PROFILE OFFICIALLY APPROVED
        </td>
      </tr>
    </table>

    <p style="font-size: 14px; line-height: 1.6;">Hello <strong>${escName}</strong>,</p>
    <p style="font-size: 14px; line-height: 1.6; font-weight: bold; color: #16A34A;">Congratulations! Your SHAADIRA Artist profile has been verified and approved.</p>
    
    <p style="font-size: 14px; line-height: 1.6;">Your credentials have passed our rigorous security audit. Your professional portfolio is now live on our search maps. Clients can view your profiles and initiate direct chats!</p>
    
    <p style="font-size: 14px; line-height: 1.6; font-weight: bold; color: #1E3A8A; margin-top: 20px;">You are now cleared to:</p>
    <ul style="font-size: 14px; line-height: 1.8; padding-left: 20px; color: #334155;">
      <li>📅 Accept custom date bookings</li>
      <li>💬 Receive real-time chat requests and design details</li>
      <li>🗺️ Unlock precise coordinates of event venue once platform fees are paid</li>
      <li>📈 Manage your booking timelines, track client invoices, and grow your local client network</li>
    </ul>

    <table border="0" cellpadding="0" cellspacing="0" style="margin: 30px 0; width: 100%;">
      <tr>
        <td align="center">
          <table border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" bgcolor="#1E3A8A" style="border-radius: 8px;">
                <a href="${escUrl}" target="_blank" style="display: inline-block; padding: 14px 28px; font-size: 14px; font-weight: bold; color: #ffffff; text-decoration: none; text-transform: uppercase; letter-spacing: 1px;">Login to Dashboard</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <p style="font-size: 13px; line-height: 1.6; color: #475569;">
      Make sure to keep your baseline pricing rate updated and log in frequently to quickly respond to pending inquiries. Excellent, timely communication ensures a higher matching success rate!
    </p>
  `;
  return getBaseTemplate("Congratulations! Your Artist Profile Approved 🎉", content);
}

// EMAIL 4: ARTIST PROFILE REJECTED
export function getArtistRejectedTemplate(artistName: string, adminRemark: string, updateUrl: string = "https://veltora.com/profile"): string {
  const escName = escapeHtml(artistName);
  const escRemark = escapeHtml(adminRemark || "Provided government identification or portfolio proof is blurred/invalid.");
  const escUrl = escapeHtml(updateUrl);
  
  const content = `
    <h2 style="margin-top: 0; font-size: 20px; font-weight: bold; color: #991B1B; border-bottom: 2px solid #F1F5F9; padding-bottom: 12px;">Profile Verification Update</h2>
    <p style="font-size: 14px; line-height: 1.6; margin-top: 15px;">Hello <strong>${escName}</strong>,</p>
    <p style="font-size: 14px; line-height: 1.6;">Thank you for your patience during the profile audit process. Unfortunately, our compliance operations team could not approve your profile at this time.</p>
    
    <!-- Rejection Reason Card -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FEF2F2; border: 1px solid #FCA5A5; border-radius: 12px; margin: 25px 0; padding: 20px;">
      <tr>
        <td>
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #991B1B; letter-spacing: 1px;">
                AUDIT COMPLIANCE REMARKS
              </td>
            </tr>
            <tr>
              <td style="font-size: 14px; line-height: 1.6; color: #7F1D1D; padding-top: 10px; font-family: monospace;">
                "${escRemark}"
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <p style="font-size: 14px; line-height: 1.6;">Do not worry! You can easily fix these details, update your professional information or identification documents, and submit your profile for a swift re-audit.</p>

    <table border="0" cellpadding="0" cellspacing="0" style="margin: 30px 0; width: 100%;">
      <tr>
        <td align="center">
          <table border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" bgcolor="#991B1B" style="border-radius: 8px;">
                <a href="${escUrl}" target="_blank" style="display: inline-block; padding: 14px 28px; font-size: 14px; font-weight: bold; color: #ffffff; text-decoration: none; text-transform: uppercase; letter-spacing: 1px;">Update Profile Information</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <p style="font-size: 12px; color: #64748B; line-height: 1.5; text-align: center;">
      If you have questions regarding the specific ID guidelines or organic mehndi test rules, reply directly to this email or reach out to our Helpdesk.
    </p>
  `;
  return getBaseTemplate("Profile Verification Update", content);
}

// EMAIL 5: BOOKING RECEIVED
export function getBookingReceivedTemplate(artistName: string, data: TemplateData): string {
  const escName = escapeHtml(artistName);
  const escClient = escapeHtml(data.clientName || "A Client");
  const escDate = escapeHtml(data.eventDate || "");
  const escTime = escapeHtml(data.eventTime || "");
  const escLocation = escapeHtml(data.eventLocation || "Venue Unlocked in Dashboard");
  const quoted = Number(data.quotedAmount) || 0;
  const platform = Number(data.platformFee) || 0;
  const direct = Number(data.remainingAmount) || (quoted - platform);
  
  const content = `
    <h2 style="margin-top: 0; font-size: 20px; font-weight: bold; color: #1E3A8A; border-bottom: 2px solid #F1F5F9; padding-bottom: 12px;">You Have Received a New Booking!</h2>
    <p style="font-size: 14px; line-height: 1.6; margin-top: 15px;">Hello <strong>${escName}</strong>,</p>
    <p style="font-size: 14px; line-height: 1.6;">Exciting news! Client <strong>${escClient}</strong> has paid the Platform Security Fee. Your booking is officially <strong>CONFIRMED</strong>, and client contacts have been securely unlocked.</p>
    
    <!-- Booking Specifications List -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; margin: 25px 0; padding: 20px;">
      <tr>
        <td style="font-size: 13px; line-height: 1.8; color: #334155;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td width="40%" style="font-weight: bold; color: #64748B;">Client Name:</td>
              <td width="60%" style="font-weight: bold; color: #1E293B;">${escClient}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; color: #64748B;">Date:</td>
              <td style="color: #1E293B;">${escDate}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; color: #64748B;">Time:</td>
              <td style="color: #1E293B;">${escTime}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; color: #64748B; vertical-align: top;">Location:</td>
              <td style="color: #1E293B; font-weight: 500;">${escLocation}</td>
            </tr>
            <tr style="height: 10px;"><td colspan="2"></td></tr>
            <tr style="border-top: 1px dashed #CBD5E1;">
              <td colspan="2" style="padding-top: 10px;"></td>
            </tr>
            <tr>
              <td style="font-weight: bold; color: #64748B;">Total Quote:</td>
              <td style="color: #1E293B; font-weight: bold;">₹${quoted.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; color: #64748B;">Platform Fee Paid:</td>
              <td style="color: #16A34A; font-weight: bold;">₹${platform.toLocaleString()} (Paid)</td>
            </tr>
            <tr>
              <td style="font-weight: bold; color: #64748B; font-size: 14px; color: #1E3A8A;">Remaining Due:</td>
              <td style="color: #B45309; font-weight: bold; font-size: 14px;">₹${direct.toLocaleString()} (Due on spot)</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FFFBEB; border-left: 4px solid #F59E0B; padding: 15px; border-radius: 4px; margin-bottom: 25px;">
      <tr>
        <td style="font-size: 13px; line-height: 1.5; color: #B45309;">
          ⚠️ <strong>Reminder:</strong> Please ensure you coordinate with the client in advance. Arrive at the scheduled event venue on time, bring certified premium organic henna cones, and provide top-notch service.
        </td>
      </tr>
    </table>
    
    <p style="font-size: 13px; line-height: 1.6;">You can access your interactive live maps, navigation, and coordinate with the client via direct text chats by logging in to SHAADIRA.</p>
  `;
  return getBaseTemplate("You Have Received a New Booking", content);
}

// EMAIL 6: BOOKING CONFIRMATION
export function getBookingConfirmationTemplate(clientName: string, data: TemplateData): string {
  const escClient = escapeHtml(clientName);
  const escArtist = escapeHtml(data.artistName || "Veltora Artist");
  const escBookingId = escapeHtml(data.bookingId || "N/A");
  const escDate = escapeHtml(data.eventDate || "");
  const escTime = escapeHtml(data.eventTime || "");
  const escLocation = escapeHtml(data.eventLocation || "");
  const quoted = Number(data.quotedAmount) || 0;
  const platform = Number(data.platformFee) || 0;
  const direct = Number(data.remainingAmount) || (quoted - platform);
  
  const content = `
    <h2 style="margin-top: 0; font-size: 20px; font-weight: bold; color: #1E3A8A; border-bottom: 2px solid #F1F5F9; padding-bottom: 12px;">Booking Confirmed! 🎉</h2>
    <p style="font-size: 14px; line-height: 1.6; margin-top: 15px;">Welcome <strong>${escClient}</strong>,</p>
    <p style="font-size: 14px; line-height: 1.6;">Great news! Your booking with artist <strong>${escArtist}</strong> has been officially confirmed. The platform clearance fee has been processed securely.</p>
    
    <!-- Booking Specifications Card -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; margin: 25px 0; padding: 20px;">
      <tr>
        <td style="font-size: 13px; line-height: 1.8; color: #334155;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td width="40%" style="font-weight: bold; color: #64748B;">Booking ID:</td>
              <td width="60%" style="font-family: monospace; font-weight: bold; color: #1E293B;">${escBookingId}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; color: #64748B;">Artist Name:</td>
              <td style="font-weight: bold; color: #1E293B;">${escArtist}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; color: #64748B;">Event Date:</td>
              <td style="color: #1E293B;">${escDate}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; color: #64748B;">Event Time:</td>
              <td style="color: #1E293B;">${escTime}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; color: #64748B; vertical-align: top;">Address Venue:</td>
              <td style="color: #1E293B;">${escLocation}</td>
            </tr>
            <tr style="height: 10px;"><td colspan="2"></td></tr>
            <tr style="border-top: 1px dashed #CBD5E1;">
              <td colspan="2" style="padding-top: 10px;"></td>
            </tr>
            <tr>
              <td style="font-weight: bold; color: #64748B;">Quoted Service Rate:</td>
              <td style="color: #1E293B; font-weight: bold;">₹${quoted.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; color: #64748B;">Platform Fee Paid:</td>
              <td style="color: #16A34A; font-weight: bold;">₹${platform.toLocaleString()}</td>
            </tr>
            <tr bgcolor="#FFFBEB" style="border-radius: 6px;">
              <td style="font-weight: bold; padding: 6px; color: #B45309;">Remaining Payment:</td>
              <td style="color: #B45309; padding: 6px; font-weight: bold; font-size: 13px;">₹${direct.toLocaleString()} (Pay direct to artist on spot)</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F0FDF4; border-left: 4px solid #16A34A; padding: 15px; border-radius: 4px; margin-bottom: 25px;">
      <tr>
        <td style="font-size: 13px; line-height: 1.5; color: #15803D;">
          🔔 <strong>Payment Reminder:</strong> The remaining amount of <strong>₹${direct.toLocaleString()}</strong> must be settled directly with the artist in person upon completion of your requested henna service.
        </td>
      </tr>
    </table>
    
    <p style="font-size: 13px; line-height: 1.6;">You can contact the artist directly, share design references, and monitor live coordinates on the day of the event via the SHAADIRA platform.</p>
  `;
  return getBaseTemplate("Booking Confirmed", content);
}

// EMAIL 7: EVENT REMINDER (24h before event)
export function getEventReminderTemplate(recipientName: string, data: TemplateData, isArtist: boolean): string {
  const escName = escapeHtml(recipientName);
  const escOppName = escapeHtml(isArtist ? (data.clientName || "Client") : (data.artistName || "Artist"));
  const escDate = escapeHtml(data.eventDate || "");
  const escTime = escapeHtml(data.eventTime || "");
  const escLocation = escapeHtml(data.eventLocation || "");
  
  const content = `
    <h2 style="margin-top: 0; font-size: 20px; font-weight: bold; color: #1E3A8A; border-bottom: 2px solid #F1F5F9; padding-bottom: 12px;">Reminder: Upcoming Booking Tomorrow ⏰</h2>
    <p style="font-size: 14px; line-height: 1.6; margin-top: 15px;">Hello <strong>${escName}</strong>,</p>
    <p style="font-size: 14px; line-height: 1.6;">This is a friendly reminder that you have a confirmed SHAADIRA booking scheduled for tomorrow.</p>
    
    <!-- Specifications Card -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; margin: 25px 0; padding: 20px;">
      <tr>
        <td style="font-size: 13px; line-height: 1.8; color: #334155;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td width="40%" style="font-weight: bold; color: #64748B;">${isArtist ? "Client Name" : "Artist Name"}:</td>
              <td width="60%" style="font-weight: bold; color: #1E293B;">${escOppName}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; color: #64748B;">Event Date:</td>
              <td style="color: #1E293B; font-weight: bold;">${escDate}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; color: #64748B;">Event Time:</td>
              <td style="color: #1E293B; font-weight: bold;">${escTime}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; color: #64748B; vertical-align: top;">Event Location:</td>
              <td style="color: #1E293B;">${escLocation}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #EFF6FF; border-left: 4px solid #3B82F6; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
      <tr>
        <td style="font-size: 13px; line-height: 1.5; color: #1E40AF;">
          📍 <strong>Navigation Notice:</strong> Please double-check the location address in advance. You can access the Veltora timeline to track transit status, coordinate fine details, and utilize integrated navigation utilities.
        </td>
      </tr>
    </table>
  `;
  return getBaseTemplate("Reminder: Upcoming Booking Tomorrow", content);
}

// EMAIL 8: EVENT START REMINDER (2h before event to artist)
export function getEventStartReminderTemplate(artistName: string, data: TemplateData): string {
  const escName = escapeHtml(artistName);
  const escClient = escapeHtml(data.clientName || "Client");
  const escLocation = escapeHtml(data.eventLocation || "");
  const escTime = escapeHtml(data.eventTime || "");
  
  // Create double google/osm link
  const query = encodeURIComponent(escLocation);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
  
  const content = `
    <h2 style="margin-top: 0; font-size: 20px; font-weight: bold; color: #1E3A8A; border-bottom: 2px solid #F1F5F9; padding-bottom: 12px;">Your Event Starts Soon! 🚗</h2>
    <p style="font-size: 14px; line-height: 1.6; margin-top: 15px;">Hello <strong>${escName}</strong>,</p>
    <p style="font-size: 14px; line-height: 1.6;">Your confirmed booking with client <strong>${escClient}</strong> begins in <strong>2 hours</strong> at <strong>${escTime}</strong>.</p>
    
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; margin: 25px 0; padding: 20px;">
      <tr>
        <td style="font-size: 13px; line-height: 1.8; color: #334155;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td width="30%" style="font-weight: bold; color: #64748B;">Client:</td>
              <td width="70%" style="font-weight: bold; color: #1E293B;">${escClient}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; color: #64748B;">Start Time:</td>
              <td style="color: #1E293B; font-weight: bold;">${escTime}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; color: #64748B; vertical-align: top;">Destination:</td>
              <td style="color: #1E3A8A; font-weight: 500;">${escLocation}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <table border="0" cellpadding="0" cellspacing="0" style="margin: 30px 0; width: 100%;">
      <tr>
        <td align="center">
          <table border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" bgcolor="#16A34A" style="border-radius: 8px;">
                <a href="${mapsUrl}" target="_blank" style="display: inline-block; padding: 14px 28px; font-size: 14px; font-weight: bold; color: #ffffff; text-decoration: none; text-transform: uppercase; letter-spacing: 1px;">Launch Google Maps Navigation</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <p style="font-size: 13px; line-height: 1.6; color: #475569;">
      Please trigger your <strong>GPS check-in</strong> button inside the Veltora app as soon as you arrive at the client's venue. This confirms your attendance on the live timeline.
    </p>
  `;
  return getBaseTemplate("Your Event Starts Soon", content);
}

// EMAIL 9: BOOKING COMPLETED
export function getBookingCompletedTemplate(clientName: string, data: TemplateData, actionUrl: string = "https://veltora.com/reviews"): string {
  const escClient = escapeHtml(clientName);
  const escArtist = escapeHtml(data.artistName || "Veltora Artist");
  const escBookingId = escapeHtml(data.bookingId || "");
  const escUrl = escapeHtml(actionUrl);
  
  const content = `
    <h2 style="margin-top: 0; font-size: 20px; font-weight: bold; color: #16A34A; border-bottom: 2px solid #F1F5F9; padding-bottom: 12px;">Service Completed Successfully! 🌟</h2>
    <p style="font-size: 14px; line-height: 1.6; margin-top: 15px;">Hello <strong>${escClient}</strong>,</p>
    <p style="font-size: 14px; line-height: 1.6;">Your booking with artist <strong>${escArtist}</strong> (ID: <span style="font-family: monospace;">${escBookingId}</span>) has been marked as completed.</p>
    
    <p style="font-size: 14px; line-height: 1.6; text-align: center; font-weight: bold; margin-top: 25px; color: #1E3A8A;">
      Thank you for using Veltora! We hope you loved your designs.
    </p>

    <table border="0" cellpadding="0" cellspacing="0" style="margin: 30px 0; width: 100%;">
      <tr>
        <td align="center">
          <table border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" bgcolor="#1E3A8A" style="border-radius: 8px; margin-right: 10px;">
                <a href="${escUrl}" target="_blank" style="display: inline-block; padding: 14px 24px; font-size: 13px; font-weight: bold; color: #ffffff; text-decoration: none; text-transform: uppercase; letter-spacing: 0.5px;">Rate & Review Artist</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <p style="font-size: 13px; line-height: 1.5; color: #64748B; text-align: center;">
      Providing feedback directly helps maintain Veltora's elite quality, and assists other clients in identifying the best-rated professionals.
    </p>
  `;
  return getBaseTemplate("Booking Completed", content);
}

// EMAIL 10: PASSWORD RESET
export function getPasswordResetTemplate(email: string, resetLink: string): string {
  const escEmail = escapeHtml(email);
  const escLink = escapeHtml(resetLink);
  
  const content = `
    <h2 style="margin-top: 0; font-size: 20px; font-weight: bold; color: #1E3A8A; border-bottom: 2px solid #F1F5F9; padding-bottom: 12px;">Reset Your Password</h2>
    <p style="font-size: 14px; line-height: 1.6; margin-top: 15px;">Hello,</p>
    <p style="font-size: 14px; line-height: 1.6;">We received a request to reset the password for your Veltora account linked to <strong>${escEmail}</strong>.</p>
    
    <table border="0" cellpadding="0" cellspacing="0" style="margin: 30px 0; width: 100%;">
      <tr>
        <td align="center">
          <table border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" bgcolor="#1E3A8A" style="border-radius: 8px;">
                <a href="${escLink}" target="_blank" style="display: inline-block; padding: 14px 28px; font-size: 14px; font-weight: bold; color: #ffffff; text-decoration: none; text-transform: uppercase; letter-spacing: 1px;">Reset My Password</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FEF2F2; border-left: 4px solid #EF4444; padding: 15px; border-radius: 4px; margin-bottom: 25px;">
      <tr>
        <td style="font-size: 12px; line-height: 1.5; color: #991B1B;">
          ⏱️ <strong>Security Warning:</strong> For safety reasons, this secure reset token will expire in exactly <strong>15 minutes</strong>. If you did not initiate this request, please ignore this email and your password will remain unchanged.
        </td>
      </tr>
    </table>
    
    <p style="font-size: 11px; color: #94A3B8; word-break: break-all;">
      If the button above is not working, copy and paste the following full address in your web browser: <br>
      <a href="${escLink}" style="color: #1E3A8A;">${escLink}</a>
    </p>
  `;
  return getBaseTemplate("Reset Your Password", content);
}

// EMAIL 11: EMAIL VERIFICATION
export function getEmailVerificationTemplate(email: string, verificationLink: string): string {
  const escEmail = escapeHtml(email);
  const escLink = escapeHtml(verificationLink);
  
  const content = `
    <h2 style="margin-top: 0; font-size: 20px; font-weight: bold; color: #1E3A8A; border-bottom: 2px solid #F1F5F9; padding-bottom: 12px;">Verify Your Email Address</h2>
    <p style="font-size: 14px; line-height: 1.6; margin-top: 15px;">Hello,</p>
    <p style="font-size: 14px; line-height: 1.6;">Thank you for registering on Veltora Artist Connect. Please verify your email address to secure your account and unlock communications.</p>
    
    <table border="0" cellpadding="0" cellspacing="0" style="margin: 30px 0; width: 100%;">
      <tr>
        <td align="center">
          <table border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" bgcolor="#1E3A8A" style="border-radius: 8px;">
                <a href="${escLink}" target="_blank" style="display: inline-block; padding: 14px 28px; font-size: 14px; font-weight: bold; color: #ffffff; text-decoration: none; text-transform: uppercase; letter-spacing: 1px;">Verify Email Address</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #EFF6FF; border-left: 4px solid #3B82F6; padding: 15px; border-radius: 4px; margin-bottom: 25px;">
      <tr>
        <td style="font-size: 12px; line-height: 1.5; color: #1E40AF;">
          ⏱️ <strong>Verification Window:</strong> This secure verification link will expire in exactly <strong>30 minutes</strong>.
        </td>
      </tr>
    </table>
    
    <p style="font-size: 11px; color: #94A3B8; word-break: break-all;">
      If the button above is not working, copy and paste the following full address in your web browser: <br>
      <a href="${escLink}" style="color: #1E3A8A;">${escLink}</a>
    </p>
  `;
  return getBaseTemplate("Verify Your Email Address", content);
}

// EMAIL EXTRA: INQUIRY RECEIVED
export function getInquiryReceivedTemplate(artistName: string, clientName: string, eventDate: string, eventTime: string): string {
  const escName = escapeHtml(artistName);
  const escClient = escapeHtml(clientName);
  const escDate = escapeHtml(eventDate);
  const escTime = escapeHtml(eventTime);
  const content = `
    <h2 style="margin-top: 0; font-size: 20px; font-weight: bold; color: #1E3A8A; border-bottom: 2px solid #F1F5F9; padding-bottom: 12px;">New Inquiry Received!</h2>
    <p style="font-size: 14px; line-height: 1.6; margin-top: 15px;">Hello <strong>${escName}</strong>,</p>
    <p style="font-size: 14px; line-height: 1.6;">You have received a new booking inquiry on Veltora Artist Connect.</p>
    
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; margin: 25px 0; padding: 20px;">
      <tr>
        <td style="font-size: 13px; line-height: 1.8; color: #334155;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td width="40%" style="font-weight: bold; color: #64748B;">Client Name:</td>
              <td width="60%" style="font-weight: bold; color: #1E293B;">${escClient}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; color: #64748B;">Event Date:</td>
              <td style="color: #1E293B;">${escDate}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; color: #64748B;">Event Time:</td>
              <td style="color: #1E293B;">${escTime}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <p style="font-size: 14px; line-height: 1.6;">Please log in to your Veltora Artist Dashboard to chat with the client, view design preferences, and submit your pricing quotation.</p>
  `;
  return getBaseTemplate("New Veltora Inquiry Received!", content);
}

// EMAIL EXTRA: QUOTATION RECEIVED
export function getQuoteSubmittedTemplate(clientName: string, artistName: string, amount: number, platformFee: number, eventDate: string): string {
  const escClient = escapeHtml(clientName);
  const escArtist = escapeHtml(artistName);
  const escDate = escapeHtml(eventDate);
  const content = `
    <h2 style="margin-top: 0; font-size: 20px; font-weight: bold; color: #1E3A8A; border-bottom: 2px solid #F1F5F9; padding-bottom: 12px;">Quotation Received from Artist!</h2>
    <p style="font-size: 14px; line-height: 1.6; margin-top: 15px;">Hello <strong>${escClient}</strong>,</p>
    <p style="font-size: 14px; line-height: 1.6;">Artist <strong>${escArtist}</strong> has submitted a formal price quote for your event.</p>
    
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; margin: 25px 0; padding: 20px;">
      <tr>
        <td style="font-size: 13px; line-height: 1.8; color: #334155;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td width="40%" style="font-weight: bold; color: #64748B;">Artist Name:</td>
              <td width="60%" style="font-weight: bold; color: #1E293B;">${escArtist}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; color: #64748B;">Service Rate:</td>
              <td style="color: #1E293B; font-weight: bold; font-size: 14px;">₹${amount.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; color: #64748B;">Platform Booking Fee:</td>
              <td style="color: #16A34A; font-weight: bold;">₹${platformFee.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; color: #64748B;">Event Date:</td>
              <td style="color: #1E293B;">${escDate}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <p style="font-size: 14px; line-height: 1.6;">To lock in the date and confirm this booking, please log in to the Veltora platform and settle the platform security fee of <strong>₹${platformFee}</strong> online via Razorpay.</p>
  `;
  return getBaseTemplate("Quotation Received from Veltora Artist!", content);
}

// EMAIL EXTRA: CITY ARTIST AVAILABLE
export function getCityAvailableTemplate(clientName: string, cityName: string): string {
  const escName = escapeHtml(clientName);
  const escCity = escapeHtml(cityName);
  const content = `
    <h2 style="margin-top: 0; font-size: 20px; font-weight: bold; color: #1E3A8A; border-bottom: 2px solid #F1F5F9; padding-bottom: 12px;">🎉 SHAADIRA is Now Available in ${escCity}!</h2>
    <p style="font-size: 14px; line-height: 1.6; margin-top: 15px;">Hello <strong>${escName}</strong>,</p>
    <p style="font-size: 14px; line-height: 1.6;">Great news! Verified artists are now available in <strong>${escCity}</strong>.</p>
    <p style="font-size: 14px; line-height: 1.6;">You can now explore artist profiles, chat, compare portfolios, and book securely through SHAADIRA.</p>
    <table border="0" cellpadding="0" cellspacing="0" style="margin: 30px 0; width: 100%;">
      <tr><td align="center"><table border="0" cellpadding="0" cellspacing="0"><tr><td align="center" bgcolor="#1E3A8A" style="border-radius: 8px;"><a href="https://veltora.com/explore" target="_blank" style="display: inline-block; padding: 14px 28px; font-size: 14px; font-weight: bold; color: #ffffff; text-decoration: none; text-transform: uppercase; letter-spacing: 1px;">Explore Artists</a></td></tr></table></td></tr>
    </table>
  `;
  return getBaseTemplate("🎉 SHAADIRA is Now Available in Your City!", content);
}

// EMAIL EXTRA: CITY CLIENT AVAILABLE
export function getClientAvailableTemplate(artistName: string, cityName: string): string {
  const escName = escapeHtml(artistName);
  const escCity = escapeHtml(cityName);
  const content = `
    <h2 style="margin-top: 0; font-size: 20px; font-weight: bold; color: #1E3A8A; border-bottom: 2px solid #F1F5F9; padding-bottom: 12px;">🎉 Clients are Now Looking for Artists in ${escCity}!</h2>
    <p style="font-size: 14px; line-height: 1.6; margin-top: 15px;">Hello <strong>${escName}</strong>,</p>
    <p style="font-size: 14px; line-height: 1.6;">Exciting news! Clients have started registering from <strong>${escCity}</strong>.</p>
    <p style="font-size: 14px; line-height: 1.6;">Your profile is now positioned to receive booking requests. Complete your profile, upload your best portfolio, and stay active to maximize your visibility.</p>
    <table border="0" cellpadding="0" cellspacing="0" style="margin: 30px 0; width: 100%;">
      <tr><td align="center"><table border="0" cellpadding="0" cellspacing="0"><tr><td align="center" bgcolor="#1E3A8A" style="border-radius: 8px;"><a href="https://veltora.com/dashboard" target="_blank" style="display: inline-block; padding: 14px 28px; font-size: 14px; font-weight: bold; color: #ffffff; text-decoration: none; text-transform: uppercase; letter-spacing: 1px;">Go to Artist Dashboard</a></td></tr></table></td></tr>
    </table>
  `;
  return getBaseTemplate("🎉 Clients are Now Looking for Artists in Your City!", content);
}

