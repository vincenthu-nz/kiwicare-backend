import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'email' })
  @IsNotEmpty({ message: 'please input email' })
  @IsEmail({}, { message: 'please input a valid email address' })
  email: string;

  @ApiProperty({ description: 'password' })
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

  @ApiProperty({ description: 'role', enum: ['customer', 'provider'] })
  @IsIn(['customer', 'provider'], {
    message: 'Invalid role',
  })
  role: string;

  @ApiPropertyOptional({ description: 'first name' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ description: 'last name' })
  @IsOptional()
  @IsString()
  lastName?: string;

  // @ApiProperty({
  //   description: 'Unique verification token',
  //   example: 'abc123xyz',
  // })
  // @IsNotEmpty()
  // @IsString()
  // token: string;

  // @ApiProperty({
  //   description: 'Created timestamp (ISO 8601)',
  //   example: '2025-07-02T12:00:00Z',
  // })
  // @IsDate()
  // created_at: Date;
  //
  // @ApiProperty({
  //   description: 'Expiration timestamp (ISO 8601)',
  //   example: '2025-07-03T12:00:00Z',
  // })
  // @IsDate()
  // expires_at: Date;
}
