import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import { join, extname } from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class UploadService {
  private readonly uploadsDir = join(process.cwd(), 'uploads');

  constructor() {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  async uploadFile(file: any, hostUrl: string): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const uniqueId = randomUUID();
    const fileExt = extname(file.originalname);
    const fileName = `${uniqueId}${fileExt}`;
    const filePath = join(this.uploadsDir, fileName);

    await fs.promises.writeFile(filePath, file.buffer);

    return `${hostUrl}/uploads/${fileName}`;
  }
}
