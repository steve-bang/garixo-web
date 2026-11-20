import { env } from '@/config/env';

type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

type SmtpConfig = {
  host: string;
  port: number;
  username: string;
  password: string;
  from: string;
};

function getSmtpConfig(): SmtpConfig | null {
  const host = env.SMTP_HOST?.trim();
  const portValue = env.SMTP_PORT?.trim();
  const username = env.SMTP_USERNAME?.trim();
  const password = env.SMTP_PASSWORD?.trim();
  const sender = env.SMTP_SENDER?.trim();

  if (!host || !portValue || !username || !password || !sender) {
    return null;
  }

  const port = Number(portValue);
  if (!Number.isFinite(port) || port <= 0) {
    return null;
  }

  return {
    host,
    port,
    username,
    password,
    from: sender
  };
}

/**
 * Sends an email using Nodemailer SMTP transport from environment variables.
 * Returns false when SMTP is not configured so callers can handle gracefully.
 */
export async function sendSmtpEmail(input: SendEmailInput): Promise<boolean> {
  const config = getSmtpConfig();
  if (!config) {
    return false;
  }

  try {
    // Dynamic import keeps runtime safe if nodemailer is not installed yet.
    const moduleName = 'nodemailer';
    const nodemailerModule = (await import(moduleName).catch(() => null)) as {
      default?: {
        createTransport: (...args: unknown[]) => {
          sendMail: (options: unknown) => Promise<unknown>;
        };
      };
    } | null;

    if (!nodemailerModule?.default?.createTransport) {
      return false;
    }

    const transporter = nodemailerModule.default.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: {
        user: config.username,
        pass: config.password
      }
    });

    await transporter.sendMail({
      from: `Garixo <${config.from}>`,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html
    });

    return true;
  } catch {
    return false;
  }
}
