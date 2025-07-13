import {
  Controller,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AwsS3Service } from './aws-s3.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('upload')
export class UploadController {
  constructor(private readonly awss3Service: AwsS3Service) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ message: string }> {
    const userId = req.user.id;

    await this.awss3Service.uploadFile(userId, file);

    return { message: 'Upload successful' };
  }
}
