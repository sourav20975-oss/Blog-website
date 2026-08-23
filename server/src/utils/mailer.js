const nodemailer = require('nodemailer');

// Gmail SMTP - env me SMTP_USER (gmail address) + SMTP_PASS (16-char App Password) bharna hai.
// Configured nahi hai to dev ke liye OTP console me print hota hai.

function isConfigured() {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    // Fail fast — SMTP hang hone par request freeze na ho
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
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

async function sendOtpMail(to, name, otp) {
  if (!isConfigured()) {
    console.log(`[DEV MAILER] OTP for ${to}: ${otp}`);
    return { delivered: false };
  }
  const transporter = getTransporter();
  await transporter.sendMail({
    from: `"BlogVerse" <${process.env.SMTP_USER}>`,
    to,
    subject: `BlogVerse verification code: ${otp}`,
    html: otpEmailHtml(name, otp),
  });
  return { delivered: true };
}

module.exports = { sendOtpMail, isConfigured };
