import { Injectable } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

@Injectable()
export class FilesService {
  private readonly uploadDir = 'uploads';

  ensureUploadDir(): string {
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
    return this.uploadDir;
  }

  getFilePath(filename: string): string {
    return join(process.cwd(), this.uploadDir, filename);
  }
}
