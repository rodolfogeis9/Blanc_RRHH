-- Add new enums
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'VisibilidadDocumento') THEN
    CREATE TYPE "VisibilidadDocumento" AS ENUM ('SOLO_ADMIN', 'ADMIN_Y_EMPLEADO');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TipoEducacion') THEN
    CREATE TYPE "TipoEducacion" AS ENUM ('ESTUDIO', 'CERTIFICACION', 'CURSO');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'EstadoEducacion') THEN
    CREATE TYPE "EstadoEducacion" AS ENUM ('EN_CURSO', 'COMPLETADO');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'EstadoRemuneracion') THEN
    CREATE TYPE "EstadoRemuneracion" AS ENUM ('PUBLICADA', 'ANULADA');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'EstadoHoraExtra') THEN
    CREATE TYPE "EstadoHoraExtra" AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA');
  END IF;
END $$;

-- Extend existing enums
ALTER TYPE "TipoDocumento" ADD VALUE IF NOT EXISTS 'LEGAL';
ALTER TYPE "TipoDocumento" ADD VALUE IF NOT EXISTS 'CAPACITACION';
ALTER TYPE "TipoDocumento" ADD VALUE IF NOT EXISTS 'MANUAL';
ALTER TYPE "TipoDocumento" ADD VALUE IF NOT EXISTS 'CONSENTIMIENTO';
ALTER TYPE "TipoDocumento" ADD VALUE IF NOT EXISTS 'CERTIFICADO';

ALTER TYPE "TipoEventoAuditoria" ADD VALUE IF NOT EXISTS 'DESCARGA_DOCUMENTO';
ALTER TYPE "TipoEventoAuditoria" ADD VALUE IF NOT EXISTS 'ELIMINACION_DOCUMENTO';
ALTER TYPE "TipoEventoAuditoria" ADD VALUE IF NOT EXISTS 'EDUCACION_CREATE';
ALTER TYPE "TipoEventoAuditoria" ADD VALUE IF NOT EXISTS 'EDUCACION_UPDATE';
ALTER TYPE "TipoEventoAuditoria" ADD VALUE IF NOT EXISTS 'EDUCACION_DELETE';
ALTER TYPE "TipoEventoAuditoria" ADD VALUE IF NOT EXISTS 'JOB_CREATE';
ALTER TYPE "TipoEventoAuditoria" ADD VALUE IF NOT EXISTS 'JOB_UPDATE';
ALTER TYPE "TipoEventoAuditoria" ADD VALUE IF NOT EXISTS 'JOB_DELETE';
ALTER TYPE "TipoEventoAuditoria" ADD VALUE IF NOT EXISTS 'REMUNERACION_PUBLISH';
ALTER TYPE "TipoEventoAuditoria" ADD VALUE IF NOT EXISTS 'REMUNERACION_ANULATE';
ALTER TYPE "TipoEventoAuditoria" ADD VALUE IF NOT EXISTS 'VACATION_REQUEST';
ALTER TYPE "TipoEventoAuditoria" ADD VALUE IF NOT EXISTS 'VACATION_APPROVE';
ALTER TYPE "TipoEventoAuditoria" ADD VALUE IF NOT EXISTS 'VACATION_REJECT';
ALTER TYPE "TipoEventoAuditoria" ADD VALUE IF NOT EXISTS 'VACATION_ADJUST';
ALTER TYPE "TipoEventoAuditoria" ADD VALUE IF NOT EXISTS 'VACATION_CHANGE_FECHA_INGRESO';
ALTER TYPE "TipoEventoAuditoria" ADD VALUE IF NOT EXISTS 'OVERTIME_REQUEST';
ALTER TYPE "TipoEventoAuditoria" ADD VALUE IF NOT EXISTS 'OVERTIME_APPROVE';
ALTER TYPE "TipoEventoAuditoria" ADD VALUE IF NOT EXISTS 'OVERTIME_REJECT';

-- Usuario updates
ALTER TABLE "Usuario" ADD COLUMN IF NOT EXISTS "saldoVacacionesInicial" DOUBLE PRECISION;

-- Documento updates
ALTER TABLE "Documento" ADD COLUMN IF NOT EXISTS "visibilidad" "VisibilidadDocumento" NOT NULL DEFAULT 'ADMIN_Y_EMPLEADO';
ALTER TABLE "Documento" ADD COLUMN IF NOT EXISTS "storagePath" TEXT;
ALTER TABLE "Documento" ADD COLUMN IF NOT EXISTS "mimeType" TEXT NOT NULL DEFAULT 'application/octet-stream';
ALTER TABLE "Documento" ADD COLUMN IF NOT EXISTS "sizeBytes" INTEGER NOT NULL DEFAULT 0;

UPDATE "Documento" SET "storagePath" = "urlArchivo" WHERE "storagePath" IS NULL;
ALTER TABLE "Documento" ALTER COLUMN "storagePath" SET NOT NULL;
ALTER TABLE "Documento" DROP COLUMN IF EXISTS "urlArchivo";

-- Educacion
CREATE TABLE IF NOT EXISTS "Educacion" (
  "id" TEXT NOT NULL,
  "usuarioId" TEXT NOT NULL,
  "tipo" "TipoEducacion" NOT NULL,
  "institucion" TEXT NOT NULL,
  "nombre" TEXT NOT NULL,
  "fechaInicio" TIMESTAMP(3),
  "fechaFin" TIMESTAMP(3),
  "estado" "EstadoEducacion" NOT NULL,
  "descripcion" TEXT,
  "documentoId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Educacion_pkey" PRIMARY KEY ("id")
);

-- AntecedenteLaboral
CREATE TABLE IF NOT EXISTS "AntecedenteLaboral" (
  "id" TEXT NOT NULL,
  "usuarioId" TEXT NOT NULL,
  "empresa" TEXT NOT NULL,
  "cargo" TEXT NOT NULL,
  "fechaInicio" TIMESTAMP(3) NOT NULL,
  "fechaFin" TIMESTAMP(3),
  "descripcion" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AntecedenteLaboral_pkey" PRIMARY KEY ("id")
);

-- Remuneracion
CREATE TABLE IF NOT EXISTS "Remuneracion" (
  "id" TEXT NOT NULL,
  "usuarioId" TEXT NOT NULL,
  "periodo" TEXT NOT NULL,
  "fechaPago" TIMESTAMP(3),
  "montoLiquido" DOUBLE PRECISION,
  "montoBruto" DOUBLE PRECISION,
  "documentoId" TEXT NOT NULL,
  "estado" "EstadoRemuneracion" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Remuneracion_pkey" PRIMARY KEY ("id")
);

-- HoraExtra
CREATE TABLE IF NOT EXISTS "HoraExtra" (
  "id" TEXT NOT NULL,
  "usuarioId" TEXT NOT NULL,
  "fecha" TIMESTAMP(3) NOT NULL,
  "horas" DOUBLE PRECISION NOT NULL,
  "motivo" TEXT,
  "estado" "EstadoHoraExtra" NOT NULL,
  "revisadoPorId" TEXT,
  "comentarioRevision" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "HoraExtra_pkey" PRIMARY KEY ("id")
);

-- MovimientoVacaciones
CREATE TABLE IF NOT EXISTS "MovimientoVacaciones" (
  "id" TEXT NOT NULL,
  "empleadoId" TEXT NOT NULL,
  "tipo" TEXT NOT NULL,
  "dias" DOUBLE PRECISION NOT NULL,
  "detalle" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MovimientoVacaciones_pkey" PRIMARY KEY ("id")
);

-- SolicitudVacaciones timestamps
ALTER TABLE "SolicitudVacaciones" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "SolicitudVacaciones" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Indexes and constraints
ALTER TABLE "Educacion"
  ADD CONSTRAINT "Educacion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Educacion"
  ADD CONSTRAINT "Educacion_documentoId_fkey" FOREIGN KEY ("documentoId") REFERENCES "Documento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "AntecedenteLaboral"
  ADD CONSTRAINT "AntecedenteLaboral_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Remuneracion"
  ADD CONSTRAINT "Remuneracion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Remuneracion"
  ADD CONSTRAINT "Remuneracion_documentoId_fkey" FOREIGN KEY ("documentoId") REFERENCES "Documento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "HoraExtra"
  ADD CONSTRAINT "HoraExtra_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "HoraExtra"
  ADD CONSTRAINT "HoraExtra_revisadoPorId_fkey" FOREIGN KEY ("revisadoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "MovimientoVacaciones"
  ADD CONSTRAINT "MovimientoVacaciones_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
