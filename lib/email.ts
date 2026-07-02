import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

const FROM_ADDRESS = process.env.EMAIL_FROM ?? "CEINFUA <no-reply@ceinfua.local>";

function baseUrl(): string {
  return process.env.NEXTAUTH_URL ?? "http://localhost:3000";
}

async function send(to: string, subject: string, html: string): Promise<void> {
  if (!resend) {
    console.log(
      `[email:no-op] RESEND_API_KEY not set. Would send "${subject}" to ${to}:\n${html}`,
    );
    return;
  }

  try {
    await resend.emails.send({ from: FROM_ADDRESS, to, subject, html });
  } catch (error) {
    console.error(`[email:error] Failed to send "${subject}" to ${to}`, error);
  }
}

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const link = `${baseUrl()}/api/verify-email?token=${token}`;
  await send(
    email,
    "Verifica tu correo - CEINFUA",
    `<p>Gracias por registrarte en CEINFUA.</p><p>Verifica tu correo haciendo clic en el siguiente enlace:</p><p><a href="${link}">${link}</a></p>`,
  );
}

export async function sendClaimInviteEmail(email: string, token: string): Promise<void> {
  const link = `${baseUrl()}/claim-account?token=${token}`;
  await send(
    email,
    "Activa tu cuenta - CEINFUA",
    `<p>CEINFUA creo un registro de estudiante para ti.</p><p>Activa tu cuenta estableciendo una contraseña:</p><p><a href="${link}">${link}</a></p>`,
  );
}
