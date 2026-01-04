import dayjs from 'dayjs'
import { prisma } from '../common/prisma'
import { comparePassword, hashPassword } from '../../utils/password'
import { signJwt } from '../../utils/jwt'
import { AppError, UnauthorizedError } from '../../utils/errors'
import { env } from '../../config/env'
import { generateNumericCode, hashToken } from '../../utils/token'
import { sendEmail } from '../../services/email-service'

export const login = async (email: string, password: string) => {
const user = await prisma.usuario.findUnique({ where: { email } })
if (!user) {
throw new UnauthorizedError('Credenciales inválidas')
}

const isValid = await comparePassword(password, user.passwordHash)
if (!isValid) {
throw new UnauthorizedError('Credenciales inválidas')
}

const token = signJwt({ sub: user.id, role: user.rol })
return {
token,
usuario: {
id: user.id,
nombre: user.nombre,
apellido: user.apellido,
email: user.email,
rol: user.rol
}
}
}

export const createPasswordResetToken = async (email: string) => {
const user = await prisma.usuario.findUnique({ where: { email } })
if (!user) {
return
}

const code = generateNumericCode(6)
const tokenHash = hashToken(code)
const expiresAt = dayjs().add(env.passwordResetTokenMinutes, 'minute').toDate()

await prisma.$transaction(async (tx) => {
await tx.passwordResetToken.updateMany({
where: { usuarioId: user.id, usedAt: null },
data: { usedAt: new Date() },
})
await tx.passwordResetToken.create({
data: {
tokenHash,
usuarioId: user.id,
expiresAt,
}
})
await tx.eventoAuditoria.create({
data: {
usuarioId: user.id,
tipoEvento: 'PASSWORD_RESET_REQUEST',
entidadAfectada: 'Usuario',
entidadId: user.id,
detalle: 'Solicitud de recuperación de contraseña generada',
}
})
})

const resetUrl = `${env.frontendBaseUrl}/reset-password`
const messageHtml = `
  <p>Hola,</p>
  <p>Recibimos una solicitud para restablecer tu contraseña. Usa este código de verificación:</p>
  <h2>${code}</h2>
  <p>Este código expira en ${env.passwordResetTokenMinutes} minutos.</p>
  <p>Si no solicitaste este cambio, ignora este mensaje.</p>
  <p>Portal: <a href="${resetUrl}">${resetUrl}</a></p>
`

await sendEmail({
to: user.email,
subject: 'Código de recuperación de contraseña',
html: messageHtml,
text: `Tu código de recuperación es ${code}. Expira en ${env.passwordResetTokenMinutes} minutos.`,
})

return { expiresAt }
}

export const resetPassword = async (email: string, code: string, newPassword: string) => {
const user = await prisma.usuario.findUnique({ where: { email } })
if (!user) {
throw new AppError('Código inválido o expirado', 400)
}

const tokenHash = hashToken(code)
const storedToken = await prisma.passwordResetToken.findFirst({
where: { usuarioId: user.id, tokenHash, usedAt: null },
orderBy: { createdAt: 'desc' },
})

if (!storedToken) {
const latestToken = await prisma.passwordResetToken.findFirst({
where: { usuarioId: user.id, usedAt: null },
orderBy: { createdAt: 'desc' },
})
if (latestToken) {
const attempts = latestToken.attempts + 1
await prisma.passwordResetToken.update({
where: { id: latestToken.id },
data: { attempts, usedAt: attempts >= 5 ? new Date() : undefined },
})
}
throw new AppError('Código inválido o expirado', 400)
}

if (storedToken.attempts >= 5) {
throw new AppError('Código bloqueado temporalmente', 429)
}

if (dayjs(storedToken.expiresAt).isBefore(dayjs())) {
throw new AppError('Código inválido o expirado', 400)
}

const newHash = await hashPassword(newPassword)

await prisma.$transaction(async (tx) => {
await tx.usuario.update({
where: { id: storedToken.usuarioId },
data: { passwordHash: newHash },
})
await tx.passwordResetToken.update({
where: { id: storedToken.id },
data: { usedAt: new Date() },
})
await tx.eventoAuditoria.create({
data: {
usuarioId: storedToken.usuarioId,
tipoEvento: 'PASSWORD_RESET_SUCCESS',
entidadAfectada: 'Usuario',
entidadId: storedToken.usuarioId,
detalle: 'Contraseña restablecida mediante código de verificación',
}
})
})
}

export const updateOwnProfile = async (
usuarioId: string,
data: { telefono?: string; direccion?: string; urlFotoPerfil?: string; resumenPerfilProfesional?: string }
) => {
const updated = await prisma.usuario.update({
where: { id: usuarioId },
data
})

await prisma.eventoAuditoria.create({
data: {
usuarioId,
tipoEvento: 'ACTUALIZACION_DATOS_PERSONALES',
entidadAfectada: 'Usuario',
entidadId: usuarioId,
detalle: 'Actualización de datos personales realizada por el empleado'
}
})

return updated
}
