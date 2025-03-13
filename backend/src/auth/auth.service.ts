// src/auth/auth.service.ts
import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDto } from './../user/users.dto';
import { UserEntity } from './../user/users.entity';
import { UserRole } from './../user/users.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from 'service/email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  private handleError(error: any): never {
    if (
      error instanceof BadRequestException ||
      error instanceof UnauthorizedException
    ) {
      throw error;
    }
    throw new InternalServerErrorException(
      'An unexpected error occurred. Please try again later.',
    );
  }

  private generateToken(user: UserEntity): string {
    try {
      return this.jwtService.sign({
        sub: user.id,
        email: user.email,
        role: user.role,
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Register a new user
  async register(userDto: UserDto): Promise<{ message: string; user: UserEntity }> {

    try {
      const existingUser = await this.userRepository.findOne({
        where: [{ email: userDto.email }],
      });

      if (existingUser) {
        throw new BadRequestException('Email already exists');
      }
      if (!userDto.password) {
        throw new BadRequestException('Password is required');
      }
      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userDto.password, saltRounds);

      // Create the new user with hashed password
      const newUser = this.userRepository.create({
        ...userDto,
        password: hashedPassword,
        role: UserRole.Editor,
        isDeleted: false,
      });

      await this.userRepository.save(newUser); // Save the new user
      return {
        message: 'Your account has been created successfully', 
        user: newUser,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  // Login a user
  async login(userDto: UserDto): Promise<{ message: string; user: Partial<UserEntity>; token: string }> {
    try {
      const user = await this.userRepository.findOne({
        where: { email: userDto.email, isDeleted: false },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      if (!userDto.password) {
        throw new BadRequestException('Password is required');
      }

      const isPasswordValid = await bcrypt.compare(
        userDto.password,
        user.password,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const token = this.generateToken(user);

      // Only return specific user fields
      const sanitizedUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
      };

      return {
        message: 'Login successful',
        user: sanitizedUser,
        token: token,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  // Forget Password

  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const user = await this.userRepository.findOne({
        where: { email, isDeleted: false }
      });

      if (!user) {
        throw new BadRequestException('Email not found');
      }

      // Generate OTP
      const otp = this.generateOTP();
      
      // Save OTP and expiry time (5 minutes)
      user.otp = otp;
      user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
      await this.userRepository.save(user);

      // Send OTP via email
      await this.emailService.sendOTP(email, otp);

      return { message: 'OTP has been sent to your email' };
    } catch (error) {
      this.handleError(error);
    }
  }

  async verifyOtpAndResetPassword(email: string, otp: string, newPassword: string): Promise<{ message: string }> {
    try {
      const user = await this.userRepository.findOne({
        where: { email, isDeleted: false }
      });

      if (!user || !user.otp || !user.otpExpires) {
        throw new BadRequestException('Invalid reset request');
      }

      if (new Date() > user.otpExpires) {
        throw new BadRequestException('OTP has expired');
      }

      if (user.otp !== otp) {
        throw new BadRequestException('Invalid OTP');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update password and clear OTP data
      user.password = hashedPassword;
      user.otp = null
      user.otpExpires = null;
      await this.userRepository.save(user);

      return { message: 'Password reset successful' };
    } catch (error) {
      this.handleError(error);
    }
  }


}
