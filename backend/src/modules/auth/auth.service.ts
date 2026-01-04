import crypto from 'crypto'
import dayjs from 'dayjs'
import { prisma } from '../common/prisma'
import { comparePassword, hashPassword } from '../../utils/password'
import { signJwt } from '../../utils/jwt'
import { AppError, UnauthorizedError } from '../../utils/errors'
import { env } from '../../config/env'

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

const token = crypto.randomBytes(32).toString('hex')
const expiresAt = dayjs().add(env.passwordResetTokenMinutes, 'minute').toDate()

await prisma.passwordResetToken.create({
data: {
token,
usuarioId: user.id,
expiresAt
}
})

await prisma.eventoAuditoria.create({
data: {
usuarioId: user.id,
tipoEvento: 'RESET_PASSWORD',
entidadAfectada: 'Usuario',
entidadId: user.id,
detalle: 'Solicitud de recuperación de contraseña generada'
}
})

return { token, expiresAt }
}

export const resetPassword = async (token: string, newPassword: string) => {
const storedToken = await prisma.passwordResetToken.findUnique({
where: { token },
include: { usuario: true }
})

if (!storedToken || storedToken.usedAt) {
throw new AppError('Token inválido o ya utilizado', 400)
}

if (dayjs(storedToken.expiresAt).isBefore(dayjs())) {
throw new AppError('El token ha expirado', 400)
}

const newHash = await hashPassword(newPassword)

await prisma.$transaction(async (tx) => {
await tx.usuario.update({
where: { id: storedToken.usuarioId },
data: { passwordHash: newHash }
})
await tx.passwordResetToken.update({
where: { id: storedToken.id },
data: { usedAt: new Date() }
})
await tx.eventoAuditoria.create({
data: {
usuarioId: storedToken.usuarioId,
tipoEvento: 'RESET_PASSWORD',
entidadAfectada: 'Usuario',
entidadId: storedToken.usuarioId,
detalle: 'Contraseña restablecida mediante token'
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