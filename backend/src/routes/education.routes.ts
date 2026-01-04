import { Router } from 'express';
import { z } from 'zod';
import { authenticate, AuthenticatedRequest, requireRoles } from '../middleware/auth';
import { createEducation, deleteEducation, listOwnEducation, updateEducation } from '../modules/education/education.service';
import { AppError } from '../utils/errors';

const router = Router();

const educationSchema = z.object({
  tipo: z.enum(['ESTUDIO', 'CERTIFICACION', 'CURSO']),
  institucion: z.string().min(2),
  nombre: z.string().min(2),
  fechaInicio: z.string().optional(),
  fechaFin: z.string().optional(),
  estado: z.enum(['EN_CURSO', 'COMPLETADO']),
  descripcion: z.string().optional(),
  documentoId: z.string().optional().nullable(),
});

router.get('/me', authenticate, requireRoles(['EMPLEADO']), async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) throw new AppError('No autenticado', 401);
    const data = await listOwnEducation(req.user.id);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.post('/me', authenticate, requireRoles(['EMPLEADO']), async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) throw new AppError('No autenticado', 401);
    const payload = educationSchema.parse(req.body);
    const result = await createEducation(req.user.id, {
      ...payload,
      fechaInicio: payload.fechaInicio ? new Date(payload.fechaInicio) : null,
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
    const payload = educationSchema.partial().parse(req.body);
    const result = await updateEducation(req.user.id, req.params.id, {
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
    const result = await deleteEducation(req.user.id, req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
