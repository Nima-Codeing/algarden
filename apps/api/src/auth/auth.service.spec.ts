import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto/create-user.dto';
import { userSelect } from './types/user.types';

describe('AuthService', () => {
  let service: AuthService;

  const prismaMock = {
    user: {
      create: jest.fn(),
    },
  };
  const jwtMock = {};

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: JwtService, useValue: jwtMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('createUser', () => {
    it('レスポンスにパスワードを含めないよう、ハッシュ化してselectで項目を絞る', async () => {
      const user: CreateUserDto = {
        name: 'test123',
        email: 'test123@xxx.com',
        password: 'test.123',
      };

      await service.createUser(user);

      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: {
          name: 'test123',
          email: 'test123@xxx.com',
          password: expect.not.stringContaining(
            'test.123',
          ) as unknown as string,
        },
        select: userSelect,
      });
    });
  });
});
