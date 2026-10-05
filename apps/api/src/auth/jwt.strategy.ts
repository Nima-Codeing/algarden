import { Request } from 'express';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { TOKEN_COOKIE_NAME } from './auth.constants';
import { JwtPayload, RequestUser } from './types/user.types';

export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request): string | null => {
          const token: unknown = req?.cookies?.[TOKEN_COOKIE_NAME];
          return typeof token === 'string' ? token : null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET!,
    });
  }

  validate(payload: JwtPayload): RequestUser {
    return {
      id: payload.sub,
      name: payload.username,
    };
  }
}
