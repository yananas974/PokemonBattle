import { Hono } from "hono";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { sign } from 'hono/jwt';

const JWT_SECRET = process.env.JWT_SECRET;


const authUtils = new Hono();


export const generateToken = async (user_id: string) => {
  const secret = process.env.JWT_SECRET as string;
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: user_id,
    iat: now,
    exp: now + 60 * 60 * 24 * 30,
  };
  const token = await sign(payload, secret);
  return token;
};

export const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'Strict',
  path: '/',
  maxAge: 3600,
};

export const comparePassword = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash);
};

export const verifyPassword = comparePassword;



export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

export default authUtils;