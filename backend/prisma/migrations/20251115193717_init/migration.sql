-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('ADMIN_DIRECCION', 'ADMIN_RRHH', 'EMPLEADO');

-- CreateEnum
CREATE TYPE "EstadoLaboral" AS ENUM ('ACTIVO', 'SUSPENDIDO', 'FINIQUITADO');

-- CreateEnum
CREATE TYPE "TipoDocumento" AS ENUM ('CONTRATO', 'ANEXO', 'LIQUIDACION', 'ESTUDIO', 'OTRO');

-- CreateEnum
CREATE TYPE "TipoSolicitudVacaciones" AS ENUM ('VACACIONES', 'PERMISO_DESCONTADO_DE_VACACIONES');

-- CreateEnum
CREATE TYPE "EstadoSolicitudVacaciones" AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA');

-- CreateEnum
CREATE TYPE "TipoLicenciaMedica" AS ENUM ('ENFERMEDAD', 'ACCIDENTE', 'MATERNIDAD', 'OTRO');

-- CreateEnum
CREATE TYPE "TipoEventoAuditoria" AS ENUM ('CREACION_EMPLEADO', 'CAMBIO_FECHA_INGRESO', 'AJUSTE_VACACIONES', 'APROBACION_VACACIONES', 'RECHAZO_VACACIONES', 'SUBIDA_DOCUMENTO', 'REGISTRO_LICENCIA_MEDICA', 'CAMBIO_ESTADO_LABORAL', 'ACTUALIZACION_DATOS_PERSONALES', 'RESET_PASSWORD');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "rol" "RolUsuario" NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "rut" TEXT NOT NULL,
    "fechaNacimiento" TIMESTAMP(3) NOT NULL,
    "telefono" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "fechaIngreso" TIMESTAMP(3) NOT NULL,
    "cargo" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "estadoLaboral" "EstadoLaboral" NOT NULL DEFAULT 'ACTIVO',
    "diasVacacionesAcumulados" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "diasVacacionesTomados" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "urlFotoPerfil" TEXT,
    "resumenPerfilProfesional" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Documento" (
    "id" TEXT NOT NULL,
    "empleadoId" TEXT NOT NULL,
    "tipoDocumento" "TipoDocumento" NOT NULL,
    "periodo" TEXT,
    "nombreArchivoOriginal" TEXT NOT NULL,
    "urlArchivo" TEXT NOT NULL,
    "subidoPorUsuarioId" TEXT NOT NULL,
    "fechaSubida" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Documento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SolicitudVacaciones" (
    "id" TEXT NOT NULL,
    "empleadoId" TEXT NOT NULL,
    "tipoSolicitud" "TipoSolicitudVacaciones" NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "cantidadDias" DOUBLE PRECISION NOT NULL,
    "estado" "EstadoSolicitudVacaciones" NOT NULL DEFAULT 'PENDIENTE',
    "fechaSolicitud" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aprobadorId" TEXT,
    "comentarioEmpleado" TEXT,
    "comentarioAprobador" TEXT,
    "fechaResolucion" TIMESTAMP(3),
    "alertaSuperposicion" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SolicitudVacaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LicenciaMedica" (
    "id" TEXT NOT NULL,
    "empleadoId" TEXT NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "tipo" "TipoLicenciaMedica" NOT NULL,
    "urlArchivoLicencia" TEXT NOT NULL,
    "observaciones" TEXT,
    "creadoPorUsuarioId" TEXT NOT NULL,
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LicenciaMedica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventoAuditoria" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tipoEvento" "TipoEventoAuditoria" NOT NULL,
    "entidadAfectada" TEXT NOT NULL,
    "entidadId" TEXT NOT NULL,
    "detalle" TEXT NOT NULL,
    "fechaEvento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventoAuditoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_rut_key" ON "Usuario"("rut");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- AddForeignKey
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_subidoPorUsuarioId_fkey" FOREIGN KEY ("subidoPorUsuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudVacaciones" ADD CONSTRAINT "SolicitudVacaciones_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudVacaciones" ADD CONSTRAINT "SolicitudVacaciones_aprobadorId_fkey" FOREIGN KEY ("aprobadorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LicenciaMedica" ADD CONSTRAINT "LicenciaMedica_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LicenciaMedica" ADD CONSTRAINT "LicenciaMedica_creadoPorUsuarioId_fkey" FOREIGN KEY ("creadoPorUsuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventoAuditoria" ADD CONSTRAINT "EventoAuditoria_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
