import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'email' })
  @IsNotEmpty({ message: 'please input email' })
  email: string;

  @ApiProperty({ description: 'password' })
  @IsNotEmpty({ message: 'please input password' })
  password: string;

  @ApiProperty({ description: 'role' })
  role: string;
}
