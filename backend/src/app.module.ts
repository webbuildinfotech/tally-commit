// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddressesModule } from './addresses/addresses.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/users.module';
import { VendorModule } from './vendors/vendor.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config'; 

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Load environment variables
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: true,
      ssl: true,
      extra: {
        ssl: {
          rejectUnauthorized: false,
        },
      },
    }),
    
  
  UserModule,
  AuthModule,
  AddressesModule,
  VendorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
