import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TOKEN_COOKIE_NAME, TOKEN_COOKIE_OPTIONS } from './auth.constants';

describe('AuthController', () => {
  let controller: AuthController;

  const authServiceMock = {
    signIn: jest.fn(),
  };
  const resMock = {
    clearCookie: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('signOut', () => {
    it('共通の名前と属性でCookieを削除する', () => {
      controller.signOut(resMock as unknown as Response);

      expect(resMock.clearCookie).toHaveBeenCalledWith(
        TOKEN_COOKIE_NAME,
        TOKEN_COOKIE_OPTIONS,
      );
    });
  });
});
