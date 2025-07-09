import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateReviewDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Comment must be at least 2 characters' })
  @MaxLength(2000, { message: 'Comment must not exceed 2000 characters' })
  comment?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(6, { message: 'You can upload up to 6 images only' })
  @IsString({ each: true })
  images?: string[];
}
