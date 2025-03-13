//users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { UserEntity } from './users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async getAll(): Promise<Partial<UserEntity>[]> {
    const users = await this.userRepository.find({
      where: { isDeleted: false },
    });
    return users.map(({ password, isDeleted, ...rest }) => rest);
  }
  async getById(id: string): Promise<Partial<UserEntity>> {
    const user = await this.userRepository.findOne({
      where: { id, isDeleted: false },
    });
    if (!user) {
      throw new NotFoundException('User not found or has been deleted');
    }

    const { password, isDeleted, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async delete(id: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id } }); // Correct way to find by ID
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isDeleted = true;
    await this.userRepository.save(user);
    return { message: 'User deleted successfully' };
  }

  async update(
    id: string,
    updateData: Partial<UserEntity>,
  ): Promise<Partial<UserEntity>> {
    const user = await this.userRepository.findOne({
      where: { id, isDeleted: false },
    });
    if (!user) {
      throw new NotFoundException('User not found or has been deleted');
    }
    // Remove sensitive fields from updateData
    const {
      password,
      isDeleted,
      id: userId,
      otp,
      otpExpires,
      ...safeUpdateData
    } = updateData;
    // Update the user
    Object.assign(user, safeUpdateData);
    const updatedUser = await this.userRepository.save(user);
    // Remove sensitive fields from response
    const {
      password: _,
      isDeleted: __,
      otp: ___,
      otpExpires: ____,
      ...result
    } = updatedUser;
    return result;
  }
}
