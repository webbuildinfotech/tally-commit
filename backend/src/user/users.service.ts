//users.service.ts
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { UserEntity, UserRole, UserStatus } from './users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AddressEntity } from './../addresses/addresses.entity';


@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,
        @InjectRepository(AddressEntity)
        private addressRepository: Repository<AddressEntity>,
    ) { }

    async updateUserStatus(id: string, status: UserStatus): Promise<UserEntity> {
        const user = await this.userRepository.findOne({ where: { id } });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (!Object.values(UserStatus).includes(status)) {
            throw new ConflictException('Invalid user status');
        }

        user.status = status;
        await this.userRepository.save(user);

        return user;
    }

    async getAdminState(): Promise<string | null> {
        const admin = await this.userRepository.findOne({
            where: { role: UserRole.Admin },
            select: ['state'], // Only fetch the `state` column
        });

        return admin?.state ?? null; // Return state if found, otherwise null
    }

    async getAll(): Promise<UserEntity[]> {
        return await this.userRepository.find({
            where: { isDeleted: false },
            relations: ['addresses'], // Ensure addresses are loaded
        });
    }

    async findAllVendors(): Promise<UserEntity[]> {
        return this.userRepository.find({ where: { role: UserRole.Vendor } });
    }



    async getById(id: string): Promise<UserEntity> {
        const user = await this.userRepository.findOne({ where: { id, isDeleted: false } }); // Correct way to find by ID
        if (!user) {
            throw new NotFoundException("User not found or has been deleted");
        }
        return user;
    }

    async delete(id: string): Promise<{ message: string }> {
        const user = await this.userRepository.findOne({ where: { id } }); // Correct way to find by ID
        if (!user) {
            throw new NotFoundException('User not found');
        }

        user.isDeleted = true;
        await this.userRepository.save(user);
        // await this.userRepository.remove(user);
        return { message: 'User deleted successfully' };
    }
}
