import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'username' })
  @IsNotEmpty({ message: 'please input username' })
  username: string;

  @ApiProperty({ description: 'password' })
  @IsNotEmpty({ message: 'please input password' })
  password: string;

  @ApiProperty({ description: 'role' })
  role: string;
}
