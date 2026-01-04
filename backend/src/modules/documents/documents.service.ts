import type { Express } from 'express';
import path from 'path';
import { TipoDocumento, VisibilidadDocumento } from '@prisma/client';
import { prisma } from '../common/prisma';
import { storageService } from '../../services/storage-service';
import { ForbiddenError, NotFoundError } from '../../utils/errors';

export const listOwnDocuments = async (usuarioId: string, filters: { tipoDocumento?: TipoDocumento; periodo?: string }) => {
  return prisma.documento.findMany({
    where: {
      empleadoId: usuarioId,
      visibilidad: 'ADMIN_Y_EMPLEADO',
      tipoDocumento: filters.tipoDocumento,
      periodo: filters.periodo,
    },
    orderBy: { fechaSubida: 'desc' },
    select: {
      id: true,
      tipoDocumento: true,
      visibilidad: true,
      periodo: true,
      nombreArchivoOriginal: true,
      mimeType: true,
      fechaSubida: true,
    },
  });
};

export const listEmployeeDocuments = async (
  empleadoId: string,
  filters: { tipoDocumento?: TipoDocumento; periodo?: string }
) => {
  return prisma.documento.findMany({
    where: {
      empleadoId,
      tipoDocumento: filters.tipoDocumento,
      periodo: filters.periodo,
    },
    orderBy: { fechaSubida: 'desc' },
    select: {
      id: true,
      tipoDocumento: true,
      visibilidad: true,
      periodo: true,
      nombreArchivoOriginal: true,
      mimeType: true,
      fechaSubida: true,
    },
  });
};

export const uploadDocument = async (
  empleadoId: string,
  file: Express.Multer.File,
  data: { tipoDocumento: TipoDocumento; periodo?: string; visibilidad?: VisibilidadDocumento },
  actorId: string
) => {
  const empleado = await prisma.usuario.findUnique({ where: { id: empleadoId } });
  if (!empleado) {
    throw new NotFoundError('Empleado no encontrado');
  }

  const stored = await storageService.uploadFile({
    buffer: file.buffer,
    filename: file.originalname,
    mimetype: file.mimetype,
    folder: `empleados/${empleadoId}/documentos`,
  });

  const documento = await prisma.documento.create({
    data: {
      empleadoId,
      tipoDocumento: data.tipoDocumento,
      visibilidad: data.visibilidad ?? 'ADMIN_Y_EMPLEADO',
      periodo: data.periodo,
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
      detalle: `Documento ${data.tipoDocumento} subido para empleado ${empleadoId}`,
    },
  });

  return documento;
};

export const getDocumentForDownload = async (documentId: string, actorId: string, actorRole: string) => {
  const documento = await prisma.documento.findUnique({ where: { id: documentId } });
  if (!documento) {
    throw new NotFoundError('Documento no encontrado');
  }

  const isOwner = documento.empleadoId === actorId;
  const isAdmin = actorRole !== 'EMPLEADO';
  if (!isAdmin) {
    if (!isOwner || documento.visibilidad !== 'ADMIN_Y_EMPLEADO') {
      throw new ForbiddenError('No tienes permisos para ver este documento');
    }
  }

  await prisma.eventoAuditoria.create({
    data: {
      usuarioId: actorId,
      tipoEvento: 'DESCARGA_DOCUMENTO',
      entidadAfectada: 'Documento',
      entidadId: documento.id,
      detalle: `Descarga de documento ${documento.tipoDocumento}`,
    },
  });

  const isGcs = documento.storagePath.startsWith('gs://');
  if (isGcs) {
    throw new NotFoundError('Documento no disponible para descarga local');
  }
  const resolvedPath = storageService.resolveLocalPath(documento.storagePath);
  const exists = await storageService.fileExists(documento.storagePath);
  if (!exists) {
    throw new NotFoundError('Archivo no disponible');
  }
  const fileName = path.basename(documento.storagePath);
  return { documento, resolvedPath, fileName };
};

export const deleteDocument = async (documentId: string, actorId: string) => {
  const documento = await prisma.documento.findUnique({ where: { id: documentId } });
  if (!documento) {
    throw new NotFoundError('Documento no encontrado');
  }

  await prisma.documento.delete({ where: { id: documentId } });

  if (!documento.storagePath.startsWith('gs://')) {
    const fs = await import('fs/promises');
    const resolvedPath = storageService.resolveLocalPath(documento.storagePath);
    await fs.unlink(resolvedPath).catch(() => undefined);
  }

  await prisma.eventoAuditoria.create({
    data: {
      usuarioId: actorId,
      tipoEvento: 'ELIMINACION_DOCUMENTO',
      entidadAfectada: 'Documento',
      entidadId: documento.id,
      detalle: `Documento eliminado ${documento.tipoDocumento}`,
    },
  });

  return documento;
};
