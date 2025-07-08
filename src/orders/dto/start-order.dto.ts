import { IsNumber, Max, Min } from 'class-validator';

export class StartOrderDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  currentLatitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  currentLongitude: number;
}
