import { Prisma } from '@prisma/client';
import { prisma } from '../common/prisma.js';

export const listAuditEvents = async (filters: {
  usuarioId?: string;
  tipoEvento?: string;
  desde?: string;
  hasta?: string;
  page?: number;
  pageSize?: number;
}) => {
  const where: Prisma.EventoAuditoriaWhereInput = {};
  if (filters.usuarioId) {
    where.usuarioId = filters.usuarioId;
  }
  if (filters.tipoEvento) {
    where.tipoEvento = filters.tipoEvento as any;
  }
  if (filters.desde || filters.hasta) {
    where.fechaEvento = {
      gte: filters.desde ? new Date(filters.desde) : undefined,
      lte: filters.hasta ? new Date(filters.hasta) : undefined,
    };
  }

  const pageSize = filters.pageSize ?? 20;
  const page = filters.page ?? 1;

  const [total, eventos] = await prisma.$transaction([
    prisma.eventoAuditoria.count({ where }),
    prisma.eventoAuditoria.findMany({
      where,
      orderBy: { fechaEvento: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        usuario: {
          select: { id: true, nombre: true, apellido: true, rol: true },
        },
      },
    }),
  ]);

  return {
    total,
    page,
    pageSize,
    eventos,
  };
};
