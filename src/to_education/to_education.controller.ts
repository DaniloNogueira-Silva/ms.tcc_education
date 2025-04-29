import { Controller, Get } from '@nestjs/common';

import { EventPattern } from '@nestjs/microservices';

@Controller()
export class ToEducationController {
  constructor() {}

  @EventPattern('to_education')
  async handleMessage(data: string) {
    console.log(`📥 Received message from queue to_education: ${data}`);
  }
}
