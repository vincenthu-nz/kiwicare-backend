import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ description: 'category name' })
  @IsNotEmpty({ message: 'please input category name' })
  @IsString()
  name: string;
}
