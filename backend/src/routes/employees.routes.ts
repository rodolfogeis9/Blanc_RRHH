import { Router } from 'express';
import { z } from 'zod';
import { authenticate, AuthenticatedRequest, requireRoles } from '../middleware/auth';
import {
  getCurrentEmployee,
  listEmployees,
  createEmployee,
  updateEmployee,
  adjustEmployeeVacation,
} from '../modules/employees/employees.service';
import { hashPassword } from '../utils/password';
import { updateOwnProfile } from '../modules/auth/auth.service';
import { AppError } from '../utils/errors';

const router = Router();

router.get('/me', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) throw new AppError('No autenticado', 401);
    const employee = await getCurrentEmployee(req.user.id);
    const { passwordHash, ...rest } = employee;
    res.json(rest);
  } catch (error) {
    next(error);
  }
});

const updateSelfSchema = z.object({
  telefono: z.string().min(6).optional(),
  direccion: z.string().optional(),
  urlFotoPerfil: z.string().url().optional(),
  resumenPerfilProfesional: z.string().max(2000).optional(),
});

router.put('/me', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) throw new AppError('No autenticado', 401);
    if (req.user.role !== 'EMPLEADO') {
      throw new AppError('Solo empleados pueden actualizar sus datos personales', 403);
    }
    const payload = updateSelfSchema.parse(req.body);
    const updated = await updateOwnProfile(req.user.id, payload);
    res.json({
      id: updated.id,
      telefono: updated.telefono,
      direccion: updated.direccion,
      urlFotoPerfil: updated.urlFotoPerfil,
      resumenPerfilProfesional: updated.resumenPerfilProfesional,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/', authenticate, requireRoles(['ADMIN_DIRECCION', 'ADMIN_RRHH']), async (req, res, next) => {
  try {
    const filters = {
      nombre: req.query.nombre?.toString(),
      area: req.query.area?.toString(),
      estadoLaboral: req.query.estadoLaboral?.toString() as any,
    };
    const empleados = await listEmployees(filters);
    const sanitized = empleados.map(({ passwordHash, ...rest }) => rest);
    res.json(sanitized);
  } catch (error) {
    next(error);
  }
});

const createSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  nombre: z.string().min(1),
  apellido: z.string().min(1),
  rut: z.string().min(3),
  fechaNacimiento: z.string(),
  telefono: z.string(),
  direccion: z.string(),
  fechaIngreso: z.string(),
  cargo: z.string(),
  area: z.string(),
  estadoLaboral: z.enum(['ACTIVO', 'SUSPENDIDO', 'FINIQUITADO']).default('ACTIVO'),
  diasVacacionesAcumulados: z.number().default(0),
  diasVacacionesTomados: z.number().default(0),
});

router.post('/', authenticate, requireRoles(['ADMIN_RRHH']), async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) throw new AppError('No autenticado', 401);
    const payload = createSchema.parse(req.body);
    const passwordHash = await hashPassword(payload.password);
    const empleado = await createEmployee(
      {
        email: payload.email,
        passwordHash,
        nombre: payload.nombre,
        apellido: payload.apellido,
        rut: payload.rut,
        fechaNacimiento: new Date(payload.fechaNacimiento),
        telefono: payload.telefono,
        direccion: payload.direccion,
        fechaIngreso: new Date(payload.fechaIngreso),
        cargo: payload.cargo,
        area: payload.area,
        estadoLaboral: payload.estadoLaboral,
        diasVacacionesAcumulados: payload.diasVacacionesAcumulados,
        diasVacacionesTomados: payload.diasVacacionesTomados,
        rol: 'EMPLEADO',
      },
      req.user.id,
      req.user.role
    );
    const { passwordHash: _hash, ...rest } = empleado;
    res.status(201).json(rest);
  } catch (error) {
    next(error);
  }
});

const updateSchema = z.object({
  cargo: z.string().optional(),
  area: z.string().optional(),
  estadoLaboral: z.enum(['ACTIVO', 'SUSPENDIDO', 'FINIQUITADO']).optional(),
  fechaIngreso: z.string().optional(),
});

router.put('/:id', authenticate, requireRoles(['ADMIN_DIRECCION', 'ADMIN_RRHH']), async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) throw new AppError('No autenticado', 401);
    const payload = updateSchema.parse(req.body);
    const data = {
      ...payload,
      fechaIngreso: payload.fechaIngreso ? new Date(payload.fechaIngreso) : undefined,
    };
    const empleado = await updateEmployee(req.params.id, data, req.user.id, req.user.role);
    const { passwordHash, ...rest } = empleado;
    res.json(rest);
  } catch (error) {
    next(error);
  }
});

const adjustSchema = z.object({
  diasVacacionesAcumulados: z.number().optional(),
  diasVacacionesTomados: z.number().optional(),
});

router.put('/:id/vacaciones', authenticate, requireRoles(['ADMIN_DIRECCION', 'ADMIN_RRHH']), async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) throw new AppError('No autenticado', 401);
    const payload = adjustSchema.parse(req.body);
    const result = await adjustEmployeeVacation(req.params.id, payload, req.user.id, req.user.role);
    const { passwordHash, ...empleado } = result.empleado;
    res.json({ empleado, balance: result.balance });
  } catch (error) {
    next(error);
  }
});

export default router;
