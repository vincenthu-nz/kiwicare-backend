import {
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderDto {
  @IsUUID()
  providerId: string;

  @IsUUID()
  customerId: string;

  @IsUUID()
  serviceId: string;

  @IsString()
  serviceAddress: string;

  @Type(() => Number)
  @IsNumber()
  serviceLatitude: number;

  @Type(() => Number)
  @IsNumber()
  serviceLongitude: number;

  @Type(() => Number)
  @IsNumber()
  providerLatitude: number;

  @Type(() => Number)
  @IsNumber()
  providerLongitude: number;

  @IsISO8601()
  scheduledStart: string;

  @IsOptional()
  @IsString()
  note?: string;
}
