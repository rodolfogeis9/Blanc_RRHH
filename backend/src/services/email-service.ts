import { env } from '../config/env';

export type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export const sendEmail = async ({ to, subject, html }: SendEmailParams) => {
  if (!env.sendgridApiKey || !env.sendgridFrom) {
    throw new Error('Servicio de correo no configurado. Define SENDGRID_API_KEY y SENDGRID_FROM.');
  }

  const payload = {
    personalizations: [{ to: [{ email: to }] }],
    from: { email: env.sendgridFrom },
    subject,
    content: [{ type: 'text/html', value: html }],
  };

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.sendgridApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Error enviando correo: ${detail}`);
  }
};
