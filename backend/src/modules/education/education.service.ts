import { EstadoEducacion, TipoEducacion } from '@prisma/client';
import { prisma } from '../common/prisma';
import { ForbiddenError, NotFoundError } from '../../utils/errors';

export const listOwnEducation = async (usuarioId: string) => {
  return prisma.educacion.findMany({
    where: { usuarioId },
    orderBy: { fechaInicio: 'desc' },
    include: { documento: true },
  });
};

export const createEducation = async (
  usuarioId: string,
  data: {
    tipo: TipoEducacion;
    institucion: string;
    nombre: string;
    fechaInicio?: Date | null;
    fechaFin?: Date | null;
    estado: EstadoEducacion;
    descripcion?: string;
    documentoId?: string | null;
  }
) => {
  if (data.documentoId) {
    const documento = await prisma.documento.findUnique({ where: { id: data.documentoId } });
    if (!documento || documento.empleadoId !== usuarioId || documento.tipoDocumento !== 'CERTIFICADO') {
      throw new ForbiddenError('Documento no válido para adjuntar');
    }
  }

  const educacion = await prisma.educacion.create({
    data: {
      usuarioId,
      tipo: data.tipo,
      institucion: data.institucion,
      nombre: data.nombre,
      fechaInicio: data.fechaInicio ?? null,
      fechaFin: data.fechaFin ?? null,
      estado: data.estado,
      descripcion: data.descripcion,
      documentoId: data.documentoId ?? null,
    },
  });

  await prisma.eventoAuditoria.create({
    data: {
      usuarioId,
      tipoEvento: 'EDUCACION_CREATE',
      entidadAfectada: 'Educacion',
      entidadId: educacion.id,
      detalle: `Educación creada (${data.tipo})`,
    },
  });

  return educacion;
};

export const updateEducation = async (
  usuarioId: string,
  id: string,
  data: {
    tipo?: TipoEducacion;
    institucion?: string;
    nombre?: string;
    fechaInicio?: Date | null;
    fechaFin?: Date | null;
    estado?: EstadoEducacion;
    descripcion?: string | null;
    documentoId?: string | null;
  }
) => {
  const existente = await prisma.educacion.findUnique({ where: { id } });
  if (!existente) {
    throw new NotFoundError('Registro de educación no encontrado');
  }
  if (existente.usuarioId !== usuarioId) {
    throw new ForbiddenError('No autorizado');
  }

  if (data.documentoId) {
    const documento = await prisma.documento.findUnique({ where: { id: data.documentoId } });
    if (!documento || documento.empleadoId !== usuarioId || documento.tipoDocumento !== 'CERTIFICADO') {
      throw new ForbiddenError('Documento no válido para adjuntar');
    }
  }

  const updated = await prisma.educacion.update({
    where: { id },
    data,
  });

  await prisma.eventoAuditoria.create({
    data: {
      usuarioId,
      tipoEvento: 'EDUCACION_UPDATE',
      entidadAfectada: 'Educacion',
      entidadId: id,
      detalle: 'Educación actualizada',
    },
  });

  return updated;
};

export const deleteEducation = async (usuarioId: string, id: string) => {
  const existente = await prisma.educacion.findUnique({ where: { id } });
  if (!existente) {
    throw new NotFoundError('Registro de educación no encontrado');
  }
  if (existente.usuarioId !== usuarioId) {
    throw new ForbiddenError('No autorizado');
  }

  await prisma.educacion.delete({ where: { id } });

  await prisma.eventoAuditoria.create({
    data: {
      usuarioId,
      tipoEvento: 'EDUCACION_DELETE',
      entidadAfectada: 'Educacion',
      entidadId: id,
      detalle: 'Educación eliminada',
    },
  });

  return existente;
};
