// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config'; 
import { UserModule } from './user/users.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Load environment variables
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: true,
      // ssl: true,
      // extra: {
      //   ssl: {
      //     rejectUnauthorized: false,
      //   },
      // },
    }),
    
  AuthModule,
  UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
