import dotenv from 'dotenv';

dotenv.config();

const requiredEnv = ['DATABASE_URL', 'JWT_SECRET'];

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    console.warn(`⚠️  La variable de entorno ${key} no está definida. Algunas funcionalidades pueden no funcionar correctamente.`);
  }
});

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL ?? '',
  jwtSecret: process.env.JWT_SECRET ?? 'change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '8h',
  passwordResetTokenMinutes: Number(process.env.PASSWORD_RESET_TOKEN_MINUTES ?? 15),
  invitationTokenHours: Number(process.env.INVITATION_TOKEN_HOURS ?? 72),
  gcsBucket: process.env.GCS_BUCKET ?? '',
  gcsBaseFolder: process.env.GCS_BASE_FOLDER ?? 'uploads',
  localUploadsPath: process.env.LOCAL_UPLOADS_PATH ?? 'backend/uploads',
  frontendBaseUrl: process.env.FRONTEND_BASE_URL ?? 'http://localhost:5173',
  smtpHost: process.env.SMTP_HOST ?? '',
  smtpPort: Number(process.env.SMTP_PORT ?? 587),
  smtpUser: process.env.SMTP_USER ?? '',
  smtpPass: process.env.SMTP_PASS ?? '',
  smtpFrom: process.env.SMTP_FROM ?? 'no-reply@blancrrhh.local',
  smtpSecure: process.env.SMTP_SECURE === 'true',
  sendgridApiKey: process.env.SENDGRID_API_KEY ?? '',
  sendgridFrom: process.env.SENDGRID_FROM ?? '',
};
