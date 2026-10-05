import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

import { RequestUser } from '../types/user.types';

export const CurrentUser = createParamDecorator(
  (data: keyof RequestUser | undefined, ctx: ExecutionContext) => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user: RequestUser }>();
    const user = request.user;
    if (!user) throw new UnauthorizedException();
    return data ? user[data] : user;
  },
);
