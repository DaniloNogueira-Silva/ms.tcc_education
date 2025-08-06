import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { UserProgress } from '../user_progress/user_progress.schema';
import axios from 'axios';

interface CreateCharacterDto {
  user_id: string;
  name: string;
  level: number;
  points: number;
  rank: string;
  trophies?: string[];
  avatar_id?: string;
  coins: number;
}

@Injectable()
export class HttpRequest {
  private readonly logger = new Logger(HttpRequest.name);
  private readonly userCharacterApiUrl?: string;

  public constructor(private readonly configService: ConfigService) {
    this.userCharacterApiUrl = this.configService.get<string>(
      'USER_CHARACTER_API_URL',
    );
    if (!this.userCharacterApiUrl) {
      this.logger.error(
        'USER_CHARACTER_API_URL is not defined in environment variables.',
      );
      throw new Error('User Character API URL is not configured.');
    }
  }

  public async completeActivity(data: UserProgress): Promise<any> {
    const url = `${this.userCharacterApiUrl}/user-character/complete-activity`;
    this.logger.log(
      `Sending 'complete-activity' request for user progress: ${data._id}`,
    );
    try {
      const response = await axios.post(url, data);
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to call 'complete-activity'. Status: ${error.response?.status}`,
        error.stack,
      );
      throw new ServiceUnavailableException(
        'The character service is currently unavailable.',
      );
    }
  }

  public async createCharacter(data: CreateCharacterDto): Promise<any> {
    const url = `${this.userCharacterApiUrl}/user-character`;
    this.logger.log(
      `Sending 'create-character' request for user: ${data.user_id}`,
    );
    try {
      const response = await axios.post(url, data);
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to call 'create-character'. Status: ${error.response?.status}`,
        error.stack,
      );
      throw new ServiceUnavailableException(
        'The character service is currently unavailable.',
      );
    }
  }

  public async getStats(id: string): Promise<any> {
    const url = `${this.userCharacterApiUrl}/user-character/stats/${id}`;
    this.logger.log(`Sending 'get-stats' request for user: ${id}`);
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to call 'get-stats'. Status: ${error.response?.status}`,
        error.stack,
      );
      throw new ServiceUnavailableException(
        'The character service is currently unavailable.',
      );
    }
  }
}
