import { Module } from '@nestjs/common';
import { CosService } from './cos.service';
import { UploadController } from './cos.controller';

@Module({
  controllers: [UploadController],
  providers: [CosService],
  exports: [CosService],
})
export class CosModule {}
