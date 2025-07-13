import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserInfoDto } from './dto/user-info.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { AwsS3Service } from '../aws/aws-s3.service';
import { plainToInstance } from 'class-transformer';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly awss3Service: AwsS3Service,
  ) {}

  @ApiOperation({ summary: 'register user' })
  @ApiResponse({ status: 201, type: UserInfoDto })
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('register')
  register(@Body() createUser: CreateUserDto) {
    return this.userService.register(createUser);
  }

  @ApiOperation({ summary: 'Fetch user info' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  async getUserInfo(@Req() req) {
    return plainToInstance(User, req.user);
  }

  @ApiOperation({ summary: 'Update user info' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateMyProfile(@Req() req, @Body() dto: UpdateUserDto) {
    const userId = req.user.id;
    return this.userService.update(userId, dto);
  }

  @Post('avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(@Req() req, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    const userId = req.user.id;

    const { url } = await this.awss3Service.uploadFile(userId, file);

    await this.userService.updateAvatar(userId, url);

    return {
      message: 'Avatar uploaded successfully',
      url,
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
