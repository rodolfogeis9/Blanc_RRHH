import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { authenticate, AuthenticatedRequest, requireRoles } from '../middleware/auth.js';
import { listOwnLicenses, listEmployeeLicenses, createLicense } from '../modules/licenses/licenses.service.js';
import { AppError } from '../utils/errors.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!['application/pdf', 'image/png', 'image/jpeg'].includes(file.mimetype)) {
      return cb(new AppError('Tipo de archivo no permitido', 400));
    }
    cb(null, true);
  },
});

const router = Router();

router.get('/mias', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) throw new AppError('No autenticado', 401);
    const licencias = await listOwnLicenses(req.user.id);
    res.json(licencias);
  } catch (error) {
    next(error);
  }
});

router.get('/empleados/:id', authenticate, requireRoles(['ADMIN_DIRECCION', 'ADMIN_RRHH']), async (req, res, next) => {
  try {
    const licencias = await listEmployeeLicenses(req.params.id);
    res.json(licencias);
  } catch (error) {
    next(error);
  }
});

const createSchema = z.object({
  fechaInicio: z.string(),
  fechaFin: z.string(),
  tipo: z.enum(['ENFERMEDAD', 'ACCIDENTE', 'MATERNIDAD', 'OTRO']),
  observaciones: z.string().optional(),
});

router.post(
  '/empleados/:id',
  authenticate,
  requireRoles(['ADMIN_DIRECCION', 'ADMIN_RRHH']),
  upload.single('archivo'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      if (!req.user) throw new AppError('No autenticado', 401);
      if (!req.file) {
        throw new AppError('Archivo requerido', 400);
      }
      const payload = createSchema.parse(req.body);
      const result = await createLicense(req.params.id, req.file, payload, req.user.id);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
