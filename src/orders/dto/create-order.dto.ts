import {
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateOrderDto {
  @IsUUID()
  providerId: string;

  @IsUUID()
  customerId: string;

  @IsUUID()
  serviceId: string;

  @IsString()
  serviceAddress: string;

  @IsNumber()
  serviceLatitude: number;

  @IsNumber()
  serviceLongitude: number;

  @IsNumber()
  providerLatitude: number;

  @IsNumber()
  providerLongitude: number;

  @IsISO8601()
  scheduledStart: string;

  @IsOptional()
  @IsString()
  note?: string;
}
