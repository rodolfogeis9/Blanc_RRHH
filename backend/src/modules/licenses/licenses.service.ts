import dayjs from 'dayjs';
import type { Express } from 'express';
import { TipoLicenciaMedica } from '@prisma/client';
import { prisma } from '../common/prisma';
import { storageService } from '../../services/storage-service';
import { NotFoundError } from '../../utils/errors';

export const listOwnLicenses = async (usuarioId: string) => {
  return prisma.licenciaMedica.findMany({
    where: { empleadoId: usuarioId },
    orderBy: { fechaInicio: 'desc' },
  });
};

export const listEmployeeLicenses = async (empleadoId: string) => {
  return prisma.licenciaMedica.findMany({
    where: { empleadoId },
    orderBy: { fechaInicio: 'desc' },
  });
};

const checkOverlapWithVacations = async (empleadoId: string, fechaInicio: Date, fechaFin: Date) => {
  const solicitudes = await prisma.solicitudVacaciones.findMany({
    where: {
      empleadoId,
      estado: 'APROBADA',
      fechaInicio: { lte: fechaFin },
      fechaFin: { gte: fechaInicio },
    },
  });

  return solicitudes;
};

export const createLicense = async (
  empleadoId: string,
  file: Express.Multer.File,
  data: {
    fechaInicio: string;
    fechaFin: string;
    tipo: TipoLicenciaMedica;
    observaciones?: string;
  },
  actorId: string
) => {
  const empleado = await prisma.usuario.findUnique({ where: { id: empleadoId } });
  if (!empleado) {
    throw new NotFoundError('Empleado no encontrado');
  }

  const inicio = dayjs(data.fechaInicio).toDate();
  const fin = dayjs(data.fechaFin).toDate();

  const url = await storageService.uploadFile({
    buffer: file.buffer,
    filename: file.originalname,
    mimetype: file.mimetype,
    folder: `empleados/${empleadoId}/licencias`,
  });

  const licencia = await prisma.licenciaMedica.create({
    data: {
      empleadoId,
      fechaInicio: inicio,
      fechaFin: fin,
      tipo: data.tipo,
      urlArchivoLicencia: url,
      observaciones: data.observaciones,
      creadoPorUsuarioId: actorId,
    },
  });

  const overlaps = await checkOverlapWithVacations(empleadoId, inicio, fin);
  if (overlaps.length > 0) {
    await prisma.$transaction(async (tx) => {
      for (const solicitud of overlaps) {
        await tx.solicitudVacaciones.update({
          where: { id: solicitud.id },
          data: {
            alertaSuperposicion: true,
            comentarioAprobador: `${solicitud.comentarioAprobador ?? ''}\nLicencia médica registrada del ${data.fechaInicio} al ${data.fechaFin}. Revisar ajuste de saldo.`.trim(),
          },
        });
      }
      await tx.eventoAuditoria.create({
        data: {
          usuarioId: actorId,
          tipoEvento: 'REGISTRO_LICENCIA_MEDICA',
          entidadAfectada: 'LicenciaMedica',
          entidadId: licencia.id,
          detalle: `Licencia médica se cruza con ${overlaps.length} solicitudes de vacaciones aprobadas`,
        },
      });
    });
  } else {
    await prisma.eventoAuditoria.create({
      data: {
        usuarioId: actorId,
        tipoEvento: 'REGISTRO_LICENCIA_MEDICA',
        entidadAfectada: 'LicenciaMedica',
        entidadId: licencia.id,
        detalle: 'Licencia médica registrada sin superposición con vacaciones',
      },
    });
  }

  return { licencia, overlaps };
};
