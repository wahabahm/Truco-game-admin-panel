import nodemailer from 'nodemailer';
import { logger } from './logger.js';

/**
 * Email Service for sending emails (OTP, Verification, etc.)
 * Supports multiple email providers: Gmail, SendGrid, AWS SES, SMTP
 */

let transporter = null;

/**
 * Initialize email transporter
 */
function initializeEmailService() {
  // Trim password to remove any spaces (Gmail app passwords sometimes have spaces)
  const smtpPassword = process.env.SMTP_PASSWORD ? process.env.SMTP_PASSWORD.trim().replace(/\s+/g, '') : null;
  
  const emailConfig = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER?.trim(),
      pass: smtpPassword
    },
    // Additional TLS options for Hostinger and other SMTP servers
    tls: {
      rejectUnauthorized: false // Allow self-signed certificates if needed
    },
    // For port 465 (SSL), sometimes need to explicitly require TLS
    requireTLS: process.env.SMTP_SECURE !== 'true' // Require TLS for non-SSL ports
  };

  // Gmail OAuth2 (if using Gmail)
  if (process.env.EMAIL_PROVIDER === 'gmail' && process.env.GMAIL_CLIENT_ID) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.SMTP_USER,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN
      }
    });
  }
  // SendGrid
  else if (process.env.EMAIL_PROVIDER === 'sendgrid' && process.env.SENDGRID_API_KEY) {
    transporter = nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });
  }
  // AWS SES
  else if (process.env.EMAIL_PROVIDER === 'ses') {
    transporter = nodemailer.createTransport({
      SES: {
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
      }
    });
  }
  // Generic SMTP
  else if (emailConfig.host && emailConfig.auth.user && emailConfig.auth.pass) {
    logger.info(`📧 Initializing email service with SMTP: ${emailConfig.host}:${emailConfig.port}`);
    transporter = nodemailer.createTransport(emailConfig);
  }
  // Development mode - no email service configured
  else {
    logger.warn('⚠️ Email service not configured. Emails will not be sent.');
    logger.warn('   Required: SMTP_HOST, SMTP_USER, SMTP_PASSWORD');
    return false;
  }

  // Verify connection (async)
  transporter.verify()
    .then(() => {
      logger.info('✅ Email service connected successfully');
    })
    .catch((error) => {
      logger.error('❌ Email service connection error:', error.message || error);
      logger.error('Email service will not work. Please check your SMTP credentials.');
      logger.error('SMTP Configuration:', {
        host: emailConfig.host,
        port: emailConfig.port,
        secure: emailConfig.secure,
        user: emailConfig.auth.user,
        passwordSet: !!emailConfig.auth.pass
      });
      transporter = null; // Set to null if verification fails
    });

  return true;
}

/**
 * Send OTP email
 */
export async function sendOTPEmail(email, otpCode, userName = 'User') {
  if (!transporter) {
    if (process.env.NODE_ENV === 'production') {
      logger.error('❌ Email service not initialized. Cannot send OTP email.');
      return false;
    }
    // In development, if email service is not configured, just log
    logger.warn(`⚠️ [DEV] Email service not configured. OTP would be sent to ${email}: ${otpCode}`);
    logger.warn('   Please configure SMTP settings in .env file to send actual emails.');
    return false; // Return false so caller knows email wasn't sent
  }

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'Truco Game'}" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
    to: email,
    subject: 'Your OTP Code - Truco Game',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
          .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 OTP Verification</h1>
          </div>
          <div class="content">
            <p>Hello ${userName},</p>
            <p>Your One-Time Password (OTP) for Truco Game verification is:</p>
            <div class="otp-box">
              <div class="otp-code">${otpCode}</div>
            </div>
            <div class="warning">
              <strong>⚠️ Important:</strong> This OTP will expire in 10 minutes. Do not share this code with anyone.
            </div>
            <p>If you didn't request this OTP, please ignore this email.</p>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Truco Game. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Hello ${userName},
      
      Your OTP code for Truco Game verification is: ${otpCode}
      
      This OTP will expire in 10 minutes. Do not share this code with anyone.
      
      If you didn't request this OTP, please ignore this email.
      
      © ${new Date().getFullYear()} Truco Game. All rights reserved.
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`OTP email sent to ${email}: ${info.messageId}`);
    return true;
  } catch (error) {
    logger.error('Error sending OTP email:', error);
    return false;
  }
}

/**
 * Send email verification email with OTP
 */
export async function sendVerificationEmail(email, verificationOTP, userName = 'User') {
  if (!transporter && process.env.NODE_ENV === 'production') {
    logger.error('Email service not initialized. Cannot send verification email.');
    return false;
  }

  // In development, if email service is not configured, just log
  if (!transporter) {
    logger.info(`[DEV] Verification email would be sent to ${email}`);
    logger.info(`[DEV] Verification OTP: ${verificationOTP}`);
    return true; // Return true for development
  }

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'Truco Game'}" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
    to: email,
    subject: 'Verify Your Email - Truco Game',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
          .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✉️ Verify Your Email</h1>
          </div>
          <div class="content">
            <p>Hello ${userName},</p>
            <p>Thank you for registering with Truco Game! Please verify your email address using the OTP code below:</p>
            <div class="otp-box">
              <div class="otp-code">${verificationOTP}</div>
            </div>
            <div class="warning">
              <strong>⚠️ Important:</strong> This verification OTP will expire in 10 minutes. Do not share this code with anyone.
            </div>
            <p>If you didn't create an account, please ignore this email.</p>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Truco Game. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Hello ${userName},
      
      Thank you for registering with Truco Game! Please verify your email address using the OTP code below:
      
      ${verificationOTP}
      
      This verification OTP will expire in 10 minutes. Do not share this code with anyone.
      
      If you didn't create an account, please ignore this email.
      
      © ${new Date().getFullYear()} Truco Game. All rights reserved.
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Verification email sent to ${email}: ${info.messageId}`);
    return true;
  } catch (error) {
    logger.error('Error sending verification email:', error);
    return false;
  }
}

// Initialize email service on module load
if (process.env.NODE_ENV === 'production' || process.env.SMTP_HOST) {
  initializeEmailService();
}

export { initializeEmailService };

