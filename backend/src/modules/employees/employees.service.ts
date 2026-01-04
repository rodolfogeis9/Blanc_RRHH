import { Prisma, RolUsuario, EstadoLaboral } from '@prisma/client';
import { prisma } from '../common/prisma';
import { ForbiddenError, NotFoundError } from '../../utils/errors';
import { getEmployeeVacationBalance, adjustVacationDays } from '../../services/vacation-service';

export const getCurrentEmployee = async (id: string) => {
  const empleado = await prisma.usuario.findUnique({ where: { id } });
  if (!empleado) {
    throw new NotFoundError('Empleado no encontrado');
  }

  const balance = getEmployeeVacationBalance(empleado);
  const [pendingVacationRequests, pendingOvertimeRequests, lastRemuneration, latestOvertime] = await Promise.all([
    prisma.solicitudVacaciones.count({ where: { empleadoId: id, estado: 'PENDIENTE' } }),
    prisma.horaExtra.count({ where: { usuarioId: id, estado: 'PENDIENTE' } }),
    prisma.remuneracion.findFirst({
      where: { usuarioId: id, estado: 'PUBLICADA' },
      orderBy: { periodo: 'desc' },
      include: { documento: { select: { id: true, nombreArchivoOriginal: true, mimeType: true } } },
    }),
    prisma.horaExtra.findFirst({
      where: { usuarioId: id },
      orderBy: { fecha: 'desc' },
    }),
  ]);

  return {
    ...empleado,
    saldoVacaciones: balance.balance,
    totalVacaciones: balance.totalAccrued,
    pendingVacationRequests,
    pendingOvertimeRequests,
    lastRemuneration,
    latestOvertime,
  };
};

export const listEmployees = async (filters: {
  nombre?: string;
  area?: string;
  estadoLaboral?: EstadoLaboral;
}) => {
  const where: Prisma.UsuarioWhereInput = {};
  if (filters.nombre) {
    where.OR = [
      { nombre: { contains: filters.nombre, mode: 'insensitive' } },
      { apellido: { contains: filters.nombre, mode: 'insensitive' } },
    ];
  }
  if (filters.area) {
    where.area = { equals: filters.area, mode: 'insensitive' };
  }
  if (filters.estadoLaboral) {
    where.estadoLaboral = filters.estadoLaboral;
  }
  const empleados = await prisma.usuario.findMany({ where, orderBy: { nombre: 'asc' } });
  return empleados.map((empleado) => ({
    ...empleado,
    saldoVacaciones: getEmployeeVacationBalance(empleado).balance,
  }));
};

export const createEmployee = async (
  data: Prisma.UsuarioCreateInput,
  actorId: string,
  actorRole: RolUsuario
) => {
  if (actorRole !== 'ADMIN_RRHH') {
    throw new ForbiddenError('Solo RRHH puede crear empleados');
  }

  const empleado = await prisma.usuario.create({ data });

  await prisma.eventoAuditoria.create({
    data: {
      usuarioId: actorId,
      tipoEvento: 'CREACION_EMPLEADO',
      entidadAfectada: 'Empleado',
      entidadId: empleado.id,
      detalle: `Empleado ${empleado.nombre} ${empleado.apellido} creado`,
    },
  });

  return empleado;
};

export const updateEmployee = async (
  id: string,
  data: Partial<Pick<Prisma.UsuarioUpdateInput, 'cargo' | 'area' | 'estadoLaboral' | 'fechaIngreso'>>,
  actorId: string,
  actorRole: RolUsuario
) => {
  if (actorRole === 'EMPLEADO') {
    throw new ForbiddenError();
  }

  const empleado = await prisma.usuario.findUnique({ where: { id } });
  if (!empleado) {
    throw new NotFoundError('Empleado no encontrado');
  }

  if (data.fechaIngreso && actorRole !== 'ADMIN_DIRECCION') {
    throw new ForbiddenError('Solo administración puede actualizar la fecha de ingreso');
  }

  const updated = await prisma.usuario.update({ where: { id }, data });

  const changes = Object.entries(data)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');

  await prisma.eventoAuditoria.create({
    data: {
      usuarioId: actorId,
      tipoEvento: data.fechaIngreso ? 'VACATION_CHANGE_FECHA_INGRESO' : 'CAMBIO_ESTADO_LABORAL',
      entidadAfectada: 'Empleado',
      entidadId: id,
      detalle: `Actualización de datos laborales (${changes})`,
    },
  });

  return updated;
};

export const adjustEmployeeVacation = async (
  id: string,
  data: { diasVacacionesAcumulados?: number; diasVacacionesTomados?: number; saldoVacacionesInicial?: number },
  actorId: string,
  actorRole: RolUsuario
) => {
  if (actorRole !== 'ADMIN_DIRECCION') {
    throw new ForbiddenError('Solo administración puede ajustar vacaciones');
  }
  const result = await adjustVacationDays(id, data);

  await prisma.eventoAuditoria.create({
    data: {
      usuarioId: actorId,
      tipoEvento: 'VACATION_ADJUST',
      entidadAfectada: 'Empleado',
      entidadId: id,
      detalle: `Ajuste manual de vacaciones. Nuevos valores: acumulados=${result.empleado.diasVacacionesAcumulados}, tomados=${result.empleado.diasVacacionesTomados}`,
    },
  });

  return result;
};
