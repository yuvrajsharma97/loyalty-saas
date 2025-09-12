import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function sendEmail({ to, subject, html }) {
  if (!resend) {
    console.warn("[email disabled]", subject);
    return { ok: true, message: "Email disabled in development" };
  }

  try {
    const result = await resend.emails.send({
      from: "noreply@yourdomain.com",
      to,
      subject,
      html,
    });
    return { ok: true, data: result };
  } catch (error) {
    console.error("Email send error:", error);
    return { ok: false, error: error.message };
  }
}

export function passwordResetTemplate({ appUrl, token }) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Password Reset</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #014421;">Password Reset Request</h1>
        <p>You requested a password reset for your account.</p>
        <p>Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${appUrl}/auth/reset-password/${token}" 
             style="background-color: #014421; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this reset, please ignore this email.</p>
      </div>
    </body>
    </html>
  `;
}
