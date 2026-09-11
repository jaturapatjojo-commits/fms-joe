import "server-only";
import nodemailer from "nodemailer";
import { env, smtpConfigured } from "./env";
import { logger } from "./logger";
import { prisma } from "./prisma";

export interface SmtpConfig {
  host?: string;
  port?: number;
  secure?: boolean;
  user: string;
  pass: string;
  from?: string;
}

export interface MailInput {
  to: string;
  subject: string;
  text: string;
  html?: string;
  smtp?: SmtpConfig;
}

interface SmtpResolved {
  host: string;
  port: number;
  secure: boolean;
  auth?: { user: string; pass: string };
  from: string;
}

async function resolveSmtp(custom?: SmtpConfig): Promise<SmtpResolved | null> {
  if (custom?.user && custom?.pass) {
    return {
      host: custom.host || "smtp.gmail.com",
      port: custom.port || 465,
      secure: custom.secure ?? true,
      auth: { user: custom.user, pass: custom.pass.replace(/\s+/g, "") },
      from: custom.from || custom.user,
    };
  }

  try {
    const t = await prisma.tenant.findFirst({ select: { settings: true } });
    const s = (t?.settings as { smtp?: { enabled: boolean; user: string; pass: string; from?: string } } | null)?.smtp;
    if (s?.enabled && s.user && s.pass) {
      return {
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: { user: s.user, pass: s.pass.replace(/\s+/g, "") },
        from: s.from || `FMS System <${s.user}>`,
      };
    }
  } catch {
    // Database might not be available in unit tests
  }

  if (smtpConfigured()) {
    const e = env();
    return {
      host: e.SMTP_HOST,
      port: e.SMTP_PORT,
      secure: e.SMTP_PORT === 465,
      auth: e.SMTP_USER ? { user: e.SMTP_USER, pass: e.SMTP_PASS } : undefined,
      from: e.SMTP_FROM,
    };
  }

  return null;
}

export async function sendMail(input: MailInput): Promise<{ delivered: boolean }> {
  const config = await resolveSmtp(input.smtp);

  if (!config) {
    logger.info("mail (no SMTP configured, logged only)", { to: input.to, subject: input.subject, text: input.text });
    return { delivered: false };
  }

  try {
    const transport = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.auth,
    });
    await transport.sendMail({
      from: config.from,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
    });
    logger.info("mail sent successfully", { to: input.to, subject: input.subject });
    return { delivered: true };
  } catch (err) {
    logger.error("mail send failed", { to: input.to, err: err instanceof Error ? err.message : String(err) });
    return { delivered: false };
  }
}
