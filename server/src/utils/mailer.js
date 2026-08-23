// Email delivery layer — Render blocks outbound SMTP ports (25/465/587),
// isliye production me HTTP email APIs hi kaam karti hain.
//
// Priority order:
//   1. SENDGRID_API_KEY  -> SendGrid HTTP API (free 100 emails/day)
//   2. BREVO_API_KEY     -> Brevo HTTP API    (free 300 emails/day)
//   3. SMTP_USER+PASS    -> Gmail SMTP        (sirf LOCAL dev ke liye — Render pe blocked)
//   4. kuch nahi         -> OTP server console me print (dev/testing)
//
// NOTE: har provider me ek baar apna sender email (EMAIL_FROM) verify karna hota hai.

const nodemailer = require('nodemailer');

const FROM_NAME = 'BlogVerse';

function getEmailFrom() {
  return (
    process.env.EMAIL_FROM ||
    process.env.SMTP_USER ||
    'noreply@blogverse.local'
  );
}

function isConfigured() {
  return Boolean(
    process.env.SENDGRID_API_KEY ||
      process.env.BREVO_API_KEY ||
      (process.env.SMTP_USER && process.env.SMTP_PASS)
  );
}

function otpEmailHtml(name, otp) {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:auto;border:1px solid #e4e4e7;border-radius:12px;overflow:hidden">
    <div style="background:#f97316;padding:24px;text-align:center">
      <h1 style="color:#ffffff;margin:0;font-size:22px">&lt;/&gt; BlogVerse</h1>
    </div>
    <div style="padding:28px;background:#ffffff">
      <p style="margin:0;color:#18181b;font-size:15px">Hi ${name},</p>
      <p style="color:#3f3f46;font-size:14px;line-height:1.6">
        Welcome to BlogVerse! Verify your email using this One-Time Password (OTP):
      </p>
      <div style="text-align:center;margin:24px 0">
        <span style="display:inline-block;background:#fff7ed;border:2px dashed #f97316;border-radius:10px;padding:14px 30px;font-size:32px;font-weight:bold;letter-spacing:10px;color:#ea580c">${otp}</span>
      </div>
      <p style="color:#71717a;font-size:13px;line-height:1.6">
        This OTP is valid for <b>10 minutes</b>. If you didn&apos;t sign up, simply ignore this email.
      </p>
    </div>
    <div style="background:#fafafa;padding:14px;text-align:center">
      <p style="color:#a1a1aa;font-size:12px;margin:0">&copy; ${new Date().getFullYear()} BlogVerse &middot; Learn to Code</p>
    </div>
  </div>`;
}

// ---- SendGrid (HTTP) ----
async function sendViaSendGrid(to, name, otp) {
  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to, name }] }],
      from: { email: getEmailFrom(), name: FROM_NAME },
      subject: `BlogVerse verification code: ${otp}`,
      content: [{ type: 'text/html', value: otpEmailHtml(name, otp) }],
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`SendGrid ${res.status}: ${detail.slice(0, 200)}`);
  }
}

// ---- Brevo (HTTP) ----
async function sendViaBrevo(to, name, otp) {
  const res = await fetch('https://api.brevo.com/api/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: { email: getEmailFrom(), name: FROM_NAME },
      to: [{ email: to, name }],
      subject: `BlogVerse verification code: ${otp}`,
      htmlContent: otpEmailHtml(name, otp),
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Brevo ${res.status}: ${detail.slice(0, 200)}`);
  }
}

// ---- Gmail SMTP (LOCAL DEV ONLY — Render pe ports blocked hain) ----
async function sendViaSmtp(to, name, otp) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    family: 4,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  await transporter.sendMail({
    from: `"${FROM_NAME}" <${process.env.SMTP_USER}>`,
    to,
    subject: `BlogVerse verification code: ${otp}`,
    html: otpEmailHtml(name, otp),
  });
}

async function sendOtpMail(to, name, otp) {
  // 1. SendGrid
  if (process.env.SENDGRID_API_KEY) {
    try {
      await sendViaSendGrid(to, name, otp);
      return { delivered: true };
    } catch (err) {
      console.error('[mailer] SendGrid failed:', err.message);
      return { delivered: false };
    }
  }
  // 2. Brevo
  if (process.env.BREVO_API_KEY) {
    try {
      await sendViaBrevo(to, name, otp);
      return { delivered: true };
    } catch (err) {
      console.error('[mailer] Brevo failed:', err.message);
      return { delivered: false };
    }
  }
  // 3. SMTP — sirf local machine pe chalega
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      await sendViaSmtp(to, name, otp);
      return { delivered: true };
    } catch (err) {
      console.error(
        '[mailer] SMTP failed (Render pe SMTP blocked hota hai — HTTP API use karo):',
        err.code || err.message
      );
      return { delivered: false };
    }
  }
  // 4. Kuch configured nahi — console me print (dev testing)
  console.log(`[DEV MAILER] OTP for ${to}: ${otp}`);
  return { delivered: false };
}

module.exports = { sendOtpMail, isConfigured };
