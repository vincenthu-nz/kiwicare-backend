import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ description: 'Post title' })
  @IsNotEmpty({ message: 'Post title is required' })
  readonly title: string;

  @ApiPropertyOptional({ description: 'Content' })
  readonly content: string;

  @ApiPropertyOptional({ description: 'Cover image URL' })
  readonly coverUrl: string;

  @ApiPropertyOptional({ description: 'Post status' })
  readonly status: string;

  @IsNumber()
  @ApiProperty({ description: 'Post category ID' })
  readonly category: number;

  @ApiPropertyOptional({ description: 'Recommended flag' })
  readonly isRecommend: boolean;

  @ApiPropertyOptional({ description: 'Tags (comma-separated)' })
  readonly tag: string;
}

export class PostInfoDto {
  public id: number;
  public title: string;
  public content: string;
  public contentHtml: string;
  public summary: string;
  public toc: string;
  public coverUrl: string;
  public isRecommend: boolean;
  public status: string;
  public userId: string;
  public author: string;
  public category: string;
  public tags: string[];
  public count: number;
  public likeCount: number;
}

export interface PostsRo {
  list: PostInfoDto[];
  count: number;
}
