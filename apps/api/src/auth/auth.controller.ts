import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { RequestUser, UserResponse } from './types/user.types';
import { SigninUserDto } from './dto/signin-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getMe(@CurrentUser() user: RequestUser): UserResponse {
    return user;
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signIn(
    @Body() signinUserDto: SigninUserDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const token = await this.authService.signIn(signinUserDto);
    res.cookie('token', token, {
      maxAge: 60 * 60 * 1000,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'strict',
      signed: false,
    });
  }

  @Post('signup')
  async signUp(@Body() createUserDto: CreateUserDto): Promise<UserResponse> {
    return await this.authService.createUser(createUserDto);
  }
}
