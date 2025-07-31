import { Module } from '@nestjs/common';
import { SupabaseController } from './supabase.controller';
import { SupabaseService } from 'src/supabase/supabase.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [SupabaseController],
  providers: [SupabaseService],
})
export class SupabaseModule {}
