import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { UserRole } from '../../core/enums/user.enum';

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

  @ApiProperty({
    description: 'role',
    enum: [UserRole.CUSTOMER, UserRole.PROVIDER],
  })
  @IsIn([UserRole.CUSTOMER, UserRole.PROVIDER], {
    message: 'Invalid role',
  })
  role: UserRole;

  @ApiPropertyOptional({ description: 'first name' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ description: 'last name' })
  @IsOptional()
  @IsString()
  lastName?: string;
}
