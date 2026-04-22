import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon2 from 'argon2';
import { SigninUserDto } from './dto/signin-user.dto';

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

  async Signin(signinUserDto: SigninUserDto): Promise<User> {
    const { email, password } = signinUserDto;

    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (user && (await argon2.verify(user.password, password))) {
      return user;
    } else {
      throw new BadRequestException('EmailまたはPasswordが違います。');
    }
  }
}
