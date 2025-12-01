// apps/backend/src/routes.ts
import { Routes } from '@nestjs/core';
import { ItemsModule } from './items/items.module';
import { UsersModule } from './users/users.module';
import { RentalsModule } from './rentals/rentals.module';
import { CategoriesModule } from './categories/categories.module';
import { CartModule } from './cart/cart.module';

export const appRoutes: Routes = [
  {
    path: 'api', 
    children: [
      {
        // http://localhost:3001/api/items
        path: 'items',
        module: ItemsModule,
      },
      {
        // http://localhost:3001/api/users
        path: 'users',
        module: UsersModule,
      },
      {
        // http://localhost:3001/api/rentals
        path: 'rentals',
        module: RentalsModule,
      },
      {
        // http://localhost:3001/api/categories
        path: 'categories',
        module: CategoriesModule,
      },
      {
        // http://localhost:3001/api/cart
        path: 'cart',
        module: CartModule,
      },
    ],
  },
];