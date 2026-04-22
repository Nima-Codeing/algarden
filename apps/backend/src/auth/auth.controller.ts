import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SigninUserDto } from './dto/signin-user.dto';
import { User } from 'generated/prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  async Signin(@Body() signinUserDto: SigninUserDto): Promise<User> {
    return await this.authService.Signin(signinUserDto);
  }
}
