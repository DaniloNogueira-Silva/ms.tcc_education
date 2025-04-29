import { Injectable, OnModuleInit } from '@nestjs/common';
import { ServerRMQ } from '@nestjs/microservices';
import { MessagePattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';

@Injectable()
export class RabbitMQToEducationConsumer extends ServerRMQ implements OnModuleInit {
  constructor() {
    super({
      urls: [process.env.RABBITMQ_URI!],
      queue: 'to_education',
      queueOptions: {
        durable: true,
      },
      noAck: false, // para permitir ack manual
      prefetchCount: 1, // opcional: limita a 1 mensagem por vez
    });
  }

  async onModuleInit() {
    await this.listen(() => {
      console.log('📡 RabbitMQ Consumer connected and listening!');
    });
  }

  @MessagePattern('to_education')
  async handleMessage(@Payload() message: any) {
    console.log('📩 Raw message received from to_education');

    const content = JSON.parse(message.content.toString());
    console.log('📩 Parsed message content:', content.data);

    return;
  }
}
