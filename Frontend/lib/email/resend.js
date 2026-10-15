import { Resend } from "resend";

export async function sendResendEmail({ to, subject, html, text, attachments }) {
  const apiKey = process.env.RESEND_API_KEY || "";
  const senderEmail = process.env.RESEND_FROM_EMAIL || process.env.RESEND_SENDER_EMAIL || "onboarding@resend.dev";

  if (!apiKey) {
    console.warn("RESEND_API_KEY is not configured. Simulating email send:", { to, subject });
    if (html) {
      const linkRegex = /href="([^"]+)"/g;
      const links = [];
      let match;
      while ((match = linkRegex.exec(html)) !== null) {
        links.push(match[1]);
      }
      if (links.length > 0) {
        console.warn("🔗 Simulated Email Links Found (Click or copy to test):");
        links.forEach(link => console.warn(`   👉 ${link}`));
      } else {
        console.warn("Simulated Email Body HTML:", html);
      }
    }
    return { id: "simulated_email_id" };
  }

  try {
    const resendClient = new Resend(apiKey);
    const data = await resendClient.emails.send({
      from: senderEmail,
      to,
      subject,
      html,
      text: text || "Please view this email in a client that supports HTML.",
      attachments,
    });
    return data;
  } catch (error) {
    console.error("Failed to send email using Resend:", error);
    throw error;
  }
}
