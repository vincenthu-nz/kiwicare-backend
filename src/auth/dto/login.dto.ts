import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsStrongPassword } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'Username' })
  @IsNotEmpty({ message: 'Please enter your email' })
  email: string;

  @ApiProperty({ description: 'Password' })
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'Password must be at least 8 characters and include uppercase, lowercase, number, and special character',
    },
  )
  password: string;
}
