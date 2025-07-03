import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CosService } from './cos.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly cosService: CosService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ message: string }> {
    await this.cosService.uploadFile(
      process.env.COS_BUCKET,
      process.env.COS_REGION,
      `uploads/${file.originalname}`,
      file.buffer,
    );

    return { message: 'Upload successful' };
  }
}
