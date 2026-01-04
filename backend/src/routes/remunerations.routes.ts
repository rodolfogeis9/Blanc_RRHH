import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { authenticate, AuthenticatedRequest, requireRoles } from '../middleware/auth';
import { listOwnRemunerations, listRemunerations, publishRemuneration, annulRemuneration } from '../modules/remunerations/remunerations.service';
import { AppError } from '../utils/errors';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!['application/pdf'].includes(file.mimetype)) {
      return cb(new AppError('Tipo de archivo no permitido', 400, 'INVALID_FILE_TYPE'));
    }
    cb(null, true);
  },
});

const router = Router();

router.get('/me', authenticate, requireRoles(['EMPLEADO']), async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) throw new AppError('No autenticado', 401);
    const data = await listOwnRemunerations(req.user.id);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get('/', authenticate, requireRoles(['ADMIN_DIRECCION', 'ADMIN_RRHH']), async (req, res, next) => {
  try {
    const data = await listRemunerations({
      empleadoId: req.query.employeeId?.toString(),
      periodo: req.query.periodo?.toString(),
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

const createSchema = z.object({
  periodo: z.string().min(4),
  fechaPago: z.string().optional(),
  montoLiquido: z.coerce.number().optional(),
  montoBruto: z.coerce.number().optional(),
  documentoId: z.string().optional(),
});

router.post(
  '/:employeeId',
  authenticate,
  requireRoles(['ADMIN_DIRECCION', 'ADMIN_RRHH']),
  upload.single('archivo'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      if (!req.user) throw new AppError('No autenticado', 401);
      const payload = createSchema.parse(req.body);
      const result = await publishRemuneration(
        req.params.employeeId,
        {
          periodo: payload.periodo,
          fechaPago: payload.fechaPago ? new Date(payload.fechaPago) : null,
          montoLiquido: payload.montoLiquido,
          montoBruto: payload.montoBruto,
          documentoId: payload.documentoId,
        },
        req.file ?? undefined,
        req.user.id
      );
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.patch('/:id/anular', authenticate, requireRoles(['ADMIN_DIRECCION', 'ADMIN_RRHH']), async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) throw new AppError('No autenticado', 401);
    const result = await annulRemuneration(req.params.id, req.user.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
