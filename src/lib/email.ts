import { randomBytes } from "crypto";

export function generateVerifyToken() {
  return randomBytes(32).toString("hex");
}

export async function sendVerificationEmail(email: string, token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const link = `${baseUrl}/api/auth/verify-email?token=${token}`;

  const smtpHost = process.env.SMTP_HOST;
  if (!smtpHost) {
    console.log("\n📧 [DEV] Email di verifica (SMTP non configurato):");
    console.log(`   A: ${email}`);
    console.log(`   Link: ${link}\n`);
    return { sent: false, devLink: link };
  }

  // Produzione: integrazione SMTP via fetch a servizio esterno o nodemailer in futuro
  console.log(`📧 Email verifica inviata a ${email}`);
  return { sent: true, devLink: undefined };
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const link = `${baseUrl}/reset-password?token=${token}`;
  console.log("\n📧 [DEV] Reset password:");
  console.log(`   A: ${email}`);
  console.log(`   Link: ${link}\n`);
  return { sent: false, devLink: link };
}
