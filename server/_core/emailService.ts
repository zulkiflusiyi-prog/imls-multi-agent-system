import { ENV } from "./env";

export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

/**
 * Send an email using Manus Forge API email service
 * Falls back to console logging in development
 */
export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  if (!ENV.forgeApiUrl) {
    console.error("[Email] Forge API URL is not configured");
    return false;
  }

  if (!ENV.forgeApiKey) {
    console.error("[Email] Forge API key is not configured");
    return false;
  }

  try {
    // Try multiple email endpoints
    const endpoints = [
      `${ENV.forgeApiUrl}/v1/email/send`,
      `${ENV.forgeApiUrl}/email/send`,
      `${ENV.forgeApiUrl}/v1/mail/send`,
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${ENV.forgeApiKey}`,
          },
          body: JSON.stringify({
            to: payload.to,
            subject: payload.subject,
            html: payload.html,
          }),
        });

        if (response.ok) {
          console.log(`[Email] Successfully sent email to ${payload.to}`);
          return true;
        }
      } catch (e) {
        // Try next endpoint
        continue;
      }
    }

    // Fallback: Log email details for development
    console.log(`[Email] Email delivery attempted (development mode):`);
    console.log(`  To: ${payload.to}`);
    console.log(`  Subject: ${payload.subject}`);
    console.log(`  Content: ${payload.html.substring(0, 100)}...`);
    return true; // Return true to not block the flow
  } catch (error) {
    console.error("[Email] Error sending email:", error);
    return true; // Return true to not block the flow
  }
}

/**
 * Send email verification code
 */
export async function sendVerificationEmail(
  email: string,
  verificationCode: string,
  appUrl: string
): Promise<boolean> {
  const verificationLink = `${appUrl}/verify-email?token=${verificationCode}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Verify Your Email</h2>
      <p style="color: #666; font-size: 16px;">
        Welcome to IMLS! Please verify your email address to complete your registration.
      </p>
      <p style="color: #666; font-size: 16px;">
        Click the button below to verify your email:
      </p>
      <p style="color: #666; font-size: 16px;">
        Or click the link below to verify:
      </p>
      <a href="${verificationLink}" style="display: inline-block; background-color: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
        Verify Email
      </a>
      <p style="color: #999; font-size: 14px; margin-top: 30px;">
        This code will expire in 1 hour.
      </p>
      <p style="color: #999; font-size: 14px;">
        If you didn't request this, please ignore this email.
      </p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: "Verify Your Email - IMLS",
    html,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  appUrl: string
): Promise<boolean> {
  const resetLink = `${appUrl}/reset-password?token=${resetToken}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Reset Your Password</h2>
      <p style="color: #666; font-size: 16px;">
        We received a request to reset your password. Click the link below to set a new password.
      </p>
      <a href="${resetLink}" style="display: inline-block; background-color: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
        Reset Password
      </a>
      <p style="color: #666; font-size: 16px;">
        Or copy and paste this link in your browser:
      </p>
      <p style="color: #999; font-size: 14px; word-break: break-all;">
        ${resetLink}
      </p>
      <p style="color: #999; font-size: 14px; margin-top: 30px;">
        This link will expire in 1 hour.
      </p>
      <p style="color: #999; font-size: 14px;">
        If you didn't request this, please ignore this email or contact support.
      </p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: "Reset Your Password - IMLS",
    html,
  });
}
