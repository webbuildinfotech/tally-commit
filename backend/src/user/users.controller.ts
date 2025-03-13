//users.controller.ts
import {
    Controller,
    HttpStatus,
    Param,
    Get,
    Delete,
    Res,
    UseGuards,
    Put,
    Body,
} from '@nestjs/common';
import { UserRole } from './users.dto';
import { Response } from 'express';
import { UserService } from './users.service';
import { JwtAuthGuard } from './../jwt/jwt-auth.guard';
import { RolesGuard } from './../jwt/roles.guard';
import { Roles } from './../jwt/roles.decorator';
import { UserEntity } from './users.entity';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
    constructor(private readonly userService: UserService) { }
    
    @Get('list')
    @Roles(UserRole.Admin)
    async getAllUsers(@Res() response: Response) {
        const users = await this.userService.getAll();
        return response.status(HttpStatus.OK).json({
            length: users.length,
            data: users,
        });
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

    @Put('update/:id')
    // @Roles(UserRole.Admin)
    async updateUser(
        @Param('id') id: string,
        @Body() updateData: Partial<UserEntity>,
        @Res() response: Response
    ) {
        const result = await this.userService.update(id, updateData);
        return response.status(HttpStatus.OK).json({
            message: 'User updated successfully',
            data: result,
        });
    }

}
