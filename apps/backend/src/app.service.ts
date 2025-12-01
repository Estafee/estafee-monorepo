import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getHealth() {
    return {
      status: 'ok',
      message: 'ESTAFEE API is running',
      timestamp: new Date().toISOString(),
      service: 'lending-platform-backend',
      version: '1.0.0',
    };
  }
}
