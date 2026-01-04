export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(message: string, statusCode = 400, code?: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code =
      code ??
      (statusCode === 401
        ? 'UNAUTHORIZED'
        : statusCode === 403
          ? 'FORBIDDEN'
          : statusCode === 404
            ? 'NOT_FOUND'
            : statusCode >= 500
              ? 'UNEXPECTED_ERROR'
              : 'BAD_REQUEST');
    this.details = details;
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404, 'NOT_FOUND');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'No autorizado') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'No tienes permisos para realizar esta acción') {
    super(message, 403, 'FORBIDDEN');
  }
}
