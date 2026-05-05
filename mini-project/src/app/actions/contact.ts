"use server";

import nodemailer from "nodemailer";

export type ContactState = {
  success?: boolean;
  error?: string;
};

export async function sendContactEmail(
  _prev: ContactState,
  formData: FormData
): Promise<ContactState> {
  const name    = (formData.get("name")    as string | null)?.trim();
  const email   = (formData.get("email")   as string | null)?.trim();
  const company = (formData.get("company") as string | null)?.trim();
  const subject = (formData.get("subject") as string | null)?.trim();
  const message = (formData.get("message") as string | null)?.trim();

  if (!name || !email || !message) {
    return { error: "Name, email, and message are required." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  const htmlBody = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1A1A1A">
      <div style="background:#D4AF37;padding:2px 0;border-radius:4px 4px 0 0"></div>
      <div style="border:1px solid #D4D4D4;border-top:none;border-radius:0 0 8px 8px;padding:28px 32px">
        <h2 style="margin:0 0 20px;font-size:18px">New Enquiry — GOLD Eyes</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr><td style="padding:8px 0;color:#6B7280;width:110px">Name</td><td style="padding:8px 0;font-weight:600">${name}</td></tr>
          <tr><td style="padding:8px 0;color:#6B7280">Email</td><td style="padding:8px 0"><a href="mailto:${email}" style="color:#D4AF37">${email}</a></td></tr>
          ${company ? `<tr><td style="padding:8px 0;color:#6B7280">Company</td><td style="padding:8px 0">${company}</td></tr>` : ""}
          ${subject ? `<tr><td style="padding:8px 0;color:#6B7280">Subject</td><td style="padding:8px 0">${subject}</td></tr>` : ""}
        </table>
        <hr style="border:none;border-top:1px solid #E5E5E5;margin:20px 0">
        <p style="margin:0 0 6px;color:#6B7280;font-size:13px">Message</p>
        <p style="margin:0;font-size:14px;line-height:1.7;white-space:pre-wrap">${message}</p>
      </div>
    </div>
  `;

  try {
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST ?? "smtp.gmail.com",
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: false,
        auth: { user: smtpUser, pass: smtpPass },
      });

      await transporter.sendMail({
        from: `"GOLD Eyes Contact" <${smtpUser}>`,
        to: "fengng6907@gmail.com",
        replyTo: email,
        subject: `[GOLD Eyes] ${subject ?? `Enquiry from ${name}`}`,
        html: htmlBody,
      });
    } else {
      // Dev fallback — logs to console when SMTP env vars are absent
      console.log("[Contact Form Submission]", { name, email, company, subject, message });
    }

    return { success: true };
  } catch (err) {
    console.error("[Contact Form Error]", err);
    return { error: "Failed to send your message. Please try again shortly." };
  }
}
