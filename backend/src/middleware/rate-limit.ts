import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/errors';

type RateLimitOptions = {
  windowMs: number;
  max: number;
  blockDurationMs?: number;
  keyGenerator?: (req: Request) => string;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
  blockedUntil?: number;
};

const store = new Map<string, RateLimitEntry>();

export const createRateLimiter = (options: RateLimitOptions) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const key = options.keyGenerator ? options.keyGenerator(req) : req.ip;
    const now = Date.now();
    const entry = store.get(key);

    if (entry?.blockedUntil && entry.blockedUntil > now) {
      return next(new AppError('Demasiadas solicitudes, intenta más tarde', 429));
    }

    if (!entry || entry.resetAt <= now) {
      store.set(key, { count: 1, resetAt: now + options.windowMs });
      return next();
    }

    entry.count += 1;
    if (entry.count > options.max) {
      entry.blockedUntil = now + (options.blockDurationMs ?? options.windowMs);
      store.set(key, entry);
      return next(new AppError('Demasiadas solicitudes, intenta más tarde', 429));
    }

    store.set(key, entry);
    next();
  };
};

export const clearRateLimitKey = (key: string) => {
  store.delete(key);
};
