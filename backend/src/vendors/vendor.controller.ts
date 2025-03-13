import {
    Controller,
    HttpStatus,
    Post,
    Get,
    Res,
    Param,
    Delete,
    Body,
    NotFoundException,
    UseGuards,

} from '@nestjs/common';
import { Response } from 'express';
import { VendorService } from './vendor.service';
import { JwtAuthGuard } from './../jwt/jwt-auth.guard';
import { SessionGuard } from './../jwt/session.guard';


@Controller('vendors')
@UseGuards(SessionGuard,JwtAuthGuard)
export class VendorController {
    constructor(private readonly vendorService: VendorService) { }

    @Post('/fetch') // Example of fetching and storing vendors
    async fetchVendors() {
        await this.vendorService.fetchAndStoreVendors();
        return { message: 'Vendors fetched and stored successfully' };
    }

    @Get() // Get all vendors
    async findAll(@Res() response: Response) {
        const vendors = await this.vendorService.findAll();
        return response.status(HttpStatus.OK).json({
            length: vendors.length,
            data: vendors,
        });
    }

    @Get(':id') // Get vendor by ID
    async getById(@Param('id') id: string, @Res() response: Response) {
        const vendor = await this.vendorService.findById(id);
        if (!vendor) {
            return response.status(HttpStatus.NOT_FOUND).json({
                message: 'Vendor not found',
            });
        }
        return response.status(HttpStatus.OK).json({
            data: vendor,
        });
    }

    @Delete('delete/:id')
    async delete(@Param('id') id: string): Promise<{ message: string }> {
        await this.vendorService.delete(id); // Call the delete method from the service
        return {
            message: `Vendor deleted successfully`, // Success message
        };
    }



    @Delete('delete/vendors/all')
    async deleteMultiple(@Body('ids') ids: string[], @Res() response: Response) {
        try {
            const result = await this.vendorService.deleteMultiple(ids);
            return response.status(HttpStatus.OK).json(result);
        } catch (error) {
            // Handle the error appropriately
            if (error instanceof NotFoundException) {
                return response.status(HttpStatus.NOT_FOUND).json({ message: error.message });
            }
            return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'An error occurred while deleting the data.' });
        }
    }

}
