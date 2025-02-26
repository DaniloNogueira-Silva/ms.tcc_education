import * as dotenv from 'dotenv';

import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:3000', 'https://tcc-frontend-flax.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  await app.listen(3000);
}
bootstrap();
