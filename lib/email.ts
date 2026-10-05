import "server-only";
import nodemailer from "nodemailer";

let _transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      // 587/STARTTLS, not 465/implicit-TLS - many hosts (including our VPS)
      // block 465 and 25 outbound by default as an anti-spam measure but leave
      // 587 open since it's the standard mail-submission port.
      port: 587,
      secure: false,
      requireTLS: true,
      // fifart.net's mail server is on shared hosting (cretaforce.gr) and its
      // cert only covers *.cretaforce.gr, not fifart.net - but connecting
      // *as* cretaforce.gr routes to the wrong virtual mail host and breaks
      // auth (SNI-based virtual hosting). Must connect as fifart.net for auth
      // to resolve correctly, which means the cert hostname won't match.
      // The connection is still encrypted; only the hostname check is relaxed.
      tls: { rejectUnauthorized: false },
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }
  return _transporter;
}

export async function sendMail({
  to,
  subject,
  text,
  from = "ΚΕΔ ΟΣΕΚΑ<oseka@fifart.net>",
}: {
  to: string | string[];
  subject: string;
  text: string;
  from?: string;
}) {
  return getTransporter().sendMail({ from, to, subject, text });
}

/** Sends to many recipients in parallel and reports which ones failed, instead of silently swallowing errors. */
export async function sendMailToMany(
  recipients: string[],
  build: (email: string) => { subject: string; text: string }
) {
  const results = await Promise.allSettled(
    recipients.map((email) => sendMail({ to: email, ...build(email) }))
  );

  const failed = recipients.filter((_, i) => results[i]?.status === "rejected");
  return { sent: recipients.length - failed.length, failed };
}
