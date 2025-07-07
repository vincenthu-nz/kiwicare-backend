import { IsOptional, IsString } from 'class-validator';

export class ClosureOrderDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
