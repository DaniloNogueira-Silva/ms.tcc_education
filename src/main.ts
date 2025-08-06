import * as dotenv from 'dotenv';

import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  app.enableCors({
    origin: [
      'http://localhost:3001',
      'https://tcc-frontend-flax.vercel.app',
      'http://localhost:3000',
    ],
  });

  await app.listen(3000);

  logger.log('🚀 Application running at http://localhost:3002');
}
bootstrap();
