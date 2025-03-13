//users.controller.ts
import {
    Controller,
    HttpStatus,
    Param,
    Get,
    Delete,
    Res,
    UseGuards,
    Patch,
    Body,
} from '@nestjs/common';
import { UserRole } from './users.dto';
import { Response } from 'express';
import { UserService } from './users.service';
import { UserStatus } from './users.entity';
import { JwtAuthGuard } from './../jwt/jwt-auth.guard';
import { RolesGuard } from './../jwt/roles.guard';
import { Roles } from './../jwt/roles.decorator';
import { SessionGuard } from './../jwt/session.guard';

@Controller('users')
@UseGuards(SessionGuard,JwtAuthGuard, RolesGuard)
export class UserController {
    constructor(private readonly userService: UserService) { }
    @Get()
    @Roles(UserRole.Admin)
    async getAllUsers(@Res() response: Response) {
        const users = await this.userService.getAll();
        return response.status(HttpStatus.OK).json({
            length: users.length,
            data: users,
        });
    }

    @Get('admin-state')
    async getAdminState(): Promise<string | null> {
        return this.userService.getAdminState();
    }
    
    


    @Get(':id')
    async getUserById(@Param('id') id: string, @Res() response: Response) {
        const user = await this.userService.getById(id);
        return response.status(HttpStatus.OK).json({
            data: user,
        });
    }

    @Delete('delete/:id')
    async deleteUser(@Param('id') id: string, @Res() response: Response) {
        const result = await this.userService.delete(id);
        return response.status(HttpStatus.OK).json(result);
    }

    @Patch('status/:id')
    @Roles(UserRole.Admin)
    async updateUserStatus(
        @Param('id') id: string,
        @Body('status') status: UserStatus,
        @Res() response: Response,
    ) {
        const updatedUser = await this.userService.updateUserStatus(id, status);
        return response.status(HttpStatus.OK).json({
            message: `User status updated to ${status}`,
            data: updatedUser,
        });
    }


}
