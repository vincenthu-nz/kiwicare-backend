import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'birthday (ISO date)' })
  @IsOptional()
  @IsISO8601({ strict: true }, { message: 'Invalid date format' })
  birthday?: string;

  @ApiPropertyOptional({ description: 'city' })
  @IsOptional()
  @IsString()
  city?: string;
}
