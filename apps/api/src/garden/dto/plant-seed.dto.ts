import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class PlantSeedDto {
  @IsString()
  @IsNotEmpty()
  seedId: string;

  @IsNumber()
  @IsNotEmpty()
  x: number;

  @IsNumber()
  @IsNotEmpty()
  y: number;
}
