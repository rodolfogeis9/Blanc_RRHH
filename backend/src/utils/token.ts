import crypto from 'crypto';

export const generateSecureToken = (size = 32) => {
  return crypto.randomBytes(size).toString('base64url');
};

export const hashToken = (token: string) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const generateNumericCode = (digits = 6) => {
  const max = 10 ** digits;
  const code = crypto.randomInt(0, max).toString().padStart(digits, '0');
  return code;
};
