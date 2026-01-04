import { NextFunction, Request, Response } from 'express';
import { verifyJwt } from '../utils/jwt';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';

export type AuthenticatedRequest = Request & {
  user?: {
    id: string;
    role: 'ADMIN_DIRECCION' | 'ADMIN_RRHH' | 'EMPLEADO';
  };
};

export const authenticate = (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header) {
    return next(new UnauthorizedError());
  }

  const token = header.replace('Bearer ', '');
  try {
    const payload = verifyJwt(token);
    req.user = { id: String(payload.sub), role: payload.role as AuthenticatedRequest['user']['role'] };
    next();
  } catch (error) {
    next(new UnauthorizedError('Token inválido o expirado'));
  }
};

export const requireRoles = (roles: Array<AuthenticatedRequest['user']['role']>) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }

    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError());
    }

    next();
  };
};
