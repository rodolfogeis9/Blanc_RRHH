-- AlterEnum
ALTER TYPE "TipoEventoAuditoria" ADD VALUE IF NOT EXISTS 'INVITATION_CREATE';
ALTER TYPE "TipoEventoAuditoria" ADD VALUE IF NOT EXISTS 'INVITATION_ACCEPT';
ALTER TYPE "TipoEventoAuditoria" ADD VALUE IF NOT EXISTS 'PASSWORD_RESET_REQUEST';
ALTER TYPE "TipoEventoAuditoria" ADD VALUE IF NOT EXISTS 'PASSWORD_RESET_SUCCESS';

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN "jobRoleId" TEXT;

-- CreateTable
CREATE TABLE "JobRole" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invitation" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "RolUsuario" NOT NULL,
    "jobRoleId" TEXT,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "PasswordResetToken" ADD COLUMN "tokenHash" TEXT;
ALTER TABLE "PasswordResetToken" ADD COLUMN "attempts" INTEGER NOT NULL DEFAULT 0;
UPDATE "PasswordResetToken" SET "tokenHash" = "token";
ALTER TABLE "PasswordResetToken" ALTER COLUMN "tokenHash" SET NOT NULL;
DROP INDEX "PasswordResetToken_token_key";
ALTER TABLE "PasswordResetToken" DROP COLUMN "token";

-- CreateIndex
CREATE UNIQUE INDEX "JobRole_name_key" ON "JobRole"("name");
CREATE INDEX "Invitation_email_idx" ON "Invitation"("email");
CREATE INDEX "Invitation_tokenHash_idx" ON "Invitation"("tokenHash");
CREATE INDEX "PasswordResetToken_tokenHash_idx" ON "PasswordResetToken"("tokenHash");
CREATE INDEX "PasswordResetToken_usuarioId_idx" ON "PasswordResetToken"("usuarioId");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_jobRoleId_fkey" FOREIGN KEY ("jobRoleId") REFERENCES "JobRole"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_jobRoleId_fkey" FOREIGN KEY ("jobRoleId") REFERENCES "JobRole"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Seed JobRole
INSERT INTO "JobRole" ("id", "name", "active", "createdAt", "updatedAt") VALUES
  (md5(random()::text || clock_timestamp()::text), 'kinesiologo', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (md5(random()::text || clock_timestamp()::text), 'tecnologo medico', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (md5(random()::text || clock_timestamp()::text), 'operador camara hiperbarica', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (md5(random()::text || clock_timestamp()::text), 'odontologo', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (md5(random()::text || clock_timestamp()::text), 'recepcionista', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (md5(random()::text || clock_timestamp()::text), 'gerente comercial', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO NOTHING;
