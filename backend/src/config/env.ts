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
  passwordResetTokenMinutes: Number(process.env.PASSWORD_RESET_TOKEN_MINUTES ?? 60),
  gcsBucket: process.env.GCS_BUCKET ?? '',
  gcsBaseFolder: process.env.GCS_BASE_FOLDER ?? 'uploads',
  localUploadsPath: process.env.LOCAL_UPLOADS_PATH ?? 'backend/uploads',
  frontendBaseUrl: process.env.FRONTEND_BASE_URL ?? 'http://localhost:5173',
};
