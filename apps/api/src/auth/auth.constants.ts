import { CookieOptions } from 'express';

export const TOKEN_COOKIE_NAME = 'token' as const;
export const TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/',
  signed: false,
} as const satisfies CookieOptions;
