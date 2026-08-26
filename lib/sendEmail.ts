import nodemailer, { type Transporter } from "nodemailer";

export type MailPayload = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
};

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Falta la variable de entorno ${name}`);
  return value;
}

export class EmailService {
  private transporter: Transporter;
  private defaultFrom: string;

  constructor() {
    const host = requireEnv("SMTP_HOST");
    const port = Number(process.env.SMTP_PORT ?? 587);

    this.defaultFrom = process.env.SMTP_FROM ?? requireEnv("SMTP_USER");
    this.transporter = nodemailer.createTransport({
      host,
      port,
      // 465 es SMTPS (TLS implícito); el resto usa STARTTLS.
      secure: process.env.SMTP_SECURE
        ? process.env.SMTP_SECURE === "true"
        : port === 465,
      auth: {
        user: requireEnv("SMTP_USER"),
        pass: requireEnv("SMTP_PASSWORD"),
      },
    });
  }

  async sendMail(payload: MailPayload) {
    return this.transporter.sendMail({
      from: payload.from ?? this.defaultFrom,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
      replyTo: payload.replyTo,
    });
  }
}
