import { Router } from 'express';
import { z } from 'zod';
import { authenticate, AuthenticatedRequest, requireRoles } from '../middleware/auth';
import { createJob, deleteJob, listOwnJobs, updateJob } from '../modules/jobs/jobs.service';
import { AppError } from '../utils/errors';

const router = Router();

const jobSchema = z.object({
  empresa: z.string().min(2),
  cargo: z.string().min(2),
  fechaInicio: z.string(),
  fechaFin: z.string().optional(),
  descripcion: z.string().optional(),
});

router.get('/me', authenticate, requireRoles(['EMPLEADO']), async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) throw new AppError('No autenticado', 401);
    const data = await listOwnJobs(req.user.id);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.post('/me', authenticate, requireRoles(['EMPLEADO']), async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) throw new AppError('No autenticado', 401);
    const payload = jobSchema.parse(req.body);
    const result = await createJob(req.user.id, {
      ...payload,
      fechaInicio: new Date(payload.fechaInicio),
      fechaFin: payload.fechaFin ? new Date(payload.fechaFin) : null,
    });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

router.put('/me/:id', authenticate, requireRoles(['EMPLEADO']), async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) throw new AppError('No autenticado', 401);
    const payload = jobSchema.partial().parse(req.body);
    const result = await updateJob(req.user.id, req.params.id, {
      ...payload,
      fechaInicio: payload.fechaInicio ? new Date(payload.fechaInicio) : undefined,
      fechaFin: payload.fechaFin ? new Date(payload.fechaFin) : undefined,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.delete('/me/:id', authenticate, requireRoles(['EMPLEADO']), async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) throw new AppError('No autenticado', 401);
    const result = await deleteJob(req.user.id, req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
