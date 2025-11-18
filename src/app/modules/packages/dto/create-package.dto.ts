import { IsString, IsArray, IsEnum, IsBoolean, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { PackageType } from '../schema/package.schema';  

export class CreatePackageDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(PackageType)
  type: PackageType;

  @IsNumber()
  @Min(1)
  durationInDays: number;

  @IsNumber()
  @Min(0)
  price: number;

  @IsString()
  currency: string;

  @IsArray()
  @IsOptional()
  features: string[];

  @IsBoolean()
  isActive: boolean;
}
