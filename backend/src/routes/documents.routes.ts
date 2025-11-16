import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { authenticate, AuthenticatedRequest, requireRoles } from '../middleware/auth';
import { listOwnDocuments, listEmployeeDocuments, uploadDocument } from '../modules/documents/documents.service';
import { AppError } from '../utils/errors';

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

router.get('/mios', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) throw new AppError('No autenticado', 401);
    const filters = {
      tipoDocumento: req.query.tipoDocumento?.toString() as any,
      periodo: req.query.periodo?.toString(),
    };
    const docs = await listOwnDocuments(req.user.id, filters);
    res.json(docs);
  } catch (error) {
    next(error);
  }
});

router.get('/empleados/:id', authenticate, requireRoles(['ADMIN_DIRECCION', 'ADMIN_RRHH']), async (req, res, next) => {
  try {
    const filters = {
      tipoDocumento: req.query.tipoDocumento?.toString() as any,
      periodo: req.query.periodo?.toString(),
    };
    const docs = await listEmployeeDocuments(req.params.id, filters);
    res.json(docs);
  } catch (error) {
    next(error);
  }
});

const uploadSchema = z.object({
  tipoDocumento: z.enum(['CONTRATO', 'ANEXO', 'LIQUIDACION', 'ESTUDIO', 'OTRO']),
  periodo: z.string().optional(),
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
      const payload = uploadSchema.parse(req.body);
      const doc = await uploadDocument(req.params.id, req.file, payload, req.user.id);
      res.status(201).json(doc);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
