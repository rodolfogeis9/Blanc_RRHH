import dayjs from 'dayjs';
import { prisma } from '../common/prisma';
import { AppError } from '../../utils/errors';
import { env } from '../../config/env';
import { generateSecureToken, hashToken } from '../../utils/token';
import { sendEmail } from '../../services/email-service';
import { hashPassword } from '../../utils/password';

const getInvitationStatus = (invitation: { usedAt: Date | null; expiresAt: Date }) => {
  if (invitation.usedAt) return 'USADA';
  if (dayjs(invitation.expiresAt).isBefore(dayjs())) return 'EXPIRADA';
  return 'PENDIENTE';
};

export const listJobRoles = async () => {
  return prisma.jobRole.findMany({ where: { active: true }, orderBy: { name: 'asc' } });
};

export const createInvitation = async (params: {
  email: string;
  role: 'ADMIN_DIRECCION' | 'ADMIN_RRHH' | 'EMPLEADO';
  jobRoleId: string;
  createdById: string;
}) => {
  const normalizedEmail = params.email.toLowerCase();
  const existingUser = await prisma.usuario.findUnique({ where: { email: normalizedEmail } });
  if (existingUser) {
    throw new AppError('El correo ya está registrado en el sistema', 400);
  }

  const jobRole = await prisma.jobRole.findUnique({ where: { id: params.jobRoleId } });
  if (!jobRole || !jobRole.active) {
    throw new AppError('El cargo seleccionado no es válido', 400);
  }

  const token = generateSecureToken(32);
  const tokenHash = hashToken(token);
  const expiresAt = dayjs().add(env.invitationTokenHours, 'hour').toDate();

  const existingInvitation = await prisma.invitation.findFirst({
    where: {
      email: normalizedEmail,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  const invitation = existingInvitation
    ? await prisma.invitation.update({
        where: { id: existingInvitation.id },
        data: {
          role: params.role,
          jobRoleId: params.jobRoleId,
          tokenHash,
          expiresAt,
          createdById: params.createdById,
        },
      })
    : await prisma.invitation.create({
        data: {
          email: normalizedEmail,
          role: params.role,
          jobRoleId: params.jobRoleId,
          tokenHash,
          expiresAt,
          createdById: params.createdById,
        },
      });

  const inviteLink = `${env.frontendBaseUrl}/invite?token=${token}`;
  const html = `
    <p>Hola,</p>
    <p>Has sido invitado/a a Blanc RRHH. Usa el siguiente enlace para completar tu registro:</p>
    <p><a href="${inviteLink}">Completar registro</a></p>
    <p>Este enlace expira en ${env.invitationTokenHours} horas.</p>
  `;

  await sendEmail({
    to: normalizedEmail,
    subject: 'Invitación para Blanc RRHH',
    html,
    text: `Completa tu registro aquí: ${inviteLink}. Expira en ${env.invitationTokenHours} horas.`,
  });

  await prisma.eventoAuditoria.create({
    data: {
      usuarioId: params.createdById,
      tipoEvento: 'INVITATION_CREATE',
      entidadAfectada: 'Invitation',
      entidadId: invitation.id,
      detalle: `Invitación enviada a ${normalizedEmail} (${params.role})`,
    },
  });

  return {
    id: invitation.id,
    email: invitation.email,
    role: invitation.role,
    jobRoleName: jobRole.name,
    expiresAt: invitation.expiresAt,
  };
};

export const listInvitations = async () => {
  const invitations = await prisma.invitation.findMany({
    orderBy: { createdAt: 'desc' },
    include: { jobRole: true, createdBy: { select: { id: true, nombre: true, apellido: true } } },
  });

  return invitations.map((invitation) => ({
    id: invitation.id,
    email: invitation.email,
    role: invitation.role,
    jobRoleName: invitation.jobRole?.name ?? 'Sin cargo',
    createdAt: invitation.createdAt,
    expiresAt: invitation.expiresAt,
    usedAt: invitation.usedAt,
    status: getInvitationStatus(invitation),
    createdBy: invitation.createdBy,
  }));
};

export const resendInvitation = async (id: string, actorId: string) => {
  const invitation = await prisma.invitation.findUnique({ where: { id }, include: { jobRole: true } });
  if (!invitation) {
    throw new AppError('Invitación no encontrada', 404);
  }

  const existingUser = await prisma.usuario.findUnique({ where: { email: invitation.email } });
  if (existingUser) {
    throw new AppError('El correo ya está registrado en el sistema', 400);
  }

  const token = generateSecureToken(32);
  const tokenHash = hashToken(token);
  const expiresAt = dayjs().add(env.invitationTokenHours, 'hour').toDate();

  const updated = await prisma.invitation.update({
    where: { id },
    data: { tokenHash, expiresAt, usedAt: null },
  });

  const inviteLink = `${env.frontendBaseUrl}/invite?token=${token}`;
  await sendEmail({
    to: invitation.email,
    subject: 'Reenvío de invitación a Blanc RRHH',
    html: `
      <p>Reenviamos tu invitación para completar el registro en Blanc RRHH:</p>
      <p><a href="${inviteLink}">Completar registro</a></p>
      <p>Este enlace expira en ${env.invitationTokenHours} horas.</p>
    `,
    text: `Completa tu registro aquí: ${inviteLink}. Expira en ${env.invitationTokenHours} horas.`,
  });

  await prisma.eventoAuditoria.create({
    data: {
      usuarioId: actorId,
      tipoEvento: 'INVITATION_CREATE',
      entidadAfectada: 'Invitation',
      entidadId: updated.id,
      detalle: `Invitación reenviada a ${invitation.email}`,
    },
  });

  return {
    id: updated.id,
    email: updated.email,
    role: updated.role,
    jobRoleName: invitation.jobRole?.name ?? 'Sin cargo',
    expiresAt: updated.expiresAt,
  };
};

export const revokeInvitation = async (id: string) => {
  const invitation = await prisma.invitation.findUnique({ where: { id } });
  if (!invitation) {
    throw new AppError('Invitación no encontrada', 404);
  }
  await prisma.invitation.update({ where: { id }, data: { usedAt: new Date() } });
};

export const validateInvitation = async (token: string) => {
  const tokenHash = hashToken(token);
  const invitation = await prisma.invitation.findFirst({
    where: { tokenHash, usedAt: null, expiresAt: { gt: new Date() } },
    include: { jobRole: true },
  });

  if (!invitation) {
    throw new AppError('Invitación inválida o expirada', 400);
  }

  return {
    email: invitation.email,
    role: invitation.role,
    jobRoleName: invitation.jobRole?.name ?? 'Sin cargo',
  };
};

export const acceptInvitation = async (params: {
  token: string;
  password: string;
  nombre: string;
  apellido: string;
  rut: string;
  fechaNacimiento: Date;
  telefono: string;
  direccion: string;
  fechaIngreso: Date;
  area: string;
}) => {
  const tokenHash = hashToken(params.token);
  const invitation = await prisma.invitation.findFirst({
    where: { tokenHash, usedAt: null, expiresAt: { gt: new Date() } },
    include: { jobRole: true },
  });

  if (!invitation) {
    throw new AppError('Invitación inválida o expirada', 400);
  }

  const existingUser = await prisma.usuario.findUnique({ where: { email: invitation.email } });
  if (existingUser) {
    throw new AppError('El correo ya está registrado en el sistema', 400);
  }

  if (!invitation.jobRole) {
    throw new AppError('La invitación no tiene un cargo asociado', 400);
  }

  const passwordHash = await hashPassword(params.password);

  const created = await prisma.$transaction(async (tx) => {
    const usuario = await tx.usuario.create({
      data: {
        rol: invitation.role,
        email: invitation.email,
        passwordHash,
        nombre: params.nombre,
        apellido: params.apellido,
        rut: params.rut,
        fechaNacimiento: params.fechaNacimiento,
        telefono: params.telefono,
        direccion: params.direccion,
        fechaIngreso: params.fechaIngreso,
        cargo: invitation.jobRole?.name ?? 'Sin cargo',
        area: params.area,
        jobRoleId: invitation.jobRoleId,
      },
    });

    await tx.invitation.update({
      where: { id: invitation.id },
      data: { usedAt: new Date() },
    });

    await tx.eventoAuditoria.create({
      data: {
        usuarioId: usuario.id,
        tipoEvento: 'INVITATION_ACCEPT',
        entidadAfectada: 'Invitation',
        entidadId: invitation.id,
        detalle: `Invitación aceptada por ${usuario.email}`,
      },
    });

    return usuario;
  });

  return created;
};
