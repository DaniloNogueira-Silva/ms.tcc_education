import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { SupabaseClient, createClient } from '@supabase/supabase-js';

import { ConfigService } from '@nestjs/config';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseService.name);
  private supabase: SupabaseClient;

  public constructor(private readonly configService: ConfigService) {}

  public onModuleInit() {
    this.logger.log('Initializing Supabase client...');
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );

    if (!supabaseUrl || !supabaseKey) {
      this.logger.error(
        'Supabase URL or Key is not defined in environment variables.',
      );
      throw new Error('Supabase configuration is missing.');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.logger.log('Supabase client initialized successfully.');
  }

  public getSupabaseClient(): SupabaseClient {
    if (!this.supabase) {
      this.logger.error('Supabase client has not been initialized.');
      throw new InternalServerErrorException(
        'Supabase client is not available.',
      );
    }
    return this.supabase;
  }

  public async uploadFile(
    file: Express.Multer.File,
    bucket: string,
  ): Promise<{ path: string }> {
    const fileName = `${Date.now()}-${file.originalname.replace(/\s/g, '_')}`;
    this.logger.log(`Uploading file "${fileName}" to bucket "${bucket}".`);

    try {
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
        });

      if (error) {
        throw error;
      }

      this.logger.log(`File "${fileName}" uploaded successfully.`);
      return data;
    } catch (error) {
      this.logger.error(
        `Failed to upload file to Supabase bucket "${bucket}". Error: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to upload file.');
    }
  }

  public async createSignedUrl(path: string, bucket: string, expires = 3600) {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .createSignedUrl(path, expires);
    if (error) throw error;
    return data.signedUrl;
  }
}
