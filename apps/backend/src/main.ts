import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // 1. Wajib import ini

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend communication
  app.enableCors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  });

  // 2. Aktifkan Global Pipe untuk Validasi DTO
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Membersihkan properti JSON yang tidak ada di DTO (keamanan)
    transform: true, // Otomatis mengubah payload JSON menjadi instance class DTO
  }));

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();