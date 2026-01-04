import dayjs from 'dayjs';
import { EstadoSolicitudVacaciones, RolUsuario } from '@prisma/client';
import { prisma } from '../common/prisma';
import { NotFoundError, ForbiddenError, AppError } from '../../utils/errors';
import { getEmployeeVacationBalance, handleVacationApproval, handleVacationRejection } from '../../services/vacation-service';

export const listOwnVacationRequests = async (usuarioId: string) => {
  return prisma.solicitudVacaciones.findMany({
    where: { empleadoId: usuarioId },
    orderBy: { fechaSolicitud: 'desc' },
  });
};

export const listVacationRequests = async (filters: {
  estado?: EstadoSolicitudVacaciones;
  empleadoId?: string;
  desde?: string;
  hasta?: string;
}) => {
  return prisma.solicitudVacaciones.findMany({
    where: {
      estado: filters.estado,
      empleadoId: filters.empleadoId,
      fechaInicio: filters.desde ? { gte: new Date(filters.desde) } : undefined,
      fechaFin: filters.hasta ? { lte: new Date(filters.hasta) } : undefined,
    },
    orderBy: { fechaSolicitud: 'desc' },
    include: {
      empleado: {
        select: {
          id: true,
          nombre: true,
          apellido: true,
          area: true,
          cargo: true,
        },
      },
    },
  });
};

export const createVacationRequest = async (
  empleadoId: string,
  data: {
    tipoSolicitud: 'VACACIONES' | 'PERMISO_DESCONTADO_DE_VACACIONES';
    fechaInicio: string;
    fechaFin: string;
    comentarioEmpleado?: string;
  }
) => {
  const empleado = await prisma.usuario.findUnique({ where: { id: empleadoId } });
  if (!empleado) {
    throw new NotFoundError('Empleado no encontrado');
  }

  const inicio = dayjs(data.fechaInicio).startOf('day');
  const fin = dayjs(data.fechaFin).startOf('day');
  if (fin.isBefore(inicio)) {
    throw new AppError('La fecha fin debe ser posterior a la fecha de inicio', 400);
  }
  const dias = fin.diff(inicio, 'day') + 1;

  const balance = getEmployeeVacationBalance(empleado);
  if (balance.balance < dias) {
    throw new AppError('No tienes saldo suficiente de vacaciones', 400);
  }

  const solicitud = await prisma.solicitudVacaciones.create({
    data: {
      empleadoId,
      tipoSolicitud: data.tipoSolicitud,
      fechaInicio: inicio.toDate(),
      fechaFin: fin.toDate(),
      cantidadDias: dias,
      comentarioEmpleado: data.comentarioEmpleado,
    },
  });

  await prisma.eventoAuditoria.create({
    data: {
      usuarioId: empleadoId,
      tipoEvento: 'VACATION_REQUEST',
      entidadAfectada: 'SolicitudVacaciones',
      entidadId: solicitud.id,
      detalle: `Solicitud creada por ${dias} días`,
    },
  });

  return solicitud;
};

export const approveVacation = async (
  solicitudId: string,
  aprobadorId: string,
  actorRole: RolUsuario,
  comentario?: string
) => {
  if (actorRole === 'EMPLEADO') {
    throw new ForbiddenError();
  }
  const allowNegative = actorRole === 'ADMIN_DIRECCION';
  return handleVacationApproval(solicitudId, aprobadorId, comentario, allowNegative);
};

export const rejectVacation = async (
  solicitudId: string,
  aprobadorId: string,
  actorRole: RolUsuario,
  comentario?: string
) => {
  if (actorRole === 'EMPLEADO') {
    throw new ForbiddenError();
  }
  return handleVacationRejection(solicitudId, aprobadorId, comentario);
};
