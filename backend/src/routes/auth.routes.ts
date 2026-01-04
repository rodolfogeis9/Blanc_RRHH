import { Router } from 'express';
import { z } from 'zod';
import { login, createPasswordResetToken, resetPassword } from '../modules/auth/auth.service';
import { acceptInvitation, validateInvitation } from '../modules/invitations/invitations.service';
import { createRateLimiter } from '../middleware/rate-limit';

const router = Router();

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(6) });

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const result = await login(email, password);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

const forgotSchema = z.object({ email: z.string().email() });
const forgotLimiter = createRateLimiter({
  windowMs: 60_000,
  max: 5,
  blockDurationMs: 10 * 60_000,
  keyGenerator: (req) => `forgot:${req.ip}:${req.body?.email ?? ''}`,
});

router.post('/forgot-password', forgotLimiter, async (req, res, next) => {
  try {
    const { email } = forgotSchema.parse(req.body);
    try {
      await createPasswordResetToken(email);
    } catch (error) {
      console.error('Error enviando recuperación de contraseña', error);
    }
    res.json({ message: 'Si el correo existe se enviará un código de recuperación' });
  } catch (error) {
    next(error);
  }
});

const resetSchema = z.object({
  email: z.string().email(),
  code: z.string().min(4),
  password: z.string().min(8),
});
const resetLimiter = createRateLimiter({
  windowMs: 60_000,
  max: 5,
  blockDurationMs: 10 * 60_000,
  keyGenerator: (req) => `reset:${req.ip}:${req.body?.email ?? ''}`,
});

router.post('/reset-password', resetLimiter, async (req, res, next) => {
  try {
    const { email, code, password } = resetSchema.parse(req.body);
    await resetPassword(email, code, password);
    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    next(error);
  }
});

const invitationValidateLimiter = createRateLimiter({
  windowMs: 60_000,
  max: 20,
  blockDurationMs: 10 * 60_000,
  keyGenerator: (req) => `invite-validate:${req.ip}`,
});

router.get('/invitations/validate', invitationValidateLimiter, async (req, res, next) => {
  try {
    const token = z.string().min(10).parse(req.query.token);
    const invitation = await validateInvitation(token);
    res.json(invitation);
  } catch (error) {
    next(error);
  }
});

const invitationAcceptSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8),
  nombre: z.string().min(1),
  apellido: z.string().min(1),
  rut: z.string().min(3),
  fechaNacimiento: z.string(),
  telefono: z.string().min(6),
  direccion: z.string().min(3),
  fechaIngreso: z.string(),
  area: z.string().min(1),
});

const invitationAcceptLimiter = createRateLimiter({
  windowMs: 60_000,
  max: 10,
  blockDurationMs: 10 * 60_000,
  keyGenerator: (req) => `invite-accept:${req.ip}`,
});

router.post('/invitations/accept', invitationAcceptLimiter, async (req, res, next) => {
  try {
    const payload = invitationAcceptSchema.parse(req.body);
    const user = await acceptInvitation({
      token: payload.token,
      password: payload.password,
      nombre: payload.nombre,
      apellido: payload.apellido,
      rut: payload.rut,
      fechaNacimiento: new Date(payload.fechaNacimiento),
      telefono: payload.telefono,
      direccion: payload.direccion,
      fechaIngreso: new Date(payload.fechaIngreso),
      area: payload.area,
    });
    res.status(201).json({ id: user.id, email: user.email });
  } catch (error) {
    next(error);
  }
});

export default router;
