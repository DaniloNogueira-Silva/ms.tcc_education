import { Controller, Get } from '@nestjs/common';

import { EventPattern } from '@nestjs/microservices';
import { RabbitMQProducerService } from './utils/rabbitmq-producer';

@Controller()
export class AppController {
  constructor(private readonly rabbitMQService: RabbitMQProducerService) {}

  @Get('send')
  sendMessage() {
    return this.rabbitMQService.sendMessage('Hello from MS.EDUCATION!');
  }

  @EventPattern('to_education')
  async handleMessage(data: string) {
    console.log(`📥 Received message: ${data}`);
  }
}
