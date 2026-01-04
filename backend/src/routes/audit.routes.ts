import { Router } from 'express';
import { authenticate, requireRoles } from '../middleware/auth';
import { listAuditEvents } from '../modules/audit/audit.service';

const router = Router();

router.get('/', authenticate, requireRoles(['ADMIN_DIRECCION']), async (req, res, next) => {
  try {
    const page = req.query.page ? Number(req.query.page) : 1;
    const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 20;
    const result = await listAuditEvents({
      usuarioId: req.query.usuarioId?.toString(),
      tipoEvento: req.query.tipoEvento?.toString(),
      desde: req.query.desde?.toString(),
      hasta: req.query.hasta?.toString(),
      page,
      pageSize,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
