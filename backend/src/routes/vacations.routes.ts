import { Router } from 'express';
import { z } from 'zod';
import { authenticate, AuthenticatedRequest, requireRoles } from '../middleware/auth';
import {
  listOwnVacationRequests,
  listVacationRequests,
  createVacationRequest,
  approveVacation,
  rejectVacation,
} from '../modules/vacations/vacations.service';
import { AppError } from '../utils/errors';

const router = Router();

router.get('/mias', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) throw new AppError('No autenticado', 401);
    const solicitudes = await listOwnVacationRequests(req.user.id);
    res.json(solicitudes);
  } catch (error) {
    next(error);
  }
});

router.get('/', authenticate, requireRoles(['ADMIN_DIRECCION', 'ADMIN_RRHH']), async (req, res, next) => {
  try {
    const solicitudes = await listVacationRequests({
      estado: req.query.estado?.toString() as any,
      empleadoId: req.query.empleadoId?.toString(),
      desde: req.query.desde?.toString(),
      hasta: req.query.hasta?.toString(),
    });
    res.json(solicitudes);
  } catch (error) {
    next(error);
  }
});

const createSchema = z.object({
  tipoSolicitud: z.enum(['VACACIONES', 'PERMISO_DESCONTADO_DE_VACACIONES']),
  fechaInicio: z.string(),
  fechaFin: z.string(),
  comentarioEmpleado: z.string().optional(),
});

router.post('/', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) throw new AppError('No autenticado', 401);
    const payload = createSchema.parse(req.body);
    const solicitud = await createVacationRequest(req.user.id, payload);
    res.status(201).json(solicitud);
  } catch (error) {
    next(error);
  }
});

const decisionSchema = z.object({ comentario: z.string().optional() });

router.put('/:id/aprobar', authenticate, requireRoles(['ADMIN_DIRECCION', 'ADMIN_RRHH']), async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) throw new AppError('No autenticado', 401);
    const payload = decisionSchema.parse(req.body);
    const solicitud = await approveVacation(req.params.id, req.user.id, req.user.role, payload.comentario);
    res.json(solicitud);
  } catch (error) {
    next(error);
  }
});

router.put('/:id/rechazar', authenticate, requireRoles(['ADMIN_DIRECCION', 'ADMIN_RRHH']), async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) throw new AppError('No autenticado', 401);
    const payload = decisionSchema.parse(req.body);
    const solicitud = await rejectVacation(req.params.id, req.user.id, req.user.role, payload.comentario);
    res.json(solicitud);
  } catch (error) {
    next(error);
  }
});

export default router;
