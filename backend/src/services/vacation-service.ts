import dayjs from 'dayjs';
import { prisma } from '../modules/common/prisma';
import { AppError, NotFoundError } from '../utils/errors';

export const VACATION_DAYS_PER_MONTH = 1.25;

export const calculateAccruedVacationDays = (entryDate: Date, today = new Date()) => {
  const start = dayjs(entryDate);
  const end = dayjs(today);
  const monthsWorked = end.diff(start.startOf('day'), 'month');
  return Number((monthsWorked * VACATION_DAYS_PER_MONTH).toFixed(2));
};

export const getEmployeeVacationBalance = (employee: {
  fechaIngreso: Date;
  diasVacacionesAcumulados: number;
  diasVacacionesTomados: number;
}) => {
  const autoAccrued = calculateAccruedVacationDays(employee.fechaIngreso);
  const manualAccrued = employee.diasVacacionesAcumulados;
  const totalAccrued = Number((autoAccrued + manualAccrued).toFixed(2));
  const taken = employee.diasVacacionesTomados;
  const balance = Number((totalAccrued - taken).toFixed(2));
  return { totalAccrued, taken, balance };
};

export const adjustVacationDays = async (
  empleadoId: string,
  data: { diasVacacionesAcumulados?: number; diasVacacionesTomados?: number }
) => {
  const empleado = await prisma.usuario.findUnique({ where: { id: empleadoId } });
  if (!empleado) {
    throw new NotFoundError('Empleado no encontrado');
  }

  const updated = await prisma.usuario.update({
    where: { id: empleadoId },
    data: {
      diasVacacionesAcumulados: data.diasVacacionesAcumulados ?? empleado.diasVacacionesAcumulados,
      diasVacacionesTomados: data.diasVacacionesTomados ?? empleado.diasVacacionesTomados,
    },
  });

  return { empleado: updated, balance: getEmployeeVacationBalance(updated) };
};

export const handleVacationApproval = async (
  solicitudId: string,
  aprobadorId: string,
  comentario?: string
) => {
  const solicitud = await prisma.solicitudVacaciones.findUnique({
    where: { id: solicitudId },
    include: { empleado: true },
  });

  if (!solicitud) {
    throw new NotFoundError('Solicitud no encontrada');
  }

  if (solicitud.estado !== 'PENDIENTE') {
    throw new AppError('La solicitud ya fue gestionada', 400);
  }

  const balance = getEmployeeVacationBalance(solicitud.empleado);
  if (balance.balance < solicitud.cantidadDias) {
    throw new AppError('El empleado no tiene saldo suficiente de vacaciones', 400);
  }

  const updatedSolicitud = await prisma.$transaction(async (tx) => {
    const solicitudActualizada = await tx.solicitudVacaciones.update({
      where: { id: solicitudId },
      data: {
        estado: 'APROBADA',
        aprobadorId,
        comentarioAprobador: comentario,
        fechaResolucion: new Date(),
      },
      include: { empleado: true },
    });

    await tx.usuario.update({
      where: { id: solicitud.empleadoId },
      data: {
        diasVacacionesTomados: solicitud.empleado.diasVacacionesTomados + solicitud.cantidadDias,
      },
    });

    await tx.eventoAuditoria.create({
      data: {
        usuarioId: aprobadorId,
        tipoEvento: 'APROBACION_VACACIONES',
        entidadAfectada: 'SolicitudVacaciones',
        entidadId: solicitudId,
        detalle: `Solicitud aprobada por ${solicitud.cantidadDias} días. Comentario: ${comentario ?? 'sin comentario'}`,
      },
    });

    return solicitudActualizada;
  });

  return updatedSolicitud;
};

export const handleVacationRejection = async (
  solicitudId: string,
  aprobadorId: string,
  comentario?: string
) => {
  const solicitud = await prisma.solicitudVacaciones.findUnique({ where: { id: solicitudId } });
  if (!solicitud) {
    throw new NotFoundError('Solicitud no encontrada');
  }

  if (solicitud.estado !== 'PENDIENTE') {
    throw new AppError('La solicitud ya fue gestionada', 400);
  }

  const solicitudActualizada = await prisma.solicitudVacaciones.update({
    where: { id: solicitudId },
    data: {
      estado: 'RECHAZADA',
      aprobadorId,
      comentarioAprobador: comentario,
      fechaResolucion: new Date(),
    },
  });

  await prisma.eventoAuditoria.create({
    data: {
      usuarioId: aprobadorId,
      tipoEvento: 'RECHAZO_VACACIONES',
      entidadAfectada: 'SolicitudVacaciones',
      entidadId: solicitudId,
      detalle: `Solicitud rechazada. Comentario: ${comentario ?? 'sin comentario'}`,
    },
  });

  return solicitudActualizada;
};
