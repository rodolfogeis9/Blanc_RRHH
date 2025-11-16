import jwt from 'jsonwebtoken';
import { env } from '../config/env';

type JwtPayload = {
  sub: string;
  role: string;
};

export const signJwt = (payload: JwtPayload, expiresIn = env.jwtExpiresIn) =>
  jwt.sign(payload, env.jwtSecret, { expiresIn });

export const verifyJwt = (token: string) => jwt.verify(token, env.jwtSecret) as JwtPayload & jwt.JwtPayload;
