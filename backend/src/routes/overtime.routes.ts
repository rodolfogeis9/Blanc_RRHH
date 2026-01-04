import { Router } from 'express';
import { z } from 'zod';
import { authenticate, AuthenticatedRequest, requireRoles } from '../middleware/auth';
import {
  listOwnOvertime,
  listOvertimeRequests,
  createOvertime,
  approveOvertime,
  rejectOvertime,
} from '../modules/overtime/overtime.service';
import { AppError } from '../utils/errors';

const router = Router();

const createSchema = z.object({
  fecha: z.string(),
  horas: z.coerce.number().min(0.5),
  motivo: z.string().optional(),
});

router.get('/me', authenticate, requireRoles(['EMPLEADO']), async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) throw new AppError('No autenticado', 401);
    const data = await listOwnOvertime(req.user.id);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.post('/me', authenticate, requireRoles(['EMPLEADO']), async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) throw new AppError('No autenticado', 401);
    const payload = createSchema.parse(req.body);
    const result = await createOvertime(req.user.id, {
      fecha: new Date(payload.fecha),
      horas: payload.horas,
      motivo: payload.motivo,
    });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/requests', authenticate, requireRoles(['ADMIN_DIRECCION', 'ADMIN_RRHH']), async (req, res, next) => {
  try {
    const data = await listOvertimeRequests({
      estado: req.query.estado?.toString() as any,
      empleadoId: req.query.empleadoId?.toString(),
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

const reviewSchema = z.object({ comentario: z.string().optional() });

router.put('/:id/approve', authenticate, requireRoles(['ADMIN_DIRECCION', 'ADMIN_RRHH']), async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) throw new AppError('No autenticado', 401);
    const result = await approveOvertime(req.params.id, req.user.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.put('/:id/reject', authenticate, requireRoles(['ADMIN_DIRECCION', 'ADMIN_RRHH']), async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) throw new AppError('No autenticado', 401);
    const payload = reviewSchema.parse(req.body);
    const result = await rejectOvertime(req.params.id, req.user.id, payload.comentario);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
