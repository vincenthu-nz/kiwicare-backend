import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UserInfoDto {
  @ApiProperty({ description: 'Username' })
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: 'User nickname' })
  nickname: string;

  @ApiProperty({ description: 'User avatar' })
  avatar: string;

  @ApiProperty({ description: 'User email' })
  email: string;

  @ApiProperty({ description: 'User role' })
  role: string;

  @ApiProperty({ description: 'Creation time' })
  createTime: Date;
}
