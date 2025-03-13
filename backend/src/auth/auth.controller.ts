// src/auth/auth.controller.ts
import { Controller, Post, Body, Res, HttpStatus, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDto } from './../user/users.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Res() response: Response, 
    @Body() userDto: UserDto, 
  ) {
    const result = await this.authService.register(userDto);
    return response.status(HttpStatus.OK).json({
      message: result.message,
      user: result.user,
    });
  }

  @Post('login')
  async login(
    @Res() response: Response,
    @Body() loginDto: UserDto,
  ) {
    const result = await this.authService.login(loginDto);
    return response.status(HttpStatus.OK).json({
      message: result.message,
      info: result.user,
      token: result.token,
    });
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body('email') email: string
  ) {
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() body: { email: string; otp: string; newPassword: string }
  ) {
    return this.authService.verifyOtpAndResetPassword(
      body.email,
      body.otp,
      body.newPassword
    );
  }

}
