import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SupabaseService } from '../supabase/supabase.service';

@Controller('supabase')
export class SupabaseController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file')) 
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado.');
    }

    try {
      const bucketName = 'uploads';

      const result = await this.supabaseService.uploadFile(file, bucketName);

      const supabase = this.supabaseService.getSupabaseClient();
      const { data } = supabase.storage
        .from(bucketName)
        .getPublicUrl(result.path);

      return {
        message: 'Arquivo enviado com sucesso!',
        data: result,
        publicUrl: data.publicUrl,
      };
    } catch (error) {
      throw new BadRequestException(`Falha no upload: ${error.message}`);
    }
  }
}
