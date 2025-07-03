import { Controller, Get } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

export const ApiFile =
  (fileName: string = 'file'): MethodDecorator =>
  (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          [fileName]: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    })(target, propertyKey, descriptor);
  };

@ApiTags('Public API')
@Controller('app')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    return this.appService.getHello();
  }

  // @Post('upload')
  // @ApiOperation({ summary: 'Upload file' })
  // @ApiConsumes('multipart/form-data')
  // @ApiFile()
  // @UseInterceptors(FileInterceptor('file'))
  // async uploadFile(@UploadedFile('file') file: any): Promise<any> {
  //   console.log('Upload file success!', file);
  // }
}
