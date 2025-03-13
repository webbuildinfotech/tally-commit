import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { parseStringPromise } from 'xml2js'; // Library for parsing XML to JSON
import { Vendors } from './../tally/vendors';
import { VendorDto } from './../user/users.dto';
import { Cron } from '@nestjs/schedule';

import { UserEntity, UserRole } from './../user/users.entity';
import { AddressesService } from './../addresses/addresses.service';
import { CreateAddressDto } from './../addresses/addresses.dto';
import { SyncControlSettings } from './../settings/setting.entity';
import { SyncLogEntity, SyncLogStatus } from './../sync-log/sync-log.entity';


@Injectable()
export class VendorService {
    constructor(
        @InjectRepository(UserEntity)
        private vendorRepository: Repository<UserEntity>,
        private readonly addressesService: AddressesService,

        @InjectRepository(SyncLogEntity)
        private readonly syncLogRepository: Repository<SyncLogEntity>,
    
        @InjectRepository(SyncControlSettings)
        private readonly syncControlSettingsRepository: Repository<SyncControlSettings>,


    ) { }

    async fetchAndStoreVendors(): Promise<void> {
        const REQUEST_TIMEOUT = 40000; // 20 seconds timeout
        // Check if "Manual Sync" is enabled for products
        const SyncSetting = await this.syncControlSettingsRepository.findOne({
            where: { moduleName: 'Vendors' },
        });

        if (!SyncSetting || !SyncSetting.isManualSyncEnabled) {
            throw new BadRequestException('Manual Sync for Vendor is disabled.');
        }
        try {
            const response = await axios.get(process.env.TALLY_URL as string, {
                headers: {
                    'Content-Type': 'text/xml',
                },
                data: Vendors, // Replace with your dynamic XML request
                timeout: REQUEST_TIMEOUT, // Set a timeout for the request
            });

            // Check for specific XML error patterns in the response
            if (response.data.includes('<LINEERROR>')) {
                throw new BadRequestException('Please Login The Tally');
            }

            const vendors = await this.parseXmlToVendors(response.data);
            const existingVendors = await this.vendorRepository.find();

            // Create a map of existing vendors for quick lookup
            const existingVendorMap = new Map(existingVendors.map(vendor => [vendor.name, vendor]));

            for (const vendor of vendors) {
                const existingVendor = existingVendorMap.get(vendor.name);

                if (existingVendor) {
                    // If the item exists, compare and update if necessary
                    if (this.hasChanges(existingVendor, vendor)) {
                        await this.vendorRepository.save({ ...existingVendor, ...vendor });
                    }
                    // Handle address separately
                    await this.storeVendorAddress(existingVendor, vendor);
                } else {
                    const savedVendor = await this.vendorRepository.save(vendor);
                    await this.storeVendorAddress(savedVendor, vendor);
                }
            }

        } catch (error: any) {
            // If the error is already a BadRequestException, rethrow it
            if (error instanceof BadRequestException) {
                throw error;
            }
            // General error handling
            throw new InternalServerErrorException('Make Sure Tally is Open and logged In');
        }
    }


    async storeVendorAddress(vendor: UserEntity, vendorDto: VendorDto): Promise<void> {
        const createAddressDto: CreateAddressDto = {
            userId: vendor.id,
            mobile: vendorDto.mobile || 'N/A',
            street_address: vendorDto.address || 'N/A',
            state: vendorDto.state || 'N/A',
            zip_code: vendorDto.pincode || 'N/A',
            country: vendorDto.country || 'N/A',
        };

        const existingAddress = await this.addressesService.findByUserId(vendor.id);
        if (existingAddress) {
            await this.addressesService.update(existingAddress.id, createAddressDto);
        } else {
            await this.addressesService.create(createAddressDto, vendor.id);
        }
    }

    async parseXmlToVendors(xml: string): Promise<UserEntity[]> {
        const parsedResult = await parseStringPromise(xml);
        const vendorItems = parsedResult.ENVELOPE.LEDGER || []; // Adjust based on your XML structure

        return vendorItems.map((vendor: any) => {
            const vendorDto = new VendorDto();
            vendorDto.slNo = this.cleanString(vendor.SLNO?.[0]);
            vendorDto.name = this.cleanString(vendor.NAME?.[0]);
            vendorDto.alias = this.cleanString(vendor.ALIAS?.[0]);
            vendorDto.active = this.cleanString(vendor.ACTIVE?.[0]);
            vendorDto.parent = this.cleanString(vendor.PARENT?.[0]);
            vendorDto.address = this.cleanString(vendor.ADDRESS?.[0]);
            vendorDto.country = this.cleanString(vendor.COUNTRY?.[0]);
            vendorDto.state = this.cleanString(vendor.STATE?.[0]);
            vendorDto.pincode = this.cleanString(vendor.PINCODE?.[0]);
            vendorDto.contactPerson = this.cleanString(vendor.CONTACTPERSON?.[0]);
            vendorDto.mobile = this.cleanString(vendor.PHONE?.[0]);
            vendorDto.email = this.cleanString(vendor.EMAIL?.[0]);
            vendorDto.pan = this.cleanString(vendor.PAN?.[0]);
            vendorDto.gstType = this.cleanString(vendor.GSTTYPE?.[0]);
            vendorDto.gstNo = this.cleanString(vendor.GSTNO?.[0]);
            vendorDto.gstDetails = this.cleanString(vendor.GSTDETAILS?.[0]);
            // Convert DTO to Entity
            return this.vendorRepository.create(vendorDto);
        });
    }

    private cleanString(value: string | undefined): string {
        return value?.replace(/\x04/g, '').trim() || '';
    }

    // Function to check if the existing vendor has changes
    private hasChanges(existingVendor: UserEntity, newVendor: UserEntity): boolean {
        return (
            existingVendor.slNo !== newVendor.slNo ||
            existingVendor.name !== newVendor.name ||
            existingVendor.alias !== newVendor.alias ||
            existingVendor.active !== newVendor.active ||
            existingVendor.parent !== newVendor.parent ||
            existingVendor.address !== newVendor.address ||
            existingVendor.country !== newVendor.country ||
            existingVendor.state !== newVendor.state ||
            existingVendor.pincode !== newVendor.pincode ||
            existingVendor.contactPerson !== newVendor.contactPerson ||
            existingVendor.mobile !== newVendor.mobile ||
            existingVendor.email !== newVendor.email ||
            existingVendor.pan !== newVendor.pan ||
            existingVendor.gstType !== newVendor.gstType ||
            existingVendor.gstNo !== newVendor.gstNo ||
            existingVendor.gstDetails !== newVendor.gstDetails
        );
    }

    async findAll(): Promise<UserEntity[]> {
        return this.vendorRepository.find({
            where: { role: UserRole.Vendor }, // Use UserRole enum to match the role correctly
        });
    }

    async findById(id: string): Promise<UserEntity | null> {
        return this.vendorRepository.findOne({ where: { id } }); // Load files for the vendor by ID
    }
    async delete(id: string): Promise<void> {
        const result = await this.vendorRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Vendor with ID  not found`);
        }
    }

    async deleteMultiple(ids: string[]): Promise<{ message: string }> {
        const notFoundIds: string[] = [];

        for (const id of ids) {
            const item = await this.findById(id);
            if (!item) {
                notFoundIds.push(id);
                continue; // skip this ID if not found
            }
            await this.vendorRepository.remove(item);
        }

        if (notFoundIds.length > 0) {
            throw new NotFoundException(`vendors with ids ${notFoundIds.join(', ')} not found`);
        }

        return { message: 'Vendors deleted successfully' };
    }

    // Cron Job Set
    @Cron('0 * * * *') // hour
    async CronFetchAndStoreVendors(): Promise<void> {
        console.log('Vendor sync executed at:', new Date().toISOString());
        const REQUEST_TIMEOUT = 20000; // 20 seconds timeout
    
        // Check if "Auto Sync" is enabled 
        const syncSetting = await this.syncControlSettingsRepository.findOne({
            where: { moduleName: 'Vendors' },
        });
    
        if (!syncSetting?.isAutoSyncEnabled) {
            throw new BadRequestException('Auto Sync for Vendor is disabled.');
        }
    
        try {
            const response = await axios.get(process.env.TALLY_URL as string, {
                headers: { 'Content-Type': 'text/xml' },
                data: Vendors, // Replace with your dynamic XML request
                timeout: REQUEST_TIMEOUT,
            });
    
            const vendors = await this.parseXmlToVendors(response.data);
            const existingVendors = await this.vendorRepository.find();
            const existingVendorMap = new Map(existingVendors.map(vendor => [vendor.name, vendor]));
    
            for (const vendor of vendors) {
                const existingVendor = existingVendorMap.get(vendor.name);
                if (existingVendor) {
                    // Update if there are changes
                    if (this.hasChanges(existingVendor, vendor)) {
                        await this.vendorRepository.save({ ...existingVendor, ...vendor });
                    }
                    await this.storeVendorAddress(existingVendor, vendor);
                } else {
                    const savedVendor = await this.vendorRepository.save(vendor);
                    await this.storeVendorAddress(savedVendor, vendor);
                }
            }
    
            await this.syncLogRepository.save({
                sync_type: 'Vendors',
                status: SyncLogStatus.SUCCESS,
            });
        } catch (error: any) {
            await this.syncLogRepository.save({
                sync_type: 'Vendors',
                status: SyncLogStatus.FAIL,
            });
    
            if (error instanceof BadRequestException) throw error;
            throw new InternalServerErrorException('Ensure Tally is open and logged in.');
        }
    }
    

}
