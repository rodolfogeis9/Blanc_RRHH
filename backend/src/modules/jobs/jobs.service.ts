import { prisma } from '../common/prisma';
import { ForbiddenError, NotFoundError } from '../../utils/errors';

export const listOwnJobs = async (usuarioId: string) => {
  return prisma.antecedenteLaboral.findMany({
    where: { usuarioId },
    orderBy: { fechaInicio: 'desc' },
  });
};

export const createJob = async (
  usuarioId: string,
  data: {
    empresa: string;
    cargo: string;
    fechaInicio: Date;
    fechaFin?: Date | null;
    descripcion?: string;
  }
) => {
  const job = await prisma.antecedenteLaboral.create({
    data: {
      usuarioId,
      empresa: data.empresa,
      cargo: data.cargo,
      fechaInicio: data.fechaInicio,
      fechaFin: data.fechaFin ?? null,
      descripcion: data.descripcion,
    },
  });

  await prisma.eventoAuditoria.create({
    data: {
      usuarioId,
      tipoEvento: 'JOB_CREATE',
      entidadAfectada: 'AntecedenteLaboral',
      entidadId: job.id,
      detalle: `Antecedente laboral creado (${data.empresa})`,
    },
  });

  return job;
};

export const updateJob = async (
  usuarioId: string,
  id: string,
  data: {
    empresa?: string;
    cargo?: string;
    fechaInicio?: Date;
    fechaFin?: Date | null;
    descripcion?: string | null;
  }
) => {
  const existente = await prisma.antecedenteLaboral.findUnique({ where: { id } });
  if (!existente) {
    throw new NotFoundError('Antecedente laboral no encontrado');
  }
  if (existente.usuarioId !== usuarioId) {
    throw new ForbiddenError('No autorizado');
  }

  const updated = await prisma.antecedenteLaboral.update({
    where: { id },
    data,
  });

  await prisma.eventoAuditoria.create({
    data: {
      usuarioId,
      tipoEvento: 'JOB_UPDATE',
      entidadAfectada: 'AntecedenteLaboral',
      entidadId: id,
      detalle: 'Antecedente laboral actualizado',
    },
  });

  return updated;
};

export const deleteJob = async (usuarioId: string, id: string) => {
  const existente = await prisma.antecedenteLaboral.findUnique({ where: { id } });
  if (!existente) {
    throw new NotFoundError('Antecedente laboral no encontrado');
  }
  if (existente.usuarioId !== usuarioId) {
    throw new ForbiddenError('No autorizado');
  }

  await prisma.antecedenteLaboral.delete({ where: { id } });

  await prisma.eventoAuditoria.create({
    data: {
      usuarioId,
      tipoEvento: 'JOB_DELETE',
      entidadAfectada: 'AntecedenteLaboral',
      entidadId: id,
      detalle: 'Antecedente laboral eliminado',
    },
  });

  return existente;
};
