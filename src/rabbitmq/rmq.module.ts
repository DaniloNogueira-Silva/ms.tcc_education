import { Module } from '@nestjs/common';
import { RabbitMQProducerToGameService } from './producers/rmq-to-game-producer';
import { RabbitMQToEducationConsumer } from './consumers/rmq.to_education';

@Module({
  controllers: [],
  providers: [RabbitMQProducerToGameService, RabbitMQToEducationConsumer],
  exports: [RabbitMQProducerToGameService, RabbitMQToEducationConsumer],
})
export class RabbitMQModule {}
