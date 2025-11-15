import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/errors.js';

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
      details: err.details,
    });
  }

  console.error(err);
  return res.status(500).json({ message: 'Ha ocurrido un error inesperado' });
};
