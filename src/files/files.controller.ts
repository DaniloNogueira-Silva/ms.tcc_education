import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Get,
  Param,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FilesService } from './files.service';
import { Response } from 'express';
import { createReadStream } from 'fs';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      dest: './uploads',
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    this.filesService.ensureUploadDir();
    return { filename: file.filename, path: `/files/${file.filename}` };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':filename')
  async getFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = this.filesService.getFilePath(filename);
    const stream = createReadStream(filePath);
    stream.pipe(res);
  }
}
