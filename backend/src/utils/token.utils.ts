import crypto from 'crypto';
import { generateToken as jwtGenerateToken } from './auth.utils';

export const generateToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const generateRefreshToken = (): string => {
  return crypto.randomBytes(64).toString('hex');
};

export const generateTokenPair = async (userId: string) => {
  const accessToken = await jwtGenerateToken(userId);
  const refreshToken = generateRefreshToken();

  return { accessToken, refreshToken };
};

export const verifyRefreshToken = (token: string): boolean => {
  // Vérification format/validité de base
  return token.length === 128 && /^[a-f0-9]+$/.test(token);
};