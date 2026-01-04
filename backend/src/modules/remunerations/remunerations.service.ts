import type { Express } from 'express';
import { EstadoRemuneracion, TipoDocumento } from '@prisma/client';
import { prisma } from '../common/prisma';
import { storageService } from '../../services/storage-service';
import { AppError, ForbiddenError, NotFoundError } from '../../utils/errors';

export const listOwnRemunerations = async (usuarioId: string) => {
  return prisma.remuneracion.findMany({
    where: { usuarioId },
    orderBy: { periodo: 'desc' },
    include: { documento: { select: { id: true, nombreArchivoOriginal: true, mimeType: true } } },
  });
};

export const listRemunerations = async (filters: { empleadoId?: string; periodo?: string }) => {
  return prisma.remuneracion.findMany({
    where: {
      usuarioId: filters.empleadoId,
      periodo: filters.periodo,
    },
    orderBy: { periodo: 'desc' },
    include: {
      usuario: { select: { id: true, nombre: true, apellido: true, area: true, cargo: true } },
      documento: { select: { id: true, nombreArchivoOriginal: true, mimeType: true } },
    },
  });
};

const createDocumentForRemuneration = async (
  empleadoId: string,
  file: Express.Multer.File,
  periodo: string,
  actorId: string
) => {
  const stored = await storageService.uploadFile({
    buffer: file.buffer,
    filename: file.originalname,
    mimetype: file.mimetype,
    folder: `empleados/${empleadoId}/remuneraciones`,
  });

  const documento = await prisma.documento.create({
    data: {
      empleadoId,
      tipoDocumento: TipoDocumento.LIQUIDACION,
      visibilidad: 'ADMIN_Y_EMPLEADO',
      periodo,
      nombreArchivoOriginal: file.originalname,
      storagePath: stored.storagePath,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      subidoPorUsuarioId: actorId,
    },
  });

  await prisma.eventoAuditoria.create({
    data: {
      usuarioId: actorId,
      tipoEvento: 'SUBIDA_DOCUMENTO',
      entidadAfectada: 'Documento',
      entidadId: documento.id,
      detalle: `Liquidación subida para empleado ${empleadoId} (${periodo})`,
    },
  });

  return documento;
};

export const publishRemuneration = async (
  empleadoId: string,
  data: {
    periodo: string;
    fechaPago?: Date | null;
    montoLiquido?: number;
    montoBruto?: number;
    documentoId?: string;
  },
  file: Express.Multer.File | undefined,
  actorId: string
) => {
  const empleado = await prisma.usuario.findUnique({ where: { id: empleadoId } });
  if (!empleado) {
    throw new NotFoundError('Empleado no encontrado');
  }

  let documentoId = data.documentoId;
  if (!documentoId) {
    if (!file) {
      throw new AppError('Documento requerido para la liquidación', 400, 'DOCUMENT_REQUIRED');
    }
    const documento = await createDocumentForRemuneration(empleadoId, file, data.periodo, actorId);
    documentoId = documento.id;
  } else {
    const documento = await prisma.documento.findUnique({ where: { id: documentoId } });
    if (!documento || documento.empleadoId !== empleadoId) {
      throw new ForbiddenError('Documento inválido');
    }
  }

  const remuneracion = await prisma.remuneracion.create({
    data: {
      usuarioId: empleadoId,
      periodo: data.periodo,
      fechaPago: data.fechaPago ?? null,
      montoLiquido: data.montoLiquido ?? null,
      montoBruto: data.montoBruto ?? null,
      documentoId: documentoId,
      estado: EstadoRemuneracion.PUBLICADA,
    },
  });

  await prisma.eventoAuditoria.create({
    data: {
      usuarioId: actorId,
      tipoEvento: 'REMUNERACION_PUBLISH',
      entidadAfectada: 'Remuneracion',
      entidadId: remuneracion.id,
      detalle: `Liquidación publicada ${data.periodo}`,
    },
  });

  return remuneracion;
};

export const annulRemuneration = async (id: string, actorId: string) => {
  const remuneracion = await prisma.remuneracion.findUnique({ where: { id } });
  if (!remuneracion) {
    throw new NotFoundError('Liquidación no encontrada');
  }

  const updated = await prisma.remuneracion.update({
    where: { id },
    data: { estado: EstadoRemuneracion.ANULADA },
  });

  await prisma.eventoAuditoria.create({
    data: {
      usuarioId: actorId,
      tipoEvento: 'REMUNERACION_ANULATE',
      entidadAfectada: 'Remuneracion',
      entidadId: id,
      detalle: 'Liquidación anulada',
    },
  });

  return updated;
};
