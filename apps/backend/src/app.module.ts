import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core'; // <-- Import ini
import { ConfigModule } from '@nestjs/config'; // <-- For environment variables
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { appRoutes } from './routes'; // <-- Import file routes yang tadi dibuat

// Import Modul
import { ItemsModule } from './items/items.module';
import { UsersModule } from './users/users.module';
import { RentalsModule } from './rentals/rentals.module';
import { CategoriesModule } from './categories/categories.module';
import { CartModule } from './cart/cart.module';
import { AuthModule } from './auth/auth.module'; // <-- Auth Module

@Module({
  imports: [
    // Config Module for environment variables (JWT_SECRET, etc.)
    ConfigModule.forRoot({
      isGlobal: true, // Make it available everywhere
    }),

    // 1. Daftarkan Modulnya seperti biasa
    ItemsModule,
    UsersModule,
    RentalsModule,
    CategoriesModule,
    CartModule,
    AuthModule, // <-- Add Auth Module

    // 2. Daftarkan Routing-nya di sini
    RouterModule.register(appRoutes), 
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
  exports: [PrismaService],
})
export class AppModule {}