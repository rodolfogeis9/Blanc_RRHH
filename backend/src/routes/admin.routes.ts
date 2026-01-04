import { Router } from 'express';
import { z } from 'zod';
import { authenticate, AuthenticatedRequest, requireRoles } from '../middleware/auth';
import { createRateLimiter } from '../middleware/rate-limit';
import {
  createInvitation,
  listInvitations,
  listJobRoles,
  resendInvitation,
  revokeInvitation,
} from '../modules/invitations/invitations.service';
import { AppError } from '../utils/errors';

const router = Router();

router.use(authenticate, requireRoles(['ADMIN_DIRECCION', 'ADMIN_RRHH']));

router.get('/job-roles', async (_req, res, next) => {
  try {
    const roles = await listJobRoles();
    res.json(roles);
  } catch (error) {
    next(error);
  }
});

const createSchema = z.object({
  email: z.string().email(),
  role: z.enum(['ADMIN_DIRECCION', 'ADMIN_RRHH', 'EMPLEADO']),
  jobRoleId: z.string().min(1),
});

const inviteLimiter = createRateLimiter({
  windowMs: 60_000,
  max: 10,
  blockDurationMs: 10 * 60_000,
  keyGenerator: (req) => `invite:${req.ip}`,
});

router.post('/invitations', inviteLimiter, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) throw new AppError('No autenticado', 401);
    const payload = createSchema.parse(req.body);
    const invitation = await createInvitation({
      email: payload.email,
      role: payload.role,
      jobRoleId: payload.jobRoleId,
      createdById: req.user.id,
    });
    res.status(201).json(invitation);
  } catch (error) {
    next(error);
  }
});

router.get('/invitations', async (_req, res, next) => {
  try {
    const invitations = await listInvitations();
    res.json(invitations);
  } catch (error) {
    next(error);
  }
});

router.post('/invitations/:id/resend', inviteLimiter, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) throw new AppError('No autenticado', 401);
    const invitation = await resendInvitation(req.params.id, req.user.id);
    res.json(invitation);
  } catch (error) {
    next(error);
  }
});

router.post('/invitations/:id/revoke', async (_req, res, next) => {
  try {
    await revokeInvitation(req.params.id);
    res.json({ message: 'Invitación revocada' });
  } catch (error) {
    next(error);
  }
});

export default router;
