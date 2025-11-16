import type { Express } from 'express';
import { TipoDocumento } from '@prisma/client';
import { prisma } from '../common/prisma';
import { storageService } from '../../services/storage-service';
import { NotFoundError } from '../../utils/errors';

export const listOwnDocuments = async (usuarioId: string, filters: { tipoDocumento?: TipoDocumento; periodo?: string }) => {
  return prisma.documento.findMany({
    where: {
      empleadoId: usuarioId,
      tipoDocumento: filters.tipoDocumento,
      periodo: filters.periodo,
    },
    orderBy: { fechaSubida: 'desc' },
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
  });
};

export const uploadDocument = async (
  empleadoId: string,
  file: Express.Multer.File,
  data: { tipoDocumento: TipoDocumento; periodo?: string },
  actorId: string
) => {
  const empleado = await prisma.usuario.findUnique({ where: { id: empleadoId } });
  if (!empleado) {
    throw new NotFoundError('Empleado no encontrado');
  }

  const url = await storageService.uploadFile({
    buffer: file.buffer,
    filename: file.originalname,
    mimetype: file.mimetype,
    folder: `empleados/${empleadoId}/documentos`,
  });

  const documento = await prisma.documento.create({
    data: {
      empleadoId,
      tipoDocumento: data.tipoDocumento,
      periodo: data.periodo,
      nombreArchivoOriginal: file.originalname,
      urlArchivo: url,
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
