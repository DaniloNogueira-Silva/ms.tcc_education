import * as dotenv from 'dotenv';

import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3001;

  app.enableCors({
    origin: '*',
  });

  await app.listen(port);

  logger.log('🚀 Application running at http://localhost:3002');
}
bootstrap();
