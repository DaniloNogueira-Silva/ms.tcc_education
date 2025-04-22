import * as dotenv from 'dotenv';

import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'http://localhost:3001',
      'https://tcc-frontend-flax.vercel.app',
      'http://localhost:3000',
    ],
  });
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URI!],
      queue: 'to_education',
      queueOptions: { durable: true },
    },
  });

  await app.startAllMicroservices();

  await app.listen(3002);
}
bootstrap();
