import { EstadoHoraExtra } from '@prisma/client';
import { prisma } from '../common/prisma';
import { ForbiddenError, NotFoundError } from '../../utils/errors';

export const listOwnOvertime = async (usuarioId: string) => {
  return prisma.horaExtra.findMany({
    where: { usuarioId },
    orderBy: { fecha: 'desc' },
  });
};

export const listOvertimeRequests = async (filters: { estado?: EstadoHoraExtra; empleadoId?: string }) => {
  return prisma.horaExtra.findMany({
    where: {
      estado: filters.estado,
      usuarioId: filters.empleadoId,
    },
    orderBy: { fecha: 'desc' },
    include: {
      usuario: { select: { id: true, nombre: true, apellido: true, area: true, cargo: true } },
    },
  });
};

export const createOvertime = async (
  usuarioId: string,
  data: {
    fecha: Date;
    horas: number;
    motivo?: string;
  }
) => {
  const overtime = await prisma.horaExtra.create({
    data: {
      usuarioId,
      fecha: data.fecha,
      horas: data.horas,
      motivo: data.motivo,
      estado: EstadoHoraExtra.PENDIENTE,
    },
  });

  await prisma.eventoAuditoria.create({
    data: {
      usuarioId,
      tipoEvento: 'OVERTIME_REQUEST',
      entidadAfectada: 'HoraExtra',
      entidadId: overtime.id,
      detalle: `Solicitud de horas extra por ${data.horas} horas`,
    },
  });

  return overtime;
};

export const approveOvertime = async (id: string, actorId: string) => {
  const overtime = await prisma.horaExtra.findUnique({ where: { id } });
  if (!overtime) {
    throw new NotFoundError('Registro de horas extra no encontrado');
  }

  const updated = await prisma.horaExtra.update({
    where: { id },
    data: {
      estado: EstadoHoraExtra.APROBADA,
      revisadoPorId: actorId,
    },
  });

  await prisma.eventoAuditoria.create({
    data: {
      usuarioId: actorId,
      tipoEvento: 'OVERTIME_APPROVE',
      entidadAfectada: 'HoraExtra',
      entidadId: id,
      detalle: 'Horas extra aprobadas',
    },
  });

  return updated;
};

export const rejectOvertime = async (id: string, actorId: string, comentario?: string) => {
  const overtime = await prisma.horaExtra.findUnique({ where: { id } });
  if (!overtime) {
    throw new NotFoundError('Registro de horas extra no encontrado');
  }

  const updated = await prisma.horaExtra.update({
    where: { id },
    data: {
      estado: EstadoHoraExtra.RECHAZADA,
      revisadoPorId: actorId,
      comentarioRevision: comentario,
    },
  });

  await prisma.eventoAuditoria.create({
    data: {
      usuarioId: actorId,
      tipoEvento: 'OVERTIME_REJECT',
      entidadAfectada: 'HoraExtra',
      entidadId: id,
      detalle: `Horas extra rechazadas. ${comentario ?? ''}`.trim(),
    },
  });

  return updated;
};

export const ensureOvertimeOwnership = async (usuarioId: string, id: string) => {
  const overtime = await prisma.horaExtra.findUnique({ where: { id } });
  if (!overtime) {
    throw new NotFoundError('Registro de horas extra no encontrado');
  }
  if (overtime.usuarioId !== usuarioId) {
    throw new ForbiddenError('No autorizado');
  }
  return overtime;
};
