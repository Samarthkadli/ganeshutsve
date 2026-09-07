'use server';

import { isValidEmailFormat } from '@/lib/email-validator';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// Server-side in-memory cache for OTP codes
const otpStore = new Map<string, { code: string; expiresAt: number }>();

function generateSecretHash(email: string, code: string): string {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || 'ganesh-festival-otp-secret-key-2026';
  return crypto.createHmac('sha256', secret).update(`${email.toLowerCase()}:${code}`).digest('hex');
}

/**
 * Sends a 6-digit OTP code to the specified email address via direct Nodemailer SMTP (or fallback)
 */
export async function sendOtpToEmail(email: string) {
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanEmail) {
    return { success: false, error: 'ನಿಮ್ಮ ಇಮೇಲ್ ವಿಳಾಸವನ್ನು ನಮೂದಿಸಿ / Please enter your email address.' };
  }

  if (!isValidEmailFormat(cleanEmail)) {
    return { success: false, error: 'ಸಿಂಧುತ್ವ ಹೊಂದಿರುವ ಇಮೇಲ್ ವಿಳಾಸವನ್ನು ನಮೂದಿಸಿ (e.g. user@gmail.com) / Please enter a valid email address.' };
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(cleanEmail, { code, expiresAt: Date.now() + 10 * 60 * 1000 });

  const gmailUser = process.env.GMAIL_USER || process.env.SMTP_USER;
  const gmailPass = (process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS || '').replace(/\s+/g, '');

  if (gmailUser && gmailPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPass,
        },
      });

      await transporter.sendMail({
        from: `"Koppal Ganesh Utsava" <${gmailUser}>`,
        to: cleanEmail,
        subject: `🙏 ${code} — ನಿಮ್ಮ ಕೊಪ್ಪಳ ಗಣೇಶೋತ್ಸವ ಪರಿಶೀಲನಾ OTP / Your Verification Code`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; background: #0f172a; border-radius: 12px; color: #ffffff; border: 1px solid #e5c158;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #e5c158; margin: 0;">🙏 ಕೊಪ್ಪಳ ನಗರ ಪೊಲೀಸ್ ಠಾಣೆ - 2026 🙏</h2>
              <p style="color: #94a3b8; font-size: 14px; margin-top: 4px;">Koppal City Ganesh Utsava Mandal Evaluation</p>
            </div>
            
            <div style="background: rgba(229, 193, 88, 0.1); padding: 20px; border-radius: 8px; text-align: center; border: 1px dashed #e5c158;">
              <p style="margin: 0 0 10px 0; font-size: 15px; color: #f1f5f9;">ನಿಮ್ಮ ಮೌಲ್ಯಮಾಪನ ಪರಿಶೀಲನಾ OTP ಕೋಡ್ / Verification Code:</p>
              <div style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #f59e0b; margin: 10px 0;">${code}</div>
              <p style="margin: 10px 0 0 0; font-size: 13px; color: #94a3b8;">This code is valid for 10 minutes.</p>
            </div>

            <p style="font-size: 12px; color: #64748b; text-align: center; margin-top: 24px;">
              ಇದು ಸ್ವಯಂಚಾಲಿತ ಸಂದೇಶವಾಗಿದೆ. ದಯವಿಟ್ಟು ಇದಕ್ಕೆ ಉತ್ತರಿಸಬೇಡಿ.<br/>
              This is an automated verification email.
            </p>
          </div>
        `,
      });

      return {
        success: true,
        message: `OTP code sent directly to ${cleanEmail}. Please check your inbox!`,
      };
    } catch (err: any) {
      console.error('Nodemailer Gmail SMTP error:', err);
    }
  }

  // Fallback if env vars not set or Nodemailer throws error
  return {
    success: true,
    message: `OTP generated for ${cleanEmail}!`,
    demoCode: code,
  };
}

/**
 * Verifies the 6-digit OTP code for the email
 */
export async function verifyOtpCode(email: string, code: string) {
  const cleanEmail = email.trim().toLowerCase();
  const cleanCode = code.trim();

  if (!cleanEmail || !cleanCode) {
    return { success: false, error: 'Enter the 6-digit OTP code.' };
  }

  if (cleanCode.length !== 6 || !/^\d+$/.test(cleanCode)) {
    return { success: false, error: 'OTP code must be 6 numeric digits.' };
  }

  const stored = otpStore.get(cleanEmail);
  if (stored && stored.code === cleanCode) {
    if (Date.now() > stored.expiresAt) {
      otpStore.delete(cleanEmail);
      return { success: false, error: 'OTP code expired. Please click Resend OTP.' };
    }
    otpStore.delete(cleanEmail);
    return {
      success: true,
      message: 'Email verified successfully!',
      token: generateSecretHash(cleanEmail, cleanCode),
    };
  }

  return {
    success: false,
    error: 'Invalid OTP code. Please check your code and try again.',
  };
}
