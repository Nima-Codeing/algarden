import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SigninUserDto } from './dto/signin-user.dto';
import { User } from 'generated/prisma/client';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  async Signin(@Body() signinUserDto: SigninUserDto): Promise<User> {
    return await this.authService.Signin(signinUserDto);
  }

  @Post('signup')
  async Signup(@Body() createUserDto: CreateUserDto): Promise<User> {
    return await this.authService.CreateUser(createUserDto);
  }
}
