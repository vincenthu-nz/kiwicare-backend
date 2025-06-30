import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'Username' })
  @IsNotEmpty({ message: 'Please enter your username' })
  username: string;

  @ApiProperty({ description: 'Password' })
  @IsNotEmpty({ message: 'Please enter your password' })
  password: string;
}
