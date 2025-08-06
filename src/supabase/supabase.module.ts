import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { SupabaseController } from './supabase.controller';
import { SupabaseService } from '../supabase/supabase.service';

@Module({
  imports: [ConfigModule],
  controllers: [SupabaseController],
  providers: [SupabaseService],
})
export class SupabaseModule {}
