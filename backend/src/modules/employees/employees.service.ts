import { Prisma, RolUsuario, EstadoLaboral } from '@prisma/client';
import { prisma } from '../common/prisma.js';
import { ForbiddenError, NotFoundError } from '../../utils/errors.js';
import { getEmployeeVacationBalance, adjustVacationDays } from '../../services/vacation-service.js';

export const getCurrentEmployee = async (id: string) => {
  const empleado = await prisma.usuario.findUnique({ where: { id } });
  if (!empleado) {
    throw new NotFoundError('Empleado no encontrado');
  }

  const balance = getEmployeeVacationBalance(empleado);
  return { ...empleado, saldoVacaciones: balance.balance, totalVacaciones: balance.totalAccrued };
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

  const updated = await prisma.usuario.update({ where: { id }, data });

  const changes = Object.entries(data)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');

  await prisma.eventoAuditoria.create({
    data: {
      usuarioId: actorId,
      tipoEvento: 'CAMBIO_FECHA_INGRESO',
      entidadAfectada: 'Empleado',
      entidadId: id,
      detalle: `Actualización de datos laborales (${changes})`,
    },
  });

  return updated;
};

export const adjustEmployeeVacation = async (
  id: string,
  data: { diasVacacionesAcumulados?: number; diasVacacionesTomados?: number },
  actorId: string,
  actorRole: RolUsuario
) => {
  if (actorRole === 'EMPLEADO') {
    throw new ForbiddenError('No autorizado');
  }
  const result = await adjustVacationDays(id, data);

  await prisma.eventoAuditoria.create({
    data: {
      usuarioId: actorId,
      tipoEvento: 'AJUSTE_VACACIONES',
      entidadAfectada: 'Empleado',
      entidadId: id,
      detalle: `Ajuste manual de vacaciones. Nuevos valores: acumulados=${result.empleado.diasVacacionesAcumulados}, tomados=${result.empleado.diasVacacionesTomados}`,
    },
  });

  return result;
};
