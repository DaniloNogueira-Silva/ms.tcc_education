import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { Injectable, OnModuleInit } from '@nestjs/common';

import { ServerRMQ } from '@nestjs/microservices';

@Injectable()
export class RabbitMQConsumerToEducation extends ServerRMQ implements OnModuleInit {

  constructor() {
    super({
      urls: [process.env.RABBITMQ_URI!],
      queue: 'to_education',
      queueOptions: {
        durable: true,
      },
      noAck: false,
      prefetchCount: 1,
    });
  }

  async onModuleInit() {
    await this.listen(() => {
      console.log('📡 RabbitMQ Consumer connected and listening!');
    });
  }
}
