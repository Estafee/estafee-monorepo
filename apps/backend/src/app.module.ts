import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core'; // <-- Import ini
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

@Module({
  imports: [
    // 1. Daftarkan Modulnya seperti biasa
    ItemsModule,
    UsersModule,
    RentalsModule,
    CategoriesModule,
    CartModule,

    // 2. Daftarkan Routing-nya di sini
    RouterModule.register(appRoutes), 
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
  exports: [PrismaService],
})
export class AppModule {}