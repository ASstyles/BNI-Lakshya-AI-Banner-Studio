// const nodemailer = require("nodemailer");

// // SMTP transporter configured from environment variables.
// // Required .env keys:
// //   SMTP_HOST, SMTP_PORT, SMTP_SECURE (true/false), SMTP_USER, SMTP_PASS, SMTP_FROM
// let transporter = null;

// function getTransporter() {
//   if (transporter) return transporter;

//   if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
//     console.warn("Mailer: SMTP credentials not configured. Emails will not be sent.");
//     return null;
//   }

//   transporter = nodemailer.createTransport({
//     host: process.env.SMTP_HOST,
//     port: Number(process.env.SMTP_PORT) || 587,
//     secure: String(process.env.SMTP_SECURE).toLowerCase() === "true",
//     auth: {
//       user: process.env.SMTP_USER,
//       pass: process.env.SMTP_PASS
//     }
//   });

//   return transporter;
// }

// async function sendMail({ to, subject, html, text }) {
//   const t = getTransporter();
//   if (!t) {
//     console.warn(`Mailer: skipped sending email to ${to} (SMTP not configured).`);
//     return { sent: false, reason: "SMTP not configured" };
//   }

//   try {
//     await t.sendMail({
//       from: process.env.SMTP_FROM || process.env.SMTP_USER,
//       to,
//       subject,
//       text,
//       html
//     });
//     return { sent: true };
//   } catch (err) {
//     console.error("Mailer: failed to send email:", err.message);
//     return { sent: false, reason: err.message };
//   }
// }

// // Email sent when an admin/superadmin rejects a registration request
// async function sendRejectionEmail({ to, name, role }) {
//   const subject = "BNI Lakshya AI Banner Studio - Registration Update";
//   const roleLabel = role === "admin" ? "Admin" : "Member";

//   const html = `
//     <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; color: #222;">
//       <h2 style="color: #CF142B;">BNI Lakshya AI Banner Studio</h2>
//       <p>Hi ${name || "there"},</p>
//       <p>
//         Thank you for your interest in joining BNI Lakshya AI Banner Studio as a <strong>${roleLabel}</strong>.
//       </p>
//       <p>
//         After review, we regret to inform you that your registration request has
//         <strong style="color:#E53E3E;">not been approved</strong> at this time.
//       </p>
//       <p>
//         If you believe this is a mistake or have questions, please contact your chapter administrator.
//       </p>
//       <p style="margin-top: 24px; font-size: 0.85rem; color: #777;">
//         This is an automated message. Please do not reply directly to this email.
//       </p>
//     </div>
//   `;

//   const text = `Hi ${name || "there"},\n\nThank you for your interest in joining BNI Lakshya AI Banner Studio as a ${roleLabel}.\n\nAfter review, your registration request has NOT been approved at this time.\n\nIf you believe this is a mistake, please contact your chapter administrator.`;

//   return sendMail({ to, subject, html, text });
// }

// // Email sent when a registration request is approved
// async function sendApprovalEmail({ to, name, role }) {
//   const subject = "BNI Lakshya AI Banner Studio - Registration Approved";
//   const roleLabel = role === "admin" ? "Admin" : "Member";

//   const html = `
//     <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; color: #222;">
//       <h2 style="color: #CF142B;">BNI Lakshya AI Banner Studio</h2>
//       <p>Hi ${name || "there"},</p>
//       <p>
//         Great news! Your registration request as a <strong>${roleLabel}</strong> has been
//         <strong style="color:#38A169;">approved</strong>.
//       </p>
//       <p>You can now log in using your registered email and password.</p>
//       <p style="margin-top: 24px; font-size: 0.85rem; color: #777;">
//         This is an automated message. Please do not reply directly to this email.
//       </p>
//     </div>
//   `;

//   const text = `Hi ${name || "there"},\n\nYour registration request as a ${roleLabel} has been approved. You can now log in using your registered email and password.`;

//   return sendMail({ to, subject, html, text });
// }

// module.exports = {
//   sendMail,
//   sendRejectionEmail,
//   sendApprovalEmail
// };

const nodemailer = require("nodemailer");

// SMTP transporter configured from environment variables.
// Required .env keys:
//   SMTP_HOST, SMTP_PORT, SMTP_SECURE (true/false), SMTP_USER, SMTP_PASS, SMTP_FROM
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("Mailer: SMTP credentials not configured. Emails will not be sent.");
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: String(process.env.SMTP_SECURE).toLowerCase() === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  return transporter;
}

async function sendMail({ to, subject, html, text }) {
  const t = getTransporter();
  if (!t) {
    console.warn(`Mailer: skipped sending email to ${to} (SMTP not configured).`);
    return { sent: false, reason: "SMTP not configured" };
  }

  try {
    await t.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text,
      html
    });
    console.log(`Mailer: email sent successfully to ${to} — "${subject}"`);
    return { sent: true };
  } catch (err) {
    console.error("Mailer: failed to send email:", err.message);
    return { sent: false, reason: err.message };
  }
}

// ─── Shared email wrapper ────────────────────────────────────────────────────
function emailWrapper(bodyHtml) {
  return `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;border-radius:12px;overflow:hidden;border:1px solid #e5e5e5;">
      <!-- Header -->
      <div style="background:#CF142B;padding:24px 32px;text-align:center;">
        <h1 style="margin:0;color:#fff;font-size:1.3rem;letter-spacing:0.5px;">BNI Lakshya AI Banner Studio</h1>
        <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:0.85rem;">Powered by BNI Lakshya Chapter</p>
      </div>
      <!-- Body -->
      <div style="background:#fff;padding:32px;">
        ${bodyHtml}
        <hr style="margin:28px 0;border:none;border-top:1px solid #eee;">
        <p style="margin:0;font-size:0.8rem;color:#aaa;text-align:center;">
          This is an automated message — please do not reply directly to this email.
        </p>
      </div>
    </div>
  `;
}

// ─── 1. Registration Received (sent right after user submits registration) ───
async function sendRegistrationReceivedEmail({ to, name, role }) {
  const roleLabel = role === "admin" ? "Admin" : "Member";
  const subject   = "BNI Lakshya Banner Studio — Registration Received";

  const bodyHtml = `
    <p style="font-size:1rem;color:#333;">Hi <strong>${name || "there"}</strong>,</p>
    <p style="color:#555;line-height:1.6;">
      We've received your registration request for
      <strong>BNI Lakshya AI Banner Studio</strong> as a <strong>${roleLabel}</strong>.
    </p>
    <div style="background:#fffbea;border-left:4px solid #f6ad55;padding:14px 18px;border-radius:6px;margin:20px 0;">
      <p style="margin:0;color:#7b6012;font-size:0.92rem;">
        ⏳ Your request is <strong>pending review</strong>. You will receive another email once an admin processes your application.
      </p>
    </div>
    <p style="color:#555;line-height:1.6;">
      If you did not make this request, please ignore this email.
    </p>
  `;

  const text = `Hi ${name || "there"},\n\nWe've received your registration request as a ${roleLabel} for BNI Lakshya AI Banner Studio.\n\nYour request is PENDING review. You will be notified once an admin processes your application.\n\nIf you did not make this request, please ignore this email.`;

  return sendMail({ to, subject, html: emailWrapper(bodyHtml), text });
}

// ─── 2. Registration Approved ────────────────────────────────────────────────
async function sendApprovalEmail({ to, name, role }) {
  const roleLabel = role === "admin" ? "Admin" : "Member";
  const subject   = "BNI Lakshya Banner Studio — Registration Approved ✅";

  const bodyHtml = `
    <p style="font-size:1rem;color:#333;">Hi <strong>${name || "there"}</strong>,</p>
    <p style="color:#555;line-height:1.6;">
      Great news! Your registration request as a <strong>${roleLabel}</strong> has been
      <strong style="color:#38A169;">approved</strong> by our admin team.
    </p>
    <div style="background:#f0fff4;border-left:4px solid #38A169;padding:14px 18px;border-radius:6px;margin:20px 0;">
      <p style="margin:0;color:#276749;font-size:0.92rem;">
        ✅ You can now <strong>log in</strong> using your registered email and password.
      </p>
    </div>
    <p style="color:#555;line-height:1.6;">
      Welcome to BNI Lakshya AI Banner Studio! If you have any questions, contact your chapter administrator.
    </p>
  `;

  const text = `Hi ${name || "there"},\n\nYour registration request as a ${roleLabel} has been APPROVED.\n\nYou can now log in using your registered email and password.\n\nWelcome to BNI Lakshya AI Banner Studio!`;

  return sendMail({ to, subject, html: emailWrapper(bodyHtml), text });
}

// ─── 3. Registration Rejected ────────────────────────────────────────────────
async function sendRejectionEmail({ to, name, role }) {
  const roleLabel = role === "admin" ? "Admin" : "Member";
  const subject   = "BNI Lakshya Banner Studio — Registration Update";

  const bodyHtml = `
    <p style="font-size:1rem;color:#333;">Hi <strong>${name || "there"}</strong>,</p>
    <p style="color:#555;line-height:1.6;">
      Thank you for your interest in joining <strong>BNI Lakshya AI Banner Studio</strong>
      as a <strong>${roleLabel}</strong>.
    </p>
    <div style="background:#fff5f5;border-left:4px solid #E53E3E;padding:14px 18px;border-radius:6px;margin:20px 0;">
      <p style="margin:0;color:#9b2c2c;font-size:0.92rem;">
        ❌ After review, your registration request has <strong>not been approved</strong> at this time.
      </p>
    </div>
    <p style="color:#555;line-height:1.6;">
      If you believe this is a mistake or have questions, please reach out to your chapter administrator directly.
    </p>
  `;

  const text = `Hi ${name || "there"},\n\nThank you for your interest in joining BNI Lakshya AI Banner Studio as a ${roleLabel}.\n\nAfter review, your registration request has NOT been approved at this time.\n\nIf you believe this is a mistake, please contact your chapter administrator.`;

  return sendMail({ to, subject, html: emailWrapper(bodyHtml), text });
}

module.exports = {
  sendMail,
  sendRegistrationReceivedEmail,
  sendApprovalEmail,
  sendRejectionEmail
};