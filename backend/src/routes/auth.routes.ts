import { Router } from 'express';
import { z } from 'zod';
import { login, createPasswordResetToken, resetPassword } from '../modules/auth/auth.service';

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

router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = forgotSchema.parse(req.body);
    const result = await createPasswordResetToken(email);
    if (result) {
      console.log(`Token de recuperación para ${email}: ${result.token}`);
    }
    res.json({ message: 'Si el correo existe se enviará un enlace de recuperación' });
  } catch (error) {
    next(error);
  }
});

const resetSchema = z.object({ token: z.string().min(10), password: z.string().min(6) });

router.post('/reset-password', async (req, res, next) => {
  try {
    const { token, password } = resetSchema.parse(req.body);
    await resetPassword(token, password);
    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    next(error);
  }
});

export default router;
